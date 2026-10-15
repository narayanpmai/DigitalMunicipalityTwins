import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Camera,
  MapPin,
  FileText,
  Phone,
  Building2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F4C81 0%, #1E3A8A 60%, #172554 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.25rem 1rem 1.25rem',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                flexShrink: 0,
              }}
            >
              <img src="/panchpokhari-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: 900 }}>
                गोपनीयता नीति तथा सर्तहरू
              </div>
              <div style={{ fontSize: '0.68rem', color: '#FCD34D' }}>
                Privacy Policy & Citizen Data Safety (Play Store / App Store Compliance)
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, fontSize: '0.78rem', color: '#334155', lineHeight: 1.6 }}>
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#065F46',
            }}
          >
            <ShieldCheck size={20} color="#059669" />
            <span style={{ fontWeight: 700 }}>
              नेपालको व्यक्तिगत गोपनीयता सम्बन्धी ऐन २०७५ र स्थानीय सरकार सञ्चालन ऐन २०७४ बमोजिम पूर्ण सुरक्षित।
            </span>
          </div>

          <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            १. एपको उद्देश्य तथा परिचय
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            यो मोबाइल एप पाँचपोखरी थाङपाल गाउँपालिका (सिन्धुपाल्चोक) को आधिकारिक <strong>"Municipal Digital Twins"</strong> नागरिक सेवा प्लेटफर्म हो। यसको उद्देश्य बडापत्र, ई-सिफारिस, डिजिटल कर, गुनासो व्यवस्थापन, पर्यटन र विपद् पूर्वसूचना सेवा पारदर्शी रूपमा उपलब्ध गराउनु हो।
          </p>

          <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            २. डिभाइस अनुमतिहरू (Device Permissions) र प्रयोग:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={14} color="#EA580C" />
                <span>क्यामेरा अनुमति (Camera Permission):</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0 0' }}>
                नागरिकले सिफारिसका लागि पेश गर्ने कागजात (नागरिकता, जग्गाधनी प्रमाण पुर्जा, फोटो) स्मार्ट स्क्यानरबाट खिच्न मात्र प्रयोग गरिन्छ।
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#0284C7" />
                <span>स्थान अनुमति (GPS Location):</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0 0' }}>
                नागरिक गुनासो दर्ता गर्दा घटनास्थलको जीपीएस लोकेसन पठाउन, घरधुरी सर्भे (ODK) गर्न, र इन्द्रावती नदीको बाढी सेन्सरबाट नागरिकको दूरी पत्ता लगाई सतर्कता साइरन बजाउन प्रयोग हुन्छ।
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="#16A34A" />
                <span>स्टोरेज अनुमति (Storage / Files):</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0 0' }}>
                नागरिकले आफ्नो मलेप १०२ कर रसिद, ई-सिफारिस प्रमाणपत्र वा ई-पुस्तकालयका ऐन-कानुन डाउनलोड गरी सुरक्षित राख्न प्रयोग हुन्छ।
              </p>
            </div>
          </div>

          <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            ३. डाटा सुरक्षा तथा गोपनीयता (No Third-Party Sharing)
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            नागरिकको व्यक्तिगत विवरण (नाम, फोन, नागरिकता नं, घरधुरी विवरण) कुनै पनि व्यावसायिक विज्ञापनदाता वा तेस्रो पक्षलाई बिक्री वा साझेदारी गरिँदैन। सम्पूर्ण डाटा गाउँपालिकाको सुरक्षित सरकारी डाटा सेन्टरमा इन्क्रिप्टेड अवस्थामा भण्डार गरिन्छ।
          </p>

          <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            ४. सम्पर्क तथा गुनासो अधिकारी
          </h4>
          <div style={{ backgroundColor: '#F1F5F9', padding: '8px 10px', borderRadius: '10px', fontSize: '0.72rem' }}>
            <div>कार्यालय: <strong>पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय</strong></div>
            <div>ठेगाना: <strong>मानेखर्क, सिन्धुपाल्चोक, बागमती प्रदेश</strong></div>
            <div>फोन / हटलाइन: <strong>०११-५०५००१ / ९८५१२३४५६७</strong></div>
            <div>ईमेल: <strong>info@panchpokharithangpalmun.gov.np</strong></div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#0F4C81',
              color: '#ffffff',
              border: 'none',
              padding: '9px 24px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            बुझेँ / सहमत छु
          </button>
        </div>
      </div>
    </div>
  );
};
