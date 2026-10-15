import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tourismApi, type LocalProduct } from '../../../api/tourism';
import { ShoppingBag, MapPin, Phone, Search, ShoppingCart, Plus } from 'lucide-react';
import { AddProductModal } from './AddProductModal';

const CATEGORY_LABELS: Record<string, string> = {
  food: '🥗 खाद्य पदार्थ',
  handicraft: '🧶 हस्तकला',
  herbs: '🌿 जडीबुटी',
  art: '🎨 कला',
};

export const LocalProductsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<LocalProduct[]>({
    queryKey: ['local-products'],
    queryFn: () => tourismApi.getLocalProducts(),
  });

  const filtered = products.filter(p => {
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 320px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="उत्पादन वा विक्रेता खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dt-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <select
            className="dt-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">सबै प्रकार</option>
            <option value="food">खाद्य पदार्थ</option>
            <option value="handicraft">हस्तकला</option>
            <option value="herbs">जडीबुटी</option>
            <option value="art">कला</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.25rem',
            background: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={16} /> नयाँ उत्पादन दर्ता
        </button>
      </div>

      {isLoading ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>स्थानीय उत्पादनहरू लोड हुँदैछ...</div>
      ) : filtered.length === 0 ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>कुनै उत्पादन फेला परेन।</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(prod => (
            <div key={prod.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ height: '170px', backgroundImage: `url(${prod.imageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {CATEGORY_LABELS[prod.category] || prod.category}
                </span>
                {prod.inStock ? (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#22c55e', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    उपलब्ध
                  </span>
                ) : (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    सकिएको
                  </span>
                )}
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.1rem' }}>{prod.name}</h3>
                {prod.nameEn && <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>{prod.nameEn}</div>}
                <div style={{ color: '#0ea5e9', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>रु {prod.price || '—'}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#334155' }}>
                    <ShoppingBag size={14} color="#64748b" /> {prod.vendorName}
                  </div>
                  {prod.wardNo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#64748b" /> वडा नं. {prod.wardNo}
                    </div>
                  )}
                  {prod.contactNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} color="#64748b" /> {prod.contactNumber}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (prod.contactNumber) {
                      window.open(`tel:${prod.contactNumber}`);
                    } else {
                      alert(`सम्पर्क: ${prod.vendorName}`);
                    }
                  }}
                  style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Phone size={14} /> अर्डर सोधपुछ ({prod.contactNumber || 'सम्पर्क'})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <AddProductModal
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
        />
      )}
    </div>
  );
};
