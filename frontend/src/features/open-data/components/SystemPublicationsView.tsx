import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../../api/sectoral';
import {
  Globe,
  Database,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Layers,
  Search,
  RefreshCw,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import type { OpenDataPublicationItem } from '../../../types/open-data';

interface SystemPublicationsViewProps {
  isAdmin?: boolean;
}

export const SystemPublicationsView: React.FC<SystemPublicationsViewProps> = ({ isAdmin = false }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: publications = [], isLoading, refetch } = useQuery<OpenDataPublicationItem[]>({
    queryKey: ['open-data-publications'],
    queryFn: () => sectoralApi.getOpenDataPublications() as Promise<OpenDataPublicationItem[]>,
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      return sectoralApi.toggleOpenDataPublication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-data-publications'] });
    },
  });

  const filtered = publications.filter((p) =>
    !searchTerm.trim() ||
    p.dataset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.source_table_or_query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            प्रणालीगत खुला डाटा तालिका व्यवस्थापन (dash_open_data_publications)
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
            डिजिटल ट्विनका प्रत्यक्ष डाटाबेस तालिकाहरू (Households, Budgets, Projects, Schools) लाई नागरिक पोर्टलमा सार्वजनिक प्रदर्शन गर्ने वा रोक्ने नियन्त्रण।
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="तालिका वा शीर्षक खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.825rem',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={() => refetch()}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.825rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} />
            <span>रिफ्रेस</span>
          </button>
        </div>
      </div>

      {/* Publications Table */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>तालिकाहरू लोड हुँदैछ...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          कुनै प्रणालीगत खुला डाटा तालिका फेला परेन।
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>डेटासेट नाम</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>स्रोत तालिका (DB Table)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>ढाँचा</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>रेकर्ड सङ्ख्या</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>डाउनलोड</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>स्वीकृत गर्ने अधिकारी</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155' }}>सार्वजनिक स्थिति</th>
                {isAdmin && <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#334155', textAlign: 'center' }}>स्वीकृति / स्थिति बदल्नुहोस्</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.dataset_name}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <code style={{ fontSize: '0.78rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>
                      {item.source_table_or_query}
                    </code>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 600 }}>
                    {item.format || 'JSON, CSV'}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0284c7' }}>
                    {item.record_count.toLocaleString()}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#d97706', fontWeight: 700 }}>
                    {item.download_count} पटक
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                    {item.published_by || 'प्रमुख प्रशासकीय अधिकृत'}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    {item.is_published ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                        <CheckCircle2 size={13} />
                        <span>प्रकाशित</span>
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                        <XCircle size={13} />
                        <span>अप्रकाशित</span>
                      </span>
                    )}
                  </td>

                  {isAdmin && (
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleMutation.mutate(item.id)}
                        disabled={toggleMutation.isPending}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: item.is_published ? '#fee2e2' : '#dcfce7',
                          color: item.is_published ? '#b91c1c' : '#15803d',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {item.is_published ? 'अप्रकाशित गर्नुहोस्' : 'स्वीकृत गरी प्रकाशन'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
