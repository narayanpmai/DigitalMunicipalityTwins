import React, { useState, useMemo } from 'react';
import type { Project } from '../../../api/projects';
import type { GisFacility } from '../../../types/profile';
import { PalikaMap } from '../../../components/maps/PalikaMap';
import {
  MapPin,
  Search,
  Layers,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface ProjectsGisTabProps {
  projects: Project[];
  onOpenProject?: (project: Project) => void;
  onUpdateCoordinates?: (projectId: string, lat: number, lng: number) => Promise<void>;
}

const WARD_CENTERS: Record<number, { lat: number; lng: number }> = {
  0: { lat: 27.9398, lng: 85.5921 },
  1: { lat: 27.9450, lng: 85.6130 },
  2: { lat: 27.9880, lng: 85.6310 },
  3: { lat: 27.9789, lng: 85.6123 },
  4: { lat: 27.9610, lng: 85.5980 },
  5: { lat: 27.9234, lng: 85.5801 },
  6: { lat: 27.9398, lng: 85.5921 },
  7: { lat: 27.9117, lng: 85.5692 },
  8: { lat: 27.9087, lng: 85.5745 },
};

export const ProjectsGisTab: React.FC<ProjectsGisTabProps> = ({
  projects,
  onOpenProject,
  onUpdateCoordinates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [baseLayer, setBaseLayer] = useState<'satellite' | 'streets' | 'topo'>('satellite');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (wardFilter !== 'all' && Number(p.wardNumber) !== Number(wardFilter)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const hay = `${p.name || ''} ${p.projectCode || ''} ${p.location || ''} ${p.sector || ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [projects, wardFilter, statusFilter, searchQuery]);

  const facilities: GisFacility[] = useMemo(() => {
    return filteredProjects.map((p) => {
      const wardNo = Number(p.wardNumber || 0);
      const fallback = WARD_CENTERS[wardNo] || WARD_CENTERS[0];
      const lat = p.latitude && Number(p.latitude) !== 0 ? Number(p.latitude) : fallback.lat;
      const lng = p.longitude && Number(p.longitude) !== 0 ? Number(p.longitude) : fallback.lng;
      return {
        id: String(p.id),
        name: p.name,
        code: p.projectCode,
        type: 'project',
        wardNo: wardNo || 1,
        lat,
        lng,
        contact: p.committeePhone || p.engineerPhone,
        categoryNepali: `${p.sector || 'पूर्वाधार'} • रु. ${Number(p.officeCost || p.budget || 0).toLocaleString()} (${Number(p.progressPercentage ?? p.physicalProgress ?? 0)}%)`,
      };
    });
  }, [filteredProjects]);

  const statusCounts = useMemo(() => {
    return {
      completed: filteredProjects.filter((p) => p.status === 'completed').length,
      ongoing: filteredProjects.filter((p) => p.status === 'ongoing' || p.status === 'in_progress' || p.status === 'approved').length,
      planned: filteredProjects.filter((p) => p.status === 'planned' || p.status === 'planning').length,
    };
  }, [filteredProjects]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="योजना वा स्थान खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="all">सबै वडा (१-८)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
              <option key={w} value={w}>वडा नं. {w}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="all">सबै स्थिति ({filteredProjects.length})</option>
            <option value="ongoing">सञ्चालनमा ({statusCounts.ongoing})</option>
            <option value="completed">सम्पन्न ({statusCounts.completed})</option>
            <option value="planned">योजना चरण ({statusCounts.planned})</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['satellite', 'streets', 'topo'] as const).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setBaseLayer(layer)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: baseLayer === layer ? '1px solid #0f766e' : '1px solid #cbd5e1',
                backgroundColor: baseLayer === layer ? '#0f766e' : '#ffffff',
                color: baseLayer === layer ? '#ffffff' : '#334155',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Layers size={14} />
              <span>{layer === 'satellite' ? 'स्याटेलाइट' : layer === 'streets' ? 'सडक नक्सा' : 'भू-बनावट (Topo)'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Real Leaflet PalikaMap + Project Quick Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: '1rem', alignItems: 'start' }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}>
          <PalikaMap
            facilities={facilities}
            selectedWard={wardFilter}
            baseLayer={baseLayer}
            onBaseLayerChange={setBaseLayer}
            height="540px"
            zoom={12}
            showTrekkingTrail={true}
            onUpdateLocation={onUpdateCoordinates}
          />
          <div style={{ padding: '0.5rem 0.85rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>📍 कुल नक्साङ्कित आयोजना: <strong>{facilities.length}</strong> (पिन तानेर वास्तविक GPS स्थान अद्यावधिक गर्न सकिन्छ)</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={13} color="#0f766e" /> पाँचपोखरी थाङपाल गाउँपालिका GIS
            </span>
          </div>
        </div>

        {/* Project List Sidebar */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '580px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            नक्सा सूची ({filteredProjects.length} आयोजना)
          </div>
          {filteredProjects.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
              कुनै आयोजना फेला परेन।
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                  <span style={{ fontWeight: 700, color: '#0369a1' }}>वडा नं. {p.wardNumber}</span>
                  <span style={{ fontFamily: 'monospace', color: '#475569' }}>
                    {p.latitude && p.longitude ? `${Number(p.latitude).toFixed(4)}, ${Number(p.longitude).toFixed(4)}` : 'वडा केन्द्र GPS'}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', lineHeight: 1.35 }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#475569' }}>
                  <span>प्रगति: {Number(p.progressPercentage ?? p.physicalProgress ?? 0)}%</span>
                  {onOpenProject && (
                    <button
                      type="button"
                      onClick={() => onOpenProject(p)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bae6fd',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                      }}
                    >
                      सम्पादन <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
