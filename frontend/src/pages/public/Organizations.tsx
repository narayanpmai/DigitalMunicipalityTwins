import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, Phone, Mail, MapPin, Landmark, Search, ShieldCheck, CheckCircle2, Users } from 'lucide-react';
import { cooperativesApi, type Cooperative } from '../../api/cooperatives';

const DEFAULT_OFFICES = [
  { name: 'पाँचपोखरी थाङपाल गाउँपालिका कार्यालय', type: 'सरकारी', phone: '०११-६९२००१', ward: 'वडा नं ६ (थाङपालधाप)', color: '#0284c7' },
  { name: 'भूमि प्रशासन तथा मालपोत शाखा', type: 'सरकारी', phone: '०११-६९२००२', ward: 'वडा नं ६', color: '#0284c7' },
  { name: 'सहकारी तथा उद्यम प्रवर्द्धन शाखा', type: 'सरकारी', phone: '०११-६९२०१५', ward: 'वडा नं ६', color: '#0284c7' },
  { name: 'पाँचपोखरी पर्यटन तथा वातावरण संरक्षण समिति', type: 'समुदाय', phone: '९८५११२३४५६', ward: 'वडा नं ३ (भोताङ)', color: '#16a34a' },
  { name: 'तामाङ सेवा समाज', type: 'गैसस', phone: '—', ward: 'वडा नं ५', color: '#d97706' },
  { name: 'महिला कृषक समूह महासंघ', type: 'गैसस', phone: '—', ward: 'सबै वडा', color: '#e11d48' },
];

export const Organizations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cooperatives' | 'all'>('cooperatives');
  const [search, setSearch] = useState('');

  const { data: cooperatives = [] } = useQuery<Cooperative[]>({
    queryKey: ['public-cooperatives'],
    queryFn: () => cooperativesApi.list(),
  });

  const filteredCoops = cooperatives.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.registration_no.toLowerCase().includes(search.toLowerCase()) ||
    c.ward_number.toString().includes(search)
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '10px', background: '#0284c7', borderRadius: '10px', color: '#fff' }}>
            <Building size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0d1f3c', margin: 0 }}>
              संघसंस्था तथा सहकारी सूचना पोर्टल
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
              पाँचपोखरी थाङपाल गाउँपालिका | आधिकारिक दर्ता भएका सहकारी संस्था, सरकारी निकाय तथा गैरसरकारी संघसंस्थाहरू
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('cooperatives')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'cooperatives' ? '#0284c7' : '#64748b',
            borderBottom: activeTab === 'cooperatives' ? '2px solid #0284c7' : '2px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Landmark size={16} /> सहकारी संस्थाहरू (COPOMIS दर्ता)
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'all' ? '#0284c7' : '#64748b',
            borderBottom: activeTab === 'all' ? '2px solid #0284c7' : '2px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Building size={16} /> सरकारी तथा अन्य निकायहरू
        </button>
      </div>

      {activeTab === 'cooperatives' && (
        <div>
          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="सहकारीको नाम वा वडा नं बाट खोज्नुहोस्..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredCoops.map((coop) => (
              <div
                key={coop.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px' }}>
                      {coop.coop_type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> {coop.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {coop.name}
                  </h3>

                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> वडा नं {coop.ward_number}, {coop.tole_address || 'पाँचपोखरी'}</div>
                    <div><Landmark size={13} style={{ display: 'inline', marginRight: '4px' }} /> दर्ता: {coop.registration_no}</div>
                    {coop.chairperson_name && (
                      <div><Users size={13} style={{ display: 'inline', marginRight: '4px' }} /> अध्यक्ष: {coop.chairperson_name} ({coop.chairperson_phone || '-'})</div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#475569' }}>कुल सदस्य: <b>{coop.total_members}</b></span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>COPOMIS: {coop.copomis_code || 'दर्ता सूचीकृत'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {DEFAULT_OFFICES.map((o) => (
            <div
              key={o.name}
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderLeft: `4px solid ${o.color}`
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontWeight: 600, fontSize: '15px' }}>{o.name}</h4>
                <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                  <span><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />{o.ward}</span>
                  {o.phone !== '—' && <span><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />{o.phone}</span>}
                </div>
              </div>
              <span style={{ padding: '4px 12px', backgroundColor: `${o.color}15`, color: o.color, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                {o.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
