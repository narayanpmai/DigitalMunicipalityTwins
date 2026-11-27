import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type BudgetSubHeadItem, type BudgetSourceItem } from '../../../api/projects';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Save,
  Filter,
  FileText,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

const formatNpr = (val: number | string | undefined): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '०.००';
  return toNepaliNum(
    Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

interface BudgetSubHeadsTabProps {
  onStartAgreementWithSubhead?: (subhead: BudgetSubHeadItem) => void;
}

export const BudgetSubHeadsTab: React.FC<BudgetSubHeadsTabProps> = ({
  onStartAgreementWithSubhead,
}) => {
  const queryClient = useQueryClient();
  const [fiscalYear, setFiscalYear] = useState('२०८१/०८२');
  const [levelFilter, setLevelFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetSubHeadItem | null>(null);
  const [subHeadNo, setSubHeadNo] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [sourceOfFund, setSourceOfFund] = useState('');
  const [level, setLevel] = useState('नगर स्तरिय');
  const [wardNumber, setWardNumber] = useState<number | ''>('');
  const [expenseType, setExpenseType] = useState('पुँजीगत खर्च');
  const [approvalState, setApprovalState] = useState('स्विकृत भएको');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Budget Sources for dropdown
  const { data: sources = [] } = useQuery({
    queryKey: ['budget-sources'],
    queryFn: () => projectsApi.getBudgetSources(),
  });

  // Fetch Budget Sub-Heads
  const { data: subheads = [], isLoading, refetch } = useQuery({
    queryKey: ['budget-sub-heads', fiscalYear, levelFilter, wardFilter, sourceFilter, expenseFilter, search],
    queryFn: () =>
      projectsApi.getBudgetSubHeads({
        fiscalYear: fiscalYear !== 'all' ? fiscalYear : undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined,
        ward: wardFilter !== 'all' ? wardFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        expenseType: expenseFilter !== 'all' ? expenseFilter : undefined,
        search: search.trim() || undefined,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<BudgetSubHeadItem>) => {
      if (editingItem?.id) {
        return projectsApi.updateBudgetSubHead(editingItem.id, data);
      }
      return projectsApi.createBudgetSubHead(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-sub-heads'] });
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      showToast(editingItem ? 'बजेट उप-शीर्षक अद्यावधिक भयो!' : 'नयाँ बजेट उप-शीर्षक कार्यक्रम सुरक्षित गरियो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.detail || 'सुरक्षित गर्दा समस्या भयो', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteBudgetSubHead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-sub-heads'] });
      showToast('बजेट उप-शीर्षक कार्यक्रम हटाइयो!');
    },
    onError: () => showToast('हटाउँदा समस्या भयो', 'error'),
  });

  const resetForm = () => {
    setSubHeadNo('');
    setTitle('');
    setAmount('');
    setSourceOfFund(sources[0]?.name || 'आन्तरीक स्रोत');
    setLevel('नगर स्तरिय');
    setWardNumber('');
    setExpenseType('पुँजीगत खर्च');
    setApprovalState('स्विकृत भएको');
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetSubHeadItem) => {
    setEditingItem(item);
    setSubHeadNo(item.subHeadNo || '');
    setTitle(item.title);
    setAmount(item.allocatedAmount);
    setSourceOfFund(item.sourceOfFund);
    setLevel(item.level || 'नगर स्तरिय');
    setWardNumber(item.wardNumber || '');
    setExpenseType(item.expenseType || 'पुँजीगत खर्च');
    setApprovalState(item.approvalState || 'स्विकृत भएको');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('योजना / कार्यक्रमको नाम अनिवार्य छ!', 'error');
      return;
    }
    saveMutation.mutate({
      subHeadNo: subHeadNo.trim(),
      title: title.trim(),
      allocatedAmount: typeof amount === 'number' ? amount : 0,
      sourceOfFund: sourceOfFund || 'आन्तरीक स्रोत',
      level,
      wardNumber: typeof wardNumber === 'number' ? wardNumber : undefined,
      expenseType,
      approvalState,
      fiscalYear,
    });
  };

  const totalAllocated = subheads.reduce((acc, curr) => acc + (curr.allocatedAmount || 0), 0);

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

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              बजेट उप-शीर्षक रकम सूची (Budget Sub-Head Allocations)
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#e0f2fe' }}>
              पाँचपोखरी थाङपाल गाउँपालिका अन्तर्गत स्वीकृत कार्यक्रमहरू (कार्यक्रम संख्या: {toNepaliNum(subheads.length)}, कुल विनियोजन: रु. {formatNpr(totalAllocated)})
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
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.15)',
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
              backgroundColor: '#ffffff',
              color: '#0369a1',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={16} />
            <span>+ नयाँ कार्यक्रम थप्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          backgroundColor: '#ffffff',
          padding: '1.15rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            आर्थिक वर्ष
          </label>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="२०८१/०८२">२०८१/०८२ (चालु)</option>
            <option value="२०८०/०८१">२०८०/०८१</option>
            <option value="२०७९/०८०">२०७९/०८०</option>
            <option value="all">सबै आर्थिक वर्ष</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            वडा / नगर स्तरिय
          </label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="all">सबै स्तर</option>
            <option value="नगर स्तरिय">नगर स्तरिय</option>
            <option value="वडा स्तरिय">वडा स्तरिय</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            वडा नं.
          </label>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="all">सबै वडाहरू</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
              <option key={w} value={String(w)}>
                वडा नं. {toNepaliNum(w)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            बजेट स्रोत
          </label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="all">सबै बजेट स्रोतहरू</option>
            {sources.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            खर्च किसिम
          </label>
          <select
            value={expenseFilter}
            onChange={(e) => setExpenseFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="all">सबै खर्च किसिम</option>
            <option value="पुँजीगत खर्च">पुँजीगत खर्च</option>
            <option value="चालु खर्च">चालु खर्च</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
            कार्यक्रम / उप-शीर्षक नं. खोज्नुहोस्
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम वा उप-शीर्षक नं...."
              style={{
                width: '100%',
                padding: '0.5rem 2rem 0.5rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.825rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '0.85rem 0.75rem', width: '50px', fontWeight: 700 }}>क्र.स.</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '120px', fontWeight: 700 }}>उप-शीर्षक नं.</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, minWidth: '220px' }}>योजना / कार्यक्रम</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '130px', fontWeight: 700, textAlign: 'right' }}>रकम (रु.)</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '160px', fontWeight: 700 }}>बजेट स्रोत</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '110px', fontWeight: 700 }}>वडा / नगर</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '110px', fontWeight: 700 }}>खर्च किसिम</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '100px', fontWeight: 700, textAlign: 'center' }}>स्थिति</th>
                <th style={{ padding: '0.85rem 0.75rem', width: '180px', fontWeight: 700, textAlign: 'center' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>बजेट उप-शीर्षक कार्यक्रमहरू लोड हुँदैछ...</div>
                  </td>
                </tr>
              ) : subheads.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    छानिएको फिल्टर अनुसार कुनै बजेट उप-शीर्षक कार्यक्रम फेला परेन।
                  </td>
                </tr>
              ) : (
                subheads.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td style={{ padding: '0.7rem 0.75rem', color: '#64748b', fontWeight: 600 }}>
                      {toNepaliNum(idx + 1)}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', fontWeight: 700, color: '#0369a1' }}>
                      {toNepaliNum(item.subHeadNo || '—')}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>
                      <div>{item.title}</div>
                      {item.sector && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {item.sector}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      {formatNpr(item.allocatedAmount)}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#334155' }}>
                      {item.sourceOfFund || '—'}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#334155' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: item.level?.includes('वडा') ? '#fef3c7' : '#e0e7ff',
                          color: item.level?.includes('वडा') ? '#b45309' : '#3730a3',
                        }}
                      >
                        {item.level || (item.wardNumber ? `वडा नं. ${toNepaliNum(item.wardNumber)}` : 'नगर स्तरिय')}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#475569' }}>
                      {item.expenseType || 'पुँजीगत खर्च'}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                        }}
                      >
                        {item.approvalState || item.status || 'स्विकृत'}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {onStartAgreementWithSubhead && (
                          <button
                            onClick={() => onStartAgreementWithSubhead(item)}
                            title="यस कार्यक्रमको सम्झौता फारम खोल्नुहोस्"
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              boxShadow: '0 1px 3px rgba(2, 132, 199, 0.25)',
                            }}
                          >
                            <span>सम्झौता</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="सम्पादन गर्नुहोस्"
                          style={{
                            padding: '0.35rem 0.55rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`के तपाईं '${item.title}' कार्यक्रम हटाउन निश्चित हुनुहुन्छ?`)) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          title="मेटाउनुहोस्"
                          style={{
                            padding: '0.35rem 0.55rem',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Sub-Head Modal */}
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
              maxWidth: '640px',
              maxHeight: '90vh',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflowY: 'auto',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '1.1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Layers size={20} color="#ffffff" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  {editingItem ? 'बजेट उप-शीर्षक सम्पादन गर्नुहोस्' : 'नयाँ बजेट उप-शीर्षक कार्यक्रम थप्नुहोस्'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    बजेट उप-शीर्षक नं.
                  </label>
                  <input
                    type="text"
                    value={subHeadNo}
                    onChange={(e) => setSubHeadNo(e.target.value)}
                    placeholder="उदा. ८०३२७५०४२०४"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    विनियोजित रकम (रु.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="उदा. ५०००००"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  योजना / कार्यक्रमको नाम *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. पेमाथाङ टासी छ्योलिङ गुम्बा मर्मत तथा संरक्षण"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    बजेट स्रोत *
                  </label>
                  <select
                    value={sourceOfFund}
                    onChange={(e) => setSourceOfFund(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">-- बजेट स्रोत छान्नुहोस् --</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    खर्च किसिम
                  </label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="पुँजीगत खर्च">पुँजीगत खर्च</option>
                    <option value="चालु खर्च">चालु खर्च</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    स्तर
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="नगर स्तरिय">नगर स्तरिय</option>
                    <option value="वडा स्तरिय">वडा स्तरिय</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    वडा नं. (वडा स्तरिय भएमा)
                  </label>
                  <select
                    value={wardNumber}
                    onChange={(e) => setWardNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">-- छान्नुहोस् --</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>
                        वडा नं. {toNepaliNum(w)}
                      </option>
                    ))}
                  </select>
                </div>
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
