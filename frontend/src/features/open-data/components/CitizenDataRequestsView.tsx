import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import {
  FileQuestion,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  MessageSquare,
  User,
  Building,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import type { CitizenDataRequest } from '../../../types/open-data';

interface CitizenDataRequestsViewProps {
  isAdmin?: boolean;
}

export const CitizenDataRequestsView: React.FC<CitizenDataRequestsViewProps> = ({ isAdmin = false }) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CitizenDataRequest | null>(null);

  // Form states
  const [submitForm, setSubmitForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    organization: '',
    dataset_title: '',
    purpose: '',
    ward_number: 0,
  });

  const [respondForm, setRespondForm] = useState({
    status: 'स्वीकृत/उपलब्ध',
    response_note: '',
    response_file_url: '',
  });

  const { data: requests = [], isLoading } = useQuery<CitizenDataRequest[]>({
    queryKey: ['citizen-data-requests', selectedStatus],
    queryFn: () => sectoralApi.getCitizenDataRequests(selectedStatus === 'all' ? undefined : selectedStatus) as Promise<CitizenDataRequest[]>,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return sectoralApi.submitCitizenDataRequest(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen-data-requests'] });
      setIsSubmitModalOpen(false);
      setSubmitForm({
        full_name: '',
        phone: '',
        email: '',
        organization: '',
        dataset_title: '',
        purpose: '',
        ward_number: 0,
      });
      alert('तपाइँको खुला तथ्याङ्क माग सफलतापूर्वक दर्ता भयो!');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return sectoralApi.updateCitizenDataRequestStatus(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen-data-requests'] });
      setIsRespondModalOpen(false);
      setSelectedRequest(null);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'स्वीकृत/उपलब्ध':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={13} />
            <span>स्वीकृत / उपलब्ध</span>
          </span>
        );
      case 'प्रक्रियामा':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Clock size={13} />
            <span>प्रक्रियामा</span>
          </span>
        );
      case 'अस्वीकृत':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            <XCircle size={13} />
            <span>अस्वीकृत</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }}>
            <AlertCircle size={13} />
            <span>दर्ता भएको</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {['all', 'दर्ता भएको', 'प्रक्रियामा', 'स्वीकृत/उपलब्ध', 'अस्वीकृत'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                border: selectedStatus === st ? '1px solid #0284c7' : '1px solid #e2e8f0',
                backgroundColor: selectedStatus === st ? '#0284c7' : '#ffffff',
                color: selectedStatus === st ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {st === 'all' ? 'सबै मागहरू' : st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
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
          <span>+ नयाँ तथ्याङ्क माग दर्ता गर्नुहोस्</span>
        </button>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>डेटा मागहरू लोड हुँदैछ...</div>
      ) : requests.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          कुनै तथ्याङ्क माग फेला परेन।
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="dt-card"
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('ne-NP') : 'हालसालै'}
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
                  {req.dataset_title}
                </h4>

                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.75rem 0', backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '6px' }}>
                  <strong>उद्देश्य:</strong> {req.purpose}
                </p>

                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div><strong>मागकर्ता:</strong> {req.full_name} {req.organization && `(${req.organization})`}</div>
                  <div><strong>सम्पर्क:</strong> {req.phone} {req.email && `· ${req.email}`}</div>
                  {req.ward_number > 0 && <div><strong>सम्बन्धित वडा:</strong> वडा नं. {req.ward_number}</div>}
                </div>

                {req.response_note && (
                  <div style={{ marginTop: '0.75rem', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46' }}>
                    <strong>पालिकाको जवाफ:</strong> {req.response_note}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setRespondForm({
                        status: req.status,
                        response_note: req.response_note || '',
                        response_file_url: req.response_file_url || '',
                      });
                      setIsRespondModalOpen(true);
                    }}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #0284c7',
                      backgroundColor: '#f0f9ff',
                      color: '#0284c7',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    प्रतिक्रिया / स्थिति सम्पादन
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Citizen Request Submit Modal */}
      {isSubmitModalOpen && (
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
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '560px',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              खुला तथ्याङ्क माग फाराम (Data Request Form)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              अनुसन्धान, पत्रकारिता वा नागरिक प्रयोजनका लागि आवश्यक खुला डाटासेट अनुरोध गर्नुहोस्।
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMutation.mutate(submitForm);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={submitForm.full_name}
                  onChange={(e) => setSubmitForm({ ...submitForm, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>सम्पर्क मोबाइल *</label>
                  <input
                    type="text"
                    required
                    value={submitForm.phone}
                    onChange={(e) => setSubmitForm({ ...submitForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>इमेल ठेगाना</label>
                  <input
                    type="email"
                    value={submitForm.email}
                    onChange={(e) => setSubmitForm({ ...submitForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>संस्था / विश्वविद्यालय / माध्यम</label>
                <input
                  type="text"
                  placeholder="उदा: त्रिभुवन विश्वविद्यालय / नागरिक समाज"
                  value={submitForm.organization}
                  onChange={(e) => setSubmitForm({ ...submitForm, organization: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>माग गरिएको तथ्याङ्क वा विषय *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: वडागत खानेपानी मुहान र उपभोक्ता समिति सूची"
                  value={submitForm.dataset_title}
                  onChange={(e) => setSubmitForm({ ...submitForm, dataset_title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>तथ्याङ्क उपयोगको उद्देश्य *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="अनुसन्धान, लेख रचना वा स्थानीय विकासको प्रयोजन..."
                  value={submitForm.purpose}
                  onChange={(e) => setSubmitForm({ ...submitForm, purpose: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submitMutation.isPending ? 'दर्ता हुँदैछ...' : 'माग पेस गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Respond Modal */}
      {isRespondModalOpen && selectedRequest && (
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
          onClick={() => setIsRespondModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              तथ्याङ्क माग स्थिति अद्यावधिक
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700, margin: '0 0 1rem 0' }}>
              {selectedRequest.dataset_title} ({selectedRequest.full_name})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>स्थिति चयन गर्नुहोस्</label>
                <select
                  value={respondForm.status}
                  onChange={(e) => setRespondForm({ ...respondForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="दर्ता भएको">दर्ता भएको (Registered)</option>
                  <option value="प्रक्रियामा">प्रक्रियामा (Under Process)</option>
                  <option value="स्वीकृत/उपलब्ध">स्वीकृत/उपलब्ध (Fulfilled & Shared)</option>
                  <option value="अस्वीकृत">अस्वीकृत (Rejected)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>पालिकाको आधिकारिक प्रतिक्रिया / टिप्पणी</label>
                <textarea
                  rows={3}
                  value={respondForm.response_note}
                  onChange={(e) => setRespondForm({ ...respondForm, response_note: e.target.value })}
                  placeholder="माग गरिएको डाटा उपलब्ध गराइएको व्यहोरा..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>फाइल डाउनलोड लिङ्क (ऐच्छिक)</label>
                <input
                  type="text"
                  placeholder="/uploads/data_export.csv"
                  value={respondForm.response_file_url}
                  onChange={(e) => setRespondForm({ ...respondForm, response_file_url: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setIsRespondModalOpen(false)}
                style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                रद्द
              </button>
              <button
                type="button"
                onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, data: respondForm })}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
              >
                अद्यावधिक गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
