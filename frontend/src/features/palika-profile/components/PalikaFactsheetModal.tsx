import React from 'react';
import { Printer, X, FileText, Download, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PalikaFactsheetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { settings } = useTenant();
  const palikaName = settings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका';
  const currentDate = new Date().toISOString().slice(0, 10);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem', overflowY: 'auto' }}>
      <div style={{ maxWidth: '900px', width: '100%', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative' }}>
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#0f4c81', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '0.95rem' }}>
            <FileText size={20} />
            आधिकारिक पालिका डिजिटल तथ्यपत्र (Municipal Digital Factsheet Preview)
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={16} />
              प्रिन्ट गर्नुहोस् / PDF सेभ
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable Factsheet Sheet */}
        <div className="palika-print-area" style={{ padding: '2.5rem', background: '#ffffff', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2.5px solid #991b1b', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/180px-Emblem_of_Nepal.svg.png"
                alt="नेपाल सरकार निशान छाप"
                style={{ height: '70px', width: 'auto' }}
              />
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#991b1b' }}>नेपाल सरकार</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e3a8a', margin: '2px 0' }}>
              {palikaName}
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#334155' }}>
              गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक
            </div>
            <div style={{ fontSize: '0.84rem', color: '#64748b' }}>बागमती प्रदेश, नेपाल</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857', marginTop: '0.65rem', textDecoration: 'underline' }}>
              आधिकारिक पालिका डिजिटल तथ्यपत्र तथा सूचक प्रतिवेदन (Municipal Digital Factsheet)
            </div>
          </div>

          {/* Factsheet Meta Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.25rem', padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>प्रकाशन मिति: <strong>{currentDate}</strong></div>
            <div>तथ्यपत्र सिम्बोल: <strong>P5-MDTS-FACT-2026</strong></div>
            <div>प्रणाली: <strong>म्युनिसिपल डिजिटल ट्विन्स (Municipal Digital Twins)</strong></div>
          </div>

          {/* 1. Basic Profile Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <strong style={{ color: '#0f4c81', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                १. भौगोलिक तथा प्रशासनिक संरचना
              </strong>
              • कुल क्षेत्रफल: <strong>१८७.२९ वर्ग कि.मि.</strong><br />
              • वडा संख्या: <strong>८ वटा वडाहरू</strong><br />
              • उचाइ: <strong>१,१०० मि. - ४,१०० मि. (पाँचपोखरी)</strong><br />
              • केन्द्र: <strong>थाङपालधाप, सिन्धुपाल्चोक</strong>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <strong style={{ color: '#047857', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                २. जनसांख्यिकी तथा परिवार (जनगणना २०७८)
              </strong>
              • कुल जनसंख्या: <strong>२०,५४० जना</strong> (पुरुष: ९,९५० | महिला: १०,५९०)<br />
              • कुल घरधुरी: <strong>५,८०५ घर</strong> (औसत परिवार: ३.५४)<br />
              • साक्षरता दर: <strong>७२.४%</strong> (पुरुष: ७८.५% | महिला: ६६.२%)<br />
              • प्रमुख जाति: <strong>तामाङ (६२.४%), क्षेत्री/बाहुन (१८.१%)</strong>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <strong style={{ color: '#b45309', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                ३. घरधुरी सुविधा तथा पूर्वाधार
              </strong>
              • पक्की आरसीसी घर: <strong>२२%</strong> | ढुङ्गा-माटो: <strong>६८%</strong><br />
              • खानेपानी धारा पहुँच: <strong>८४.२% (४,८८८ घर)</strong><br />
              • बिजुली/उर्जा पहुँच: <strong>९६.४% (५,५९६ घर)</strong><br />
              • शौचालय सुविधा: <strong>९८% (खुल्ला दिसामुक्त)</strong>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <strong style={{ color: '#6d28d9', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                ४. विषयगत विकास तथा सेवा सूचकहरू
              </strong>
              • स्वास्थ्य संस्था: <strong>८ चौकी + १ अस्पताल (९८.४% खोप)</strong><br />
              • सामुदायिक विद्यालय: <strong>३२ विद्यालय (४,१२० विद्यार्थी)</strong><br />
              • सडक सञ्जाल: <strong>२८० कि.मी. (१३० कि.मी. स्तरोन्नत)</strong><br />
              • वार्षिक बजेट: <strong>रु. ५८ करोड ४५ लाख (आ.व. २०८१/८२)</strong>
            </div>
          </div>

          {/* 2. Ward Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>वडा नं.</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'left' }}>वडाको नाम</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'left' }}>वडा अध्यक्ष</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>घरधुरी</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>जनसंख्या</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>क्षेत्रफल (sq.km)</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>साक्षरता</th>
              </tr>
            </thead>
            <tbody>
              {[
                { w: 1, name: 'बाँसखर्क', c: 'जय बहादुर लामा', h: 615, p: '२,६४५', a: '२४.१२', l: '७१.५%' },
                { w: 2, name: 'बरुवा', c: 'पेम्बा दोर्जे तामाङ', h: 540, p: '२,३३०', a: '३४.५०', l: '६९.२%' },
                { w: 3, name: 'भोताङ', c: 'निमा दोर्जे तामाङ', h: 630, p: '२,७०५', a: '२८.३०', l: '७४.०%' },
                { w: 4, name: 'थाङपालकोट', c: 'दोर्जे तामाङ', h: 490, p: '२,१००', a: '३८.६०', l: '७२.८%' },
                { w: 5, name: 'गुन्सा', c: 'सुकुमान तामाङ', h: 580, p: '२,४६०', a: '२६.८०', l: '७५.४%' },
                { w: 6, name: 'थाङपालधाप', c: 'दिल बहादुर श्रेष्ठ', h: 460, p: '२,०४०', a: '२१.४०', l: '७९.१%' },
                { w: 7, name: 'भोटेनाम्लाङ', c: 'ज्ञान बहादुर तामाङ', h: 520, p: '२,२५०', a: '२२.९०', l: '७०.८%' },
                { w: 8, name: 'लागर्चे', c: 'टेक बहादुर तामाङ', h: 480, p: '२,१००', a: '१९.८०', l: '७१.०%' },
              ].map((row) => (
                <tr key={row.w}>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 800 }}>{row.w}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', fontWeight: 700 }}>{row.name}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0' }}>{row.c}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>{row.h}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>{row.p}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>{row.a}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{row.l}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Blocks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem' }}>
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderBottom: '1px dashed #64748b', marginBottom: '6px', height: '35px' }}></div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>तथ्याङ्क अधिकृत</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>योजना तथा तथ्याङ्क शाखा</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '2px dashed #991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', fontWeight: 800, fontSize: '0.74rem', margin: '0 auto', textAlign: 'center' }}>
                गाउँ कार्यपालिकाको<br />आधिकारिक छाप
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderBottom: '1px dashed #64748b', marginBottom: '6px', height: '35px' }}></div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>प्रमुख प्रशासकीय अधिकृत</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>गाउँ कार्यपालिकाको कार्यालय</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
