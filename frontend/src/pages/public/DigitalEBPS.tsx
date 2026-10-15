import React, { useState, useEffect } from 'react';
import './DigitalEBPS.css';

interface Application {
    id: string;
    application_no: string;
    owner_citizen_id: string;
    ward_id: string;
    building_type: string;
    status: string;
}

interface Inspection {
    id: string;
    application_id: string;
    inspector_id: string;
    inspection_stage: string;
    status: string;
    remarks: string;
}

interface Certificate {
    id: string;
    certificate_no: string;
    application_id: string;
    certificate_type: string;
    issue_date: string;
}

export default function DigitalEBPS() {
    const [activeTab, setActiveTab] = useState<'application' | 'inspection' | 'certificate'>('application');
    
    // Data States
    const [applications, setApplications] = useState<Application[]>([]);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [appForm, setAppForm] = useState({ application_no: '', owner_citizen_id: '', ward_id: '', building_type: 'Residential', gis_polygon_id: '' });
    const [inspForm, setInspForm] = useState({ application_id: '', inspector_id: '', inspection_stage: 'Plinth Level', status: 'Approved', remarks: '' });
    const [certForm, setCertForm] = useState({ application_id: '', certificate_no: '', certificate_type: 'Nirman Sampanna', pdf_url: '' });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'application') {
                    const res = await fetch('/api/v1/ebps/applications/');
                    if(res.ok) setApplications(await res.json());
                } else if (activeTab === 'inspection') {
                    const res = await fetch('/api/v1/ebps/inspections/');
                    if(res.ok) setInspections(await res.json());
                } else if (activeTab === 'certificate') {
                    const res = await fetch('/api/v1/ebps/certificates/');
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
    const submitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/ebps/applications/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appForm)
            });
            if (res.ok) {
                setApplications([...applications, await res.json()]);
                alert('भवन निर्माण अनुमति आवेदन दर्ता भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitInspection = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/ebps/inspections/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inspForm)
            });
            if (res.ok) {
                setInspections([...inspections, await res.json()]);
                alert('डिजिटल फिल्ड इन्स्पेक्सन रिपोर्ट सबमिट भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/ebps/certificates/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certForm)
            });
            if (res.ok) {
                setCertificates([...certificates, await res.json()]);
                alert('निर्माण सम्पन्न प्रमाणपत्र जारी भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    return (
        <div className="ebps-container">
            <div className="ebps-header">
                <h1>Electronic Building Permit System (EBPS)</h1>
                <p>भवन निर्माण अनुमति तथा सम्पन्न प्रमाणपत्र प्रणाली (Phase 13)</p>
            </div>

            <div className="ebps-tabs">
                <button className={`ebps-tab-btn ${activeTab === 'application' ? 'active' : ''}`} onClick={() => setActiveTab('application')}>१. नक्सा पास आवेदन</button>
                <button className={`ebps-tab-btn ${activeTab === 'inspection' ? 'active' : ''}`} onClick={() => setActiveTab('inspection')}>२. प्राविधिक जाँच (Inspection)</button>
                <button className={`ebps-tab-btn ${activeTab === 'certificate' ? 'active' : ''}`} onClick={() => setActiveTab('certificate')}>३. निर्माण सम्पन्न प्रमाणपत्र</button>
            </div>

            <div className="ebps-content-card">
                
                {/* APPLICATION SECTION */}
                {activeTab === 'application' && (
                    <>
                        <form onSubmit={submitApplication}>
                            <div className="ebps-form-grid">
                                <div className="ebps-input-group">
                                    <label>आवेदन दर्ता नं.</label>
                                    <input type="text" required value={appForm.application_no} onChange={e => setAppForm({...appForm, application_no: e.target.value})} placeholder="EBPS-2081-001" />
                                </div>
                                <div className="ebps-input-group">
                                    <label>घरधनीको ID (Citizen ID)</label>
                                    <input type="text" required value={appForm.owner_citizen_id} onChange={e => setAppForm({...appForm, owner_citizen_id: e.target.value})} placeholder="UUID of Citizen" />
                                </div>
                                <div className="ebps-input-group">
                                    <label>वडा नम्बर</label>
                                    <input type="text" required value={appForm.ward_id} onChange={e => setAppForm({...appForm, ward_id: e.target.value})} placeholder="वडा नं." />
                                </div>
                                <div className="ebps-input-group">
                                    <label>भवनको प्रकार (Building Type)</label>
                                    <select value={appForm.building_type} onChange={e => setAppForm({...appForm, building_type: e.target.value})}>
                                        <option value="Residential">आवासीय (Residential)</option>
                                        <option value="Commercial">व्यावसायिक (Commercial)</option>
                                        <option value="Industrial">औद्योगिक (Industrial)</option>
                                    </select>
                                </div>
                                <div className="ebps-input-group" style={{gridColumn: '1 / -1'}}>
                                    <label>GIS जग्गाको ID (GIS Polygon ID - Optional)</label>
                                    <input type="text" value={appForm.gis_polygon_id} onChange={e => setAppForm({...appForm, gis_polygon_id: e.target.value})} placeholder="Link with Phase 7 GIS land data..." />
                                </div>
                            </div>
                            <button type="submit" className="ebps-submit-btn">नक्सा पासको लागि आवेदन दिनुहोस्</button>
                        </form>
                        <div className="ebps-table-container">
                            <table className="ebps-table">
                                <thead><tr><th>आवेदन नं.</th><th>घरधनी ID</th><th>प्रकार</th><th>अवस्था</th><th>ID</th></tr></thead>
                                <tbody>
                                    {applications.map(a => <tr key={a.id}><td>{a.application_no}</td><td><small>{a.owner_citizen_id.substring(0,8)}</small></td><td>{a.building_type}</td><td><b style={{color:'#3498db'}}>{a.status}</b></td><td><small>{a.id.substring(0,8)}</small></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* INSPECTION SECTION */}
                {activeTab === 'inspection' && (
                    <>
                        <form onSubmit={submitInspection}>
                            <div className="ebps-form-grid">
                                <div className="ebps-input-group">
                                    <label>आवेदन ID</label>
                                    <input type="text" required value={inspForm.application_id} onChange={e => setInspForm({...inspForm, application_id: e.target.value})} placeholder="UUID of EBPS Application" />
                                </div>
                                <div className="ebps-input-group">
                                    <label>इन्जिनियर/प्राविधिकको ID</label>
                                    <input type="text" required value={inspForm.inspector_id} onChange={e => setInspForm({...inspForm, inspector_id: e.target.value})} placeholder="Admin/Engineer ID" />
                                </div>
                                <div className="ebps-input-group">
                                    <label>निरीक्षण चरण (Stage)</label>
                                    <select value={inspForm.inspection_stage} onChange={e => setInspForm({...inspForm, inspection_stage: e.target.value})}>
                                        <option value="Plinth Level">Plinth Level (डी.पी.सी. सम्म)</option>
                                        <option value="Superstructure">Superstructure (छत ढलान)</option>
                                        <option value="Completion">Completion (सम्पन्न)</option>
                                    </select>
                                </div>
                                <div className="ebps-input-group">
                                    <label>निर्णय (Status)</label>
                                    <select value={inspForm.status} onChange={e => setInspForm({...inspForm, status: e.target.value})}>
                                        <option value="Approved">पास (Approved)</option>
                                        <option value="Rejected">फेल (Rejected)</option>
                                        <option value="Hold">रोक्का (Hold)</option>
                                    </select>
                                </div>
                                <div className="ebps-input-group" style={{gridColumn: '1 / -1'}}>
                                    <label>कैफियत (Remarks)</label>
                                    <textarea required rows={3} value={inspForm.remarks} onChange={e => setInspForm({...inspForm, remarks: e.target.value})} placeholder="नक्सा अनुसार काम भएको पाइयो..."></textarea>
                                </div>
                            </div>
                            <button type="submit" className="ebps-submit-btn">निरीक्षण प्रतिवेदन पेश गर्नुहोस्</button>
                        </form>
                        <div className="ebps-table-container">
                            <table className="ebps-table">
                                <thead><tr><th>आवेदन ID</th><th>चरण (Stage)</th><th>निर्णय</th><th>कैफियत</th></tr></thead>
                                <tbody>
                                    {inspections.map(i => <tr key={i.id}><td><small>{i.application_id.substring(0,8)}</small></td><td>{i.inspection_stage}</td><td><b style={{color: i.status==='Approved'?'green':'red'}}>{i.status}</b></td><td>{i.remarks}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CERTIFICATE SECTION */}
                {activeTab === 'certificate' && (
                    <>
                        <form onSubmit={submitCertificate}>
                            <div className="ebps-form-grid">
                                <div className="ebps-input-group">
                                    <label>आवेदन ID</label>
                                    <input type="text" required value={certForm.application_id} onChange={e => setCertForm({...certForm, application_id: e.target.value})} placeholder="UUID" />
                                </div>
                                <div className="ebps-input-group">
                                    <label>प्रमाणपत्र नं (Auto-gen)</label>
                                    <input type="text" required value={certForm.certificate_no} onChange={e => setCertForm({...certForm, certificate_no: e.target.value})} placeholder="EBPS-CERT-001" />
                                </div>
                                <div className="ebps-input-group">
                                    <label>प्रमाणपत्रको प्रकार</label>
                                    <select value={certForm.certificate_type} onChange={e => setCertForm({...certForm, certificate_type: e.target.value})}>
                                        <option value="Nirman Sampanna">निर्माण सम्पन्न प्रमाणपत्र</option>
                                        <option value="Partial Sampanna">आंशिक सम्पन्न प्रमाणपत्र</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="ebps-submit-btn">प्रमाणपत्र जारी गर्नुहोस्</button>
                        </form>
                        <div className="ebps-table-container">
                            <table className="ebps-table">
                                <thead><tr><th>प्रमाणपत्र नं.</th><th>प्रकार</th><th>जारी मिति</th><th>आवेदन ID</th></tr></thead>
                                <tbody>
                                    {certificates.map(c => <tr key={c.id}><td><b>{c.certificate_no}</b></td><td>{c.certificate_type}</td><td>{new Date(c.issue_date).toLocaleDateString()}</td><td><small>{c.application_id.substring(0,8)}</small></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
