import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Clock,
  Search,
  Filter,
  Layers,
  HelpCircle,
  FileEdit,
  Zap,
} from 'lucide-react';
import type { AIPromptLog, AIStats } from '../../../types/admin';

interface AIPromptLogsTabProps {
  logs: AIPromptLog[];
  stats: AIStats | null;
  isLoading: boolean;
}

export const AIPromptLogsTab: React.FC<AIPromptLogsTabProps> = ({ logs, stats, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      log.userPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.aiResponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIntent = selectedIntent === 'all' || log.intentCategory === selectedIntent;

    return matchesSearch && matchesIntent;
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <Bot className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#ec4899' }} />
        एआई अन्तरक्रिया विवरणहरू लोड हुँदैछ...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* AI Telemetry KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(236, 72, 153, 0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6', fontSize: '0.8rem', fontWeight: 600 }}>
            <MessageSquare size={16} /> कुल एआई प्रश्नहरू (Total Queries)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem' }}>
            {stats?.totalPrompts || logs.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            नागरिक तथा कर्मचारी सहजीकरण
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(56, 189, 248, 0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Zap size={16} /> खपत टोकन (Tokens Consumed)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem' }}>
            {stats?.totalTokensConsumed?.toLocaleString() || '२,०५५'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            औसत: {stats?.avgTokensPerQuery || 293} tokens / query
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(34, 197, 94, 0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
            <ThumbsUp size={16} /> नागरिक सन्तुष्टि (Satisfaction)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4ade80', marginTop: '0.4rem' }}>
            {stats?.satisfactionRate || 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            {stats?.positiveFeedbackCount || logs.length} सकारात्मक प्रतिक्रिया
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(168, 85, 247, 0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontSize: '0.8rem', fontWeight: 600 }}>
            <Layers size={16} /> इन्डेक्स भएका दस्तावेज (RAG Docs)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem' }}>
            {stats?.indexedKnowledgeDocuments || 8}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            मोडेल: {stats?.aiModel?.split(' ')[0] || 'Llama-3 P5'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#1e293b',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="प्रश्न, उत्तर वा प्रयोगकर्ता खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              color: '#f8fafc',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: '#94a3b8' }} />
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">सबै मनसाय (All Intents)</option>
            <option value="Query">सोधपुछ (Query)</option>
            <option value="Support">सेवा सहायता (Support)</option>
            <option value="Drafting">मस्यौदा लेखन (Drafting)</option>
            <option value="General">सामान्य जानकारी (General)</option>
          </select>
        </div>
      </div>

      {/* Interactions Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredLogs.map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header: User & Intent */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {item.userId || 'नागरिक'}
                </span>
                <span
                  style={{
                    backgroundColor:
                      item.intentCategory === 'Drafting'
                        ? 'rgba(168, 85, 247, 0.15)'
                        : item.intentCategory === 'Query'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(34, 197, 94, 0.15)',
                    color:
                      item.intentCategory === 'Drafting'
                        ? '#c084fc'
                        : item.intentCategory === 'Query'
                        ? '#7dd3fc'
                        : '#86efac',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Intent: {item.intentCategory}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>
                  टोकन: <strong style={{ color: '#f8fafc' }}>{item.tokensUsed}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4ade80' }}>
                  <ThumbsUp size={12} /> {item.userFeedback || 'Positive'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {item.timestamp ? new Date(item.timestamp).toLocaleString('ne-NP') : ''}
                </span>
              </div>
            </div>

            {/* Prompt */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #38bdf8',
                fontSize: '0.9rem',
                color: '#f8fafc',
                fontWeight: 500,
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                सोधिएको प्रश्न (Citizen Prompt):
              </div>
              {item.userPrompt}
            </div>

            {/* AI Response */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #ec4899',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#f472b6', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={12} /> पालिका एआई सहायकको प्रत्युत्तर (P5 AI Response):
              </div>
              {item.aiResponse}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
