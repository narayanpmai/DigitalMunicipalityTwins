import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Copy,
  Check,
  Play,
  Database,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const DeveloperApiView: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/open-data/stats');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/open-data/stats',
      desc: 'समग्र खुला तथ्याङ्क, डाउनलोड, अनुक्रमणिका र पारदर्शिता स्कोर सारांश',
    },
    {
      method: 'GET',
      path: '/api/v1/open-data/datasets',
      desc: 'सबै प्रकाशित खुला डेटासेटहरूको सूची तथा मेटाडेटा',
    },
    {
      method: 'GET',
      path: '/api/v1/open-data/indicators/all',
      desc: 'पालिका प्रमुख सूचकहरू तथा दिगो विकास लक्ष्य (SDG) लगत',
    },
    {
      method: 'GET',
      path: '/api/v1/open-data/transparency/overview',
      desc: 'सार्वजनिक पारदर्शिता, RTI स्वतः प्रकाशन तथा सामाजिक परीक्षण अङ्क',
    },
    {
      method: 'GET',
      path: '/api/v1/open-data/publications/list',
      desc: 'प्रणालीगत खुला डाटा तालिकाहरू (dash_open_data_publications)',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRunTest = async (path: string) => {
    setIsTesting(true);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const getCodeSnippet = (path: string) => {
    const origin = window.location.origin;
    const url = `${origin}${path}`;

    if (activeLang === 'curl') {
      return `curl -X GET "${url}" \\
  -H "Accept: application/json"`;
    }
    if (activeLang === 'js') {
      return `// JavaScript (Fetch API)
async function fetchMunicipalOpenData() {
  const res = await fetch("${url}", {
    headers: { "Accept": "application/json" }
  });
  const data = await res.json();
  console.log("Municipal Open Data:", data);
  return data;
}

fetchMunicipalOpenData();`;
    }
    return `# Python 3 (Requests)
import requests

url = "${url}"
response = requests.get(url, headers={"Accept": "application/json"})

if response.status_code == 200:
    data = response.json()
    print("Fetched Records:", len(data) if isinstance(data, list) else data)
else:
    print("Error:", response.status_code)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Header */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '14px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            <Terminal size={14} />
            <span>सार्वजनिक खुला डाटा REST API (Developer Open Access)</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
            विकासकर्ता तथा अनुसन्धानकर्ता एपीआई पोर्टल
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            पाँचपोखरी थाङपाल गाउँपालिकाको खुला डाटासेटहरू मेसिन-पठनीय JSON ढाँचामा निःशुल्क प्रयोग गर्नुहोस्। कुनै API Key आवश्यक पर्दैन।
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.65rem 1rem', borderRadius: '10px' }}>
          <ShieldCheck size={20} color="#4ade80" />
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            इजाजत: <strong>CC-BY-SA 4.0</strong> (निःशुल्क व्यावसायिक/शैक्षिक प्रयोग)
          </div>
        </div>
      </div>

      {/* Main Grid: Endpoints + Code & Live Response */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Endpoints Directory */}
        <div className="dt-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
            उपलब्ध खुला एपीआई एन्डपोइन्टहरू (API Endpoints)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === ep.path;

              return (
                <div
                  key={ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep.path);
                    setTestResult(null);
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                      {ep.method}
                    </span>
                    <code style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{ep.path}</code>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ep.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Snippets & Interactive Tester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Code Viewer Box */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            {/* Lang Header */}
            <div
              style={{
                padding: '0.6rem 1rem',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0f172a',
              }}
            >
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {(['curl', 'js', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeLang === lang ? '#0284c7' : 'transparent',
                      color: activeLang === lang ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => handleCopy(getCodeSnippet(selectedEndpoint), 'code')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#cbd5e1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copied === 'code' ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                  <span>{copied === 'code' ? 'कपी भयो' : 'कपी'}</span>
                </button>

                <button
                  onClick={() => handleRunTest(selectedEndpoint)}
                  disabled={isTesting}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Play size={13} />
                  <span>{isTesting ? 'चल्दैछ...' : 'प्रत्यक्ष टेस्ट'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre style={{ margin: 0, padding: '1rem', color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
              {getCodeSnippet(selectedEndpoint)}
            </pre>
          </div>

          {/* Test Response Box */}
          {testResult && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1rem',
                maxHeight: '280px',
                overflowY: 'auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>
                  ✓ HTTP 200 OK (प्रत्यक्ष JSON प्रतिक्रिया)
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(testResult, null, 2), 'response')}
                  style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem', cursor: 'pointer', background: '#f8fafc' }}
                >
                  {copied === 'response' ? 'कपी भयो' : 'JSON कपी'}
                </button>
              </div>

              <pre style={{ margin: 0, fontSize: '0.75rem', color: '#0f172a', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
