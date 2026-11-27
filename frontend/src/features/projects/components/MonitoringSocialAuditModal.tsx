import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Project, MonitoringRecord, SocialAuditRecord, ProjectPhoto } from '../../../types/sectoral';
import { NepaliDatePicker } from '../../../components/common/NepaliDatePicker';
import { adToBs } from '../../../utils/nepaliCalendar';
import { api } from '../../../api/client';
import { representativesApi } from '../../../api/representatives';
import {
  X,
  Eye,
  ShieldCheck,
  CheckCircle,
  Camera,
  Users,
  Save,
  Plus,
  MapPin,
  Upload,
  Trash2,
  Loader2,
  Compass,
  FileText,
  Percent,
  Calendar,
  Award,
} from 'lucide-react';

interface MonitoringSocialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onAddMonitoring: (record: Partial<MonitoringRecord>) => Promise<void>;
  onSaveSocialAudit: (audit: Partial<SocialAuditRecord>) => Promise<void>;
  onUploadPhotoFile?: (file: File) => Promise<{ url: string; filename: string }>;
  onAddPhoto?: (photo: Partial<ProjectPhoto>) => Promise<void>;
  onDeletePhoto?: (photoId: string) => Promise<void>;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const MonitoringSocialAuditModal: React.FC<MonitoringSocialAuditModalProps> = ({
  isOpen,
  onClose,
  project,
  onAddMonitoring,
  onSaveSocialAudit,
  onUploadPhotoFile,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०४-०१';
  const [activeTab, setActiveTab] = useState<'monitoring' | 'photos' | 'social_audit'>('monitoring');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Geotagged photo upload state
  const [photoPhase, setPhotoPhase] = useState<'before' | 'during' | 'after'>('during');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [photoLat, setPhotoLat] = useState<string>('');
  const [photoLng, setPhotoLng] = useState<string>('');
  const [photoDateBs, setPhotoDateBs] = useState<string>(todayBs);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ['employees-roster'],
    queryFn: async () => {
      const res: any = await api.get('/employees');
      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 60000,
    enabled: isOpen,
  });

  const { data: representatives = [] } = useQuery<any[]>({
    queryKey: ['representatives-roster'],
    queryFn: () => representativesApi.getAll({ isCurrent: true }),
    staleTime: 60000,
    enabled: isOpen,
  });

  // Monitoring form state
  const [monitorName, setMonitorName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('गाउँपालिका अनुगमन समिति / प्राविधिक');
  const [monDateBs, setMonDateBs] = useState<string>(todayBs);
  const [progressObserved, setProgressObserved] = useState<number>(0);
  const [rating, setRating] = useState<string>('A');
  const [monStatus, setMonStatus] = useState<string>('गुणस्तरीय तथा सन्तोषजनक');
  const [recommendation, setRecommendation] = useState<string>('');
  const [isSubmittingMon, setIsSubmittingMon] = useState(false);

  // Social audit state
  const [auditDate, setAuditDate] = useState<string>('');
  const [auditVenue, setAuditVenue] = useState<string>('');
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [marginalizedCount, setMarginalizedCount] = useState<number>(0);
  const [publicSatisfaction, setPublicSatisfaction] = useState<string>('सन्तोषजनक');
  const [auditorName, setAuditorName] = useState<string>('');
  const [decisionsSummary, setDecisionsSummary] = useState<string>('');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  useEffect(() => {
    if (!isOpen || !project) return;
    setActiveTab('monitoring');
    const viceChair = representatives.find((r) => String(r.designation || '').includes('उपाध्यक्ष'));
    const wardChair = representatives.find((r) => Number(r.wardNo) === Number(project.wardNumber) && String(r.designation || '').includes('वडा अध्यक्ष'));
    const defaultMon = wardChair || viceChair;
    setMonitorName(defaultMon ? defaultMon.name : project.responsibleEngineer || '');
    setDesignation(defaultMon ? defaultMon.designation : 'वडा अनुगमन समिति / प्राविधिक');
    setMonDateBs(todayBs);
    setProgressObserved(Number(project.progressPercentage ?? project.physicalProgressPercent ?? 0));
    setRating('A');
    setMonStatus('गुणस्तरीय तथा सन्तोषजनक');
    setRecommendation('');

    setAuditDate(project.socialAudit?.date || todayBs);
    setAuditVenue(project.socialAudit?.venue || `${project.location || `वडा नं. ${project.wardNumber}`}, पाँचपोखरी थाङपाल`);
    setParticipantsCount(Number(project.socialAudit?.participantsCount || 0));
    setFemaleCount(Number(project.socialAudit?.femaleCount || 0));
    setMarginalizedCount(Number(project.socialAudit?.marginalizedCount || 0));
    setPublicSatisfaction(project.socialAudit?.publicSatisfaction || 'सन्तोषजनक');
    setAuditorName(project.socialAudit?.auditorName || '');
    setDecisionsSummary(project.socialAudit?.decisionsSummary || '');
    setPhotoLat(project.latitude ? String(project.latitude) : '27.9610');
    setPhotoLng(project.longitude ? String(project.longitude) : '85.5980');
    setPhotoDateBs(todayBs);
    setPhotoCaption('');
    setPhotoError(null);
  }, [isOpen, project, representatives, todayBs]);

  if (!isOpen || !project) return null;

  const projectPhotos: ProjectPhoto[] = Array.isArray(project.photos)
    ? project.photos.map((ph: any, idx: number) =>
        typeof ph === 'string'
          ? { id: `ph-${idx}`, phase: 'during', url: ph }
          : ph,
      )
    : [];

  const handleCaptureBrowserGps = () => {
    if (!navigator.geolocation) {
      setPhotoError('तपाईंको ब्राउजरमा GPS सुविधा उपलब्ध छैन।');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPhotoLat(pos.coords.latitude.toFixed(5));
        setPhotoLng(pos.coords.longitude.toFixed(5));
        setPhotoError(null);
      },
      () => setPhotoError('GPS स्थान पढ्न सकिएन। कृपया अनुमति दिनुहोस् वा म्यानुअल राख्नुहोस्।'),
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadPhotoFile || !onAddPhoto) return;
    if (file.size > 15 * 1024 * 1024) {
      setPhotoError('फोटो आकार १५ MB भन्दा बढी हुन सक्दैन।');
      return;
    }
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const uploaded = await onUploadPhotoFile(file);
      await onAddPhoto({
        phase: photoPhase,
        url: uploaded.url,
        caption: photoCaption.trim() || file.name,
        latitude: photoLat ? Number(photoLat) : project.latitude,
        longitude: photoLng ? Number(photoLng) : project.longitude,
        capturedDateBs: photoDateBs,
      });
      setPhotoCaption('');
      if (photoInputRef.current) photoInputRef.current.value = '';
    } catch (err: any) {
      setPhotoError(err?.response?.data?.detail || err?.message || 'फोटो अपलोड गर्न सकिएन।');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const records = Array.isArray(project.monitoringRecords) ? project.monitoringRecords : [];

  const handleMonitoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMon(true);
    try {
      await onAddMonitoring({
        date: monDateBs,
        monitorName,
        designation,
        status: monStatus,
        rating,
        progressObserved: Number(progressObserved),
        recommendation,
      });
      setRecommendation('');
    } finally {
      setIsSubmittingMon(false);
    }
  };

  const handleSocialAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAudit(true);
    try {
      await onSaveSocialAudit({
        date: auditDate,
        venue: auditVenue,
        participantsCount: Number(participantsCount),
        femaleCount: Number(femaleCount),
        marginalizedCount: Number(marginalizedCount),
        publicSatisfaction,
        auditorName,
        decisionsSummary,
      });
      onClose();
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '0.35rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '0.825rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '980px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
            color: '#ffffff',
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid #1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                अनुगमन, गुणस्तर परीक्षण तथा सामाजिक परीक्षण
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: '3px 0 0 0' }}>
                {project.name} | वडा नं. {toNepaliNum(project.wardNumber)} | योजना कोड: {project.projectCode || '-'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
            title="बन्द गर्नुहोस्"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-tabs */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'monitoring' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'monitoring' ? '#ffffff' : '#334155',
              border: activeTab === 'monitoring' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'monitoring' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <ShieldCheck size={16} />
            १. वडा तथा प्राविधिक अनुगमन प्रतिवेदन
            {records.length > 0 && (
              <span
                style={{
                  backgroundColor: activeTab === 'monitoring' ? '#ffffff' : '#0f4c81',
                  color: activeTab === 'monitoring' ? '#0f4c81' : '#ffffff',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                {toNepaliNum(records.length)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'photos' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'photos' ? '#ffffff' : '#334155',
              border: activeTab === 'photos' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'photos' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <Camera size={16} />
            २. स्थलगत Geotagged फोटो ग्यालरी
            {projectPhotos.length > 0 && (
              <span
                style={{
                  backgroundColor: activeTab === 'photos' ? '#ffffff' : '#0f4c81',
                  color: activeTab === 'photos' ? '#0f4c81' : '#ffffff',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                {toNepaliNum(projectPhotos.length)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social_audit')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'social_audit' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'social_audit' ? '#ffffff' : '#334155',
              border: activeTab === 'social_audit' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'social_audit' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <Users size={16} />
            ३. सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण
          </button>
        </div>

        {/* Tab Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* TAB 1: MONITORING */}
          {activeTab === 'monitoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Existing Reports */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.65rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      color: '#0f2942',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle size={18} color="#0f4c81" />
                    विगतका अनुगमन प्रतिवेदनहरू ({toNepaliNum(records.length)})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    पालिका तथा वडास्तरीय अनुगमन समिति
                  </span>
                </div>

                {records.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#64748b',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1',
                      fontSize: '0.825rem',
                    }}
                  >
                    अहिलेसम्म स्थलगत अनुगमन प्रतिवेदन दर्ता भएको छैन। तलको फारमबाट नयाँ अनुगमन प्रतिवेदन दर्ता गर्नुहोस्।
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {records.map((r, idx) => (
                      <div
                        key={r.id || idx}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            borderBottom: '1px solid #e2e8f0',
                            paddingBottom: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                              {r.monitorName}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({r.designation})</span>
                            <span
                              style={{
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.725rem',
                              }}
                            >
                              मिति: {toNepaliNum(r.date)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#334155', fontSize: '0.8rem' }}>
                              भौतिक प्रगति: <strong>{toNepaliNum(r.progressObserved || 0)}%</strong>
                            </span>
                            <span
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                backgroundColor:
                                  r.rating === 'A'
                                    ? '#dcfce7'
                                    : r.rating === 'B'
                                    ? '#e0e7ff'
                                    : r.rating === 'C'
                                    ? '#fef9c3'
                                    : '#fee2e2',
                                color:
                                  r.rating === 'A'
                                    ? '#15803d'
                                    : r.rating === 'B'
                                    ? '#4338ca'
                                    : r.rating === 'C'
                                    ? '#a16207'
                                    : '#b91c1c',
                                border: '1px solid currentColor',
                              }}
                            >
                              ग्रेड: {r.rating || 'A'}
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: 0, color: '#334155', fontSize: '0.8rem', lineHeight: 1.5 }}>
                          <strong style={{ color: '#0f2942' }}>सिफारिस तथा निर्देशन:</strong>{' '}
                          {r.recommendation || r.remarks || 'गुणस्तर सन्तोषजनक, आगामी किस्ता निकासा गर्न सिफारिस'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Report Form */}
              <form
                onSubmit={handleMonitoringSubmit}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Plus size={18} color="#0f4c81" />
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: '#0f2942' }}>
                    नयाँ अनुगमन प्रतिवेदन दर्ता फारम
                  </h3>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label style={labelStyle}>अनुगमनकर्ताको नाम (जनप्रतिनिधि / कर्मचारी) *</label>
                    <select
                      value={
                        [...representatives, ...employees].some((x) => (x.name || x.fullName || x.full_name) === monitorName)
                          ? monitorName
                          : '__custom__'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') return;
                        const rep = representatives.find((r) => r.name === val);
                        const emp = employees.find((em) => (em.fullName || em.full_name) === val);
                        setMonitorName(val);
                        if (rep) setDesignation(rep.designation || 'जनप्रतिनिधि');
                        else if (emp) setDesignation(emp.designation || emp.department || 'प्राविधिक');
                      }}
                      style={{ ...inputStyle, marginBottom: '0.4rem', backgroundColor: '#f8fafc' }}
                    >
                      <option value="">-- रोष्टरबाट छान्नुहोस् --</option>
                      {representatives.map((r) => (
                        <option key={`rep-${r.id}`} value={r.name}>
                          {r.name} ({r.designation}{r.wardNo ? ` - वडा ${r.wardNo}` : ''})
                        </option>
                      ))}
                      {employees.map((em) => {
                        const n = em.fullName || em.full_name;
                        return (
                          <option key={`emp-${em.id}`} value={n}>
                            {n} ({em.designation || em.department})
                          </option>
                        );
                      })}
                      <option value="__custom__">अन्य (म्यानुअल टाइप गर्नुहोस्)</option>
                    </select>
                    <input
                      type="text"
                      value={monitorName}
                      onChange={(e) => setMonitorName(e.target.value)}
                      style={inputStyle}
                      placeholder="अनुगमनकर्ताको पूरा नाम"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>पद / भूमिका *</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={inputStyle}
                      placeholder="उदा: वडा अध्यक्ष / सब-इन्जिनियर"
                      required
                    />
                  </div>

                  <div>
                    <NepaliDatePicker
                      label="अनुगमन मिति (वि.सं.) *"
                      value={monDateBs}
                      onChange={(bs) => setMonDateBs(bs)}
                      required
                      inputStyle={{ padding: '0.55rem 0.75rem', fontSize: '0.825rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>स्थलगत देखिएको भौतिक प्रगति (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressObserved}
                      onChange={(e) => setProgressObserved(Number(e.target.value))}
                      style={{ ...inputStyle, fontWeight: 700, color: '#1e3a8a' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>गुणस्तर ग्रेडिङ *</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      style={{ ...inputStyle, fontWeight: 600 }}
                    >
                      <option value="A">Grade A (उत्कृष्ट - Excellent)</option>
                      <option value="B">Grade B (राम्रो - Good)</option>
                      <option value="C">Grade C (सन्तोषजनक - Satisfactory)</option>
                      <option value="D">Grade D (सुधार आवश्यक - Needs Improvement)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>समग्र अवस्था तथा कैफियत</label>
                    <input
                      type="text"
                      value={monStatus}
                      onChange={(e) => setMonStatus(e.target.value)}
                      style={inputStyle}
                      placeholder="उदा: गुणस्तरीय तथा सन्तोषजनक"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>अनुगमन टोलीको निर्देशन तथा किस्ता भुक्तानी सिफारिस *</label>
                    <textarea
                      rows={3}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      placeholder="उपभोक्ता समितिलाई दिइएका प्राविधिक सुझाव, सुधार गर्नुपर्ने विषय र आगामी किस्ता भुक्तानी सिफारिस..."
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="submit"
                    disabled={isSubmittingMon}
                    style={{
                      backgroundColor: '#0f4c81',
                      color: '#ffffff',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: isSubmittingMon ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(15,76,129,0.25)',
                    }}
                  >
                    <Save size={16} />
                    {isSubmittingMon ? 'दर्ता हुँदैछ...' : 'अनुगमन प्रतिवेदन सुरक्षित गर्नुहोस्'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: GEOTAGGED PHOTOS */}
          {activeTab === 'photos' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.65rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    color: '#0f2942',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Camera size={18} color="#0f4c81" />
                  योजना स्थलगत Geotagged फोटो ग्यालरी ({toNepaliNum(projectPhotos.length)} फोटो)
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#475569',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: '#f1f5f9',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  <MapPin size={14} color="#dc2626" />
                  {photoLat || project.latitude || 27.9610}° N, {photoLng || project.longitude || 85.5980}° E
                </span>
              </div>

              {/* Photo Upload Box */}
              {onUploadPhotoFile && onAddPhoto && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  {photoError && (
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {photoError}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.85rem',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div>
                      <label style={labelStyle}>निर्माण चरण *</label>
                      <select
                        value={photoPhase}
                        onChange={(e) => setPhotoPhase(e.target.value as any)}
                        style={inputStyle}
                      >
                        <option value="before">१. कार्य सुरु हुनु अघि (प्रारम्भिक)</option>
                        <option value="during">२. निर्माणको क्रममा (चालु अवस्था)</option>
                        <option value="after">३. कार्य सम्पन्न भएपछि (अन्तिम)</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>फोटो विवरण / स्थान</label>
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="उदा: ग्याबियन वाल, पक्की ढलान"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>GPS (Lat / Lng)</label>
                        <button
                          type="button"
                          onClick={handleCaptureBrowserGps}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0f4c81',
                            cursor: 'pointer',
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: 0,
                          }}
                        >
                          <Compass size={12} /> हालको GPS लिनुहोस्
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={photoLat}
                          onChange={(e) => setPhotoLat(e.target.value)}
                          placeholder="Lat"
                          style={{ ...inputStyle, width: '50%', fontFamily: 'monospace', fontSize: '0.75rem' }}
                        />
                        <input
                          type="text"
                          value={photoLng}
                          onChange={(e) => setPhotoLng(e.target.value)}
                          placeholder="Lng"
                          style={{ ...inputStyle, width: '50%', fontFamily: 'monospace', fontSize: '0.75rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        style={{
                          width: '100%',
                          backgroundColor: '#0f4c81',
                          color: '#ffffff',
                          padding: '0.55rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.825rem',
                          cursor: isUploadingPhoto ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(15,76,129,0.2)',
                          opacity: isUploadingPhoto ? 0.7 : 1,
                        }}
                      >
                        {isUploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isUploadingPhoto ? 'अपलोड हुँदैछ...' : 'फोटो छानेर अपलोड गर्नुहोस्'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Phases Column Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {(
                  [
                    { key: 'before', title: '१. कार्य सुरु हुनु अघि', badge: 'प्रारम्भिक', color: '#64748b', bg: '#f1f5f9' },
                    { key: 'during', title: '२. निर्माणको क्रममा (चालु)', badge: `प्रगति ${toNepaliNum(project.progressPercentage || 0)}%`, color: '#0f4c81', bg: '#eff6ff' },
                    { key: 'after', title: '३. कार्य सम्पन्न भएपछि', badge: 'अन्तिम रूप', color: '#047857', bg: '#ecfdf5' },
                  ] as const
                ).map((phaseInfo) => {
                  const phasePhotos = projectPhotos.filter((ph) => ph.phase === phaseInfo.key);
                  return (
                    <div
                      key={phaseInfo.key}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '0.5rem',
                        }}
                      >
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: phaseInfo.color }}>
                          {phaseInfo.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: phaseInfo.bg,
                            color: phaseInfo.color,
                          }}
                        >
                          {toNepaliNum(phasePhotos.length)} फोटो
                        </span>
                      </div>

                      {phasePhotos.length === 0 ? (
                        <div
                          style={{
                            height: '140px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px dashed #cbd5e1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            gap: '0.4rem',
                          }}
                        >
                          <Camera size={26} opacity={0.4} />
                          <span style={{ fontSize: '0.75rem' }}>फोटो उपलब्ध छैन</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto' }}>
                          {phasePhotos.map((ph) => (
                            <div
                              key={ph.id}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              }}
                            >
                              <a href={ph.url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                                <img
                                  src={ph.url}
                                  alt={ph.caption || phaseInfo.title}
                                  style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }}
                                />
                              </a>
                              <div
                                style={{
                                  padding: '0.5rem 0.65rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: '0.5rem',
                                  fontSize: '0.75rem',
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{ph.caption || 'स्थलगत फोटो'}</div>
                                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace', marginTop: '2px' }}>
                                    📍 {ph.latitude || '-'}, {ph.longitude || '-'} • {toNepaliNum(ph.capturedDateBs || '-')}
                                  </div>
                                </div>
                                {onDeletePhoto && ph.id && (
                                  <button
                                    type="button"
                                    onClick={() => onDeletePhoto(ph.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      borderRadius: '4px',
                                    }}
                                    title="हटाउनुहोस्"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL AUDIT */}
          {activeTab === 'social_audit' && (
            <form
              onSubmit={handleSocialAuditSubmit}
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.65rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    color: '#0f2942',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Users size={18} color="#0f4c81" />
                  सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण (Social Audit) प्रतिवेदन
                </h3>
                <span
                  style={{
                    backgroundColor: '#e0e7ff',
                    border: '1px solid #c7d2fe',
                    color: '#3730a3',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  जनसन्तुष्टि स्थिति: {publicSatisfaction}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <NepaliDatePicker
                    label="परीक्षण सम्पन्न मिति (वि.सं.) *"
                    value={auditDate}
                    onChange={(bs) => setAuditDate(bs)}
                    required
                    inputStyle={{ padding: '0.55rem 0.75rem', fontSize: '0.825rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>भेला भएको स्थान / स्थल *</label>
                  <input
                    type="text"
                    value={auditVenue}
                    onChange={(e) => setAuditVenue(e.target.value)}
                    style={inputStyle}
                    placeholder="उदा: वडा कार्यालय प्राङ्गण / निर्माण स्थल"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>सहजकर्ता / सामाजिक परिचालक</label>
                  <input
                    type="text"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    style={inputStyle}
                    placeholder="सामाजिक परिचालक वा सहजकर्ताको नाम"
                  />
                </div>

                <div>
                  <label style={labelStyle}>कुल उपस्थित उपभोक्ता संख्या</label>
                  <input
                    type="number"
                    min={0}
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    style={{ ...inputStyle, fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>महिला सहभागी संख्या</label>
                  <input
                    type="number"
                    min={0}
                    value={femaleCount}
                    onChange={(e) => setFemaleCount(Number(e.target.value))}
                    style={{ ...inputStyle, fontWeight: 700, color: '#0d9488' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>दलित / सीमान्तकृत संख्या</label>
                  <input
                    type="number"
                    min={0}
                    value={marginalizedCount}
                    onChange={(e) => setMarginalizedCount(Number(e.target.value))}
                    style={{ ...inputStyle, fontWeight: 700, color: '#4338ca' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>उपभोक्ताको सन्तुष्टि स्तर *</label>
                  <select
                    value={publicSatisfaction}
                    onChange={(e) => setPublicSatisfaction(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 600 }}
                  >
                    <option value="उत्कृष्ट">उत्कृष्ट (Highly Satisfied)</option>
                    <option value="सन्तोषजनक">सन्तोषजनक (Satisfied)</option>
                    <option value="सामान्य">सामान्य (Average)</option>
                    <option value="सुधार आवश्यक">सुधार आवश्यक (Needs Improvement)</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>सामाजिक परीक्षणमा पारित प्रमुख निर्णयहरू (Minutes Summary) *</label>
                  <textarea
                    rows={4}
                    value={decisionsSummary}
                    onChange={(e) => setDecisionsSummary(e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="भेलामा उठेका सार्वजनिक चासो, आय-व्ययको पारदर्शी समीक्षा, निर्माण गुणस्तर अनुमोदन र पारित निर्णयहरूको संक्षिप्त विवरण..."
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAudit}
                  style={{
                    backgroundColor: '#0f4c81',
                    color: '#ffffff',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: isSubmittingAudit ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(15,76,129,0.25)',
                  }}
                >
                  <Save size={16} />
                  {isSubmittingAudit ? 'सुरक्षित गर्दै...' : 'सामाजिक परीक्षण प्रतिवेदन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
