import React, { useState } from 'react';
import type { Project } from '../../../api/projects';
import { 
  Map as MapIcon, 
  MapPin, 
  Building2, 
  Droplets, 
  Trees, 
  Activity, 
  Search,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ProjectsGisTabProps {
  projects: Project[];
}

export const ProjectsGisTab: React.FC<ProjectsGisTabProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Mock geographical distribution of projects across the municipality wards
  const mockLocations = [
    { top: '25%', left: '30%' },
    { top: '45%', left: '55%' },
    { top: '65%', left: '40%' },
    { top: '35%', left: '70%' },
    { top: '55%', left: '20%' },
    { top: '75%', left: '60%' },
    { top: '20%', left: '50%' },
    { top: '80%', left: '35%' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 220px)', minHeight: '600px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="योजनाको नाम खोज्नुहोस्..." 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
            <Filter size={16} /> फिल्टर
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}>
            <Layers size={16} /> स्याटेलाइट भ्यु
          </button>
        </div>
      </div>

      {/* Main Map Area */}
      <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '12px', border: '1px solid #cbd5e1', position: 'relative', overflow: 'hidden' }}>
        
        {/* Mock Map Background Grid */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundColor: '#f8fafc'
        }}></div>
        
        {/* Mock Topography / Roads */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2, pointerEvents: 'none' }}>
          <path d="M 0,100 C 150,200 300,50 500,200 C 700,350 850,150 1000,250" fill="none" stroke="#0f766e" strokeWidth="8" />
          <path d="M 200,0 C 250,150 100,350 300,500" fill="none" stroke="#3b82f6" strokeWidth="4" />
          <path d="M 600,100 C 650,250 500,450 700,600" fill="none" stroke="#64748b" strokeWidth="4" strokeDasharray="5,5" />
        </svg>

        {/* Floating Data Legend */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>योजनाको प्रकार</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} color="#f59e0b" /> सडक तथा पुल (१५)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={14} color="#3b82f6" /> भवन निर्माण (८)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Droplets size={14} color="#0ea5e9" /> खानेपानी (१२)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trees size={14} color="#10b981" /> कृषि तथा पर्यटन (५)</span>
          </div>
        </div>

        {/* Plotting the pins based on projects */}
        {projects.map((p, i) => {
          // Assign random mock locations if coordinate doesn't exist
          const loc = mockLocations[i % mockLocations.length];
          const isSelected = selectedProject?.id === p.id;
          
          return (
            <div 
              key={p.id || i}
              onClick={() => setSelectedProject(p)}
              style={{
                position: 'absolute',
                top: loc.top,
                left: loc.left,
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                zIndex: isSelected ? 50 : 10,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                animation: 'bounce 2s infinite', 
                animationPlayState: isSelected ? 'paused' : 'running',
                transform: isSelected ? 'scale(1.2)' : 'scale(1)'
              }}>
                <MapPin size={32} color={p.status === 'completed' ? '#10b981' : (p.status === 'in_progress' ? '#3b82f6' : '#f59e0b')} fill="#ffffff" />
              </div>
              
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '10px',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '12px',
                  width: '280px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span>वडा नं. {p.wardNumber}</span>
                    <span style={{ color: p.status === 'completed' ? '#10b981' : '#3b82f6', fontWeight: 600 }}>{p.physicalProgress || 0}% प्रगति</span>
                  </div>
                  
                  <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ width: `${p.physicalProgress || 0}%`, height: '100%', backgroundColor: p.status === 'completed' ? '#10b981' : '#3b82f6' }}></div>
                  </div>

                  <button style={{ width: '100%', padding: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f766e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    विस्तृत विवरण हेर्नुहोस् <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Global Live Indicator */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
          लाइभ कमाण्ड सेन्टर (Live)
        </div>

      </div>
    </div>
  );
};
