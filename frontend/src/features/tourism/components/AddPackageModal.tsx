import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi, type TourPackage } from '../../../api/tourism';
import { X, MapPin, Clock, DollarSign, Image, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPackageModal: React.FC<AddPackageModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [costPerPerson, setCostPerPerson] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'hard'>('moderate');
  const [destinationsStr, setDestinationsStr] = useState('');
  const [inclusionsStr, setInclusionsStr] = useState('');
  const [guideAvailable, setGuideAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Partial<TourPackage>) => tourismApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-packages'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      setSuccessMsg('नयाँ पर्यटन प्याकेज सफलतापूर्वक थपियो!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        resetForm();
      }, 1500);
    },
    onError: () => {
      setErrorMsg('प्याकेज थप्न सकिएन। कृपया विवरण जाँच्नुहोस्।');
    },
  });

  const resetForm = () => {
    setTitle('');
    setTitleEn('');
    setDurationDays(3);
    setCostPerPerson('');
    setDifficulty('moderate');
    setDestinationsStr('');
    setInclusionsStr('');
    setGuideAvailable(true);
    setImageUrl('');
    setDescription('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !costPerPerson.trim()) {
      setErrorMsg('कृपया प्याकेजको शीर्षक र शुल्क अनिवार्य भर्नुहोस्।');
      return;
    }

    const destinations = destinationsStr
      ? destinationsStr.split(',').map(d => d.trim()).filter(Boolean)
      : ['पाँचपोखरी'];
    const inclusions = inclusionsStr
      ? inclusionsStr.split(',').map(i => i.trim()).filter(Boolean)
      : ['गाइड', 'खाना र बास'];

    mutation.mutate({
      title: title.trim(),
      titleEn: titleEn.trim() || undefined,
      durationDays: Number(durationDays),
      costPerPerson: costPerPerson.trim(),
      difficulty,
      destinations,
      inclusions,
      guideAvailable,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542314831-c6a4203251f8?w=500&q=80',
      description: description.trim() || undefined,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #701a75 100%)',
          color: '#fff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>नयाँ पर्यटन प्याकेज थप्नुहोस्</h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>पाँचपोखरी थाङपालका नयाँ ट्रेकिङ तथा भ्रमण प्याकेज प्रविष्टि</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {successMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <CheckCircle size={18} color="#10b981" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                प्याकेजको नाम (नेपाली) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: पाँचपोखरी ५ दिने पदयात्रा"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Name in English
              </label>
              <input
                type="text"
                placeholder="e.g. Panchpokhari 5-Day Trek"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                अवधि (दिन)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                शुल्क प्रति व्यक्ति *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: १२,५००"
                value={costPerPerson}
                onChange={(e) => setCostPerPerson(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                कठिनाइ स्तर
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="easy">सजिलो (Easy)</option>
                <option value="moderate">मध्यम (Moderate)</option>
                <option value="hard">कठिन (Hard)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              मुख्य गन्तव्यहरू (अल्पविराम ',' ले छुट्याउनुहोस्)
            </label>
            <input
              type="text"
              placeholder="भोताङ, छिमिटि, पाँचपोखरी, तार्केघ्याङ"
              value={destinationsStr}
              onChange={(e) => setDestinationsStr(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              समावेश सुविधाहरू (अल्पविराम ',' ले छुट्याउनुहोस्)
            </label>
            <input
              type="text"
              placeholder="खाना र बास, शेर्पा गाइड, निकुञ्ज परमिट, प्राथमिक उपचार"
              value={inclusionsStr}
              onChange={(e) => setInclusionsStr(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                तस्बिर URL (वैकल्पिक)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ paddingTop: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={guideAvailable}
                  onChange={(e) => setGuideAvailable(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#701a75' }}
                />
                <strong>अनुभवी गाइड उपलब्ध छ</strong>
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              प्याकेजको विस्तृत विवरण (Description)
            </label>
            <textarea
              rows={2}
              placeholder="यस पदयात्रामा पर्यटकले पाउने प्राकृतिक तथा सांस्कृतिक अनुभव..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'none' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: '#701a75',
                color: '#fff',
                fontWeight: 600,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'थपिँदैछ...' : 'प्याकेज प्रकाशित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
