import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/client';
import { Plus, CheckCircle, Clock, Search, X, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EngineerProfile {
  id: string;
  fullName: string;
  licenseNo: string;
  consultancyName: string;
  specialization: string;
  contactPhone: string;
  email: string;
  photoUrl: string;
  status: string;
}

export const EngineersManagementTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<EngineerProfile>>({
    fullName: '',
    licenseNo: '',
    consultancyName: '',
    specialization: 'Civil',
    contactPhone: '',
    email: '',
    status: 'active'
  });

  const { data: engineers = [], isLoading } = useQuery<EngineerProfile[]>({
    queryKey: ['engineers'],
    queryFn: async () => {
      const res = await api.get('/engineers');
      // @ts-ignore
      return res.data || res || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newEng: Partial<EngineerProfile>) => {
      return api.post('/engineers', newEng);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      setShowAddModal(false);
      toast.success('इन्जिनियर सफलतापूर्वक थपियो!');
      setFormData({
        fullName: '',
        licenseNo: '',
        consultancyName: '',
        specialization: 'Civil',
        contactPhone: '',
        email: '',
        status: 'active'
      });
    },
    onError: () => toast.error('इन्जिनियर थप्न असफल भयो।'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const filteredEngineers = Array.isArray(engineers) 
    ? engineers.filter(e => e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || e.licenseNo?.includes(searchTerm))
    : [];

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          इजाजतप्राप्त इन्जिनियर रोस्टर व्यवस्थापन
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#312e81',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Plus size={18} /> नयाँ इन्जिनियर थप्नुहोस्
        </button>
      </div>
      
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          पालिकाको आधिकारिक वेबसाइटमा देखिने इन्जिनियर तथा कन्सल्टेन्सीहरूको विवरण यहाँबाट व्यवस्थापन गर्न सकिन्छ।
        </p>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="नाम वा लाइसेन्स नं. खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>नाम</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>लाइसेन्स नं.</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>कन्सल्टेन्सी / संस्था</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>सम्पर्क</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>स्थिति</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>लोड हुँदैछ...</td></tr>
              ) : filteredEngineers.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>कुनै रेकर्ड फेला परेन।</td></tr>
              ) : (
                filteredEngineers.map((eng, idx) => (
                  <tr key={eng.id || idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b' }}>{eng.fullName}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{eng.licenseNo}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      <div>{eng.consultancyName || '-'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{eng.specialization}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      <div>{eng.contactPhone}</div>
                      {eng.email && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{eng.email}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem', 
                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                        background: eng.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: eng.status === 'active' ? '#16a34a' : '#d97706'
                      }}>
                        {eng.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3b82f6' }} title="Edit"><Edit size={16} /></button>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>नयाँ इन्जिनियर थप्नुहोस्</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>पूरा नाम *</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>लाइसेन्स नं. *</label>
                  <input required type="text" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>विषय (Specialization) *</label>
                  <select required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="Civil">Civil</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Structural">Structural</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>कन्सल्टेन्सीको नाम</label>
                  <input type="text" value={formData.consultancyName} onChange={e => setFormData({...formData, consultancyName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>सम्पर्क नम्बर *</label>
                  <input required type="text" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>इमेल ठेगाना</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>स्थिति</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="active">Active (सक्रिय)</option>
                    <option value="inactive">Inactive (निष्क्रिय)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                  रद्द गर्नुहोस्
                </button>
                <button type="submit" disabled={addMutation.isPending} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: addMutation.isPending ? 'not-allowed' : 'pointer' }}>
                  {addMutation.isPending ? 'थपिँदैछ...' : 'सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
