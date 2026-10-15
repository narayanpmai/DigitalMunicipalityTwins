import React, { useState, useEffect } from 'react';
import './ProjectLifecycle.css';

// TypeScript Interfaces based on Phase 4 Project schemas
interface Proposal {
    id: string;
    project_name_np: string;
    ward_id: string;
    estimated_budget: number;
    priority: string;
}

interface Budget {
    id: string;
    proposal_id: string;
    allocated_amount: number;
    funding_source: string;
    fiscal_year: string;
}

interface Contract {
    id: string;
    project_id: string;
    contractor_id: string;
    contract_amount: number;
    start_date_bs: string;
    completion_date_bs: string;
}

interface Execution {
    id: string;
    project_id: string;
    physical_progress_pct: number;
    financial_progress_pct: number;
    status: string;
}

export default function ProjectLifecycle() {
    const [activeTab, setActiveTab] = useState<'proposal' | 'budget' | 'contract' | 'execution'>('proposal');
    
    // Data States
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [proposalForm, setProposalForm] = useState({ project_name_np: '', ward_id: '', estimated_budget: '', priority: 'P1 (High)', sector: 'Infrastructure' });
    const [budgetForm, setBudgetForm] = useState({ proposal_id: '', allocated_amount: '', funding_source: 'Internal', fiscal_year: '2081/82' });
    const [contractForm, setContractForm] = useState({ project_id: '', contractor_id: '', contract_amount: '', start_date_bs: '', completion_date_bs: '' });
    const [executionForm, setExecutionForm] = useState({ project_id: '', physical_progress_pct: '', financial_progress_pct: '', status: 'In Progress' });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'proposal') {
                    const res = await fetch('/api/v1/projects/proposals/');
                    if(res.ok) setProposals(await res.json());
                } else if (activeTab === 'budget') {
                    const res = await fetch('/api/v1/projects/budgets/');
                    if(res.ok) setBudgets(await res.json());
                } else if (activeTab === 'contract') {
                    const res = await fetch('/api/v1/projects/contracts/');
                    if(res.ok) setContracts(await res.json());
                } else if (activeTab === 'execution') {
                    const res = await fetch('/api/v1/projects/executions/');
                    if(res.ok) setExecutions(await res.json());
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
    const submitProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/projects/proposals/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...proposalForm, estimated_budget: parseFloat(proposalForm.estimated_budget)})
            });
            if (res.ok) {
                setProposals([...proposals, await res.json()]);
                alert('योजना माग सफलतापूर्वक दर्ता भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/projects/budgets/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...budgetForm, allocated_amount: parseFloat(budgetForm.allocated_amount)})
            });
            if (res.ok) {
                setBudgets([...budgets, await res.json()]);
                alert('बजेट सफलतापूर्वक विनियोजन भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitContract = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/projects/contracts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...contractForm, contract_amount: parseFloat(contractForm.contract_amount)})
            });
            if (res.ok) {
                setContracts([...contracts, await res.json()]);
                alert('सम्झौता सफलतापूर्वक सम्पन्न भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    const submitExecution = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/projects/executions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...executionForm, physical_progress_pct: parseFloat(executionForm.physical_progress_pct), financial_progress_pct: parseFloat(executionForm.financial_progress_pct)})
            });
            if (res.ok) {
                setExecutions([...executions, await res.json()]);
                alert('प्रगति विवरण सफलतापूर्वक अपडेट भयो!');
            }
        } catch (error) { alert('Error'); }
    };

    return (
        <div className="project-container">
            <div className="project-header">
                <h1>Project Lifecycle Management</h1>
                <p>योजना माग, बजेट विनियोजन, सम्झौता र कार्यन्वयन (Phase 4)</p>
            </div>

            <div className="project-tabs">
                <button className={`project-tab-btn ${activeTab === 'proposal' ? 'active' : ''}`} onClick={() => setActiveTab('proposal')}>योजना माग (Proposal)</button>
                <button className={`project-tab-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>बजेट विनियोजन (Budget)</button>
                <button className={`project-tab-btn ${activeTab === 'contract' ? 'active' : ''}`} onClick={() => setActiveTab('contract')}>सम्झौता (Contract)</button>
                <button className={`project-tab-btn ${activeTab === 'execution' ? 'active' : ''}`} onClick={() => setActiveTab('execution')}>कार्यन्वयन/भुक्तानी (Execution)</button>
            </div>

            <div className="project-content-card">
                {/* PROPOSAL SECTION */}
                {activeTab === 'proposal' && (
                    <>
                        <form onSubmit={submitProposal}>
                            <div className="project-form-grid">
                                <div className="project-input-group" style={{gridColumn: '1 / -1'}}>
                                    <label>योजनाको नाम (Project Name)</label>
                                    <input type="text" required value={proposalForm.project_name_np} onChange={e => setProposalForm({...proposalForm, project_name_np: e.target.value})} placeholder="उदा. सडक निर्माण आयोजना" />
                                </div>
                                <div className="project-input-group">
                                    <label>वडा (Ward ID)</label>
                                    <input type="text" required value={proposalForm.ward_id} onChange={e => setProposalForm({...proposalForm, ward_id: e.target.value})} placeholder="वडा नम्बर वा UUID" />
                                </div>
                                <div className="project-input-group">
                                    <label>अनुमानित बजेट (Estimated Budget Rs.)</label>
                                    <input type="number" required value={proposalForm.estimated_budget} onChange={e => setProposalForm({...proposalForm, estimated_budget: e.target.value})} placeholder="1000000" />
                                </div>
                                <div className="project-input-group">
                                    <label>प्राथमिकता (Priority)</label>
                                    <select value={proposalForm.priority} onChange={e => setProposalForm({...proposalForm, priority: e.target.value})}>
                                        <option value="P1 (High)">P1 (उच्च प्राथमिकता)</option>
                                        <option value="P2 (Medium)">P2 (मध्यम प्राथमिकता)</option>
                                        <option value="P3 (Low)">P3 (न्यून प्राथमिकता)</option>
                                    </select>
                                </div>
                                <div className="project-input-group">
                                    <label>क्षेत्र (Sector)</label>
                                    <select value={proposalForm.sector} onChange={e => setProposalForm({...proposalForm, sector: e.target.value})}>
                                        <option value="Infrastructure">पूर्वाधार (Infrastructure)</option>
                                        <option value="Health">स्वास्थ्य (Health)</option>
                                        <option value="Education">शिक्षा (Education)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="project-submit-btn">योजना दर्ता गर्नुहोस्</button>
                        </form>
                        <div className="project-table-container">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>योजनाको नाम</th>
                                        <th>वडा</th>
                                        <th>अनुमानित बजेट</th>
                                        <th>प्राथमिकता</th>
                                        <th>ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proposals.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.project_name_np}</td>
                                            <td>{p.ward_id}</td>
                                            <td>Rs. {p.estimated_budget}</td>
                                            <td>{p.priority}</td>
                                            <td><small>{p.id.substring(0,8)}...</small></td>
                                        </tr>
                                    ))}
                                    {proposals.length === 0 && !loading && <tr><td colSpan={5}>कुनै डाटा छैन</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* BUDGET SECTION */}
                {activeTab === 'budget' && (
                    <>
                        <form onSubmit={submitBudget}>
                            <div className="project-form-grid">
                                <div className="project-input-group">
                                    <label>योजना ID (Proposal ID)</label>
                                    <input type="text" required value={budgetForm.proposal_id} onChange={e => setBudgetForm({...budgetForm, proposal_id: e.target.value})} placeholder="UUID of Proposal" />
                                </div>
                                <div className="project-input-group">
                                    <label>विनियोजित रकम (Allocated Rs.)</label>
                                    <input type="number" required value={budgetForm.allocated_amount} onChange={e => setBudgetForm({...budgetForm, allocated_amount: e.target.value})} placeholder="500000" />
                                </div>
                                <div className="project-input-group">
                                    <label>स्रोत (Funding Source)</label>
                                    <select value={budgetForm.funding_source} onChange={e => setBudgetForm({...budgetForm, funding_source: e.target.value})}>
                                        <option value="Internal">आन्तरिक स्रोत (Internal)</option>
                                        <option value="Federal">संघीय अनुदान (Federal)</option>
                                        <option value="Provincial">प्रदेश अनुदान (Provincial)</option>
                                    </select>
                                </div>
                                <div className="project-input-group">
                                    <label>आर्थिक वर्ष (Fiscal Year)</label>
                                    <input type="text" required value={budgetForm.fiscal_year} onChange={e => setBudgetForm({...budgetForm, fiscal_year: e.target.value})} placeholder="2081/82" />
                                </div>
                            </div>
                            <button type="submit" className="project-submit-btn">बजेट विनियोजन गर्नुहोस्</button>
                        </form>
                        <div className="project-table-container">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>योजना ID</th>
                                        <th>विनियोजित रकम</th>
                                        <th>स्रोत</th>
                                        <th>आर्थिक वर्ष</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgets.map(b => (
                                        <tr key={b.id}>
                                            <td><small>{b.proposal_id.substring(0,8)}...</small></td>
                                            <td>Rs. {b.allocated_amount}</td>
                                            <td>{b.funding_source}</td>
                                            <td>{b.fiscal_year}</td>
                                        </tr>
                                    ))}
                                    {budgets.length === 0 && !loading && <tr><td colSpan={4}>कुनै डाटा छैन</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CONTRACT SECTION */}
                {activeTab === 'contract' && (
                    <>
                        <form onSubmit={submitContract}>
                            <div className="project-form-grid">
                                <div className="project-input-group">
                                    <label>योजना ID (Project/Budget ID)</label>
                                    <input type="text" required value={contractForm.project_id} onChange={e => setContractForm({...contractForm, project_id: e.target.value})} placeholder="UUID" />
                                </div>
                                <div className="project-input-group">
                                    <label>उपभोक्ता समिति / ठेकेदार ID</label>
                                    <input type="text" required value={contractForm.contractor_id} onChange={e => setContractForm({...contractForm, contractor_id: e.target.value})} placeholder="UUID" />
                                </div>
                                <div className="project-input-group">
                                    <label>सम्झौता रकम (Contract Amount)</label>
                                    <input type="number" required value={contractForm.contract_amount} onChange={e => setContractForm({...contractForm, contract_amount: e.target.value})} placeholder="450000" />
                                </div>
                                <div className="project-input-group">
                                    <label>सुरु मिति (Start Date B.S.)</label>
                                    <input type="text" required value={contractForm.start_date_bs} onChange={e => setContractForm({...contractForm, start_date_bs: e.target.value})} placeholder="2081-01-01" />
                                </div>
                                <div className="project-input-group">
                                    <label>सम्पन्न गर्नुपर्ने मिति (Completion Date B.S.)</label>
                                    <input type="text" required value={contractForm.completion_date_bs} onChange={e => setContractForm({...contractForm, completion_date_bs: e.target.value})} placeholder="2081-04-01" />
                                </div>
                            </div>
                            <button type="submit" className="project-submit-btn">सम्झौता गर्नुहोस्</button>
                        </form>
                        <div className="project-table-container">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>योजना ID</th>
                                        <th>ठेकेदार ID</th>
                                        <th>सम्झौता रकम</th>
                                        <th>मिति (Start - End)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map(c => (
                                        <tr key={c.id}>
                                            <td><small>{c.project_id.substring(0,8)}...</small></td>
                                            <td><small>{c.contractor_id.substring(0,8)}...</small></td>
                                            <td>Rs. {c.contract_amount}</td>
                                            <td>{c.start_date_bs} देखि {c.completion_date_bs}</td>
                                        </tr>
                                    ))}
                                    {contracts.length === 0 && !loading && <tr><td colSpan={4}>कुनै डाटा छैन</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* EXECUTION SECTION */}
                {activeTab === 'execution' && (
                    <>
                        <form onSubmit={submitExecution}>
                            <div className="project-form-grid">
                                <div className="project-input-group">
                                    <label>योजना ID (Contract ID)</label>
                                    <input type="text" required value={executionForm.project_id} onChange={e => setExecutionForm({...executionForm, project_id: e.target.value})} placeholder="UUID" />
                                </div>
                                <div className="project-input-group">
                                    <label>भौतिक प्रगति (%)</label>
                                    <input type="number" required value={executionForm.physical_progress_pct} onChange={e => setExecutionForm({...executionForm, physical_progress_pct: e.target.value})} placeholder="50" />
                                </div>
                                <div className="project-input-group">
                                    <label>वित्तीय प्रगति (%)</label>
                                    <input type="number" required value={executionForm.financial_progress_pct} onChange={e => setExecutionForm({...executionForm, financial_progress_pct: e.target.value})} placeholder="45" />
                                </div>
                                <div className="project-input-group">
                                    <label>अवस्था (Status)</label>
                                    <select value={executionForm.status} onChange={e => setExecutionForm({...executionForm, status: e.target.value})}>
                                        <option value="In Progress">काम भइरहेको (In Progress)</option>
                                        <option value="Completed">सम्पन्न (Completed)</option>
                                        <option value="Halted">रोकिएको (Halted)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="project-submit-btn">प्रगति अपडेट गर्नुहोस्</button>
                        </form>
                        <div className="project-table-container">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>Contract ID</th>
                                        <th>भौतिक प्रगति</th>
                                        <th>वित्तीय प्रगति</th>
                                        <th>अवस्था</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {executions.map(e => (
                                        <tr key={e.id}>
                                            <td><small>{e.project_id.substring(0,8)}...</small></td>
                                            <td>
                                                <div style={{background: '#ecf0f1', borderRadius: '10px', overflow: 'hidden', width: '100px'}}>
                                                    <div style={{background: '#2ecc71', width: `${e.physical_progress_pct}%`, height: '10px'}}></div>
                                                </div>
                                                <small>{e.physical_progress_pct}%</small>
                                            </td>
                                            <td>{e.financial_progress_pct}%</td>
                                            <td><span style={{color: e.status === 'Completed' ? 'green' : '#e67e22', fontWeight: 'bold'}}>{e.status}</span></td>
                                        </tr>
                                    ))}
                                    {executions.length === 0 && !loading && <tr><td colSpan={4}>कुनै डाटा छैन</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
