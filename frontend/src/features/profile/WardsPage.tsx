import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { municipalityApi } from '../../api/municipality';
import { WardProfile } from '../../types/profile';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

export const WardsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Partial<WardProfile> | null>(null);

  const { data: wards = [], isLoading } = useQuery({
    queryKey: ['wards-profile'],
    queryFn: () => municipalityApi.getWards(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<WardProfile>) => {
      if (data.id) return municipalityApi.updateWard(data.id, data);
      return municipalityApi.createWard(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wards-profile'] });
      setIsModalOpen(false);
      setEditingWard(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => municipalityApi.deleteWard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wards-profile'] });
    }
  });

  const handleEdit = (ward: WardProfile) => {
    setEditingWard(ward);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('के तपाईं पक्का यो वडा विवरण हटाउन चाहनुहुन्छ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<WardProfile> = {
      id: editingWard?.id,
      wardNo: parseInt(formData.get('wardNo') as string, 10),
      name: formData.get('name') as string,
      chairperson: formData.get('chairperson') as string,
      secretary: formData.get('secretary') as string,
      phone: formData.get('phone') as string,
      officeLocation: formData.get('officeLocation') as string,
      totalPopulation: parseInt(formData.get('totalPopulation') as string, 10),
      households: parseInt(formData.get('households') as string, 10),
      areaSqKm: parseFloat(formData.get('areaSqKm') as string),
    };
    saveMutation.mutate(data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <Building2 size={24} color="#10b981" />
          वडा प्रोफाइल व्यवस्थापन
        </h1>
        <button
          onClick={() => { setEditingWard({}); setIsModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Plus size={18} /> नयाँ वडा थप्नुहोस्
        </button>
      </div>

      {isLoading ? (
        <div>लोड हुँदैछ...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#f1f5f9' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>वडा नं.</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>वडा अध्यक्ष</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>कार्यालय स्थान</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>सम्पर्क</th>
              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>कार्य</th>
            </tr>
          </thead>
          <tbody>
            {wards.map(ward => (
              <tr key={ward.id || ward.wardNo}>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ward.wardNo}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>{ward.chairperson}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>{ward.officeLocation}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>{ward.phone}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(ward)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', marginRight: '0.5rem' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(ward.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingWard?.id ? 'वडा विवरण सम्पादन' : 'नयाँ वडा थप्नुहोस्'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>वडा नं.</label>
                <input name="wardNo" type="number" defaultValue={editingWard?.wardNo} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>वडा नाम (वैकल्पिक)</label>
                <input name="name" defaultValue={editingWard?.name} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>कार्यालय स्थान</label>
                <input name="officeLocation" defaultValue={editingWard?.officeLocation} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>वडा अध्यक्ष</label>
                <input name="chairperson" defaultValue={editingWard?.chairperson} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>वडा सचिव (वैकल्पिक)</label>
                <input name="secretary" defaultValue={editingWard?.secretary} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>सम्पर्क नम्बर</label>
                <input name="phone" defaultValue={editingWard?.phone} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>क्षेत्रफल (वर्ग कि.मी.)</label>
                <input name="areaSqKm" type="number" step="0.01" defaultValue={editingWard?.areaSqKm} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>कुल जनसंख्या</label>
                <input name="totalPopulation" type="number" defaultValue={editingWard?.totalPopulation} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>कुल घरधुरी</label>
                <input name="households" type="number" defaultValue={editingWard?.households} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' }}>रद्द गर्नुहोस्</button>
                <button type="submit" disabled={saveMutation.isPending} style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                  {saveMutation.isPending ? 'सेभ हुँदैछ...' : 'सेभ गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
