import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  agricultureApi,
  AgriAdvisory,
} from '../../../api/agriculture';
import {
  CloudLightning,
  Bug,
  Sprout,
  ShieldAlert,
  Info,
  Plus,
  Trash2,
  Calendar,
  Building,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import '../agriculture-pro.css';

export const AgriAdvisoryTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [newAdvisory, setNewAdvisory] = useState<Partial<AgriAdvisory>>({
    title: '',
    content: '',
    advisoryType: 'weather',
    issuedBy: 'पाँचपोखरी थाङपाल कृषि तथा पशुपन्छी विकास शाखा',
  });
  const [validDays, setValidDays] = useState<number>(15);

  const { data: advisories = [], isLoading } = useQuery({
    queryKey: ['advisories-admin'],
    queryFn: () => agricultureApi.getAdvisories(false),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<AgriAdvisory>) => agricultureApi.createAdvisory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories-admin'] });
      setShowAddModal(false);
      setNewAdvisory({
        title: '',
        content: '',
        advisoryType: 'weather',
        issuedBy: 'पाँचपोखरी थाङपाल कृषि तथा पशुपन्छी विकास शाखा',
      });
      setToastMessage({ type: 'success', text: 'नयाँ कृषि परामर्श सफलतापूर्वक जारी गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.response?.data?.message || err.message) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agricultureApi.deleteAdvisory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories-admin'] });
      setToastMessage({ type: 'success', text: 'परामर्श सफलतापूर्वक हटाइयो!' });
    },
  });

  const getStyleForType = (type: string) => {
    switch (type) {
      case 'weather':
        return {
          icon: <CloudLightning size={20} color="#d97706" />,
          badgeBg: '#fef3c7',
          badgeText: '#92400e',
          label: 'मौसम सतर्कता',
          borderColor: '#f59e0b',
        };
      case 'pest_control':
        return {
          icon: <Bug size={20} color="#dc2626" />,
          badgeBg: '#fee2e2',
          badgeText: '#991b1b',
          label: 'रोगकिरा नियन्त्रण',
          borderColor: '#ef4444',
        };
      case 'crop_management':
        return {
          icon: <Sprout size={20} color="#16a34a" />,
          badgeBg: '#dcfce7',
          badgeText: '#15803d',
          label: 'बाली व्यवस्थापन',
          borderColor: '#22c55e',
        };
      case 'livestock_health':
        return {
          icon: <ShieldAlert size={20} color="#9333ea" />,
          badgeBg: '#f3e8ff',
          badgeText: '#7e22ce',
          label: 'पशु स्वास्थ्य',
          borderColor: '#a855f7',
        };
      default:
        return {
          icon: <Info size={20} color="#0284c7" />,
          badgeBg: '#e0f2fe',
          badgeText: '#0369a1',
          label: 'सामान्य परामर्श',
          borderColor: '#38bdf8',
        };
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);
    createMutation.mutate({
      ...newAdvisory,
      validUntil: validUntil.toISOString().slice(0, 10),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-300" /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="agri-glass-card" style={{ padding: '1.1rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
            कृषि-मौसम तथा प्राविधिक सल्लाह बुलेटिन ({advisories.length})
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            किसानहरूका लागि मौसम सतर्कता, रोगकिरा नियन्त्रण र प्राविधिक सूचनाहरू
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="gov-btn gov-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ea580c', borderColor: '#ea580c', fontWeight: 800 }}
        >
          <Plus size={16} />
          <span>नयाँ परामर्श जारी गर्नुहोस्</span>
        </button>
      </div>

      {/* Advisories Grid */}
      {isLoading ? (
        <div className="agri-glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          परामर्शहरू लोड हुँदैछन्...
        </div>
      ) : advisories.length === 0 ? (
        <div className="agri-glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          हाल कुनै परामर्श जारी गरिएको छैन।
        </div>
      ) : (
        <div className="agri-grid-auto">
          {advisories.map((advisory) => {
            const style = getStyleForType(advisory.advisoryType);
            return (
              <div
                key={advisory.id}
                className="agri-glass-card"
                style={{
                  borderLeft: `5px solid ${style.borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  {/* Category & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: style.badgeBg,
                        color: style.badgeText,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {style.icon} {style.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {advisory.issuedDate ? new Date(advisory.issuedDate).toLocaleDateString() : '-'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {advisory.title}
                  </h4>

                  {/* Content */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                    {advisory.content}
                  </p>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building size={12} />
                    <span>{advisory.issuedBy || 'कृषि शाखा'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {advisory.validUntil && (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>
                        मान्य मिति: {new Date(advisory.validUntil).toLocaleDateString()}
                      </span>
                    )}
                    {advisory.id && (
                      <button
                        onClick={() => {
                          if (confirm('के तपाईं यो परामर्श हटाउन चाहनुहुन्छ?')) {
                            deleteMutation.mutate(advisory.id!);
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '2px' }}
                        title="हटाउनुहोस्"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Advisory Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="dt-card" style={{ maxWidth: '560px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700 }}>नयाँ प्राविधिक परामर्श / पूर्वसूचना जारी गर्नुहोस्</h4>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="dt-label">परामर्श शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: आलुको डढुवा रोकथाम, तुसारो सतर्कता, आदि"
                  value={newAdvisory.title || ''}
                  onChange={(e) => setNewAdvisory({ ...newAdvisory, title: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div className="agri-grid-2">
                <div>
                  <label className="dt-label">परामर्श प्रकार *</label>
                  <select
                    value={newAdvisory.advisoryType || 'weather'}
                    onChange={(e) => setNewAdvisory({ ...newAdvisory, advisoryType: e.target.value as any })}
                    className="dt-select"
                  >
                    <option value="weather">मौसम (Weather Alert)</option>
                    <option value="pest_control">रोगकिरा (Pest Control)</option>
                    <option value="crop_management">बाली व्यवस्थापन (Crop Management)</option>
                    <option value="livestock_health">पशु स्वास्थ्य (Livestock Health)</option>
                    <option value="general">सामान्य (General)</option>
                  </select>
                </div>
                <div>
                  <label className="dt-label">मान्य रहने अवधि (दिन) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="dt-input"
                  />
                </div>
              </div>

              <div>
                <label className="dt-label">विस्तृत प्राविधिक परामर्श व्यहोरा *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="किसानहरूलाई पालना गर्नुपर्ने प्राविधिक सुझावहरू..."
                  value={newAdvisory.content || ''}
                  onChange={(e) => setNewAdvisory({ ...newAdvisory, content: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="dt-label">जारी गर्ने शाखा / निकाय</label>
                <input
                  type="text"
                  value={newAdvisory.issuedBy || ''}
                  onChange={(e) => setNewAdvisory({ ...newAdvisory, issuedBy: e.target.value })}
                  className="dt-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="dt-btn dt-btn-outline">
                  रद्द
                </button>
                <button type="submit" disabled={createMutation.isPending} className="dt-btn dt-btn-primary">
                  {createMutation.isPending ? 'जारी गरिँदैछ...' : 'परामर्श प्रकाशित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
