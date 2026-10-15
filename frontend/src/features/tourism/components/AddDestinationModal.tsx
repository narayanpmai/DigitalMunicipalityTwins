import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Upload, Mountain, MapPin } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi } from '../../../api/tourism';
import type { Destination } from '../../../api/tourism';
import { api } from '../../../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  destinationToEdit?: Destination | null;
}

const INITIAL_STATE = {
  name: '',
  nameEn: '',
  wardNo: 1,
  altitudeMeters: 0,
  category: 'lake',
  description: '',
  bestSeason: '',
  trekDuration: '',
  highlights: '',
  imageUrl: '',
};

export const AddDestinationModal: React.FC<Props> = ({ isOpen, onClose, destinationToEdit }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (destinationToEdit) {
      setFormData({
        name: destinationToEdit.name || '',
        nameEn: destinationToEdit.nameEn || '',
        wardNo: destinationToEdit.wardNo || 1,
        altitudeMeters: destinationToEdit.altitudeMeters || 0,
        category: destinationToEdit.category || 'lake',
        description: destinationToEdit.description || '',
        bestSeason: destinationToEdit.bestSeason || '',
        trekDuration: destinationToEdit.trekDuration || '',
        highlights: Array.isArray(destinationToEdit.highlights) 
          ? destinationToEdit.highlights.join(', ') 
          : destinationToEdit.highlights || '',
        imageUrl: destinationToEdit.imageUrl || '',
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [destinationToEdit, isOpen]);

  const saveMutation = useMutation({
    mutationFn: (data: Destination) => {
      if (destinationToEdit?.id) {
        return tourismApi.updateDestination(destinationToEdit.id, data);
      }
      return tourismApi.createDestination(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-destinations'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      alert(destinationToEdit ? 'गन्तव्य परिमार्जन गरियो।' : 'नयाँ गन्तव्य थपियो।');
      onClose();
    },
    onError: () => {
      alert('सुरक्षित गर्न असफल भयो।');
      setIsSubmitting(false);
    }
  });

  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('गन्तव्यको नाम अनिवार्य छ।');
      return;
    }
    setIsSubmitting(true);
    const dataToSave: Destination = {
      ...formData,
      highlights: formData.highlights.split(',').map(s => s.trim()).filter(Boolean)
    };
    saveMutation.mutate(dataToSave);
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('फाइल आकार १५ MB भन्दा बढी हुन सक्दैन।');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await api.post('/media/upload-base64', { image: base64, filename: file.name });
          const url = (res as any).data?.url || (res as any).url;
          if (url) {
            setFormData({ ...formData, imageUrl: url });
          } else {
            alert('तस्बिर अपलोड गर्न असफल भयो।');
          }
        } catch (err) {
          alert('तस्बिर अपलोड गर्न असफल भयो।');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mountain size={24} color="#2563eb" />
            {destinationToEdit ? 'गन्तव्य सम्पादन गर्नुहोस्' : 'नयाँ गन्तव्य थप्नुहोस्'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="dt-label">गन्तव्यको नाम (नेपालीमा) *</label>
              <input
                type="text"
                className="dt-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा. पाँचपोखरी ताल"
              />
            </div>
            
            <div>
              <label className="dt-label">गन्तव्यको नाम (English)</label>
              <input
                type="text"
                className="dt-input"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Panchpokhari Lake"
              />
            </div>

            <div>
              <label className="dt-label">प्रकार (Category)</label>
              <select
                className="dt-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="lake">पवित्र कुण्ड / ताल (Lakes)</option>
                <option value="peak">हिमशिखर / भ्युपोइन्ट (Peaks)</option>
                <option value="monastery">गुम्बा / मन्दिर (Monastery/Temple)</option>
                <option value="waterfall">झरना (Waterfall)</option>
                <option value="cave">गुफा (Cave)</option>
                <option value="trek">पदमार्ग (Trek Route)</option>
              </select>
            </div>

            <div>
              <label className="dt-label">वडा नं.</label>
              <select
                className="dt-select"
                value={formData.wardNo}
                onChange={(e) => setFormData({ ...formData, wardNo: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w}>वडा नं. {w}</option>)}
              </select>
            </div>

            <div>
              <label className="dt-label">उचाइ (मिटरमा)</label>
              <input
                type="number"
                className="dt-input"
                value={formData.altitudeMeters}
                onChange={(e) => setFormData({ ...formData, altitudeMeters: Number(e.target.value) })}
                placeholder="उदा. 4100"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="dt-label">विवरण (Description)</label>
              <textarea
                className="dt-input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="गन्तव्यको छोटो विवरण लेख्नुहोस्..."
              />
            </div>

            <div>
              <label className="dt-label">उत्कृष्ट मौसम</label>
              <input
                type="text"
                className="dt-input"
                value={formData.bestSeason}
                onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                placeholder="उदा. भदौ - कात्तिक, चैत - जेठ"
              />
            </div>

            <div>
              <label className="dt-label">यात्रा समय (Trek Duration)</label>
              <input
                type="text"
                className="dt-input"
                value={formData.trekDuration}
                onChange={(e) => setFormData({ ...formData, trekDuration: e.target.value })}
                placeholder="उदा. ४-५ दिन"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="dt-label">मुख्य आकर्षणहरू (Highlights - कमाले छुट्ट्याउनुहोस्)</label>
              <input
                type="text"
                className="dt-input"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                placeholder="उदा. धार्मिक कुण्ड, हिमश्रृङ्खला, जनैपूर्णिमा मेला"
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="dt-label">तस्बिर (Image)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                  <Upload size={18} />
                  {isUploading ? 'अपलोड हुँदैछ...' : 'फोटो छान्नुहोस्'}
                  <input type="file" accept="image/*" disabled={isUploading} style={{ display: 'none' }} onChange={handleImageChange} />
                </label>
                {formData.imageUrl && !formData.imageUrl.startsWith('data:image') && (
                  <img src={formData.imageUrl} alt="Preview" style={{ height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="dt-btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              रद्द गर्नुहोस्
            </button>
            <button type="submit" disabled={isSubmitting} className="dt-btn-primary" style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              {isSubmitting ? 'सुरक्षित गरिँदै...' : 'सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
