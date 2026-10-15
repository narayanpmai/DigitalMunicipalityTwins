import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tourismApi } from '../../../api/tourism';
import type { TouristLog } from '../../../api/tourism';
import { Search, UserPlus, Shield, Phone, Compass, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { AddTouristLogModal } from './AddTouristLogModal';

export const TouristLogTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTouristOpen, setIsAddTouristOpen] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['tourism-logs'],
    queryFn: () => tourismApi.getTouristLogs(),
  });

  const filtered = logs.filter((t: TouristLog) =>
    t.touristName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.destination && t.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.guideName && t.guideName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.permitNumber && t.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>पर्यटक दर्ता पुस्तिका तथा सुरक्षा ट्र्याकिङ (Tourist Safe Travel Log)</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>गाउँपालिकामा भित्रिने पर्यटक, इजाजतप्राप्त गाइड, आपतकालीन सम्पर्क तथा पर्यटन शुल्क विवरण</p>
        </div>
        <button
          onClick={() => setIsAddTouristOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          <UserPlus size={18} /> नयाँ पर्यटक दर्ता
        </button>
      </div>

      <div style={{ display: 'flex', marginBottom: '1.5rem', position: 'relative', width: '380px', maxWidth: '100%' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input 
          type="text" 
          placeholder="पर्यटकको नाम, गाइड, परमिट वा गन्तव्य खोज्नुहोस्..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem' }}>पर्यटकको विवरण</th>
              <th style={{ padding: '0.75rem 1rem' }}>राष्ट्रियता / परमिट</th>
              <th style={{ padding: '0.75rem 1rem' }}>गन्तव्य तथा मिति</th>
              <th style={{ padding: '0.75rem 1rem' }}>इजाजतप्राप्त गाइड / सम्पर्क</th>
              <th style={{ padding: '0.75rem 1rem' }}>आपतकालीन तथा बीमा</th>
              <th style={{ padding: '0.75rem 1rem' }}>पर्यटन प्रवेश शुल्क</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log: TouristLog) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.touristName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {log.gender === 'female' ? 'महिला' : log.gender === 'other' ? 'अन्य' : 'पुरुष'}
                    {log.ageGroup ? ` • ${log.ageGroup === 'youth' ? 'युवा' : log.ageGroup === 'senior' ? 'ज्येष्ठ नागरिक' : 'वयस्क'}` : ''}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {log.country}
                  </div>
                  {log.permitNumber && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {log.permitNumber}
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 500, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Compass size={14} /> {log.destination || '-'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                    प्रवेश: {log.entryDate || '-'} {log.exitDate ? `| प्रस्थान: ${log.exitDate}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    उद्देश्य: {log.purpose || 'पदयात्रा'}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {log.guideName ? (
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Shield size={13} color="#2563eb" /> {log.guideName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        लाइसेन्स: {log.guideLicenseNo || 'स्थानीय गाइड'}
                      </div>
                      {log.guidePhone && (
                        <div style={{ fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={11} /> {log.guidePhone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>गाइड बिना (Solo)</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {log.emergencyContact ? (
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                      <span style={{ fontWeight: 600 }}>सम्पर्क:</span> {log.emergencyContact}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>-</div>
                  )}
                  {log.insurancePolicyNo && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      बीमा: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>{log.insurancePolicyNo}</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    रु. {(log.entryFeeNpr ?? 0).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    {log.entryFeeStatus === 'waived' ? (
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                        छुट / निःशुल्क
                      </span>
                    ) : log.entryFeeStatus === 'pending' ? (
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                        बाँकी
                      </span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                        ✓ तिरेको
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  कुनै रेकर्ड भेटिएन।
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  लोड हुँदैछ...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddTouristOpen && (
        <AddTouristLogModal
          isOpen={isAddTouristOpen}
          onClose={() => setIsAddTouristOpen(false)}
        />
      )}
    </div>
  );
};
