import React, { useState } from 'react';
import { X, ArrowRightLeft, PlusCircle, Coins, AlertCircle } from 'lucide-react';
import type { Project } from '../../../types/sectoral';
import { sectoralApi } from '../../../api/sectoral';

export interface BudgetVirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Project[];
}

export const BudgetVirementModal: React.FC<BudgetVirementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projects,
}) => {
  const [actionType, setActionType] = useState<'transfer' | 'add'>('transfer');
  const [sourceProjectId, setSourceProjectId] = useState<string>('');
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [amount, setAmount] = useState<number>(100000);
  const [remarks, setRemarks] = useState<string>('कार्यपालिकाको निर्णयानुसार रकमान्तर');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (projects.length > 0) {
      setSourceProjectId(projects[0].id);
      if (projects.length > 1) {
        setTargetProjectId(projects[1].id);
      }
    }
  }, [projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'transfer' && (!sourceProjectId || !targetProjectId)) {
      setErrorMessage('कृपया स्रोत र लक्ष्य दुवै आयोजना छनौट गर्नुहोस्।');
      return;
    }
    if (actionType === 'transfer' && sourceProjectId === targetProjectId) {
      setErrorMessage('स्रोत र लक्ष्य आयोजना फरक हुनुपर्छ।');
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMessage('कृपया मान्य रकम प्रविष्टि गर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await sectoralApi.transferProjectBudget(sourceProjectId, {
        targetProjectId: actionType === 'transfer' ? targetProjectId : undefined,
        amount,
        remarks,
        type: actionType,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'रकमान्तर प्रक्रियामा त्रुटि देखापर्यो।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceProject = projects.find((p) => p.id === sourceProjectId);
  const targetProject = projects.find((p) => p.id === targetProjectId);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Coins size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                बजेट थप-घट तथा रकमान्तर प्रणाली
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                पाँचपोखरी थाङपाल — स्वीकृत बजेट रकमान्तर तथा थप विनियोजन
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Type Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => setActionType('transfer')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: actionType === 'transfer' ? '2px solid #0284c7' : 'none',
              backgroundColor: actionType === 'transfer' ? '#ffffff' : 'transparent',
              color: actionType === 'transfer' ? '#0284c7' : '#64748b',
              fontWeight: actionType === 'transfer' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <ArrowRightLeft size={16} />
            <span>बजेट रकमान्तर (Virement)</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType('add')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: actionType === 'add' ? '2px solid #16a34a' : 'none',
              backgroundColor: actionType === 'add' ? '#ffffff' : 'transparent',
              color: actionType === 'add' ? '#16a34a' : '#64748b',
              fontWeight: actionType === 'add' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <PlusCircle size={16} />
            <span>योजना बजेट थप (Supplementary)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMessage && (
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {actionType === 'transfer' ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  १. बजेट घटाउने (स्रोत) आयोजना
                </label>
                <select
                  value={sourceProjectId}
                  onChange={(e) => setSourceProjectId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (मौज्दात: रु. {(p.officeCost || p.allocatedBudget || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  २. बजेट थप्ने (लक्ष्य) आयोजना
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (हालको बजेट: रु. {(p.officeCost || p.allocatedBudget || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                थप बजेट विनियोजन हुने आयोजना
              </label>
              <select
                value={sourceProjectId}
                onChange={(e) => setSourceProjectId(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (हालको बजेट: रु. {(p.officeCost || p.allocatedBudget || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
              {actionType === 'transfer' ? 'रकमान्तर रकम (रु.)' : 'थप विनियोजन रकम (रु.)'}
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
              निर्णय विवरण / कारण
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="उदा: कार्यपालिका बैठक निर्णय मिति २०८३-०२-१५ बमोजिम"
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer' }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: actionType === 'transfer' ? '#0284c7' : '#16a34a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'सुरक्षित हुँदैछ...' : actionType === 'transfer' ? 'रकमान्तर सुरक्षित गर्नुहोस्' : 'थप बजेट स्वीकृत गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
