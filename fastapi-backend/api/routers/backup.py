import os
import subprocess
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.database import get_db
from models.audit import AuditLog
from models.security_rbac import SystemAuditLog

router = APIRouter(
    prefix="/api/v1/system/backup",
    tags=["System Backup & Disaster Recovery"]
)

# Settings alias router for easy integration in settings page
settings_backup_router = APIRouter(
    prefix="/api/v1/settings/backup",
    tags=["Settings Backup"]
)

# Project base path (root directory)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKUP_DIR = BASE_DIR / "backups"
BACKUP_SCRIPT = BASE_DIR / "scripts" / "backup_db.ps1"


def get_backup_files() -> List[Dict[str, Any]]:
    """Scan the backups folder and return a structured list of backups."""
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        return []

    backups = []
    dump_files = sorted(BACKUP_DIR.glob("*.dump"), key=lambda f: f.stat().st_mtime, reverse=True)
    sql_files = sorted(BACKUP_DIR.glob("*.sql"), key=lambda f: f.stat().st_mtime, reverse=True)

    all_files = dump_files + [f for f in sql_files if not (BACKUP_DIR / (f.stem + ".dump")).exists()]

    for f in all_files:
        stat = f.stat()
        meta_file = BACKUP_DIR / (f.stem + ".meta.json")
        meta_data: Dict[str, Any] = {}
        if meta_file.exists():
            try:
                with open(meta_file, "r", encoding="utf-8-sig") as mf:
                    meta_data = json.load(mf)
            except Exception:
                meta_data = {}

        # Fallback SHA-256 calculation if missing
        sha_val = meta_data.get("sha256")
        if not sha_val or sha_val == "N/A":
            try:
                import hashlib
                sha256_hash = hashlib.sha256()
                with open(f, "rb") as bf:
                    for byte_block in iter(lambda: bf.read(65536), b""):
                        sha256_hash.update(byte_block)
                sha_val = sha256_hash.hexdigest().upper()
            except Exception:
                sha_val = "N/A"

        created_dt = datetime.fromtimestamp(stat.st_mtime)
        backups.append({
            "filename": f.name,
            "format": "PostGIS Custom Dump (.dump)" if f.suffix == ".dump" else "Plain SQL (.sql)",
            "sizeBytes": stat.st_size,
            "sizeMB": round(stat.st_size / (1024 * 1024), 2),
            "createdAt": created_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "sha256": sha_val,
            "tableOfContentsEntries": meta_data.get("tableOfContentsEntries", 0),
            "status": meta_data.get("status", "SUCCESS"),
            "municipality": meta_data.get("municipality", "Panchpokhari Thangpal Rural Municipality"),
            "hasUploads": bool(meta_data.get("uploadsZip"))
        })

    return backups


@router.get("/list")
@settings_backup_router.get("/list")
def list_backups():
    """Retrieve all available system snapshots and metadata."""
    files = get_backup_files()
    total_size_mb = sum(f["sizeMB"] for f in files)
    return {
        "success": True,
        "count": len(files),
        "totalStorageMB": round(total_size_mb, 2),
        "backups": files
    }


@router.post("/create")
@settings_backup_router.post("/create")
def create_manual_backup(
    include_sql: bool = Query(False, description="Whether to also generate an uncompressed .sql archive"),
    db: Session = Depends(get_db)
):
    """
    Trigger an instant on-demand PostGIS database and media backup.
    Executes scripts/backup_db.ps1 synchronously.
    """
    if not BACKUP_SCRIPT.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Backup script not found at: {BACKUP_SCRIPT}"
        )

    cmd = [
        "powershell.exe",
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", str(BACKUP_SCRIPT)
    ]
    if include_sql:
        cmd.append("-IncludeSqlText")

    try:
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=180,
            cwd=str(BASE_DIR)
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ब्याकअप प्रक्रिया समय सीमा समाप्त भयो (Backup timed out)")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ब्याकअप प्रक्रिया शुरु गर्न सकिएन: {str(e)}")

    if res.returncode != 0:
        err_msg = res.stderr or res.stdout or "अज्ञात त्रुटि"
        raise HTTPException(status_code=500, detail=f"ब्याकअप असफल भयो: {err_msg[:400]}")

    # Find the most recent backup generated
    backups = get_backup_files()
    latest = backups[0] if backups else None

    # Record Audit Log
    try:
        audit = SystemAuditLog(
            user_name="System Admin (Settings Manual Backup)",
            action="backup",
            entity_type="SystemBackup",
            description=f"म्यानुअल PostGIS डाटाबेस ब्याकअप सम्पन्न ({latest['filename'] if latest else 'Snapshot'}, {latest['sizeMB'] if latest else 0} MB)",
            status="SUCCESS",
            details={
                "file": latest["filename"] if latest else None,
                "size_mb": latest["sizeMB"] if latest else None,
                "sha256": latest["sha256"] if latest else None,
                "objects_archived": latest["tableOfContentsEntries"] if latest else None
            }
        )
        db.add(audit)
        db.commit()
    except Exception:
        db.rollback()

    return {
        "success": True,
        "message": "पाँचपोखरी थाङपाल गाउँपालिकाको डाटाबेस ब्याकअप सफलतापूर्वक सम्पन्न भयो!",
        "backup": latest,
        "logs": res.stdout[-500:] if res.stdout else ""
    }


@router.get("/download/{filename}")
@settings_backup_router.get("/download/{filename}")
def download_backup_file(filename: str):
    """Securely download a backup file to the administrator's local machine."""
    # Sanitize filename to prevent directory traversal
    if not re.match(r"^[a-zA-Z0-9_\-\.]+$", filename):
        raise HTTPException(status_code=400, detail="Invalid filename format")

    if not (filename.endswith(".dump") or filename.endswith(".sql") or filename.endswith(".zip") or filename.endswith(".json")):
        raise HTTPException(status_code=400, detail="Disallowed file extension")

    target_file = (BACKUP_DIR / filename).resolve()

    # Ensure resolved path is strictly inside BACKUP_DIR
    if not target_file.is_relative_to(BACKUP_DIR.resolve()):
        raise HTTPException(status_code=403, detail="Access denied")

    if not target_file.exists():
        raise HTTPException(status_code=404, detail="फाइल फेला परेन (Backup file not found)")

    return FileResponse(
        path=str(target_file),
        filename=filename,
        media_type="application/octet-stream"
    )
