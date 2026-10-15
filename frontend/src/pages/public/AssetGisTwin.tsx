import React, { useState, useEffect } from 'react';
import './AssetGisTwin.css';

interface Asset {
    id: string;
    asset_code: string;
    asset_name_np: string;
    category: string;
    status: string;
    ward_id: string;
}

interface Maintenance {
    id: string;
    asset_id: string;
    maintenance_date: string;
    cost: number;
    details: string;
}

interface GisFeature {
    id: string;
    layer_id: string;
    feature_name: string;
    geometry_type: string;
}

export default function AssetGisTwin() {
    const [activeTab, setActiveTab] = useState<'asset' | 'maintenance' | 'gis'>('asset');
    
    // Data States
    const [assets, setAssets] = useState<Asset[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [gisFeatures, setGisFeatures] = useState<GisFeature[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [assetForm, setAssetForm] = useState({ asset_code: '', asset_name_np: '', category: 'Building', status: 'Active', ward_id: '', gps_coordinates: '' });
    const [maintForm, setMaintForm] = useState({ asset_id: '', maintenance_date: '', cost: '', details: '', performed_by: 'Admin' });
    const [gisForm, setGisForm] = useState({ layer_id: 'LAY-01', feature_name: '', geometry_type: 'Point', geojson_data: '{"type":"Point","coordinates":[85.3, 27.7]}' });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'asset') {
                    const res = await fetch('/api/v1/digital-twin/assets/');
                    if(res.ok) setAssets(await res.json());
                } else if (activeTab === 'maintenance') {
                    const res = await fetch('/api/v1/digital-twin/maintenance/');
                    if(res.ok) setMaintenances(await res.json());
                } else if (activeTab === 'gis') {
                    const res = await fetch('/api/v1/digital-twin/gis-features/');
                    if(res.ok) setGisFeatures(await res.json());
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
    const submitAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/digital-twin/assets/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assetForm)
            });
            if (res.ok) {
                setAssets([...assets, await res.json()]);
                alert('नयाँ सम्पत्ति (Asset) दर्ता भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/digital-twin/maintenance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...maintForm, cost: parseFloat(maintForm.cost)})
            });
            if (res.ok) {
                setMaintenances([...maintenances, await res.json()]);
                alert('मर्मत सम्भार रेकर्ड थपियो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitGis = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/digital-twin/gis-features/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...gisForm, geojson_data: JSON.parse(gisForm.geojson_data)})
            });
            if (res.ok) {
                setGisFeatures([...gisFeatures, await res.json()]);
                alert('GIS नक्सामा डेटा अपडेट भयो!');
            }
        } catch (error) { alert('Invalid JSON or Error'); }
    };

    return (
        <div className="twin-container">
            <div className="twin-header">
                <h1>Asset & GIS Digital Twin</h1>
                <p>सार्वजनिक सम्पत्ति तथा भौगोलिक सूचना प्रणाली (Phase 5 & 7)</p>
            </div>

            <div className="twin-tabs">
                <button className={`twin-tab-btn ${activeTab === 'asset' ? 'active' : ''}`} onClick={() => setActiveTab('asset')}>१. सम्पत्ति दर्ता (Assets)</button>
                <button className={`twin-tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>२. मर्मत सम्भार (Maintenance)</button>
                <button className={`twin-tab-btn ${activeTab === 'gis' ? 'active' : ''}`} onClick={() => setActiveTab('gis')}>३. GIS नक्सा (Spatial Twin)</button>
            </div>

            <div className="twin-content-card">
                
                {/* ASSET SECTION */}
                {activeTab === 'asset' && (
                    <>
                        <form onSubmit={submitAsset}>
                            <div className="twin-form-grid">
                                <div className="twin-input-group">
                                    <label>सम्पत्ति कोड (Auto-gen/Manual)</label>
                                    <input type="text" required value={assetForm.asset_code} onChange={e => setAssetForm({...assetForm, asset_code: e.target.value})} placeholder="AST-2081-001" />
                                </div>
                                <div className="twin-input-group">
                                    <label>सम्पत्तिको नाम</label>
                                    <input type="text" required value={assetForm.asset_name_np} onChange={e => setAssetForm({...assetForm, asset_name_np: e.target.value})} placeholder="वडा नं. ३ को कार्यालय भवन" />
                                </div>
                                <div className="twin-input-group">
                                    <label>वर्ग (Category)</label>
                                    <select value={assetForm.category} onChange={e => setAssetForm({...assetForm, category: e.target.value})}>
                                        <option value="Building">भवन (Building)</option>
                                        <option value="Vehicle">सवारी साधन (Vehicle)</option>
                                        <option value="Land">जग्गा (Public Land)</option>
                                        <option value="Equipment">उपकरण (Equipment)</option>
                                    </select>
                                </div>
                                <div className="twin-input-group">
                                    <label>वडा नम्बर</label>
                                    <input type="text" required value={assetForm.ward_id} onChange={e => setAssetForm({...assetForm, ward_id: e.target.value})} placeholder="वडा नं." />
                                </div>
                                <div className="twin-input-group" style={{gridColumn: '1 / -1'}}>
                                    <label>GPS Coordinates (Lat, Lng)</label>
                                    <input type="text" value={assetForm.gps_coordinates} onChange={e => setAssetForm({...assetForm, gps_coordinates: e.target.value})} placeholder="27.7000, 85.3000" />
                                </div>
                            </div>
                            <button type="submit" className="twin-submit-btn">सम्पत्ति दर्ता गर्नुहोस्</button>
                        </form>
                        <div className="twin-table-container">
                            <table className="twin-table">
                                <thead><tr><th>कोड</th><th>नाम</th><th>वर्ग</th><th>अवस्था</th><th>वडा</th></tr></thead>
                                <tbody>
                                    {assets.map(a => <tr key={a.id}><td>{a.asset_code}</td><td>{a.asset_name_np}</td><td>{a.category}</td><td><span style={{color:'#10b981'}}>{a.status}</span></td><td>{a.ward_id}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* MAINTENANCE SECTION */}
                {activeTab === 'maintenance' && (
                    <>
                        <form onSubmit={submitMaintenance}>
                            <div className="twin-form-grid">
                                <div className="twin-input-group">
                                    <label>सम्पत्ति ID (Asset ID)</label>
                                    <input type="text" required value={maintForm.asset_id} onChange={e => setMaintForm({...maintForm, asset_id: e.target.value})} placeholder="UUID of Asset" />
                                </div>
                                <div className="twin-input-group">
                                    <label>मर्मत मिति</label>
                                    <input type="date" required value={maintForm.maintenance_date} onChange={e => setMaintForm({...maintForm, maintenance_date: e.target.value})} />
                                </div>
                                <div className="twin-input-group">
                                    <label>खर्च (Cost Rs.)</label>
                                    <input type="number" required value={maintForm.cost} onChange={e => setMaintForm({...maintForm, cost: e.target.value})} placeholder="50000" />
                                </div>
                                <div className="twin-input-group" style={{gridColumn: '1 / -1'}}>
                                    <label>मर्मत विवरण</label>
                                    <textarea required rows={3} value={maintForm.details} onChange={e => setMaintForm({...maintForm, details: e.target.value})} placeholder="भवनको रंगरोगन गरिएको..."></textarea>
                                </div>
                            </div>
                            <button type="submit" className="twin-submit-btn">मर्मत रेकर्ड थप्नुहोस्</button>
                        </form>
                        <div className="twin-table-container">
                            <table className="twin-table">
                                <thead><tr><th>सम्पत्ति ID</th><th>मिति</th><th>विवरण</th><th>खर्च</th></tr></thead>
                                <tbody>
                                    {maintenances.map(m => <tr key={m.id}><td><small>{m.asset_id.substring(0,8)}</small></td><td>{new Date(m.maintenance_date).toLocaleDateString()}</td><td>{m.details}</td><td>Rs. {m.cost}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* GIS SECTION */}
                {activeTab === 'gis' && (
                    <>
                        <div className="gis-map-placeholder">
                            🗺️ [ Interactive Leaflet/Mapbox 3D GIS Viewer ]
                        </div>
                        <form onSubmit={submitGis}>
                            <div className="twin-form-grid">
                                <div className="twin-input-group">
                                    <label>फिचरको नाम (Feature Name)</label>
                                    <input type="text" required value={gisForm.feature_name} onChange={e => setGisForm({...gisForm, feature_name: e.target.value})} placeholder="नयाँ बाटो ट्र्याक" />
                                </div>
                                <div className="twin-input-group">
                                    <label>ज्यामिति प्रकार (Geometry Type)</label>
                                    <select value={gisForm.geometry_type} onChange={e => setGisForm({...gisForm, geometry_type: e.target.value})}>
                                        <option value="Point">Point (बिन्दु)</option>
                                        <option value="LineString">LineString (रेखा)</option>
                                        <option value="Polygon">Polygon (क्षेत्र)</option>
                                    </select>
                                </div>
                                <div className="twin-input-group" style={{gridColumn: '1 / -1'}}>
                                    <label>GeoJSON Data</label>
                                    <textarea required rows={3} value={gisForm.geojson_data} onChange={e => setGisForm({...gisForm, geojson_data: e.target.value})}></textarea>
                                </div>
                            </div>
                            <button type="submit" className="twin-submit-btn">GIS नक्सामा सिंक गर्नुहोस्</button>
                        </form>
                        <div className="twin-table-container">
                            <table className="twin-table">
                                <thead><tr><th>फिचर</th><th>प्रकार</th><th>Layer ID</th></tr></thead>
                                <tbody>
                                    {gisFeatures.map(g => <tr key={g.id}><td>{g.feature_name}</td><td>{g.geometry_type}</td><td>{g.layer_id}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
