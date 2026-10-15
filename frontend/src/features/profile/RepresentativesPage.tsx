import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { representativesApi, Representative } from '../../api/representatives';
import { Plus, Edit2, Trash2, Users, X, Camera, Mail, Phone, Flag, Search } from 'lucide-react';
import { apiClient } from '../../api/client';

const DESIGNATION_OPTIONS = [
  'अध्यक्ष',
  'उपाध्यक्ष',
  'वडा अध्यक्ष',
  'कार्यपालिका सदस्य',
  'वडा सदस्य',
  'महिला सदस्य',
  'दलित महिला सदस्य',
  'प्रमुख प्रशासकीय अधिकृत',
  'अन्य'
];

const POLITICAL_PARTIES = [
  'नेपाल कम्युनिष्ट पार्टी (एमाले)',
  'नेपाली काङ्ग्रेस',
  'नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)',
  'राष्ट्रिय स्वतन्त्र पार्टी (रास्वपा)',
  'राष्ट्रिय प्रजातन्त्र पार्टी (राप्रपा)',
  'जनता समाजवादी पार्टी (जसपा)',
  'नेपाल कम्युनिष्ट पार्टी (एकीकृत समाजवादी)',
  'स्वतन्त्र'
];

export interface RepresentativesPageProps {
  isReadOnly?: boolean;
}

