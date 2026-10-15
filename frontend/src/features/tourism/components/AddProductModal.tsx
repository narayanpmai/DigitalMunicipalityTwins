import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi, type LocalProduct } from '../../../api/tourism';
import { X, ShoppingBag, MapPin, Phone, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('food');
  const [price, setPrice] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [wardNo, setWardNo] = useState(3);
  const [contactNumber, setContactNumber] = useState('');
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Partial<LocalProduct>) => tourismApi.createLocalProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-products'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      setSuccessMsg('स्थानीय उत्पादन सफलतापूर्वक दर्ता भयो!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        resetForm();
      }, 1500);
    },
    onError: () => {
      setErrorMsg('उत्पादन दर्ता गर्न सकिएन। कृपया विवरण जाँच्नुहोस्।');
    },
  });

  const resetForm = () => {
    setName('');
    setNameEn('');
    setCategory('food');
    setPrice('');
    setVendorName('');
    setWardNo(3);
    setContactNumber('');
    setInStock(true);
    setImageUrl('');
    setDescription('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !vendorName.trim()) {
      setErrorMsg('कृपया उत्पादनको नाम र उत्पादक/बिक्रेताको नाम अनिवार्य भर्नुहोस्।');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      category,
      price: price.trim() || undefined,
      vendorName: vendorName.trim(),
      wardNo: Number(wardNo),
      contactNumber: contactNumber.trim() || undefined,
      inStock,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80',
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
        maxWidth: '560px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
          color: '#fff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>नयाँ स्थानीय उत्पादन दर्ता</h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>पाँचपोखरीका मौलिक कृषि, हस्तकला तथा जडीबुटी उत्पादन प्रविष्टि</p>
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
                उत्पादनको नाम (नेपाली) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: याकको घिउ / अर्गानिक किवी"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Name in English
              </label>
              <input
                type="text"
                placeholder="e.g. Pure Yak Ghee"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                उत्पादन वर्ग (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="food">🥗 खाद्य तथा पेय पदार्थ (Food)</option>
                <option value="handicraft">🧶 हस्तकला (Handicraft)</option>
                <option value="herbs">🌿 जडीबुटी तथा प्राकृतिक (Herbs)</option>
                <option value="art">🎨 कला तथा संस्कृति (Art)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                मूल्य (प्रति एकाइ)
              </label>
              <input
                type="text"
                placeholder="उदा: रु १,२०० / केजी"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                उत्पादक / बिक्रेता / समूहको नाम *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: थाङपाल महिला उद्यमी समूह"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                वडा नं.
              </label>
              <select
                value={wardNo}
                onChange={(e) => setWardNo(parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                सम्पर्क फोन नम्बर
              </label>
              <input
                type="tel"
                placeholder="९८xxxxxxxx"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                तस्बिर URL (वैकल्पिक)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#059669' }}
              />
              <strong>स्टकमा उपलब्ध छ (In Stock)</strong>
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              उत्पादन सम्बन्धी संक्षिप्त विवरण (Description)
            </label>
            <textarea
              rows={2}
              placeholder="उत्पादनको विशिष्‍टता, गुणस्तर वा प्याकेजिङ सम्बन्धी जानकारी..."
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
                background: '#059669',
                color: '#fff',
                fontWeight: 600,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'दर्ता हुँदैछ...' : 'उत्पादन दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
