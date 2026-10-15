import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Plus,
  ArrowRight,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  KeyRound,
  FileCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import './EOfficeManagement.css';

interface Darta {
  id: string;
  darta_no: string;
  sender_name: string;
  subject: string;
  document_date: string;
  status: string;
}

interface Chalani {
  id: string;
  chalani_no: string;
  receiver_name: string;
  subject: string;
  dispatch_date: string;
}

interface Tippani {
  id: string;
  tippani_no: string;
  subject: string;
  initiated_by: string;
  status: string;
  content_html?: string;
  file_id?: string;
  created_at?: string;
}

interface FileMovement {
  id: string;
  file_id: string;
  file_no: string;
  file_subject: string;
  from_employee_id: string;
  to_employee_id: string;
  action_requested: string;
  remarks: string;
  is_read: boolean;
  action_taken_date?: string;
  dispatched_at: string;
}

interface DigitalSignature {
  id: string;
  document_id: string;
  document_type: string;
  signed_by: string;
  cert_thumbprint: string;
  signature_payload: string;
  signed_at: string;
}

interface EOfficeStats {
  totalFiles: number;
  openFiles: number;
  totalTippani: number;
  approvedTippani: number;
  pendingTippani: number;
  totalMovements: number;
  totalDigitalSignatures: number;
  totalDarta: number;
  totalChalani: number;
}

