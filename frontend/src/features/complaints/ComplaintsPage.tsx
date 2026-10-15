import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaints';
import type { Complaint, ComplaintStatus, CreateComplaintDto } from '../../types/complaint';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Shield,
  Edit2,
  Building2,
  Send,
  UserCheck,
  MessageSquare,
  Smartphone,
  Check,
  Radio,
  Map,
} from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [forwardBranch, setForwardBranch] = useState('पूर्वाधार विकास तथा प्राविधिक शाखा');
  const [statusUpdate, setStatusUpdate] = useState<ComplaintStatus>('in_progress');
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState('');

  // WhatsApp & Live Chat Simulator State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [simPhone, setSimPhone] = useState('9851123456');
  const [simName, setSimName] = useState('दावा तामाङ');
  const [simMessage, setSimMessage] = useState('वडा ३ मा मानेखर्क जाने सडकमा पहिरो खस्यो, बाटो अवरुद्ध छ।');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notifyCitizenOnUpdate, setNotifyCitizenOnUpdate] = useState(true);

  // Form State
  const [formData, setFormData] = useState<CreateComplaintDto>({
    title: '',
    description: '',
    category: 'infrastructure',
    complainantName: '',
    complainantPhone: '',
    wardNumber: 1,
    isAnonymous: false,
  });

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints', selectedCategory, selectedStatus, selectedWard],
    queryFn: () =>
      complaintsApi.getAll({
        category: selectedCategory,
        status: selectedStatus,
        ward: selectedWard,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newComplaint: CreateComplaintDto) => complaintsApi.create(newComplaint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'infrastructure',
        complainantName: '',
        complainantPhone: '',
        wardNumber: 1,
        isAnonymous: false,
      });
      alert('गुनासो सफलतापूर्वक दर्ता भयो!');
    },
    onError: () => {
      alert('गुनासो दर्ता गर्दा समस्या आयो। कृपया पुन: प्रयास गर्नुहोस्।');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => complaintsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setSelectedComplaint(null);
      alert('गुनासोको सम्बोधन/कारबाही सफलतापूर्वक अद्यावधिक भयो!');
    },
    onError: () => {
      alert('अद्यावधिक गर्दा समस्या आयो।');
    },
  });

  const handleOpenActionModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setActionNotes(c.actionTakenNotes || '');
    setStatusUpdate(c.status);
    setForwardBranch(c.assignedDepartment || 'पूर्वाधार विकास तथा प्राविधिक शाखा');
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    updateMutation.mutate(
      {
        id: selectedComplaint.id,
        data: {
          status: statusUpdate,
          actionTakenNotes: actionNotes,
          assignedDepartment: forwardBranch,
          assignedTo: 'गुनासो सुन्ने अधिकारी (Grievance Officer)',
        },
      },
      {
        onSuccess: () => {
          if (notifyCitizenOnUpdate && (selectedComplaint.whatsappSenderPhone || selectedComplaint.complainantPhone)) {
            complaintsApi
              .notifyCitizenWhatsApp(
                selectedComplaint.id,
                `गुनासो स्थिति अद्यावधिक: ${statusUpdate}। टिपोट: ${actionNotes}`
              )
              .catch(() => {});
          }
        },
      }
    );
  };

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simMessage.trim() || isSimulating) return;

    setIsSimulating(true);
    setSimResult(null);

    try {
      const res = await complaintsApi.simulateWhatsApp({
        phone: simPhone,
        message: simMessage,
        senderName: simName,
        latitude: 27.9234,
        longitude: 85.5891,
      });
      setSimResult(res);
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    } catch {
      alert('WhatsApp सिमुलेशन गर्दा समस्या आयो।');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackError('');
    setTrackResult(null);
    try {
      const result = await complaintsApi.track(trackQuery.trim());
      setTrackResult(result);
    } catch {
      setTrackError('उक्त दर्ता नं. भएको कुनै गुनासो फेला परेन।');
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.complaintNo.toLowerCase().includes(term) ||
        (c.complainantName && c.complainantName.toLowerCase().includes(term))
      );
    });
  }, [complaints, searchTerm]);

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'resolved':
        return <span className="dt-badge dt-badge-success"><CheckCircle2 size={12} /> समाधान भएको</span>;
      case 'in_progress':
        return <span className="dt-badge dt-badge-info"><Clock size={12} /> कारबाही प्रक्रियामा</span>;
      case 'rejected':
        return <span className="dt-badge dt-badge-danger"><X size={12} /> अस्वीकृत</span>;
      default:
        return <span className="dt-badge dt-badge-warning"><AlertCircle size={12} /> नयाँ दर्ता</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      infrastructure: 'पूर्वाधार तथा सडक',
      drinking_water: 'खानेपानी तथा सरसफाइ',
      electricity: 'विद्युत् तथा ऊर्जा',
      health: 'स्वास्थ्य सेवा',
      education: 'शिक्षा तथा विद्यालय',
      waste_management: 'फोहोरमैला व्यवस्थापन',
      governance_corruption: 'सुशासन तथा भ्रष्टाचार निवारण',
      service_delay: 'सेवा ढिलासुस्ती',
      environment: 'वातावरण तथा वन',
      other: 'अन्य गुनासो',
    };
    return map[category] || category;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            नागरिक गुनासो दर्ता तथा सुनुवाइ व्यवस्थापन
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            गाउँपालिका तथा वडाहरूका सेवा, विकास निर्माण तथा समस्या सम्बन्धी अनलाइन गुनासो प्रणाली
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/gis-map?filter=complaint')}
            className="dt-btn"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(2,132,199,0.25)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Map size={16} />
            <span>🗺️ GIS डिजिटल नक्सा</span>
          </button>

          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="dt-btn"
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Smartphone size={16} />
            <span>WhatsApp & Live Chat कन्सोल</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="dt-btn dt-btn-primary"
          >
            <Plus size={16} />
            <span>नयाँ गुनासो दर्ता गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Grievance Officer Statutory Banner */}
      <div className="dt-card" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Shield size={20} color="#6ee7b7" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                सुशासन ऐन, २०६४ अनुसार जनगुनासो सुनुवाइ व्यवस्थापन
              </h2>
            </div>
            <p style={{ fontSize: '0.83rem', color: '#d1fae5', margin: 0, maxWidth: '800px', lineHeight: 1.4 }}>
              दर्ता भएका सबै जनगुनासोहरू सिधै <strong>गुनासो सुन्ने अधिकारी</strong> समक्ष स्वचालित रूपमा पेश हुन्छन्। गुनासोको गम्भीरता अनुसार छानबिन गरि सम्बन्धित शाखामा निर्देशन वा प्रत्यक्ष सम्बोधन गरिन्छ।
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '0.65rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
            <div style={{ fontSize: '0.72rem', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              तोकिएको सूचना तथा गुनासो अधिकारी
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '2px' }}>
              श्री कुमार बस्नेत (WhatsApp: ९८५१२७८५३०)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ecfdf5', marginTop: '2px' }}>
              विपद् फोकल: श्री नारायण क्षेत्री (९८६४११२९५५) | फोन: ०११-६९०१२३
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Card */}
      <div className="dt-card" style={{ background: '#f8fafc', padding: '1.25rem' }}>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px', display: 'block' }}>
              गुनासोको स्थिति ट्र्याक गर्नुहोस् (Track by Complaint No):
            </label>
            <input
              type="text"
              className="dt-input"
              placeholder="e.g. CMP-2081-0042"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="dt-btn dt-btn-primary" style={{ marginTop: '22px' }}>
            <Search size={16} />
            <span>ट्र्याक स्थिति</span>
          </button>
        </form>

        {trackResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{trackResult.complaintNo}: {trackResult.title}</strong>
              {getStatusBadge(trackResult.status)}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{trackResult.description}</p>
            {trackResult.actionTakenNotes && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
                <strong>कारबाही टिपोट:</strong> {trackResult.actionTakenNotes}
              </div>
            )}
          </div>
        )}
        {trackError && <div style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{trackError}</div>}
      </div>

      {/* Filter Bar */}
      <div className="dt-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="dt-input"
            style={{ paddingLeft: '32px' }}
            placeholder="गुनासोको विषय वा दर्ता नं. खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="dt-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">सबै विधा (All Categories)</option>
          <option value="infrastructure">पूर्वाधार तथा सडक</option>
          <option value="drinking_water">खानेपानी तथा सरसफाइ</option>
          <option value="electricity">विद्युत् तथा ऊर्जा</option>
          <option value="health">स्वास्थ्य सेवा</option>
          <option value="education">शिक्षा तथा विद्यालय</option>
          <option value="waste_management">फोहोरमैला व्यवस्थापन</option>
          <option value="governance_corruption">सुशासन तथा भ्रष्टाचार</option>
          <option value="service_delay">सेवा ढिलासुस्ती</option>
          <option value="other">अन्य</option>
        </select>

        <select
          className="dt-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">सबै स्थिति (Status)</option>
          <option value="pending">नयाँ दर्ता (Pending)</option>
          <option value="in_progress">प्रक्रियामा (In Progress)</option>
          <option value="resolved">समाधान भएको (Resolved)</option>
          <option value="rejected">अस्वीकृत (Rejected)</option>
        </select>

        <select
          className="dt-select"
          value={selectedWard}
          onChange={(e) => setSelectedWard(Number(e.target.value))}
        >
          <option value={0}>सबै वडा</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <option key={w} value={w}>वडा नं. {w}</option>
          ))}
        </select>
      </div>

      {/* Complaints List Table */}
      <div className="dt-table-wrapper">
        <div className="dt-responsive-table-wrapper">
