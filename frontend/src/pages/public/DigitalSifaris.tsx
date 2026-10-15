import React, { useState, useEffect } from 'react';
import './DigitalSifaris.css';

interface Template {
    id: string;
    service_code: string;
    service_name_np: string;
    fee_amount: number;
}

interface Application {
    id: string;
    application_no: string;
    applicant_citizen_id: string;
    ward_id: string;
    status: string;
}

interface Payment {
    id: string;
    application_id: string;
    amount: number;
    payment_method: string;
    payment_status: string;
}

interface Certificate {
    id: string;
    certificate_no: string;
    application_id: string;
    issue_date: string;
}

export default function DigitalSifaris() {
    const [activeTab, setActiveTab] = useState<'template' | 'application' | 'payment' | 'certificate'>('application');
    
    // Data States
    const [templates, setTemplates] = useState<Template[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [templateForm, setTemplateForm] = useState({ service_code: '', service_name_np: '', required_documents: ['Citizenship'], fee_amount: '', html_pdf_template: '<html></html>', json_schema: {} });
    const [appForm, setAppForm] = useState({ application_no: '', service_template_id: '', applicant_citizen_id: '', ward_id: '', submitted_data: { "purpose": "demo" } });
    const [paymentForm, setPaymentForm] = useState({ application_id: '', amount: '', payment_method: 'eSewa' });
    const [certForm, setCertForm] = useState({ application_id: '', certificate_no: '', pdf_url: 'https://example.com/cert.pdf', qr_verification_token: 'TOKEN123' });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'template') {
                    const res = await fetch('/api/v1/e-services/templates/');
                    if(res.ok) setTemplates(await res.json());
                } else if (activeTab === 'application') {
                    const res = await fetch('/api/v1/e-services/applications/');
                    if(res.ok) setApplications(await res.json());
                } else if (activeTab === 'payment') {
                    const res = await fetch('/api/v1/e-services/payments/');
                    if(res.ok) setPayments(await res.json());
                } else if (activeTab === 'certificate') {
                    const res = await fetch('/api/v1/e-services/certificates/');
                    if(res.ok) setCertificates(await res.json());
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    // Submit Handlers
    const submitTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/e-services/templates/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...templateForm, fee_amount: parseFloat(templateForm.fee_amount)})
            });
            if (res.ok) {
                setTemplates([...templates, await res.json()]);
                alert('नयाँ सिफारिस टेम्प्लेट थपियो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/e-services/applications/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appForm)
            });
            if (res.ok) {
                setApplications([...applications, await res.json()]);
                alert('सिफारिसको आवेदन दर्ता भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/e-services/payments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...paymentForm, amount: parseFloat(paymentForm.amount)})
            });
            if (res.ok) {
                setPayments([...payments, await res.json()]);
                alert('राजस्व भुक्तानी सम्पन्न भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/e-services/certificates/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certForm)
            });
            if (res.ok) {
                setCertificates([...certificates, await res.json()]);
                alert('डिजिटल सिफारिस पत्र जारी भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    return (
        <div className="sifaris-container">
            <div className="sifaris-header">
                <h1>Digital Sifaris Portal</h1>
                <p>अनलाइन सिफारिस प्रणाली (E-Service Phase 12)</p>
            </div>

            <div className="sifaris-tabs">
                <button className={`sifaris-tab-btn ${activeTab === 'application' ? 'active' : ''}`} onClick={() => setActiveTab('application')}>१. आवेदन (Application)</button>
                <button className={`sifaris-tab-btn ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>२. राजस्व भुक्तानी (Payment)</button>
                <button className={`sifaris-tab-btn ${activeTab === 'certificate' ? 'active' : ''}`} onClick={() => setActiveTab('certificate')}>३. प्रमाणपत्र (Certificate)</button>
                <button className={`sifaris-tab-btn ${activeTab === 'template' ? 'active' : ''}`} onClick={() => setActiveTab('template')}>४. टेम्प्लेट (Templates)</button>
            </div>

            <div className="sifaris-content-card">
                
                {/* TEMPLATE SECTION */}
                {activeTab === 'template' && (
                    <>
                        <form onSubmit={submitTemplate}>
                            <div className="sifaris-form-grid">
                                <div className="sifaris-input-group">
                                    <label>सिफारिस कोड</label>
                                    <input type="text" required value={templateForm.service_code} onChange={e => setTemplateForm({...templateForm, service_code: e.target.value})} placeholder="SIF-01" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>सिफारिसको नाम</label>
                                    <input type="text" required value={templateForm.service_name_np} onChange={e => setTemplateForm({...templateForm, service_name_np: e.target.value})} placeholder="नाता प्रमाणित" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>शुल्क (Rs.)</label>
                                    <input type="number" required value={templateForm.fee_amount} onChange={e => setTemplateForm({...templateForm, fee_amount: e.target.value})} placeholder="500" />
                                </div>
                            </div>
                            <button type="submit" className="sifaris-submit-btn">नयाँ टेम्प्लेट थप्नुहोस्</button>
                        </form>
                        <div className="sifaris-table-container">
                            <table className="sifaris-table">
                                <thead><tr><th>कोड</th><th>नाम</th><th>शुल्क</th><th>ID</th></tr></thead>
                                <tbody>
                                    {templates.map(t => <tr key={t.id}><td>{t.service_code}</td><td>{t.service_name_np}</td><td>Rs. {t.fee_amount}</td><td><small>{t.id.substring(0,8)}</small></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* APPLICATION SECTION */}
                {activeTab === 'application' && (
                    <>
                        <form onSubmit={submitApplication}>
                            <div className="sifaris-form-grid">
                                <div className="sifaris-input-group">
                                    <label>आवेदन नम्बर (Auto-gen)</label>
                                    <input type="text" required value={appForm.application_no} onChange={e => setAppForm({...appForm, application_no: e.target.value})} placeholder="APP-2081-001" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>सिफारिस ID (Template ID)</label>
                                    <input type="text" required value={appForm.service_template_id} onChange={e => setAppForm({...appForm, service_template_id: e.target.value})} placeholder="UUID" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>नागरिक ID (Citizen ID)</label>
                                    <input type="text" required value={appForm.applicant_citizen_id} onChange={e => setAppForm({...appForm, applicant_citizen_id: e.target.value})} placeholder="UUID of Citizen (MDM)" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>वडा नम्बर</label>
                                    <input type="text" required value={appForm.ward_id} onChange={e => setAppForm({...appForm, ward_id: e.target.value})} placeholder="3" />
                                </div>
                            </div>
                            <button type="submit" className="sifaris-submit-btn">आवेदन पेश गर्नुहोस्</button>
                        </form>
                        <div className="sifaris-table-container">
                            <table className="sifaris-table">
                                <thead><tr><th>आवेदन नं.</th><th>नागरिक ID</th><th>अवस्था</th><th>ID</th></tr></thead>
                                <tbody>
                                    {applications.map(a => <tr key={a.id}><td>{a.application_no}</td><td><small>{a.applicant_citizen_id.substring(0,8)}</small></td><td><b style={{color:'#e67e22'}}>{a.status}</b></td><td><small>{a.id.substring(0,8)}</small></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* PAYMENT SECTION */}
                {activeTab === 'payment' && (
                    <>
                        <form onSubmit={submitPayment}>
                            <div className="sifaris-form-grid">
                                <div className="sifaris-input-group">
                                    <label>आवेदन ID</label>
                                    <input type="text" required value={paymentForm.application_id} onChange={e => setPaymentForm({...paymentForm, application_id: e.target.value})} placeholder="UUID of Application" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>रकम (Rs.)</label>
                                    <input type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} placeholder="500" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>भुक्तानी माध्यम</label>
                                    <select value={paymentForm.payment_method} onChange={e => setPaymentForm({...paymentForm, payment_method: e.target.value})}>
                                        <option value="eSewa">eSewa डिजिटल वालेट</option>
                                        <option value="Khalti">Khalti डिजिटल वालेट</option>
                                        <option value="ConnectIPS">ConnectIPS (NCHL)</option>
                                        <option value="Fonepay (Nepal QR)">Fonepay (Nepal QR)</option>
                                        <option value="Cash">नगद दाखिला (Cash Counter)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="sifaris-submit-btn">भुक्तानी भेरिफाई गर्नुहोस्</button>
                        </form>
                        <div className="sifaris-table-container">
                            <table className="sifaris-table">
                                <thead>
                                    <tr>
                                        <th>कारोबार नं (Txn ID)</th>
                                        <th>आवेदन नं</th>
                                        <th>सिफारिस सेवा</th>
                                        <th>नागरिकको नाम</th>
                                        <th>माध्यम</th>
                                        <th>रकम</th>
                                        <th>अवस्था</th>
                                        <th>मिति</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id}>
                                            <td><b style={{ color: '#0f766e', fontFamily: 'monospace' }}>{p.transaction_id || p.id.substring(0,8)}</b></td>
                                            <td><small>{p.application_no || p.application_id?.substring(0,8)}</small></td>
                                            <td><b>{p.service_name || 'नागरिक सिफारिस'}</b></td>
                                            <td>{p.applicant_name || 'नागरिक'} {p.ward_id ? `(वडा ${p.ward_id})` : ''}</td>
                                            <td>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: p.payment_method?.includes('eSewa') ? '#dcfce7' : p.payment_method?.includes('Khalti') ? '#ede9fe' : '#e0f2fe', color: p.payment_method?.includes('eSewa') ? '#15803d' : p.payment_method?.includes('Khalti') ? '#6d28d9' : '#0369a1' }}>
                                                    {p.payment_method}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 800 }}>रु. {Number(p.amount).toLocaleString('ne-NP')}</td>
                                            <td><b style={{ color: p.payment_status === 'Completed' || p.payment_status === 'Verified' ? 'green' : '#ea580c' }}>{p.payment_status}</b></td>
                                            <td><small>{p.created_at ? new Date(p.created_at).toLocaleDateString('ne-NP') : '२०८१/०५/२५'}</small></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CERTIFICATE SECTION */}
                {activeTab === 'certificate' && (
                    <>
                        <form onSubmit={submitCertificate}>
                            <div className="sifaris-form-grid">
                                <div className="sifaris-input-group">
                                    <label>आवेदन ID</label>
                                    <input type="text" required value={certForm.application_id} onChange={e => setCertForm({...certForm, application_id: e.target.value})} placeholder="UUID" />
                                </div>
                                <div className="sifaris-input-group">
                                    <label>प्रमाणपत्र नं (Auto-gen)</label>
                                    <input type="text" required value={certForm.certificate_no} onChange={e => setCertForm({...certForm, certificate_no: e.target.value})} placeholder="CERT-2081-001" />
                                </div>
                            </div>
                            <button type="submit" className="sifaris-submit-btn">सिफारिस जारी गर्नुहोस् (डिजिटल हस्ताक्षर सहित)</button>
                        </form>
                        <div className="sifaris-table-container">
                            <table className="sifaris-table">
                                <thead><tr><th>प्रमाणपत्र नं.</th><th>जारी मिति</th><th>आवेदन ID</th><th>QR Code</th></tr></thead>
                                <tbody>
                                    {certificates.map(c => <tr key={c.id}><td><b>{c.certificate_no}</b></td><td>{new Date(c.issue_date).toLocaleDateString()}</td><td><small>{c.application_id.substring(0,8)}</small></td><td><span style={{padding:'2px 8px', background:'#eee', borderRadius:'4px'}}>QR Ready</span></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
