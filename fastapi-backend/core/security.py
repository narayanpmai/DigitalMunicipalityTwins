"""
JWT Security utilities for Municipal Digital Twins FastAPI Backend.
Handles access token generation, refresh token generation, and verification.
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Any
import jwt
import bcrypt

# ─── Config ──────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "p5digital-jwt-secret-change-in-production")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "p5digital-refresh-secret-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_ACCESS_EXPIRES_DAYS", "7"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_EXPIRES_DAYS", "30"))

def hash_password(password: str) -> str:
    # Hash a password for the first time
    # (Using bcrypt, the salt is saved into the hash itself)
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Check hashed password. Using bcrypt, the salt is saved into the hash itself
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False


# ─── JWT Token utilities ─────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, JWT_REFRESH_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_REFRESH_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
