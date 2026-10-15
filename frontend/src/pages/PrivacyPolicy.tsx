import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2rem', color: '#1E293B', marginBottom: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem' }}>
        गोपनीयता नीति (Privacy Policy)
      </h1>
      <p style={{ color: '#475569', marginBottom: '2rem' }}><strong>पछिल्लो अद्यावधिक:</strong> {new Date().toLocaleDateString('ne-NP')}</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>१. प्रस्तावना</h2>
        <p style={{ color: '#475569' }}>
          पाँचपोखरी थाङपाल गाउँपालिका (यसपछि "हामी", "हाम्रो" वा "पालिका" भनिने) ले आफ्ना नागरिकहरूलाई डिजिटल माध्यमबाट सहज सेवा दिन "पाँचपोखरी नागरिक एप" (यसपछि "एप" भनिने) तयार पारेको छ। 
          तपाईंको गोपनीयता हाम्रो उच्च प्राथमिकता हो। यो नीतिले हामी तपाईंको जानकारी कसरी सङ्कलन, प्रयोग र सुरक्षित गर्छौं भन्ने कुरा स्पष्ट पार्छ।
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>२. हामीले माग्ने अनुमतिहरू (App Permissions)</h2>
        <p style={{ color: '#475569', marginBottom: '1rem' }}>यस एपले निम्न सेवाहरू सञ्चालन गर्न तपाईंसँग केही अनुमतिहरू (Permissions) माग्न सक्छ:</p>
        
        <ul style={{ color: '#475569', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>क्यामेरा र स्टोरेज (Camera & Storage):</strong> नागरिक दर्ता, अनलाइन निवेदन पेस गर्ने, चलानी कागजातहरू स्क्यान गर्ने वा गुनासो दर्ता गर्दा तस्बिर तथा कागजातहरू अपलोड गर्नको लागि क्यामेरा र स्टोरेज (ग्यालरी) को अनुमति आवश्यक पर्छ।
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>स्थान (Location / GPS):</strong> डिजिटल घरधुरी नक्साङ्कन, विपद् रिपोर्टिङ (जस्तै: पहिरो वा आगलागीको लोकेसन पठाउन), र नजिकैको आपतकालीन सेवा खोज्नको लागि तपाईंको उपकरणको स्थान (GPS Location) प्रयोग गरिन्छ।
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>इन्टरनेट (Internet/Network):</strong> प्रणालीसँग सञ्चार गर्न र अद्यावधिक डाटा प्राप्त गर्न।
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>३. डाटा सङ्कलन र प्रयोग</h2>
        <p style={{ color: '#475569' }}>
          तपाईंले प्रदान गर्नुभएको व्यक्तिगत जानकारी (नाम, सम्पर्क नम्बर, ठेगाना, नागरिकता नम्बर आदि) केवल पालिकाको आधिकारिक सेवा प्रवाह, दर्ता/चलानी प्रणाली र तथ्याङ्क व्यवस्थापनको लागि मात्र प्रयोग हुनेछ। 
          यी जानकारीहरू अन्य कुनै व्यावसायिक वा तेस्रो पक्ष (Third Party) लाई बिक्री वा वितरण गरिने छैन।
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>४. डाटा सुरक्षा</h2>
        <p style={{ color: '#475569' }}>
          तपाईंको डाटा गाउँपालिकाको सुरक्षित सर्भर (Municipal Data Center) मा इन्क्रिप्टेड (Encrypted) रूपमा भण्डारण गरिन्छ। अनधिकृत पहुँच रोक्न हामी उच्च सुरक्षा मापदण्डहरू अपनाउँछौं।
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>५. सम्पर्क जानकारी</h2>
        <p style={{ color: '#475569' }}>
          यस गोपनीयता नीति सम्बन्धमा तपाईंको कुनै प्रश्न वा सुझाव भएमा कृपया हामीलाई सम्पर्क गर्नुहोस्:<br/><br/>
          <strong>इमेल:</strong> info@panchpokharithangpalmun.gov.np<br/>
          <strong>फोन:</strong> ०११-४०००००<br/>
          <strong>कार्यालय:</strong> थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश, नेपाल
        </p>
      </section>

    </div>
  );
};
