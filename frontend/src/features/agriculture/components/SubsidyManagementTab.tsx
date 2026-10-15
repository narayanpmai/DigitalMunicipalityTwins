import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demographicsApi, type HouseholdRecord } from '../../../api/demographics';
import { agricultureApi, type AgricultureProfile, type SubsidyRecord } from '../../../api/agriculture';
import { Coins, Filter, Search, Plus, TrendingUp, CheckCircle, ArrowRight, Wheat, Tractor, Users } from 'lucide-react';

export const SubsidyManagementTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modals state
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('');
  const [newSubsidy, setNewSubsidy] = useState<SubsidyRecord>({
    date: new Date().toISOString().split('T')[0],
    fiscalYear: '२०८१/०८२',
    purpose: '',
    amount: 0,
  });

  // Fetch all households to derive agricultural profiles and subsidies
  const { data: households = [], isLoading } = useQuery<HouseholdRecord[]>({
    queryKey: ['households'],
    queryFn: async () => {
      const res = await demographicsApi.getAllHouseholds();
      return res.data || [];
    },
  });

  const addSubsidyMutation = useMutation({
    mutationFn: async ({ householdId, subsidy }: { householdId: string, subsidy: SubsidyRecord }) => {
      return agricultureApi.addSubsidy(householdId, subsidy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      queryClient.invalidateQueries({ queryKey: ['agriProfile'] });
      setIsModalOpen(false);
      setNewSubsidy({ date: new Date().toISOString().split('T')[0], fiscalYear: '२०८१/०८२', purpose: '', amount: 0 });
    }
  });

  // Derived Data
  const allSubsidies = households.flatMap(h => {
    if (!h.agricultureProfile?.subsidiesReceived) return [];
    return h.agricultureProfile.subsidiesReceived.map((s: any) => ({
      ...s,
      householdId: h.id,
      householdHead: h.headNameNepali || h.headName || h.householdName,
      ward: h.wardNumber,
      phone: h.contactNumber || h.contactPhone || '',
    }));
  });

  const filteredSubsidies = allSubsidies.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || s.householdHead.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q) || (s.phone && s.phone.includes(q));
    const matchFy = selectedFiscalYear === 'all' || s.fiscalYear === selectedFiscalYear;
    return matchSearch && matchFy;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Metrics
  const totalAmount = allSubsidies.reduce((sum, s) => sum + s.amount, 0);
  const totalBeneficiaries = new Set(allSubsidies.map(s => s.householdId)).size;

  const fiscalYears = Array.from(new Set(allSubsidies.map(s => s.fiscalYear)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
      
      {/* KPI Cards */}
      <div className="agri-grid-auto">
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>कुल वितरण गरिएको अनुदान रकम</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e' }}>रु. {totalAmount.toLocaleString()}</div>
          </div>
          <div style={{ backgroundColor: '#f0fdfa', padding: '1rem', borderRadius: '50%' }}>
            <Coins size={32} color="#0d9488" />
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>लाभान्वित किसान परिवार</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{totalBeneficiaries}</div>
          </div>
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '50%' }}>
            <Users size={32} color="#2563eb" />
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>कुल अनुदान संख्या</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{allSubsidies.length}</div>
          </div>
          <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '50%' }}>
            <Tractor size={32} color="#d97706" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="नाम, प्रयोजन वा फोन नं..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>
          <select 
            value={selectedFiscalYear} 
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#fff' }}
          >
            <option value="all">सबै आर्थिक वर्ष</option>
            {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
          </select>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <Plus size={18} /> नयाँ अनुदान दर्ता (Issue Grant)
        </button>
      </div>

      {/* Data Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>मिति</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>लाभान्वित किसान/परिवार</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>आर्थिक वर्ष</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>अनुदान प्रयोजन</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#475569', fontWeight: 600 }}>रकम (रु.)</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubsidies.length > 0 ? filteredSubsidies.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: '#334155' }}>{s.date}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.householdHead}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>वडा नं. {s.ward} | {s.phone || 'N/A'}</div>
                </td>
                <td style={{ padding: '1rem', color: '#334155' }}>{s.fiscalYear}</td>
                <td style={{ padding: '1rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} color="#10b981" /> {s.purpose}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                  {s.amount.toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  कुनै अनुदान रेकर्ड फेला परेन।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subsidy Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Coins size={22} color="#0d9488" /> नयाँ अनुदान वितरण रेकर्ड
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>लाभान्वित घरधुरी छान्नुहोस्</label>
                <select 
                  value={selectedHouseholdId}
                  onChange={(e) => setSelectedHouseholdId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- छान्नुहोस् --</option>
                  {households.map(h => (
                    <option key={h.id} value={h.id}>{h.headNameNepali || h.headName || h.householdName} (वडा नं. {h.wardNumber})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>मिति</label>
                  <input type="date" value={newSubsidy.date} onChange={e => setNewSubsidy({...newSubsidy, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>आर्थिक वर्ष</label>
                  <input type="text" value={newSubsidy.fiscalYear} onChange={e => setNewSubsidy({...newSubsidy, fiscalYear: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>अनुदान प्रयोजन (जस्तै: हाते ट्र्याक्टर)</label>
                <input type="text" value={newSubsidy.purpose} onChange={e => setNewSubsidy({...newSubsidy, purpose: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>अनुदान रकम (रु.)</label>
                <input type="number" value={newSubsidy.amount} onChange={e => setNewSubsidy({...newSubsidy, amount: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 600 }}>रद्द गर्नुहोस्</button>
              <button 
                onClick={() => addSubsidyMutation.mutate({ householdId: selectedHouseholdId, subsidy: newSubsidy })}
                disabled={!selectedHouseholdId || !newSubsidy.purpose || !newSubsidy.amount || addSubsidyMutation.isPending}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: (!selectedHouseholdId || !newSubsidy.purpose || !newSubsidy.amount) ? 0.5 : 1 }}
              >
                {addSubsidyMutation.isPending ? 'सेभ हुँदैछ...' : 'सेभ गर्नुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
