import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import {
  TrendingUp,
  Award,
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  Building,
  GraduationCap,
  Heart,
  Layers,
  Shield,
  Sprout,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { MunicipalIndicator } from '../../../types/open-data';

interface MunicipalIndicatorsViewProps {
  isAdmin?: boolean;
}

export const MunicipalIndicatorsView: React.FC<MunicipalIndicatorsViewProps> = ({ isAdmin = false }) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedWardId, setExpandedWardId] = useState<string | null>(null);

  // Indicator edit/create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<MunicipalIndicator | null>(null);
  const [formData, setFormData] = useState({
    indicator_code: '',
    title_np: '',
    title_en: '',
    category: 'demography',
    baseline_value: '',
    current_value: '',
    target_value: '',
    unit: '',
    progress_percent: 0,
    fiscal_year: '२०८१/०८२',
    sdg_goal: '',
    status: 'on_track' as 'achieved' | 'on_track' | 'needs_attention',
    source_department: '',
  });

  const { data: indicators = [], isLoading, refetch } = useQuery<MunicipalIndicator[]>({
    queryKey: ['municipal-indicators', selectedCategory],
    queryFn: () => sectoralApi.getMunicipalIndicators({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    }) as Promise<MunicipalIndicator[]>,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingIndicator?.id) {
        return sectoralApi.updateOpenDataRecord(editingIndicator.id, payload);
      } else {
        const res = await fetch('/api/v1/open-data/indicators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('सूचक सुरक्षित गर्न सकिएन');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipal-indicators'] });
      setIsModalOpen(false);
      setEditingIndicator(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/open-data/indicators/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('सूचक मेटाउन सकिएन');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipal-indicators'] });
    },
  });

  const handleOpenAdd = () => {
    setEditingIndicator(null);
    setFormData({
      indicator_code: `IND-${Date.now().toString().slice(-4)}`,
      title_np: '',
      title_en: '',
      category: 'finance',
      baseline_value: '',
      current_value: '',
      target_value: '',
      unit: '%',
      progress_percent: 75,
      fiscal_year: '२०८१/०८२',
      sdg_goal: 'SDG 1: गरिबी निवारण',
      status: 'on_track',
      source_department: 'योजना शाखा',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ind: MunicipalIndicator) => {
    setEditingIndicator(ind);
    setFormData({
      indicator_code: ind.indicator_code,
      title_np: ind.title_np,
      title_en: ind.title_en || '',
      category: ind.category,
      baseline_value: ind.baseline_value || '',
      current_value: ind.current_value,
      target_value: ind.target_value || '',
      unit: ind.unit || '',
      progress_percent: ind.progress_percent || 0,
      fiscal_year: ind.fiscal_year,
      sdg_goal: ind.sdg_goal || '',
      status: ind.status,
      source_department: ind.source_department || '',
    });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={13} />
            <span>लक्ष्य हासिल</span>
          </span>
        );
      case 'on_track':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <TrendingUp size={13} />
            <span>प्रगतिशील</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }}>
            <AlertCircle size={13} />
            <span>थप सुधार आवश्यक</span>
          </span>
        );
    }
  };

  const categories = [
    { id: 'all', label: 'सबै सूचकहरू' },
    { id: 'demography', label: 'जनसाङ्ख्यिक' },
    { id: 'finance', label: 'बजेट तथा वित्त' },
    { id: 'education', label: 'शिक्षा' },
    { id: 'health', label: 'स्वास्थ्य' },
    { id: 'infrastructure', label: 'पूर्वाधार' },
    { id: 'governance', label: 'सुशासन' },
    { id: 'agriculture', label: 'कृषि' },
    { id: 'sdg', label: 'दिगो विकास लक्ष्य (SDG)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Category Pills & Admin Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '20px',
                border: selectedCategory === c.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                backgroundColor: selectedCategory === c.id ? '#0284c7' : '#ffffff',
                color: selectedCategory === c.id ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>+ नयाँ सूचक थप्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Indicators Grid */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>सूचकहरू लोड हुँदैछ...</div>
      ) : indicators.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          यो विधामा कुनै सूचक फेला परेन।
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {indicators.map((ind) => {
            const pct = Math.min(Math.max(ind.progress_percent || 0, 0), 100);
            const isWardOpen = expandedWardId === ind.id;

            return (
              <div
                key={ind.id}
                className="dt-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#0369a1' }}>
                        {ind.indicator_code}
                      </span>
                      {ind.sdg_goal && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', backgroundColor: '#fdf4ff', color: '#a21caf', border: '1px solid #f0abfc' }}>
                          {ind.sdg_goal.split(':')[0]}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {getStatusBadge(ind.status)}
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEdit(ind)}
                          title="सम्पादन"
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#0284c7' }}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.15rem 0', lineHeight: 1.4 }}>
                    {ind.title_np}
                  </h3>
                  {ind.title_en && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginBottom: '0.75rem' }}>
                      {ind.title_en}
                    </div>
                  )}

                  {/* Value Triplet: Baseline / Current / Target */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>आधार रेखा (Baseline)</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                        {ind.baseline_value || '—'}
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700 }}>हालको अवस्था (Current)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                        {ind.current_value}
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>लक्ष्य (Target)</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                        {ind.target_value || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      <span style={{ color: '#475569' }}>प्रगति दर</span>
                      <span style={{ color: '#0284c7' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: pct >= 95 ? '#16a34a' : pct >= 70 ? '#0284c7' : '#d97706',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Ward Breakdown Accordion */}
                  {ind.ward_breakdown && typeof ind.ward_breakdown === 'object' && Object.keys(ind.ward_breakdown).length > 0 && (
                    <div style={{ marginTop: '0.85rem' }}>
                      <button
                        onClick={() => setExpandedWardId(isWardOpen ? null : ind.id)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <span>वडागत विश्लेषण (Ward Breakdown)</span>
                        {isWardOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isWardOpen && (
                        <div style={{ marginTop: '0.5rem', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', fontSize: '0.75rem' }}>
                          {Object.entries(ind.ward_breakdown).map(([ward, val]) => (
                            <div key={ward} style={{ padding: '4px', backgroundColor: '#ffffff', borderRadius: '4px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                              <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>{ward}</div>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{String(val)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>शाखा: {ind.source_department || 'सम्बन्धित शाखा'}</span>
                  <span>आ.व. {ind.fiscal_year}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Indicator Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
              {editingIndicator ? 'पालिका सूचक सम्पादन गर्नुहोस्' : '+ नयाँ पालिका सूचक थप्नुहोस्'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>सूचक कोड (Indicator Code)</label>
                <input
                  type="text"
                  value={formData.indicator_code}
                  onChange={(e) => setFormData({ ...formData, indicator_code: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>सूचकको नाम (नेपालीमा) *</label>
                <input
                  type="text"
                  required
                  value={formData.title_np}
                  onChange={(e) => setFormData({ ...formData, title_np: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Title (In English)</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>क्षेत्र (Category)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="demography">जनसाङ्ख्यिक (Demography)</option>
                    <option value="finance">बजेट तथा वित्त (Finance)</option>
                    <option value="education">शिक्षा (Education)</option>
                    <option value="health">स्वास्थ्य (Health)</option>
                    <option value="infrastructure">पूर्वाधार (Infrastructure)</option>
                    <option value="governance">सुशासन (Governance)</option>
                    <option value="agriculture">कृषि (Agriculture)</option>
                    <option value="sdg">दिगो विकास लक्ष्य (SDG)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>स्थिति (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="on_track">प्रगतिशील (On Track)</option>
                    <option value="achieved">लक्ष्य हासिल (Achieved)</option>
                    <option value="needs_attention">सुधार आवश्यक (Needs Attention)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>आधार रेखा (Baseline)</label>
                  <input
                    type="text"
                    value={formData.baseline_value}
                    onChange={(e) => setFormData({ ...formData, baseline_value: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: '4px' }}>हालको अवस्था (Current) *</label>
                  <input
                    type="text"
                    required
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: '4px' }}>लक्ष्य (Target)</label>
                  <input
                    type="text"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>प्रगति प्रतिशत (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress_percent}
                    onChange={(e) => setFormData({ ...formData, progress_percent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>आर्थिक वर्ष</label>
                  <input
                    type="text"
                    value={formData.fiscal_year}
                    onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>सम्बन्धित दिगो विकास लक्ष्य (SDG Alignment)</label>
                <input
                  type="text"
                  placeholder="उदा: SDG 4: गुणस्तरीय शिक्षा"
                  value={formData.sdg_goal}
                  onChange={(e) => setFormData({ ...formData, sdg_goal: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>जिम्मेवार शाखा</label>
                <input
                  type="text"
                  placeholder="उदा: शिक्षा, युवा तथा खेलकुद शाखा"
                  value={formData.source_department}
                  onChange={(e) => setFormData({ ...formData, source_department: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: 600 }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate(formData)}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
