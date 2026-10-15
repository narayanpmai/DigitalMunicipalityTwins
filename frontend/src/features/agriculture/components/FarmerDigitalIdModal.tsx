import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Sprout,
  FileBadge,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Calendar,
  Layers,
  Award,
  CreditCard,
  FileText,
  Landmark,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  AgricultureFarmer,
  SoilHealthCardData,
  FarmerSubsidy,
} from '../../../api/agriculture';

interface FarmerDigitalIdModalProps {
  farmer: AgricultureFarmer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerDigitalIdModal: React.FC<FarmerDigitalIdModalProps> = ({
  farmer,
  isOpen,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'certificate'>('card');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (farmer && farmer.farmerId) {
      const verifyUrl = `${window.location.origin}/agriculture?verify=${encodeURIComponent(
        farmer.farmerId
      )}`;
      QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#14532d',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [farmer]);

  if (!isOpen || !farmer) return null;

  const parseSoilData = (data: any): SoilHealthCardData | null => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const parseSubsidies = (data: any): FarmerSubsidy[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const soilCard = parseSoilData(farmer.soilHealthCard);
  const subsidies = parseSubsidies(farmer.subsidiesHistory);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
    >
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-farmer-document, #printable-farmer-document * {
              visibility: visible !important;
            }
            #printable-farmer-document {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
            }
            .farmer-modal-no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div
        className="dt-card"
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Modal Header (No Print) */}
        <div
          className="farmer-modal-no-print"
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileBadge size={24} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                डिजिटल किसान परिचयपत्र तथा माटो स्वास्थ्य कार्ड
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                पाँचपोखरी थाङपाल गाउँपालिका — आधिकारिक किसान प्रमाणीकरण प्रणाली
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* View Switcher & Action Bar (No Print) */}
        <div
          className="farmer-modal-no-print"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '8px',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setViewMode('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'card' ? '#ffffff' : 'transparent',
                color: viewMode === 'card' ? '#166534' : '#64748b',
                boxShadow:
                  viewMode === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <CreditCard size={15} /> परिचयपत्र कार्ड (ID Card)
            </button>
            <button
              onClick={() => setViewMode('certificate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor:
                  viewMode === 'certificate' ? '#ffffff' : 'transparent',
                color: viewMode === 'certificate' ? '#166534' : '#64748b',
                boxShadow:
                  viewMode === 'certificate'
                    ? '0 1px 3px rgba(0,0,0,0.1)'
                    : 'none',
              }}
            >
              <FileText size={15} /> विस्तृत प्रमाणपत्र (Certificate)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
              }}
            >
              <Printer size={16} /> कार्ड प्रिन्ट गर्नुहोस्
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Canvas */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            id="printable-farmer-document"
            ref={cardRef}
            style={{ width: '100%', maxWidth: '650px' }}
          >
            {viewMode === 'card' ? (
              /* ================= COMPACT PVC ID CARD VIEW ================= */
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '2px solid #16a34a',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                  fontFamily: 'inherit',
                  position: 'relative',
                }}
              >
                {/* Official National / Municipal Card Banner */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #15803d 100%)',
                    color: '#ffffff',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '3px solid #ca8a04',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        border: '2px solid rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                      }}
                    >
                      🇳🇵
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          letterSpacing: '0.5px',
                          opacity: 0.9,
                          fontWeight: 700,
                        }}
                      >
                        नेपाल सरकार | बागमती प्रदेश सरकार
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          lineHeight: 1.2,
                        }}
                      >
                        पाँचपोखरी थाङपाल गाउँपालिका
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          opacity: 0.95,
                          fontWeight: 600,
                        }}
                      >
                        कृषि तथा पशु सेवा विकास शाखा, सिन्धुपाल्चोक
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: '#ca8a04',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      डिजिटल किसान परिचयपत्र
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        marginTop: '3px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {farmer.farmerId}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      /* responsive card */
                      gap: '1rem',
                      alignItems: 'start',
                    }}
                  >
                    {/* Farmer Avatar & Category */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '90px',
                          height: '105px',
                          borderRadius: '8px',
                          border: '2px solid #cbd5e1',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          overflow: 'hidden',
                        }}
                      >
                        <User size={46} color="#94a3b8" />
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            marginTop: '4px',
                            color: '#475569',
                          }}
                        >
                          {farmer.gender || 'कृषक'}
                        </span>
                      </div>
                      <span
                        style={{
                          marginTop: '6px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '9999px',
                          textAlign: 'center',
                          width: '100%',
                        }}
                      >
                        {farmer.farmerCategory?.split('(')[0] || 'कृषक'}
                      </span>
                    </div>

                    {/* Farmer Details Grid */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.82rem',
                        color: '#1e293b',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          कृषकको पूरा नाम:
                        </span>
                        <div
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#0f172a',
                          }}
                        >
                          {farmer.fullName}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            नागरिकता नं:
                          </span>
                          <div style={{ fontWeight: 600 }}>
                            {farmer.citizenshipNo || '-'}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            सम्पर्क फोन:
                          </span>
                          <div style={{ fontWeight: 600, color: '#16a34a' }}>
                            {farmer.contactPhone || '-'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          ठेगाना:
                        </span>
                        <div style={{ fontWeight: 600 }}>
                          वडा नं. {farmer.wardNumber},{' '}
                          {farmer.toleVillage || 'पाँचपोखरी थाङपाल'}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            खेती जग्गा:
                          </span>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {farmer.landAreaRopani} रोपनी
                          </div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            दर्ता मिति:
                          </span>
                          <div style={{ fontWeight: 600 }}>
                            {farmer.registeredDateBs || '२०८०-०३-१५'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code & Status */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: '1px dashed #cbd5e1',
                        paddingLeft: '0.75rem',
                      }}
                    >
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Farmer QR"
                          style={{
                            width: '95px',
                            height: '95px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '2px',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '95px',
                            height: '95px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <QrCode size={40} color="#94a3b8" />
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: '0.62rem',
                          color: '#166534',
                          fontWeight: 700,
                          marginTop: '4px',
                          textAlign: 'center',
                        }}
                      >
                        ✓ डिजिटल प्रमाणित
                      </span>
                    </div>
                  </div>

                  {/* Production & Crops Strip */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      marginTop: '0.85rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#166534' }}>🌾 मुख्य बाली:</strong>{' '}
                      {farmer.majorCrops || 'अन्नबाली, तरकारी'}
                    </div>
                    <div>
                      <strong style={{ color: '#92400e' }}>🐄 पशुपन्छी लगत:</strong>{' '}
                      {farmer.livestockDetails || 'विवरण उल्लेख छैन'}
                    </div>
                  </div>

                  {/* Soil Health Snapshot (Compact) */}
                  {soilCard && (
                    <div
                      style={{
                        backgroundColor: '#faf5ff',
                        borderRadius: '8px',
                        padding: '0.6rem 0.85rem',
                        marginTop: '0.6rem',
                        border: '1px solid #e9d5ff',
                        fontSize: '0.78rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight: 700,
                            color: '#7e22ce',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sprout size={14} /> माटो परीक्षण कार्ड (
                          {soilCard.cardNo || 'SHC'}):
                        </span>
                        <div style={{ color: '#6b21a8', marginTop: '2px' }}>
                          pH: <strong>{soilCard.ph}</strong> | N: {soilCard.nitrogen} | P:{' '}
                          {soilCard.phosphorus} | K: {soilCard.potassium}
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: '#f3e8ff',
                          color: '#7e22ce',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {soilCard.status}
                      </span>
                    </div>
                  )}

                  {/* Card Security Footer & Signatures */}
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '0.6rem',
                      borderTop: '1px dashed #cbd5e1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      fontSize: '0.7rem',
                      color: '#64748b',
                    }}
                  >
                    <div>
                      <div>
                        बैंक खाता: {farmer.bankName || 'नेपाल बैंक'} (
                        {farmer.bankAccountNo || 'खाता प्रमाणित'})
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                        * यो कार्ड पाँचपोखरी थाङपाल गाउँपालिकाको आधिकारिक डिजिटल परिचयपत्र हो।
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'cursive',
                          color: '#166534',
                          fontWeight: 700,
                        }}
                      >
                        कृषि अधिकृत
                      </div>
                      <div
                        style={{
                          borderBottom: '1px solid #64748b',
                          width: '100px',
                          margin: '2px 0',
                        }}
                      />
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                        प्रमाणीकरण अधिकारी
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= FULL A4 CERTIFICATE VIEW ================= */
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: '3px double #16a34a',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                  position: 'relative',
                  fontFamily: 'inherit',
                }}
              >
                {/* Watermark Crest Background */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.04,
                    pointerEvents: 'none',
                    fontSize: '250px',
                  }}
                >
                  🌾
                </div>

                {/* Certificate Header */}
                <div
                  style={{
                    textAlign: 'center',
                    borderBottom: '2px solid #16a34a',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>🇳🇵</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#dc2626',
                    }}
                  >
                    नेपाल सरकार | बागमती प्रदेश सरकार
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#1e3a8a',
                    }}
                  >
                    कृषि तथा पशुपन्छी विकास मन्त्रालय
                  </div>
                  <h2
                    style={{
                      margin: '4px 0',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#14532d',
                    }}
                  >
                    पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय
                  </h2>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#475569',
                    }}
                  >
                    कृषि तथा पशु सेवा विकास शाखा, सिन्धुपाल्चोक
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '4px 16px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                  >
                    डिजिटल कृषक लगत तथा माटो स्वास्थ्य प्रमाणपत्र
                  </div>
                </div>

                {/* Farmer Credentials Banner */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                      आधिकारिक कृषक नम्बर:
                    </span>
                    <div
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#14532d',
                        fontFamily: 'monospace',
                      }}
                    >
                      {farmer.farmerId}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                      दर्ता तथा प्रमाणीकरण मिति:
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      {farmer.registeredDateBs || '२०८०-०३-१५'}
                    </div>
                  </div>
                  {qrCodeDataUrl && (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR"
                      style={{
                        width: '70px',
                        height: '70px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </div>

                {/* Section 1: Farmer & Land Details */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#14532d',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <User size={16} /> १. कृषक तथा जग्गा विवरण
                  </h4>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.85rem',
                    }}
                  >
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td
                          style={{
                            padding: '6px',
                            color: '#64748b',
                            width: '25%',
                          }}
                        >
                          कृषकको पूरा नाम:
                        </td>
                        <td
                          style={{
                            padding: '6px',
                            fontWeight: 700,
                            width: '25%',
                          }}
                        >
                          {farmer.fullName}
                        </td>
                        <td
                          style={{
                            padding: '6px',
                            color: '#64748b',
                            width: '25%',
                          }}
                        >
                          नागरिकता नं.:
                        </td>
                        <td
                          style={{
                            padding: '6px',
                            fontWeight: 600,
                            width: '25%',
                          }}
                        >
                          {farmer.citizenshipNo || '-'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px', color: '#64748b' }}>
                          स्थायी ठेगाना:
                        </td>
                        <td style={{ padding: '6px', fontWeight: 600 }}>
                          वडा नं. {farmer.wardNumber},{' '}
                          {farmer.toleVillage || 'पाँचपोखरी'}
                        </td>
                        <td style={{ padding: '6px', color: '#64748b' }}>
                          सम्पर्क फोन:
                        </td>
                        <td style={{ padding: '6px', fontWeight: 600 }}>
                          {farmer.contactPhone || '-'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px', color: '#64748b' }}>
                          किसान वर्ग:
                        </td>
                        <td style={{ padding: '6px', fontWeight: 700 }}>
                          {farmer.farmerCategory}
                        </td>
                        <td style={{ padding: '6px', color: '#64748b' }}>
                          खेती गरिएको जग्गा:
                        </td>
                        <td
                          style={{
                            padding: '6px',
                            fontWeight: 700,
                            color: '#16a34a',
                          }}
                        >
                          {farmer.landAreaRopani} रोपनी
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px', color: '#64748b' }}>
                          मुख्य उत्पादित बालीहरू:
                        </td>
                        <td
                          colSpan={3}
                          style={{ padding: '6px', fontWeight: 600 }}
                        >
                          {farmer.majorCrops || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px', color: '#64748b' }}>
                          पशुपन्छी विवरण:
                        </td>
                        <td
                          colSpan={3}
                          style={{ padding: '6px', fontWeight: 600 }}
                        >
                          {farmer.livestockDetails || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Soil Health Card */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#7e22ce',
                      borderBottom: '1px solid #e9d5ff',
                      paddingBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sprout size={16} /> २. माटो स्वास्थ्य परीक्षण प्रतिवेदन (Soil
                    Health Report)
                  </h4>
                  {soilCard ? (
                    <div
                      style={{
                        backgroundColor: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '0.85rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          
                          gap: '0.5rem',
                          textAlign: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div
                            style={{ fontSize: '0.7rem', color: '#64748b' }}
                          >
                            माटो pH
                          </div>
                          <div
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: '#0f172a',
                            }}
                          >
                            {soilCard.ph}
                          </div>
                        </div>
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div
                            style={{ fontSize: '0.7rem', color: '#64748b' }}
                          >
                            नाइट्रोजन (N)
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#16a34a',
                            }}
                          >
                            {soilCard.nitrogen}
                          </div>
                        </div>
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div
                            style={{ fontSize: '0.7rem', color: '#64748b' }}
                          >
                            फस्फोरस (P)
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#0284c7',
                            }}
                          >
                            {soilCard.phosphorus}
                          </div>
                        </div>
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div
                            style={{ fontSize: '0.7rem', color: '#64748b' }}
                          >
                            पोटासियम (K)
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#d97706',
                            }}
                          >
                            {soilCard.potassium}
                          </div>
                        </div>
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div
                            style={{ fontSize: '0.7rem', color: '#64748b' }}
                          >
                            प्राङ्गारिक पदार्थ
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#7e22ce',
                            }}
                          >
                            {soilCard.organicMatter}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fde68a',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#92400e',
                        }}
                      >
                        <strong>💡 प्राविधिक मलखाद तथा कृषि चुन सल्लाह:</strong>{' '}
                        {soilCard.advisory}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }}
                    >
                      माटो परीक्षण विवरण हालसम्म संकलन भएको छैन।
                    </div>
                  )}
                </div>

                {/* Section 3: Subsidies Received */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Award size={16} /> ३. प्राप्त सरकारी ५०% अनुदान तथा सहायता
                    इतिहास
                  </h4>
                  {subsidies.length > 0 ? (
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.8rem',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th
                            style={{
                              padding: '6px',
                              textAlign: 'left',
                              borderBottom: '1px solid #cbd5e1',
                            }}
                          >
                            कार्यक्रमको नाम
                          </th>
                          <th
                            style={{
                              padding: '6px',
                              textAlign: 'left',
                              borderBottom: '1px solid #cbd5e1',
                            }}
                          >
                            आ.व.
                          </th>
                          <th
                            style={{
                              padding: '6px',
                              textAlign: 'left',
                              borderBottom: '1px solid #cbd5e1',
                            }}
                          >
                            प्राप्त यन्त्र/सामग्री
                          </th>
                          <th
                            style={{
                              padding: '6px',
                              textAlign: 'right',
                              borderBottom: '1px solid #cbd5e1',
                            }}
                          >
                            अनुदान रकम
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subsidies.map((sub, idx) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: '1px solid #f1f5f9' }}
                          >
                            <td style={{ padding: '6px' }}>{sub.programName}</td>
                            <td style={{ padding: '6px' }}>{sub.fiscalYear}</td>
                            <td style={{ padding: '6px' }}>
                              {sub.item || '-'}
                            </td>
                            <td
                              style={{
                                padding: '6px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: '#16a34a',
                              }}
                            >
                              रु. {Number(sub.subsidyAmount).toLocaleString('ne-NP')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        padding: '6px 0',
                      }}
                    >
                      हालसम्म कुनै अनुदान भुक्तानी रेकर्ड छैन।
                    </div>
                  )}
                </div>

                {/* Official Signatures */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px dashed #cbd5e1',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <div>
                      <strong>पाँचपोखरी थाङपाल गाउँपालिका</strong>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      ई-कृषि डिजिटल ट्विन प्रमाणिक दस्तावेज
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        borderBottom: '1px solid #0f172a',
                        width: '140px',
                        marginBottom: '4px',
                      }}
                    />
                    <div style={{ fontWeight: 700 }}>कृषि शाखा प्रमुख</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      आधिकारिक हस्ताक्षर तथा छाप
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (No Print) */}
        <div
          className="farmer-modal-no-print"
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            💡 सुझाव: प्रिन्टर विकल्पमा <strong>'Background graphics'</strong> टिक
            लगाउनुहोला।
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              बन्द गर्नुहोस्
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={16} /> प्रिन्ट गर्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDigitalIdModal;