<table className="dt-table">
          <thead>
            <tr>
              <th>दर्ता नं. र विषय</th>
              <th>माध्यम (Channel)</th>
              <th>विधा (Category)</th>
              <th>वडा नं.</th>
              <th>गुनासोकर्ता</th>
              <th>जिम्मेवार अधिकारी / शाखा</th>
              <th>प्राथमिकता</th>
              <th>स्थिति (Status)</th>
              <th style={{ textAlign: 'right' }}>कार्य</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>लोड हुँदैछ...</td>
              </tr>
            ) : filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  कुनै गुनासो फेला परेन।
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.complaintNo}</div>
                  </td>
                  <td>
                    {c.channel === 'whatsapp' ? (
                      <span className="dt-badge" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <span>🟢</span> WhatsApp
                      </span>
                    ) : c.channel === 'live_chat' ? (
                      <span className="dt-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <span>🔵</span> Live Chat
                      </span>
                    ) : (
                      <span className="dt-badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}>
                        🌐 वेब पोर्टल
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="dt-badge dt-badge-info">{getCategoryLabel(c.category)}</span>
                  </td>
                  <td>वडा नं. {c.wardNumber || '-'}</td>
                  <td>
                    {c.isAnonymous ? (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>गोप्य राखिएको</span>
                    ) : (
                      <div>
                        <div>{c.complainantName || '-'}</div>
                        {c.complainantPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.complainantPhone}</div>}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>
                      <span className="dt-badge" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.75rem' }}>
                        {c.assignedTo || 'गुनासो सुन्ने अधिकारी'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {c.assignedDepartment || 'सुशासन तथा गुनासो व्यवस्थापन एकाइ'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`dt-badge ${c.priority === 'urgent' ? 'dt-badge-danger' : 'dt-badge-warning'}`}>
                      {c.priority || 'medium'}
                    </span>
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenActionModal(c)}
                      className="dt-btn dt-btn-primary"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={12} />
                      <span>सम्बोधन</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
</div>
      </div>

      {/* Create Complaint Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>नयाँ गुनासो दर्ता</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  गुनासोको शीर्षक *
                </label>
                <input
                  type="text"
                  required
                  className="dt-input"
                  placeholder="e.g. वडा नं. २ मा खानेपानी पाइपलाइन मर्मत सम्बन्धमा"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  समस्याको विधा (Category) *
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="infrastructure">पूर्वाधार तथा सडक</option>
                  <option value="drinking_water">खानेपानी तथा सरसफाइ</option>
                  <option value="electricity">विद्युत् तथा ऊर्जा</option>
                  <option value="health">स्वास्थ्य सेवा</option>
                  <option value="education">शिक्षा तथा विद्यालय</option>
                  <option value="waste_management">फोहोरमैला व्यवस्थापन</option>
                  <option value="governance_corruption">सुशासन तथा भ्रष्टाचार</option>
                  <option value="service_delay">सेवा ढिलासुस्ती</option>
                  <option value="other">अन्य</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    सम्बन्धित वडा नं. *
                  </label>
                  <select
                    className="dt-select"
                    style={{ width: '100%' }}
                    value={formData.wardNumber}
                    onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    फोन नम्बर
                  </label>
                  <input
                    type="tel"
                    className="dt-input"
                    placeholder="98XXXXXXXX"
                    value={formData.complainantPhone}
                    onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  गुनासोकर्ताको नाम
                </label>
                <input
                  type="text"
                  className="dt-input"
                  placeholder="तपाईंको पूरा नाम"
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                  disabled={formData.isAnonymous}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                />
                <label htmlFor="anonymousCheck" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  मेरो नाम र व्यक्तिगत विवरण गोप्य राखियोस्
                </label>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  समस्याको पूर्ण विवरण *
                </label>
                <textarea
                  required
                  rows={4}
                  className="dt-input"
                  style={{ resize: 'vertical' }}
                  placeholder="कृपया समस्याको स्थान, समय र असर स्पष्ट खुलाउनुहोस्..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="dt-btn dt-btn-outline"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="dt-btn dt-btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'दर्ता हुँदैछ...' : 'गुनासो पेश गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grievance Officer Action / Resolution Modal */}
      {selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  गुनासो सुनुवाइ तथा सम्बोधन (गुनासो सुन्ने अधिकारी)
                </h2>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '2px' }}>
                  दर्ता नं: {selectedComplaint.complaintNo}
                </div>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{selectedComplaint.title}</div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '6px 0' }}>{selectedComplaint.description}</p>
              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <span>गुनासोकर्ता: <strong>{selectedComplaint.isAnonymous ? 'गोप्य' : selectedComplaint.complainantName || '-'}</strong></span>
                {selectedComplaint.complainantPhone && <span>फोन: <strong>{selectedComplaint.complainantPhone}</strong></span>}
                <span>वडा नं: <strong>{selectedComplaint.wardNumber || '-'}</strong></span>
              </div>
            </div>

            <form onSubmit={handleSaveAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  कारबाहीको स्थिति (Status) *
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%' }}
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value as ComplaintStatus)}
                >
                  <option value="pending">नयाँ दर्ता (Pending)</option>
                  <option value="in_progress">कारबाही प्रक्रियामा (In Progress)</option>
                  <option value="resolved">समाधान / फछ्र्यौट भएको (Resolved)</option>
                  <option value="rejected">अस्वीकृत / खारेज (Rejected)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  सम्बन्धित जिम्मेवार शाखा / अग्रप्रेषण (Forward to Branch)
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%' }}
                  value={forwardBranch}
                  onChange={(e) => setForwardBranch(e.target.value)}
                >
                  <option value="पूर्वाधार विकास तथा प्राविधिक/इन्जिनियरिङ शाखा">पूर्वाधार विकास तथा प्राविधिक/इन्जिनियरिङ शाखा</option>
                  <option value="खानेपानी, सरसफाइ तथा स्वच्छता (WASH) शाखा">खानेपानी, सरसफाइ तथा स्वच्छता (WASH) शाखा</option>
                  <option value="स्वास्थ्य तथा जनसंख्या शाखा">स्वास्थ्य तथा जनसंख्या शाखा</option>
                  <option value="शिक्षा, युवा तथा खेलकुद शाखा">शिक्षा, युवा तथा खेलकुद शाखा</option>
                  <option value="कृषि तथा पशुपन्छी विकास शाखा">कृषि तथा पशुपन्छी विकास शाखा</option>
                  <option value="वन, वातावरण, विपद् व्यवस्थापन शाखा">वन, वातावरण, विपद् व्यवस्थापन शाखा</option>
                  <option value="प्रशासन तथा आन्तरिक व्यवस्थापन शाखा">प्रशासन तथा आन्तरिक व्यवस्थापन शाखा</option>
                  <option value="सम्बन्धित वडा कार्यालय">सम्बन्धित वडा कार्यालय</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  गुनासो सुन्ने अधिकारीको आदेश / कारबाही टिपोट *
                </label>
                <textarea
                  required
                  rows={4}
                  className="dt-input"
                  style={{ resize: 'vertical' }}
                  placeholder="गुनासो सुनुवाइ पश्चात गरिएको निर्णय, शाखालाई दिइएको निर्देशन वा समाधानको विवरण लेख्नुहोस्..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>

              {/* WhatsApp Citizen Notification Checkbox */}
              <div
                style={{
                  background: '#f0fdf4',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <input
                  type="checkbox"
                  id="notifyWa"
                  checked={notifyCitizenOnUpdate}
                  onChange={(e) => setNotifyCitizenOnUpdate(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
                />
                <label htmlFor="notifyWa" style={{ fontSize: '0.82rem', color: '#166534', cursor: 'pointer', fontWeight: 600 }}>
                  निर्णय सुरक्षित गर्नासाथ नागरिकको WhatsApp मा प्रगति विवरण स्वचालित रूपमा पठाउनुहोस्
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="dt-btn dt-btn-outline"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="dt-btn dt-btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'कारबाही तथा निर्णय सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp & Live Chat Gateway / Simulator Modal */}
      {isWhatsAppModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            className="dt-card"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.75rem',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={20} color="#15803d" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                    WhatsApp Business & Live Chat व्यवस्थापन कन्सोल
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Meta Cloud API Webhook, AI Triage र सिम्युलेटर परीक्षण
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsWhatsAppModalOpen(false);
                  setSimResult(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Gateway Configuration & Status Box */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Meta Cloud API Webhook स्थिति:</span>
                <span className="dt-badge" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                  🟢 Active (सिमुलेशन तथा रेडी मोड)
                </span>
              </div>
              <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Webhook URL:</strong> <code style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>/api/v1/complaints/whatsapp/webhook</code></div>
                <div><strong>Verify Token:</strong> <code style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>p5_palika_token</code></div>
                <div><strong>निःशुल्क कोटा (Meta Free Tier):</strong> प्रति महिना १,००० Service Conversations बिल्कुल निःशुल्क</div>
              </div>
            </div>

            {/* Simulator Form */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                नागरिक WhatsApp सन्देश सिम्युलेटर (लाइभ परीक्षण)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                नागरिकले आफ्नो WhatsApp बाट पालिकाको नम्बरमा सन्देश पठाउँदा प्रणालीले कसरी गुनासो दर्ता गर्छ र के उत्तर फर्काउँछ भनी यहाँ परीक्षण गर्नुहोस्:
              </p>

              {/* Quick Template Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                  { label: 'वडा ३ खानेपानी पाइप', text: 'वडा ३ मा खानेपानीको पाइप फुट्यो, बाटो हिलाम्य भयो।' },
                  { label: 'वडा २ पहिरो अवरोध', text: 'वडा नं २ मा पहिरो खसेर बाटो बन्द भयो, तत्काल डोजर पठाउनुपर्‍यो।' },
                  { label: 'स्थिति ट्र्याकिङ', text: 'ट्र्याक PPK-G-2081-0001' },
                  { label: 'बडापत्र सोधपुछ', text: 'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ र कति दस्तुर हो?' },
                  { label: 'अधिकृत सम्पर्क', text: 'गुनासो सुन्ने अधिकृतको सम्पर्क नम्बर' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSimMessage(chip.text)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f766e',
                      cursor: 'pointer',
                    }}
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleRunSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      नागरिकको फोन नम्बर (WhatsApp Phone)
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      नागरिकको नाम (Sender Name)
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                    नागरिकले WhatsApp मा लेखेको सन्देश (Incoming Message) *
                  </label>
                  <textarea
                    rows={3}
                    className="dt-input"
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    placeholder="नागरिकले पठाउने सन्देश यहाँ लेख्नुहोस्..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSimulating || !simMessage.trim()}
                  className="dt-btn"
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={16} />
                  <span>{isSimulating ? 'प्रोसेसिङ हुँदैछ...' : 'WhatsApp सिम्युलेट पठाउनुहोस् (Send Simulation)'}</span>
                </button>
              </form>
            </div>

            {/* Simulation Bot Reply Display */}
            {simResult && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span>🟢</span>
                  <span>नागरिकको WhatsApp मा प्राप्त हुने स्वचालित प्रतिउत्तर (Bot Response):</span>
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    color: '#1e293b',
                    lineHeight: '1.5',
                  }}
                >
                  {simResult?.botResponse?.replyText || 'प्रक्रिया सम्पन्न भयो।'}
                </div>

                {simResult?.botResponse?.complaint && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#166534' }}>
                    ✅ <strong>डेटाबेसमा नयाँ गुनासो सिर्जना भयो:</strong> दर्ता नं{' '}
                    <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                      {simResult.botResponse.complaint.complaintNo}
                    </code>{' '}
                    (च्यानल: WhatsApp)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