export const RepresentativesPage: React.FC<RepresentativesPageProps> = ({ isReadOnly = false }) => {
  const location = useLocation();
  const isAdmin = !isReadOnly && location.pathname.startsWith('/app');
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<Partial<Representative> | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<string>('अध्यक्ष');
  const [customDesignation, setCustomDesignation] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: representatives = [], isLoading } = useQuery({
    queryKey: ['representatives'],
    queryFn: () => representativesApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Representative>) => {
      let savedRep: Representative;
      if (data.id) {
        savedRep = await representativesApi.update(data.id, data);
      } else {
        savedRep = await representativesApi.create(data);
      }
      // Upload photo if a new file is chosen
      if (photoFile && savedRep.id) {
        setUploadingPhoto(true);
        const fd = new FormData();
        fd.append('file', photoFile);
        await apiClient.post(`/representatives/${savedRep.id}/upload-photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadingPhoto(false);
      }
      return savedRep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      queryClient.invalidateQueries({ queryKey: ['wards-profile'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      queryClient.invalidateQueries({ queryKey: ['wards-demographics'] });
      queryClient.invalidateQueries({ queryKey: ['municipality-profile'] });
      setIsModalOpen(false);
      setEditingRep(null);
      setPhotoPreview(null);
      setPhotoFile(null);
    },
    onError: (err: any) => {
      setUploadingPhoto(false);
      alert('तथ्याङ्क सुरक्षित गर्न सकिएन: ' + (err?.response?.data?.detail || err?.message || 'अज्ञात त्रुटि'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => representativesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      queryClient.invalidateQueries({ queryKey: ['wards-profile'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      queryClient.invalidateQueries({ queryKey: ['wards-demographics'] });
      queryClient.invalidateQueries({ queryKey: ['municipality-profile'] });
    }
  });

  const handleOpenCreate = () => {
    setEditingRep({ isCurrent: true });
    setSelectedDesignation('अध्यक्ष');
    setCustomDesignation('');
    setPhotoPreview(null);
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rep: Representative) => {
    setEditingRep(rep);
    setPhotoPreview(rep.photoUrl || null);
    setPhotoFile(null);
    if (DESIGNATION_OPTIONS.includes(rep.designation)) {
      setSelectedDesignation(rep.designation);
      setCustomDesignation('');
    } else {
      setSelectedDesignation('अन्य');
      setCustomDesignation(rep.designation || '');
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('के तपाईं यो जनप्रतिनिधि विवरण हटाउन निश्चित हुनुहुन्छ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const finalDesignation = selectedDesignation === 'अन्य' ? customDesignation.trim() : selectedDesignation;

    if (!finalDesignation) {
      alert('कृपया पद छान्नुहोस् वा लेख्नुहोस्');
      return;
    }

    const data: Partial<Representative> = {
      id: editingRep?.id,
      name: (formData.get('name') as string)?.trim(),
      designation: finalDesignation,
      wardNo: formData.get('wardNo') ? parseInt(formData.get('wardNo') as string, 10) : undefined,
      phone: (formData.get('phone') as string)?.trim() || undefined,
      email: (formData.get('email') as string)?.trim() || undefined,
      politicalParty: (formData.get('politicalParty') as string)?.trim() || undefined,
      photoUrl: editingRep?.photoUrl,
      isCurrent: formData.get('isCurrent') === 'true',
    };
    saveMutation.mutate(data);
  };

  const isBusy = saveMutation.isPending || uploadingPhoto;

  const filteredRepresentatives = representatives.filter(rep => {
    const matchesSearch = !searchTerm || 
      rep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.politicalParty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.phone?.includes(searchTerm) ||
      rep.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWard = filterWard === 'all' || 
      (filterWard === 'palika' && !rep.wardNo) || 
      (rep.wardNo?.toString() === filterWard);

    return matchesSearch && matchesWard;
  });

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            <Users size={28} color="#0284c7" />
            जनप्रतिनिधि व्यवस्थापन
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            पालिका तथा वडा स्तरका निर्वाचित पदाधिकारीहरूको पूर्ण विवरण तथा व्यवस्थापन
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)', transition: 'all 0.2s' }}
          >
            <Plus size={19} /> नयाँ थप्नुहोस्
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाम, पद, सम्पर्क, राजनीतिक दलबाट खोज्नुहोस्..."
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.4rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="all">सबै क्षेत्र (पालिका र वडा)</option>
            <option value="palika">पालिका स्तर मात्र</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
              <option key={w} value={w.toString()}>वडा नं. {w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>लोड हुँदैछ...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155', width: '70px', textAlign: 'center' }}>फोटो</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>नाम थर</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>पद</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>ईमेल</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>फोन नं</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>राजनीतिक दल</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>वडा नं.</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155' }}>अवस्था</th>
                {isAdmin && (
                  <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>कार्य</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRepresentatives.map((rep) => {
                const photoSrc = rep.photoUrl
                  ? (rep.photoUrl.startsWith('/uploads') ? `http://localhost:3001${rep.photoUrl}` : rep.photoUrl)
                  : null;

                return (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={rep.name}
                          style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}
                        />
                      ) : (
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#0284c7', margin: '0 auto', border: '2px solid #bae6fd' }}>
                          {rep.name?.trim().charAt(0) || 'जन'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      <span style={{ fontSize: '1rem' }}>{rep.name}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: rep.designation?.includes('अध्यक्ष') ? '#eff6ff' : '#f8fafc',
                        color: rep.designation?.includes('अध्यक्ष') ? '#1d4ed8' : '#334155',
                        border: rep.designation?.includes('अध्यक्ष') ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
                      }}>
                        {rep.designation}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.88rem' }}>
                      {rep.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={14} color="#94a3b8" /> {rep.email}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.88rem' }}>
                      {rep.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} color="#94a3b8" /> {rep.phone}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.88rem' }}>
                      {rep.politicalParty ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Flag size={14} color="#dc2626" /> {rep.politicalParty}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.9rem' }}>
                      {rep.wardNo ? `वडा नं. ${rep.wardNo}` : <span style={{ color: '#0284c7', fontWeight: 600 }}>पालिका</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {rep.isCurrent !== false ? (
                        <span style={{ color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '3px 9px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid #bbf7d0' }}>वर्तमान</span>
                      ) : (
                        <span style={{ color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>पूर्व</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          title="सम्पादन गर्नुहोस्"
                          onClick={() => handleEdit(rep)}
                          style={{ background: '#f0f9ff', border: '1px solid #bae6fd', cursor: 'pointer', color: '#0284c7', padding: '6px 9px', borderRadius: '6px', marginRight: '0.4rem', transition: 'all 0.15s' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          title="मेटाउनुहोस्"
                          onClick={() => handleDelete(rep.id)}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', color: '#ef4444', padding: '6px 9px', borderRadius: '6px', transition: 'all 0.15s' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredRepresentatives.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    कुनै जनप्रतिनिधि विवरण भेटिएन।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {editingRep?.id ? 'जनप्रतिनिधि सम्पादन' : 'नयाँ जनप्रतिनिधि दर्ता'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '6px' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Photo Upload Circle */}
              <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '108px', height: '108px', borderRadius: '50%',
                    border: '2px dashed #0284c7', margin: '0 auto',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f0f9ff', position: 'relative',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.12)', transition: 'all 0.2s'
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview.startsWith('/uploads') ? `http://localhost:3001${photoPreview}` : photoPreview}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      <Camera size={30} color="#0284c7" />
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '5px', fontWeight: 600 }}>फोटो छान्नुहोस्</span>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.4rem' }}>
                  क्लिक गरी फोटो अपलोड गर्नुहोस् (JPG, PNG, WebP)
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                  नाम थर *
                </label>
                <input
                  name="name"
                  defaultValue={editingRep?.name}
                  required
                  placeholder="जस्तै: श्री टासी लामा"
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Designation Dropdown (पद) */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                  पद * <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.8rem' }}>(DropDown बाट छान्नुहोस्)</span>
                </label>
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #0284c7', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', fontWeight: 600, color: '#0f172a' }}
                >
                  {DESIGNATION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {/* Custom designation field if 'अन्य' chosen */}
                {selectedDesignation === 'अन्य' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      placeholder="अन्य पदको नाम यहाँ लेख्नुहोस्..."
                      required
                      style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
              </div>

              {/* Ward Number */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                  वडा नं. <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.8rem' }}>(पालिका स्तरको भए खाली छोड्नुहोस्)</span>
                </label>
                <input
                  name="wardNo"
                  type="number"
                  min="1"
                  max="15"
                  defaultValue={editingRep?.wardNo}
                  placeholder="जस्तै: १, २, ३..."
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Contact Phone & Email in 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                    फोन नं.
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingRep?.phone}
                    placeholder="98XXXXXXXX"
                    style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                    ईमेल
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingRep?.email}
                    placeholder="mail@panchpokharimun.gov.np"
                    style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Political Party (राजनीतिक दल) */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                  राजनीतिक दल
                </label>
                <input
                  list="politicalPartiesList"
                  name="politicalParty"
                  defaultValue={editingRep?.politicalParty}
                  placeholder="राजनीतिक दल छान्नुहोस् वा लेख्नुहोस्"
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
                <datalist id="politicalPartiesList">
                  {POLITICAL_PARTIES.map(party => (
                    <option key={party} value={party} />
                  ))}
                </datalist>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                  हालको अवस्था
                </label>
                <select
                  name="isCurrent"
                  defaultValue={editingRep?.isCurrent !== false ? 'true' : 'false'}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'white' }}
                >
                  <option value="true">वर्तमान (Current Term)</option>
                  <option value="false">पूर्व (Former)</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.3rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  style={{ padding: '0.65rem 1.6rem', border: 'none', backgroundColor: '#0284c7', color: 'white', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)', opacity: isBusy ? 0.7 : 1 }}
                >
                  {uploadingPhoto ? 'फोटो अपलोड हुँदैछ...' : isBusy ? 'सेभ हुँदैछ...' : 'सेभ गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
