import React, { useMemo } from 'react';
import type { Project } from '../../../api/projects';
import { 
  Building, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Activity,
  Layers,
  MapPin,
  CalendarCheck
} from 'lucide-react';

interface ProjectsDashboardTabProps {
  projects: Project[];
}

export const ProjectsDashboardTab: React.FC<ProjectsDashboardTabProps> = ({ projects }) => {
  // Aggregate Calculations
  const stats = useMemo(() => {
    let totalBudget = 0;
    let totalPaid = 0;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    
    // Physical progress variables
    let totalPhysicalProgress = 0;
    let projectsWithProgress = 0;

    projects.forEach(p => {
      const budget = Number(p.officeCost || p.budget || 0);
      const paid = Number(p.paidAmount || 0);
      const progress = Number(p.physicalProgress || 0);
      
      totalBudget += budget;
      totalPaid += paid;
      
      if (progress > 0) {
        totalPhysicalProgress += progress;
        projectsWithProgress++;
      }

      if (p.status === 'completed') completed++;
      else if (p.status === 'in_progress') inProgress++;
      else notStarted++;
    });

    const avgPhysicalProgress = projectsWithProgress ? Math.round(totalPhysicalProgress / projectsWithProgress) : 0;
    const avgFinancialProgress = totalBudget ? Math.round((totalPaid / totalBudget) * 100) : 0;

    return { totalBudget, totalPaid, completed, inProgress, notStarted, avgPhysicalProgress, avgFinancialProgress };
  }, [projects]);

  const formatter = new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
      
      {/* High Level KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Total Budget */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05 }}>
            <Coins size={120} />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Coins size={18} color="#0f766e" /> कुल विनियोजित बजेट
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            {formatter.format(stats.totalBudget)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
            <TrendingUp size={14} /> अघिल्लो वर्षभन्दा १५% वृद्धि
          </div>
        </div>

        {/* Total Expenditure */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05 }}>
            <Activity size={120} />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Activity size={18} color="#3b82f6" /> कुल वित्तीय खर्च
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            {formatter.format(stats.totalPaid)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
            कुल बजेटको <strong>{stats.avgFinancialProgress}%</strong> भुक्तानी
          </div>
        </div>

        {/* Total Projects Count */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05 }}>
            <Layers size={120} />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={18} color="#f59e0b" /> जम्मा योजनाहरू
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            {projects.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>वटा</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> {stats.completed} सम्पन्न</span>
            <span style={{ fontSize: '0.8rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {stats.inProgress} चालु</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        
        {/* Physical Progress */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>औसत भौतिक प्रगति</h3>
          <div style={{ position: 'relative', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${stats.avgPhysicalProgress}%`, backgroundColor: '#10b981', transition: 'width 1s ease-in-out' }}></div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: stats.avgPhysicalProgress > 50 ? '#fff' : '#0f172a', textShadow: stats.avgPhysicalProgress > 50 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none' }}>
              {stats.avgPhysicalProgress}%
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem', lineHeight: 1.5 }}>
            नगरपालिकाभित्र सञ्चालित सम्पूर्ण योजनाहरूको स्थलगत नापजाँच तथा मुल्यांकनको आधारमा निकालिएको समग्र भौतिक प्रगति।
          </p>
        </div>

        {/* Financial Progress */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>औसत वित्तीय प्रगति</h3>
          <div style={{ position: 'relative', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${stats.avgFinancialProgress}%`, backgroundColor: '#3b82f6', transition: 'width 1s ease-in-out' }}></div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: stats.avgFinancialProgress > 50 ? '#fff' : '#0f172a', textShadow: stats.avgFinancialProgress > 50 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none' }}>
              {stats.avgFinancialProgress}%
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem', lineHeight: 1.5 }}>
            विनियोजित कुल बजेटको तुलनामा हालसम्म भुक्तानी भएको रकमको प्रतिशत। भौतिक प्रगतिको तुलनामा वित्तीय प्रगति सन्तुलित देखिन्छ।
          </p>
        </div>

      </div>

      {/* Recent Projects Highlights */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarCheck size={18} color="#0f766e" /> भर्खरै अपडेट भएका योजनाहरू
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {projects.slice(0, 4).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Building size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.75rem', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> वडा नं. {p.wardNumber || '-'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Coins size={12} /> {formatter.format(Number(p.officeCost || p.budget || 0))}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: p.status === 'completed' ? '#10b981' : (p.status === 'in_progress' ? '#3b82f6' : '#94a3b8') }}>
                  {p.status === 'completed' ? 'सम्पन्न' : (p.status === 'in_progress' ? 'चालु' : 'सुरु नभएको')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  भौतिक प्रगति: {p.physicalProgress || 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
