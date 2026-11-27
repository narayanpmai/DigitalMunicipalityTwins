import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type BudgetSourceItem } from '../../../api/projects';
import {
  Coins,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Save,
  Check,
} from 'lucide-react';

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const BudgetSourcesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'सक्रिय' | 'निष्क्रिय'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<BudgetSourceItem | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceSn, setSourceSn] = useState<number | ''>('');
  const [sourceStatus, setSourceStatus] = useState<'सक्रिय' | 'निष्क्रिय'>('सक्रिय');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: sources = [], isLoading, refetch } = useQuery({
    queryKey: ['budget-sources'],
    queryFn: () => projectsApi.getBudgetSources(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<BudgetSourceItem>) => {
      if (editingSource?.id) {
        return projectsApi.updateBudgetSource(editingSource.id, data);
      }
      return projectsApi.createBudgetSource(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-sources'] });
      setIsModalOpen(false);
      setEditingSource(null);
      setSourceName('');
      setSourceSn('');
      showToast(editingSource ? 'बजेट स्रोत विवरण अद्यावधिक भयो!' : 'नयाँ बजेट स्रोत सुरक्षित गरियो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.detail || 'बजेट स्रोत सुरक्षित गर्दा समस्या भयो', 'error');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      projectsApi.toggleBudgetSourceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-sources'] });
      showToast('स्थिति सफलतापूर्वक परिवर्तन गरियो!');
    },
    onError: () => showToast('स्थिति परिवर्तन गर्दा समस्या भयो', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteBudgetSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-sources'] });
      showToast('बजेट स्रोत हटाइयो!');
    },
    onError: () => showToast('हटाउँदा समस्या भयो', 'error'),
  });

  const handleOpenAdd = () => {
    setEditingSource(null);
    setSourceName('');
    setSourceSn(sources.length + 1);
    setSourceStatus('सक्रिय');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (src: BudgetSourceItem) => {
    setEditingSource(src);
    setSourceName(src.name);
    setSourceSn(src.sn);
    setSourceStatus(src.status === 'सक्रिय' ? 'सक्रिय' : 'निष्क्रिय');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim()) {
      showToast('बजेट स्रोत नाम अनिवार्य छ!', 'error');
      return;
    }
    saveMutation.mutate({
      name: sourceName.trim(),
      sn: typeof sourceSn === 'number' ? sourceSn : undefined,
      status: sourceStatus,
    });
  };

  const filtered = sources.filter((s) => {
    const matchSearch = !search.trim() || s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = sources.filter((s) => s.status === 'सक्रिय').length;
  const inactiveCount = sources.filter((s) => s.status === 'निष्क्रिय').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Info & Actions */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Coins size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              बजेट स्रोत सूची (Budget Sources Master)
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#94a3b8' }}>
              पाँचपोखरी थाङपाल गाउँपालिका अन्तर्गत स्वीकृत बजेट स्रोतहरू (कुल स्रोतहरू: {toNepaliNum(sources.length)}, सक्रिय: {toNepaliNum(activeCount)}, निष्क्रिय: {toNepaliNum(inactiveCount)})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => refetch()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>ताजा गर्नुहोस्</span>
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>+ नयाँ स्रोत थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="बजेट स्रोत नाम खोज्नुहोस्..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.875rem',
              color: '#1e293b',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>स्थिति:</span>
          {(['all', 'सक्रिय', 'निष्क्रिय'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: statusFilter === st ? '#0284c7' : '#cbd5e1',
                backgroundColor: statusFilter === st ? '#0284c7' : '#f8fafc',
                color: statusFilter === st ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              {st === 'all' ? 'सबै' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '0.85rem 1rem', width: '80px', fontWeight: 700 }}>क्र.स.</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>बजेट स्रोत नाम</th>
                <th style={{ padding: '0.85rem 1rem', width: '180px', fontWeight: 700, textAlign: 'center' }}>स्थिति</th>
                <th style={{ padding: '0.85rem 1rem', width: '160px', fontWeight: 700, textAlign: 'center' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>बजेट स्रोतहरू लोड हुँदैछ...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    कुनै बजेट स्रोत फेला परेन।
                  </td>
                </tr>
              ) : (
                filtered.map((src, idx) => {
                  const isActive = src.status === 'सक्रिय';
                  return (
                    <tr
                      key={src.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>
                        {toNepaliNum(src.sn || idx + 1)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {src.name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() =>
                            toggleMutation.mutate({
                              id: src.id,
                              status: isActive ? 'निष्क्रिय' : 'सक्रिय',
                            })
                          }
                          title="स्थिति परिवर्तन गर्न क्लिक गर्नुहोस्"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#059669' : '#dc2626',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#10b981' : '#ef4444',
                            }}
                          />
                          <span>{src.status}</span>
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEdit(src)}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#0284c7',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            <Edit2 size={13} />
                            <span>सम्पादन</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`के तपाईं '${src.name}' बजेट स्रोत हटाउन निश्चित हुनुहुन्छ?`)) {
                                deleteMutation.mutate(src.id);
                              }
                            }}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            <Trash2 size={13} />
                            <span>हटाउनुहोस्</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '1.1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Coins size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  {editingSource ? 'बजेट स्रोत सम्पादन गर्नुहोस्' : 'नयाँ बजेट स्रोत थप्नुहोस्'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  क्रम संख्या (S.N.)
                </label>
                <input
                  type="number"
                  value={sourceSn}
                  onChange={(e) => setSourceSn(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  placeholder="उदा. १"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  बजेट स्रोत नाम *
                </label>
                <input
                  type="text"
                  required
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  placeholder="उदा. संघीय सरकार वित्तीय समानीकरण अनुदान"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  स्थिति
                </label>
                <select
                  value={sourceStatus}
                  onChange={(e) => setSourceStatus(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="सक्रिय">सक्रिय (Active)</option>
                  <option value="निष्क्रिय">निष्क्रिय (Inactive)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.35rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <Save size={16} />
                  <span>{saveMutation.isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