export default function EOfficeManagement() {
  const [activeTab, setActiveTab] = useState<'movements' | 'signatures' | 'tippani' | 'darta' | 'chalani'>('movements');

  // Data States
  const [stats, setStats] = useState<EOfficeStats | null>(null);
  const [movements, setMovements] = useState<FileMovement[]>([]);
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [tippanis, setTippanis] = useState<Tippani[]>([]);
  const [dartas, setDartas] = useState<Darta[]>([]);
  const [chalanis, setChalanis] = useState<Chalani[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<Tippani | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState<any | null>(null);
  const [showTippaniModal, setShowTippaniModal] = useState(false);
  const [showDartaModal, setShowDartaModal] = useState(false);
  const [showChalaniModal, setShowChalaniModal] = useState(false);

  // Forms
  const [dispatchForm, setDispatchForm] = useState({
    file_id: '198ebfaa-119d-46fb-af8f-cfbd4588b251',
    from_employee_id: 'इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)',
    to_employee_id: 'राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)',
    action_requested: 'Final Approval',
    remarks: '',
  });

  const [dartaForm, setDartaForm] = useState({ darta_no: '', sender_name: '', subject: '', document_date: '', received_by: 'Admin' });
  const [chalaniForm, setChalaniForm] = useState({ chalani_no: '', receiver_name: '', subject: '', dispatched_by: 'Admin' });
  const [tippaniForm, setTippaniForm] = useState({ tippani_no: '', subject: '', content_text: '', initiated_by: 'प्रशासकीय अधिकृत' });

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/e-office/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Failed to fetch e-office stats', e);
    }
  };

  // Fetch Active Tab Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'movements') {
        const res = await fetch('/api/v1/e-office/movements/');
        if (res.ok) setMovements(await res.json());
      } else if (activeTab === 'signatures') {
        const res = await fetch('/api/v1/e-office/signatures/');
        if (res.ok) setSignatures(await res.json());
      } else if (activeTab === 'tippani') {
        const res = await fetch('/api/v1/e-office/tippani/');
        if (res.ok) setTippanis(await res.json());
      } else if (activeTab === 'darta') {
        const res = await fetch('/api/v1/e-office/darta/');
        if (res.ok) setDartas(await res.json());
      } else if (activeTab === 'chalani') {
        const res = await fetch('/api/v1/e-office/chalani/');
        if (res.ok) setChalanis(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [activeTab]);

  // Submit Movement (Dispatch / Forward)
  const submitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/e-office/movements/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchForm),
      });
      if (res.ok) {
        setShowDispatchModal(false);
        setDispatchForm({ ...dispatchForm, remarks: '' });
        fetchData();
        fetchStats();
        alert('फाइल सफलतापूर्वक अर्को फाँट/अधिकृतमा चालचलन गरियो!');
      }
    } catch (e) {
      alert('फाइल चालचलन गर्न त्रुटि भयो।');
    }
  };

  // Submit Digital Signature
  const handleSignDocument = async (docId: string, docType = 'TIPPANI') => {
    try {
      const res = await fetch('/api/v1/e-office/signatures/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          document_type: docType,
          signed_by: 'राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)',
        }),
      });
      if (res.ok) {
        setShowSignModal(null);
        fetchData();
        fetchStats();
        alert('कागजातमा डिजिटल हस्ताक्षर सफलतापूर्वक प्रमाणित गरियो!');
      }
    } catch (e) {
      alert('डिजिटल हस्ताक्षर गर्न त्रुटि भयो।');
    }
  };

  // Verify Signature
  const handleVerify = async (docId: string) => {
    try {
      const res = await fetch(`/api/v1/e-office/signatures/verify/${docId}`);
      if (res.ok) {
        const data = await res.json();
        setShowVerifyModal(data);
      }
    } catch (e) {
      alert('हस्ताक्षर प्रमाणीकरण जाँच गर्न सकिएन।');
    }
  };

  // Submit Darta
  const submitDarta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/e-office/darta/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dartaForm),
      });
      if (res.ok) {
        setShowDartaModal(false);
        setDartaForm({ darta_no: '', sender_name: '', subject: '', document_date: '', received_by: 'Admin' });
        fetchData();
        fetchStats();
        alert('दर्ता सफलतापूर्वक सम्पन्न भयो!');
      }
    } catch (error) {
      alert('Error creating Darta');
    }
  };

  // Submit Chalani
  const submitChalani = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/e-office/chalani/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chalaniForm),
      });
      if (res.ok) {
        setShowChalaniModal(false);
        setChalaniForm({ chalani_no: '', receiver_name: '', subject: '', dispatched_by: 'Admin' });
        fetchData();
        fetchStats();
        alert('चलानी सफलतापूर्वक सम्पन्न भयो!');
      }
    } catch (error) {
      alert('Error creating Chalani');
    }
  };

  // Submit Tippani
  const submitTippani = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/e-office/tippani/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tippaniForm),
      });
      if (res.ok) {
        setShowTippaniModal(false);
        setTippaniForm({ tippani_no: '', subject: '', content_text: '', initiated_by: 'प्रशासकीय अधिकृत' });
        fetchData();
        fetchStats();
        alert('टिप्पणी सफलतापूर्वक उठाइयो!');
      }
    } catch (error) {
      alert('Error creating Tippani');
    }
  };

  // Filtered movements
  const filteredMovements = movements.filter((m) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (m.file_no && m.file_no.toLowerCase().includes(s)) ||
      (m.file_subject && m.file_subject.toLowerCase().includes(s)) ||
      (m.from_employee_id && m.from_employee_id.toLowerCase().includes(s)) ||
      (m.to_employee_id && m.to_employee_id.toLowerCase().includes(s)) ||
      (m.remarks && m.remarks.toLowerCase().includes(s))
    );
  });

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Top Title Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}
          >
            <Layers size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              एकीकृत ई-अफिस, डिजिटल हस्ताक्षर तथा फाइल चालचलन
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              पाँचपोखरी थाङपाल गाउँपालिका — Paperless E-Office, File Movements & Digital Signatures
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              fetchStats();
              fetchData();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> ताजा गर्नुहोस्
          </button>

          {activeTab === 'movements' && (
            <button
              onClick={() => setShowDispatchModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              }}
            >
              <Send size={15} /> नयाँ फाइल चालचलन (Dispatch)
            </button>
          )}

          {activeTab === 'tippani' && (
            <button
              onClick={() => setShowTippaniModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> नयाँ टिप्पणी उठाउनुहोस्
            </button>
          )}

          {activeTab === 'darta' && (
            <button
              onClick={() => setShowDartaModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> नयाँ दर्ता
            </button>
          )}

          {activeTab === 'chalani' && (
            <button
              onClick={() => setShowChalaniModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> नयाँ चलानी
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>कुल डिजिटल फाइलहरू</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
              {stats?.totalFiles ?? 0} फाइल
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
              सक्रिय/खुला: {stats?.openFiles ?? 0}
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#ede9fe',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderTree size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>फाइल चालचलन इतिहास</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
              {stats?.totalMovements ?? 0} पटक
            </div>
            <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>फाँट तथा अधिकृत हस्तान्तरण</div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>टिप्पणी तथा निर्णय आदेश</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
              {stats?.totalTippani ?? 0} वटा
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
              स्वीकृत: {stats?.approvedTippani ?? 0} | विचाराधीन: {stats?.pendingTippani ?? 0}
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={24} />
          </div>
        </div>

        {/* Card 4 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>डिजिटल हस्ताक्षर प्रमाणित</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
              {stats?.totalDigitalSignatures ?? 0} सहि
            </div>
            <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '500' }}>SHA-256 सुरक्षित प्रमाणीकरण</div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#faf5ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'movements', label: 'फाइल चालचलन ट्र्याकर', icon: <Send size={15} />, count: movements.length },
            { key: 'signatures', label: 'डिजिटल हस्ताक्षर लग', icon: <ShieldCheck size={15} />, count: signatures.length },
            { key: 'tippani', label: 'टिप्पणी तथा निर्णय', icon: <FileText size={15} />, count: tippanis.length },
            { key: 'darta', label: 'दर्ता किताब', icon: <FileCheck size={15} />, count: dartas.length },
            { key: 'chalani', label: 'चलानी किताब', icon: <Send size={15} />, count: chalanis.length },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#f3e8ff' : 'transparent',
                  color: isActive ? '#6b21a8' : '#64748b',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? '#d8b4fe' : '#f1f5f9',
                    color: isActive ? '#581c87' : '#475569',
                    padding: '1px 7px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: FILE MOVEMENTS */}
      {activeTab === 'movements' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="फाइल नं, विषय, पठाउने वा पाउने अधिकृत खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              कुल अभिलेख: <strong>{filteredMovements.length}</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>फाइल नं / विषय</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>पठाउने फाँट/कर्मचारी</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>हस्तान्तरित अधिकृत</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>अनुरोध कार्य</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>कैफियत / टिप्पणी</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>मिति र समय</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      कुनै फाइल चालचलन अभिलेख फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#1e40af' }}>{m.file_no || 'FILE-2081'}</div>
                        <div style={{ fontSize: '12px', color: '#475569', maxWidth: '240px' }}>{m.file_subject}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>
                        {m.from_employee_id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '600',
                            color: '#0f172a',
                          }}
                        >
                          <ArrowRight size={13} style={{ color: '#7c3aed' }} /> {m.to_employee_id}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}
                        >
                          {m.action_requested}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '300px', fontSize: '12px' }}>
                        {m.remarks}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {m.dispatched_at ? new Date(m.dispatched_at).toLocaleString('ne-NP') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL SIGNATURES */}
      {activeTab === 'signatures' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              डिजिटल हस्ताक्षर तथा सुरक्षा प्रमाणीकरण अभिलेख (Cryptographic Signatures)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              नेपाल डिजिटल हस्ताक्षर तथा प्रमाणीकरण नियमावली बमोजिम सुरक्षित डिजिटल सहिहरूको आधिकारिक अभिलेख
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>प्रमाणित कागजात</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>कागजात प्रकार</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>डिजिटल हस्ताक्षरकर्ता</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>प्रमाणपत्र थम्बप्रिन्ट (SHA-256)</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>हस्ताक्षर मिति</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>प्रमाणीकरण</th>
                </tr>
              </thead>
              <tbody>
                {signatures.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      कुनै डिजिटल हस्ताक्षर अभिलेख फेला परेन।
                    </td>
                  </tr>
                ) : (
                  signatures.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e40af' }}>
                        {s.document_id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: s.document_type === 'TIPPANI' ? '#f3e8ff' : '#eff6ff',
                            color: s.document_type === 'TIPPANI' ? '#7c3aed' : '#2563eb',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                          }}
                        >
                          {s.document_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                        {s.signed_by}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <code
                          style={{
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#334155',
                          }}
                        >
                          {s.cert_thumbprint ? `${s.cert_thumbprint.slice(0, 23)}...` : 'N/A'}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {s.signed_at ? new Date(s.signed_at).toLocaleString('ne-NP') : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleVerify(s.document_id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #10b981',
                            background: '#ecfdf5',
                            color: '#059669',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={12} /> रुजु / प्रमाणीकरण
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TIPPANI */}
      {activeTab === 'tippani' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              डिजिटल टिप्पणी तथा कार्यपालिका निर्णय आदेश
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>टिप्पणी नं.</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>विषय</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>उठाउने अधिकृत</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>अवस्था</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>डिजिटल हस्ताक्षर</th>
                </tr>
              </thead>
              <tbody>
                {tippanis.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      कुनै टिप्पणी फेला परेन।
                    </td>
                  </tr>
                ) : (
                  tippanis.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1e40af' }}>{t.tippani_no}</td>
                      <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '600' }}>{t.subject}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{t.initiated_by}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: t.status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                            color: t.status === 'Approved' ? '#059669' : '#d97706',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                          }}
                        >
                          {t.status === 'Approved' ? 'स्वीकृत' : t.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {t.status !== 'Approved' ? (
                          <button
                            onClick={() => handleSignDocument(t.id, 'TIPPANI')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#7c3aed',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <KeyRound size={12} /> डिजिटल सहि गर्नुहोस्
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(t.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #10b981',
                              background: '#ecfdf5',
                              color: '#059669',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <CheckCircle2 size={12} /> प्रमाणित सहि हेर्नुहोस्
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DARTA */}
      {activeTab === 'darta' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>दर्ता किताब (Incoming Registry)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>दर्ता नं.</th>
                  <th style={{ padding: '12px 16px' }}>पठाउने व्यक्ति/संस्था</th>
                  <th style={{ padding: '12px 16px' }}>पत्रको विषय</th>
                  <th style={{ padding: '12px 16px' }}>दर्ता मिति</th>
                  <th style={{ padding: '12px 16px' }}>अवस्था</th>
                </tr>
              </thead>
              <tbody>
                {dartas.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#059669' }}>{d.darta_no}</td>
                    <td style={{ padding: '12px 16px' }}>{d.sender_name}</td>
                    <td style={{ padding: '12px 16px' }}>{d.subject}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{d.document_date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CHALANI */}
      {activeTab === 'chalani' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>चलानी किताब (Outgoing Registry)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>चलानी नं.</th>
                  <th style={{ padding: '12px 16px' }}>पाउने कार्यालय/व्यक्ति</th>
                  <th style={{ padding: '12px 16px' }}>पत्रको विषय</th>
                  <th style={{ padding: '12px 16px' }}>चलानी मिति</th>
                </tr>
              </thead>
              <tbody>
                {chalanis.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#ea580c' }}>{c.chalani_no}</td>
                    <td style={{ padding: '12px 16px' }}>{c.receiver_name}</td>
                    <td style={{ padding: '12px 16px' }}>{c.subject}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.dispatch_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPATCH FILE MOVEMENT MODAL */}
      {showDispatchModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              नयाँ फाइल चालचलन / पेश गर्नुहोस् (Forward File)
            </h3>
            <form onSubmit={submitMovement}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  फाइल छनोट गर्नुहोस्:
                </label>
                <select
                  value={dispatchForm.file_id}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, file_id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="file-infra-01">FILE-2081-INFRA-01 — सडक तथा पूर्वाधार योजना</option>
                  <option value="file-disaster-02">FILE-2081-DISASTER-02 — मनसुन विपद् प्रतिकार्य तथा राहत</option>
                  <option value="file-edu-03">FILE-2081-EDU-03 — विद्यालय भौतिक पूर्वाधार तथा शिक्षक</option>
                  <option value="file-health-04">FILE-2081-HEALTH-04 — स्वास्थ्य संस्था औषधि खरिद</option>
                  <option value="file-admin-05">FILE-2081-ADMIN-05 — सेवा करार कर्मचारी पदपूर्ति</option>
                  <option value="file-rev-06">FILE-2081-REVENUE-06 — स्थानीय कर दर पुनरावलोकन</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  पठाउने फाँट/अधिकृत:
                </label>
                <input
                  type="text"
                  value={dispatchForm.from_employee_id}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, from_employee_id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  हस्तान्तरण गरिने अधिकृत/फाँट:
                </label>
                <select
                  value={dispatchForm.to_employee_id}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, to_employee_id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)">राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)</option>
                  <option value="सुरेश केसी (लेखा अधिकृत)">सुरेश केसी (लेखा अधिकृत)</option>
                  <option value="दिलीप गिरी (योजना अधिकृत)">दिलीप गिरी (योजना अधिकृत)</option>
                  <option value="इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)">इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)</option>
                  <option value="कमल तामाङ (राजस्व अधिकृत)">कमल तामाङ (राजस्व अधिकृत)</option>
                  <option value="सुरेन्द्र श्रेष्ठ (वडा सचिव)">सुरेन्द्र श्रेष्ठ (वडा सचिव)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  अनुरोध कार्य (Action Requested):
                </label>
                <input
                  type="text"
                  value={dispatchForm.action_requested}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, action_requested: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  कैफियत / राय / निर्देशन:
                </label>
                <textarea
                  rows={3}
                  value={dispatchForm.remarks}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, remarks: e.target.value })}
                  placeholder="टिप्पणी राय वा फाइल चालचलन सम्बन्धमा व्यहोरा..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  हस्तान्तरण गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY SIGNATURE MODAL */}
      {showVerifyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                डिजिटल हस्ताक्षर प्रमाणीकरण सफल
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                {showVerifyModal.message}
              </p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>कागजात आईडी:</span>{' '}
                <strong>{showVerifyModal.document_id}</strong>
              </div>
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>डिजिटल हस्ताक्षर संख्या:</span>{' '}
                <strong>{showVerifyModal.signatures_count} वटा</strong>
              </div>

              {showVerifyModal.signatures &&
                showVerifyModal.signatures.map((sig: any, idx: number) => (
                  <div
                    key={sig.id}
                    style={{
                      borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none',
                      paddingTop: idx > 0 ? '10px' : 0,
                      marginTop: idx > 0 ? '10px' : 0,
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                      सहि गर्ने: {sig.signed_by}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      प्रमाणपत्र (SHA-256): <code>{sig.cert_thumbprint}</code>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      मिति: {sig.signed_at ? new Date(sig.signed_at).toLocaleString('ne-NP') : '—'}
                    </div>
                  </div>
                ))}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setShowVerifyModal(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TIPPANI MODAL */}
      {showTippaniModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>नयाँ टिप्पणी उठाउनुहोस्</h3>
            <form onSubmit={submitTippani}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  टिप्पणीको विषय:
                </label>
                <input
                  type="text"
                  required
                  value={tippaniForm.subject}
                  onChange={(e) => setTippaniForm({ ...tippaniForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  उठाउने अधिकृत/कर्मचारी:
                </label>
                <input
                  type="text"
                  required
                  value={tippaniForm.initiated_by}
                  onChange={(e) => setTippaniForm({ ...tippaniForm, initiated_by: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  टिप्पणीको व्यहोरा:
                </label>
                <textarea
                  rows={4}
                  required
                  value={tippaniForm.content_text}
                  onChange={(e) => setTippaniForm({ ...tippaniForm, content_text: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTippaniModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  टिप्पणी पेश गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DARTA MODAL */}
      {showDartaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>नयाँ दर्ता प्रविष्टि</h3>
            <form onSubmit={submitDarta}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>दर्ता नं:</label>
                <input
                  type="text"
                  required
                  value={dartaForm.darta_no}
                  onChange={(e) => setDartaForm({ ...dartaForm, darta_no: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>पठाउने व्यक्ति/संस्था:</label>
                <input
                  type="text"
                  required
                  value={dartaForm.sender_name}
                  onChange={(e) => setDartaForm({ ...dartaForm, sender_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>पत्रको विषय:</label>
                <input
                  type="text"
                  required
                  value={dartaForm.subject}
                  onChange={(e) => setDartaForm({ ...dartaForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDartaModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CHALANI MODAL */}
      {showChalaniModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>नयाँ चलानी प्रविष्टि</h3>
            <form onSubmit={submitChalani}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>चलानी नं:</label>
                <input
                  type="text"
                  required
                  value={chalaniForm.chalani_no}
                  onChange={(e) => setChalaniForm({ ...chalaniForm, chalani_no: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>पाउने कार्यालय/व्यक्ति:</label>
                <input
                  type="text"
                  required
                  value={chalaniForm.receiver_name}
                  onChange={(e) => setChalaniForm({ ...chalaniForm, receiver_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>पत्रको विषय:</label>
                <input
                  type="text"
                  required
                  value={chalaniForm.subject}
                  onChange={(e) => setChalaniForm({ ...chalaniForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowChalaniModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  चलानी गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
