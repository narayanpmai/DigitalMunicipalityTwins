import React, { useEffect, useRef, useState } from 'react';
import type { SensorItem } from '../../api/municipality';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  Activity,
  Layers,
} from 'lucide-react';

interface Terrain3DViewProps {
  sensors?: SensorItem[];
  height?: string;
}

interface Point3D {
  x: number;
  y: number; // elevation
  z: number;
}

export const Terrain3DView: React.FC<Terrain3DViewProps> = ({
  sensors = [],
  height = '560px',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationX, setRotationX] = useState<number>(0.55); // tilt angle
  const [rotationY, setRotationY] = useState<number>(0.75); // azimuth
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Panchpokhari Topographic Grid (Valley 1,200m -> 4,100m Peak)
  const gridSize = 24;
  const gridSpacing = 22;

  // Elevation generator modeled after Panchpokhari geography
  const getElevation = (gx: number, gz: number): number => {
    // Normalizing coordinates from -1 to 1
    const nx = (gx - gridSize / 2) / (gridSize / 2);
    const nz = (gz - gridSize / 2) / (gridSize / 2);

    // River gorge running north-south in middle
    const riverValley = Math.exp(-Math.pow(nx * 3.5, 2)) * -45;

    // Mountain slopes rising steeply to North/East (Panchpokhari Range)
    const alpineSlope = (nz * 0.8 + 0.5) * 80 + Math.sin(nx * 3.0) * 20;

    // Rugged mountain ridgelines
    const ridges = Math.cos(nx * 5.0) * Math.sin(nz * 4.0) * 25;

    return Math.max(10, alpineSlope + riverValley + ridges + 50);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Resize support
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 560;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Gradient Sky Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.65, '#1e293b');
      skyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Starry sky / high altitude haze
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33) * 0.5 + 0.5) * (height * 0.4);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Projection parameters
      const centerX = width / 2;
      const centerY = height / 2 + 50;
      const scale = 1.1 * zoom;

      const project = (p: Point3D): { x: number; y: number; z: number } => {
        // Rotate Y (azimuth)
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate X (tilt)
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Isometric / Perspective projection
        const fov = 450;
        const dist = z2 + 600;
        const projScale = (fov / dist) * scale;

        return {
          x: centerX + x1 * projScale,
          y: centerY - y2 * projScale,
          z: z2,
        };
      };

      // 1. Draw 3D Topographic Terrain Mesh
      const halfGrid = (gridSize * gridSpacing) / 2;

      for (let gx = 0; gx < gridSize; gx++) {
        for (let gz = 0; gz < gridSize; gz++) {
          const x0 = gx * gridSpacing - halfGrid;
          const z0 = gz * gridSpacing - halfGrid;
          const y0 = getElevation(gx, gz);

          const x1 = (gx + 1) * gridSpacing - halfGrid;
          const z1 = gz * gridSpacing - halfGrid;
          const y1 = getElevation(gx + 1, gz);

          const x2 = gx * gridSpacing - halfGrid;
          const z2 = (gz + 1) * gridSpacing - halfGrid;
          const y2 = getElevation(gx, gz + 1);

          const p0 = project({ x: x0, y: y0, z: z0 });
          const p1 = project({ x: x1, y: y1, z: z1 });
          const p2 = project({ x: x2, y: y2, z: z2 });

          // Elevation color mapping (River valley -> High alpine snow)
          const avgElev = (y0 + y1 + y2) / 3;
          let strokeColor = 'rgba(56, 189, 248, 0.25)'; // Valley
          let fillColor = 'rgba(14, 116, 144, 0.15)';

          if (avgElev > 120) {
            strokeColor = 'rgba(255, 255, 255, 0.6)'; // Snow peak
            fillColor = 'rgba(226, 232, 240, 0.25)';
          } else if (avgElev > 80) {
            strokeColor = 'rgba(52, 211, 153, 0.4)'; // Sub-alpine forest
            fillColor = 'rgba(16, 185, 129, 0.18)';
          } else if (avgElev > 45) {
            strokeColor = 'rgba(245, 158, 11, 0.35)'; // Middle hill terraced
            fillColor = 'rgba(217, 119, 6, 0.12)';
          }

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 2. Render Melamchi River Vector Path (Valley Flow)
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      for (let i = 0; i < gridSize; i++) {
        const rx = Math.sin(i * 0.4) * 15;
        const rz = i * gridSpacing - halfGrid;
        const ry = getElevation(gridSize / 2, i) - 8;
        const rp = project({ x: rx, y: ry, z: rz });
        if (i === 0) ctx.moveTo(rp.x, rp.y);
        else ctx.lineTo(rp.x, rp.y);
      }
      ctx.stroke();

      // 3. Render 3D Spatial IoT Sensors & Major Mountain Landmarks
      const landmarks = [
        {
          name: 'पाँचपोखरी पवित्र कुण्ड (४,१०० मिटर)',
          gx: 20,
          gz: 21,
          type: 'peak',
          color: '#38bdf8',
          icon: '⛰️'
        },
        {
          name: 'आमा याङ्ग्री पिक (३,७७१ मिटर)',
          gx: 6,
          gz: 19,
          type: 'peak',
          color: '#f59e0b',
          icon: '⛰️'
        },
        {
          name: 'भोटेकोशी होमस्टे',
          gx: 12,
          gz: 15,
          type: 'hotel',
          color: '#8b5cf6',
          icon: '🏨'
        },
        {
          name: 'पाँचपोखरी इको रिसोर्ट',
          gx: 14,
          gz: 12,
          type: 'hotel',
          color: '#8b5cf6',
          icon: '🏨'
        }
      ];

      // Landmarks rendering
      landmarks.forEach((lm) => {
        const x = lm.gx * gridSpacing - halfGrid;
        const z = lm.gz * gridSpacing - halfGrid;
        const y = getElevation(lm.gx, lm.gz) + 12;
        const p = project({ x, y, z });

        ctx.fillStyle = lm.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${lm.icon || '📍'} ${lm.name}`, p.x + 8, p.y - 4);
      });

      // Render Active IoT Sensors with Pulsing Radar Rings
      const time = Date.now() * 0.003;
      sensors.forEach((s, idx) => {
        // Map sensor coordinates to 3D grid
        const gx = Math.min(gridSize - 1, Math.max(0, Math.floor(((s.longitude - 85.60) / 0.13) * gridSize)));
        const gz = Math.min(gridSize - 1, Math.max(0, Math.floor(((s.latitude - 27.93) / 0.12) * gridSize)));

        const x = gx * gridSpacing - halfGrid;
        const z = gz * gridSpacing - halfGrid;
        const y = getElevation(gx, gz) + 18;
        const p = project({ x, y, z });

        const isWarning = s.status === 'Warning' || s.status === 'Critical';
        const sensorColor = isWarning ? '#ef4444' : '#10b981';

        // Vertical stem line from ground to sensor node
        const groundP = project({ x, y: getElevation(gx, gz), z });
        ctx.beginPath();
        ctx.strokeStyle = sensorColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.moveTo(groundP.x, groundP.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing radar ring
        const pulse = (Math.sin(time + idx) * 0.5 + 0.5) * 8 + 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = sensorColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Solid marker core
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = sensorColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(`📡 ${s.sensorId} (${s.lastValue} ${s.unit})`, p.x + 8, p.y + 3);
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rotationX, rotationY, zoom, sensors]);

  // Mouse Interaction handlers for 3D Camera Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotationY((prev) => prev + deltaX * 0.008);
    setRotationX((prev) => Math.max(0.15, Math.min(1.25, prev - deltaY * 0.008)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetCamera = () => {
    setRotationX(0.55);
    setRotationY(0.75);
    setZoom(1.0);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={(e) => {
        e.preventDefault();
        setZoom((prev) => Math.max(0.6, Math.min(2.0, prev - e.deltaY * 0.001)));
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Top HUD Bar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '0.5rem 0.85rem',
          color: '#ffffff',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={14} color="#38bdf8" />
          <span>३D डिजिटल ट्विन भू-धरातल (3D Terrain)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
          <Compass size={14} />
          <span>कोण: {Math.round((rotationY * 180) / Math.PI) % 360}° | झुकाव: {Math.round((rotationX * 180) / Math.PI)}°</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
          <Activity size={14} />
          <span>{sensors.length} IoT स्टेशन सक्रिय</span>
        </div>
      </div>

      {/* Floating Camera Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
          title="Zoom In"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
          title="Zoom Out"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Minimize2 size={16} />
        </button>
        <button
          onClick={handleResetCamera}
          title="क्यामेरा रिसेट गर्नुहोस्"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Helper instruction tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          color: '#94a3b8',
        }}
      >
        माउस तानेर क्यामेरा घुमाउनुहोस् (Drag to rotate, Scroll to zoom)
      </div>
    </div>
  );
};

export default Terrain3DView;
