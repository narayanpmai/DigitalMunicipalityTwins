import { api } from './client';

export interface HearingRecord {
  id: string;
  hearingNo: number;
  dateBs: string;
  presidedBy: string;
  attendees: string;
  summary: string;
  orderVerdict: string;
  nextHearingDateBs?: string;
  status: 'adjourned' | 'order_issued' | 'settled';
}

export interface FinalSettlement {
  settlementNo: string;
  verdictType: 'मिलापत्र (Reconciliation)' | 'निर्णय / फैसला (Verdict)' | 'अदालत पठाइएको (Referred to Court)';
  settledDateBs: string;
  settlementTerms: string;
  presidedBy: string;
  members: string[];
  complainantAccepted: boolean;
  respondentAccepted: boolean;
  remarks?: string;
}

export interface JudicialCase {
  id: string;
  caseNo: string;
  title: string;
  disputeType: string;
  wardNumber: number;
  registrationDateBs: string;
  nextHearingDateBs?: string;
  status: string;
  // Parties Information
  complainantName: string;
  complainantPhone?: string;
  complainantAddress?: string;
  complainantCitizenship?: string;
  respondentName: string;
  respondentPhone?: string;
  respondentAddress?: string;
  respondentCitizenship?: string;
  // Dispute Details
  disputedKittaNo?: string;
  claimDetails?: string;
  // Mediator Assignment
  assignedMediatorId?: string;
  assignedMediatorName?: string;
  // Bench Hearings & Verdict
  hearings?: HearingRecord[];
  verdict?: string;
  finalSettlement?: FinalSettlement;
}

export interface Mediator {
  id: string;
  mediatorCode: string;
  fullName: string;
  wardNo: number;
  phone: string;
  email?: string;
  trainingInstitute: string;
  certificateNo: string;
  specialization: string;
  activeCasesCount: number;
  resolvedCasesCount: number;
  status: 'active' | 'inactive';
}

export interface CauseListItem {
  id: string;
  benchDateBs: string;
  benchTime: string;
  caseId: string;
  caseNo: string;
  parties: string;
  disputeType: string;
  stage: 'प्रारम्भिक सुनुवाइ' | 'प्रमाण बुझ्ने' | 'मेलमिलाप छलफल' | 'निर्णय / आदेश';
  benchPresidedBy: string;
  benchMembers: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'deferred';
  resultNotes?: string;
}

export interface JudicialStats {
  totalCases: number;
  decidedCases: number;
  inHearing: number;
  inReconciliation: number;
  newRegistered: number;
  resolutionRate: number;
  totalMediators: number;
}

// ── Default Municipal Seeds for Panchpokhari Thangpal Judicial Committee ──
const INITIAL_MEDIATORS: Mediator[] = [
  {
    id: 'med-01',
    mediatorCode: 'MED-P5-01',
    fullName: 'अधिवक्ता कुल प्रसाद सापकोटा',
    wardNo: 3,
    phone: '९८५१२३४५६७',
    email: 'kul.sapkota@gmail.com',
    trainingInstitute: 'मेलमिलाप परिषद् नेपाल (४८ घण्टे तालिम)',
    certificateNo: 'MC-NP-२०७९-१४२',
    specialization: 'साँध सिमाना तथा जग्गा विवाद',
    activeCasesCount: 2,
    resolvedCasesCount: 14,
    status: 'active',
  },
  {
    id: 'med-02',
    mediatorCode: 'MED-P5-02',
    fullName: 'सुनिता लामा शेर्पा',
    wardNo: 2,
    phone: '९८४१२२३३८८',
    email: 'sunita.lama@gmail.com',
    trainingInstitute: 'न्याय परिषद् तथा स्थानीय शासन सबलीकरण',
    certificateNo: 'MC-NP-२०८०-०८९',
    specialization: 'पारिवारिक, घरेलु तथा महिला सम्बन्धी विवाद',
    activeCasesCount: 1,
    resolvedCasesCount: 19,
    status: 'active',
  },
  {
    id: 'med-03',
    mediatorCode: 'MED-P5-03',
    fullName: 'रामेश्वर थाङपाली',
    wardNo: 4,
    phone: '९८०८३३४४५५',
    trainingInstitute: 'मेलमिलाप केन्द्र नेपाल',
    certificateNo: 'MC-NP-२०८०-२१४',
    specialization: 'कुलोपानी, बाटो निकास तथा ज्याला मजुरी',
    activeCasesCount: 1,
    resolvedCasesCount: 11,
    status: 'active',
  }
];

const INITIAL_CASES: JudicialCase[] = [
  {
    id: 'case-01',
    caseNo: 'न्या.वि.-०३/२०८१-००१',
    title: 'पाँचपोखरी ३ तार्केघ्याङ खेत साँध सिमाना तथा पर्खाल विवाद',
    disputeType: 'साँध सिमाना / जग्गा विवाद (Boundary Dispute)',
    wardNumber: 3,
    registrationDateBs: '२०८१-०४-१०',
    nextHearingDateBs: '२०८१-०६-०५',
    status: 'इजलास सुनुवाइमा (In Hearing)',
    complainantName: 'दावा लामा',
    complainantPhone: '९८४१००११२२',
    complainantAddress: 'पाँचपोखरी थाङपाल गाउँपालिका-३, तार्केघ्याङ',
    complainantCitizenship: '२७-०१-६५-०१२३४ (सिन्धुपाल्चोक)',
    respondentName: 'पेम्बा दोर्जे शेर्पा',
    respondentPhone: '९८५१००२२३३',
    respondentAddress: 'पाँचपोखरी थाङपाल गाउँपालिका-३, तार्केघ्याङ',
    respondentCitizenship: '२७-०१-६२-०४३२१ (सिन्धुपाल्चोक)',
    disputedKittaNo: 'कित्ता नं. ३४२ र ३४३',
    claimDetails: 'विपक्षीले आफ्नो जग्गामा पर्खाल लगाउँदा वादीको जग्गा २ हात मिचेर लगाएकोले साँध सिमाना छुट्याई पुरानो गरा पाखा कायम गरिपाऊँ भनी दिएको उजुरी।',
    assignedMediatorId: 'med-01',
    assignedMediatorName: 'अधिवक्ता कुल प्रसाद सापकोटा',
    hearings: [
      {
        id: 'h-1',
        hearingNo: 1,
        dateBs: '२०८१-०४-२५',
        presidedBy: 'उपाध्यक्ष / संयोजक',
        attendees: 'वादी दावा लामा, प्रतिवादी पेम्बा शेर्पा, वडा प्राविधिक',
        summary: 'दुवै पक्षको प्रारम्भिक भनाइ सुनियो। विवादित जग्गाको नापजाँच गर्न वडा अमिन खटाउने आदेश भयो।',
        orderVerdict: 'वडा नं ३ का अमिन खटाई स्थलगत नापजाँच प्रतिवेदन पेश गर्नू।',
        nextHearingDateBs: '२०८१-०५-२०',
        status: 'order_issued'
      },
      {
        id: 'h-2',
        hearingNo: 2,
        dateBs: '२०८१-०५-२०',
        presidedBy: 'उपाध्यक्ष / संयोजक',
        attendees: 'वादी, प्रतिवादी, अमिन र मेलमिलापकर्ता',
        summary: 'अमिनको नापजाँच प्रतिवेदन इजलासमा पेश भयो। दुवै पक्षलाई मेलमिलापकर्ता कुलप्रसाद सापकोटाको रोहबरमा सहमति खोज्न पठाइयो।',
        orderVerdict: 'मेलमिलाप प्रक्रियामा पठाइएको।',
        nextHearingDateBs: '२०८१-०६-०५',
        status: 'adjourned'
      }
    ]
  },
  {
    id: 'case-02',
    caseNo: 'न्या.वि.-०२/२०८१-००३',
    title: 'मेलम्चीघ्याङ कुलोपानी तथा सिँचाइ निकास विवाद',
    disputeType: 'पानी कुलो तथा सिँचाइ (Canal & Irrigation)',
    wardNumber: 2,
    registrationDateBs: '२०८१-०४-१८',
    nextHearingDateBs: '२०८१-०५-३०',
    status: 'फैसला भएको (Decided)',
    complainantName: 'ल्हाक्पा शेर्पा',
    complainantPhone: '९८०८३३२२११',
    complainantAddress: 'पाँचपोखरी-२, मेलम्चीघ्याङ',
    respondentName: 'कर्मा दोर्जे',
    respondentPhone: '९८०८५५४४३३',
    respondentAddress: 'पाँचपोखरी-२, मेलम्चीघ्याङ',
    disputedKittaNo: 'कित्ता नं. १२५',
    claimDetails: 'परम्परागत रूपमा बग्दै आएको सिँचाइ कुलो विपक्षीले माटो हाली थुनेकोले कुलो पूर्ववत् सञ्चालन गरिपाऊँ।',
    assignedMediatorId: 'med-02',
    assignedMediatorName: 'सुनिता लामा शेर्पा',
    verdict: 'दुवै पक्षको सहमतिमा पुरानो कुलोको चौडाइ २ फिट कायम गरी पानी निकास गर्न दुवै पक्ष सहमत भई मिलापत्र सम्पन्न भयो।',
    finalSettlement: {
      settlementNo: 'मिलापत्र-०२/२०८१-०१',
      verdictType: 'मिलापत्र (Reconciliation)',
      settledDateBs: '२०८१-०५-३०',
      settlementTerms: '१. विपक्षी कर्मा दोर्जेले ३ दिनभित्र कुलोको थुनिएको माटो हटाई २ फिट चौडाइको पानी निकास पूर्ववत् खुला गर्ने।\n२. वादी ल्हाक्पा शेर्पाले कुलोको नियमित मर्मतमा प्रतिवादीलाई सहयोग गर्ने।\n३. दुवै पक्षबिच भविष्यमा यस विषयमा कुनै विवाद नगर्ने सहमति भयो।',
      presidedBy: 'सुनिता अधिकारी (उपाध्यक्ष तथा संयोजक)',
      members: ['वडाध्यक्ष पासाङ शेर्पा', 'कार्यपालिका सदस्य रिता विक'],
      complainantAccepted: true,
      respondentAccepted: true,
      remarks: 'स्थानीय सरकार सञ्चालन ऐन २०७४ को दफा ४७ बमोजिम मिलापत्र प्रमाणित।'
    }
  },
  {
    id: 'case-03',
    caseNo: 'न्या.वि.-०४/२०८१-००५',
    title: 'मानेखर्क बजार घरबहाल सम्झौता तथा भाडा बक्यौता भुक्तानी',
    disputeType: 'घर बहाल तथा सम्झौता (House Rent)',
    wardNumber: 4,
    registrationDateBs: '२०८१-०५-०२',
    nextHearingDateBs: '२०८१-०६-१०',
    status: 'मेलमिलाप प्रक्रियामा (In Mediation)',
    complainantName: 'सुरेश श्रेष्ठ',
    complainantPhone: '९८४१०१२३४५',
    complainantAddress: 'पाँचपोखरी-४, मानेखर्क',
    respondentName: 'राजेन्द्र गिरी',
    respondentPhone: '९८१२९८७६५०',
    respondentAddress: 'पाँचपोखरी-४, मानेखर्क',
    claimDetails: 'विगत ५ महिनाको पसल कवलको घरभाडा रु ६०,०००/- नतिरेको र कोठा पनि खाली नगरेकोले बक्यौता भाडा भराई कोठा खाली गराई पाऊँ।',
    assignedMediatorId: 'med-03',
    assignedMediatorName: 'रामेश्वर थाङपाली'
  }
];

const INITIAL_CAUSE_LIST: CauseListItem[] = [
  {
    id: 'cl-01',
    benchDateBs: '२०८१-०६-०५',
    benchTime: 'दिउँसो ०१:०० बजे',
    caseId: 'case-01',
    caseNo: 'न्या.वि.-०३/२०८१-००१',
    parties: 'दावा लामा विरुद्ध पेम्बा दोर्जे शेर्पा',
    disputeType: 'साँध सिमाना तथा जग्गा विवाद',
    stage: 'मेलमिलाप छलफल',
    benchPresidedBy: 'उपाध्यक्ष (संयोजक)',
    benchMembers: ['सदस्य-१ (कार्यपालिका सदस्य)', 'सदस्य-२ (कार्यपालिका सदस्य)'],
    status: 'scheduled'
  },
  {
    id: 'cl-02',
    benchDateBs: '२०८१-०६-०५',
    benchTime: 'दिउँसो ०२:०० बजे',
    caseId: 'case-03',
    caseNo: 'न्या.वि.-०४/२०८१-००५',
    parties: 'सुरेश श्रेष्ठ विरुद्ध राजेन्द्र गिरी',
    disputeType: 'घर बहाल तथा सम्झौता',
    stage: 'प्रारम्भिक सुनुवाइ',
    benchPresidedBy: 'उपाध्यक्ष (संयोजक)',
    benchMembers: ['सदस्य-१', 'सदस्य-२'],
    status: 'scheduled'
  }
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const judicialApi = {
  // Cases
  getCases: async (): Promise<JudicialCase[]> => {
    try {
      const res = await api.get<any>('/judicial/cases');
      const list = res?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<JudicialCase[]>('p5_judicial_cases', INITIAL_CASES);
  },

  createCase: async (data: Partial<JudicialCase>): Promise<JudicialCase> => {
    const list = getStored<JudicialCase[]>('p5_judicial_cases', INITIAL_CASES);
    const newCase: JudicialCase = {
      id: `case-${Date.now()}`,
      caseNo: data.caseNo || `न्या.वि.-०${data.wardNumber || 1}/२०८१-०${list.length + 1}`,
      title: data.title || '',
      disputeType: data.disputeType || 'साँध सिमाना / जग्गा विवाद (Boundary Dispute)',
      wardNumber: Number(data.wardNumber) || 1,
      registrationDateBs: data.registrationDateBs || '२०८१-०६-०१',
      nextHearingDateBs: data.nextHearingDateBs || '२०८१-०६-१५',
      status: data.status || 'नयाँ दर्ता (Registered)',
      complainantName: data.complainantName || '',
      complainantPhone: data.complainantPhone || '',
      complainantAddress: data.complainantAddress || '',
      complainantCitizenship: data.complainantCitizenship || '',
      respondentName: data.respondentName || '',
      respondentPhone: data.respondentPhone || '',
      respondentAddress: data.respondentAddress || '',
      respondentCitizenship: data.respondentCitizenship || '',
      disputedKittaNo: data.disputedKittaNo || '',
      claimDetails: data.claimDetails || '',
      assignedMediatorId: data.assignedMediatorId,
      assignedMediatorName: data.assignedMediatorName,
      hearings: [],
    };
    try {
      await api.post('/judicial/cases', newCase);
    } catch {}
    const updated = [newCase, ...list];
    setStored('p5_judicial_cases', updated);
    return newCase;
  },

  addHearing: async (caseId: string, hearing: Partial<HearingRecord>): Promise<JudicialCase> => {
    try {
      const res: any = await api.post(`/judicial/cases/${caseId}/hearings`, hearing);
      const data = res?.data || res;
      if (data && data.id) return data;
    } catch (e) {
      console.warn('API hearing failed, using local storage fallback', e);
    }
    const list = getStored<JudicialCase[]>('p5_judicial_cases', INITIAL_CASES);
    const index = list.findIndex(c => c.id === caseId);
    if (index === -1) throw new Error('Case not found');

    const target = list[index];
    const newHearingRecord: HearingRecord = {
      id: `h-${Date.now()}`,
      hearingNo: (target.hearings?.length || 0) + 1,
      dateBs: hearing.dateBs || '२०८१-०६-०१',
      presidedBy: hearing.presidedBy || 'उपाध्यक्ष / संयोजक',
      attendees: hearing.attendees || 'वादी तथा प्रतिवादी पक्ष',
      summary: hearing.summary || '',
      orderVerdict: hearing.orderVerdict || '',
      nextHearingDateBs: hearing.nextHearingDateBs,
      status: hearing.status || 'order_issued'
    };

    target.hearings = [...(target.hearings || []), newHearingRecord];
    if (hearing.nextHearingDateBs) {
      target.nextHearingDateBs = hearing.nextHearingDateBs;
    }
    if (hearing.orderVerdict) {
      target.status = 'इजलास सुनुवाइमा (In Hearing)';
    }

    list[index] = target;
    setStored('p5_judicial_cases', list);
    return target;
  },

  finalizeSettlement: async (caseId: string, settlement: FinalSettlement): Promise<JudicialCase> => {
    try {
      const res: any = await api.post(`/judicial/cases/${caseId}/settlement`, settlement);
      const data = res?.data || res;
      if (data && data.id) return data;
    } catch (e) {
      console.warn('API settlement failed, using local storage fallback', e);
    }
    const list = getStored<JudicialCase[]>('p5_judicial_cases', INITIAL_CASES);
    const index = list.findIndex(c => c.id === caseId);
    if (index === -1) throw new Error('Case not found');

    const target = list[index];
    target.finalSettlement = settlement;
    target.status = 'फैसला भएको (Decided)';
    target.verdict = settlement.settlementTerms;

    list[index] = target;
    setStored('p5_judicial_cases', list);
    return target;
  },

  // Mediators
  getMediators: async (): Promise<Mediator[]> => {
    try {
      const res = await api.get<any>('/judicial/mediators');
      const list = res?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<Mediator[]>('p5_judicial_mediators', INITIAL_MEDIATORS);
  },

  createMediator: async (data: Partial<Mediator>): Promise<Mediator> => {
    try {
      const res: any = await api.post('/judicial/mediators', data);
      const created = res?.data || res;
      if (created && created.id) return created;
    } catch (e) {
      console.warn('API mediator creation failed, using local storage fallback', e);
    }
    const list = getStored<Mediator[]>('p5_judicial_mediators', INITIAL_MEDIATORS);
    const newMed: Mediator = {
      id: `med-${Date.now()}`,
      mediatorCode: data.mediatorCode || `MED-P5-0${list.length + 1}`,
      fullName: data.fullName || '',
      wardNo: Number(data.wardNo) || 1,
      phone: data.phone || '',
      email: data.email,
      trainingInstitute: data.trainingInstitute || 'मेलमिलाप परिषद् नेपाल',
      certificateNo: data.certificateNo || `MC-NP-२०८१-${Math.floor(Math.random()*800+100)}`,
      specialization: data.specialization || 'सामान्य विवाद तथा साँधसिमाना',
      activeCasesCount: 0,
      resolvedCasesCount: 0,
      status: 'active'
    };
    const updated = [newMed, ...list];
    setStored('p5_judicial_mediators', updated);
    return newMed;
  },

  // Cause List (दैनिक इजलास पेशी सूची)
  getCauseList: async (): Promise<CauseListItem[]> => {
    try {
      const res = await api.get<any>('/judicial/cause-list');
      const list = res?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<CauseListItem[]>('p5_judicial_cause_list', INITIAL_CAUSE_LIST);
  },

  createCauseListItem: async (data: Partial<CauseListItem>): Promise<CauseListItem> => {
    try {
      const res: any = await api.post('/judicial/cause-list', data);
      const created = res?.data || res;
      if (created && created.id) return created;
    } catch (e) {
      console.warn('API cause-list creation failed, using local storage fallback', e);
    }
    const list = getStored<CauseListItem[]>('p5_judicial_cause_list', INITIAL_CAUSE_LIST);
    const item: CauseListItem = {
      id: `cl-${Date.now()}`,
      benchDateBs: data.benchDateBs || '२०८१-०६-०५',
      benchTime: data.benchTime || 'दिउँसो ०१:०० बजे',
      caseId: data.caseId || '',
      caseNo: data.caseNo || '',
      parties: data.parties || '',
      disputeType: data.disputeType || '',
      stage: data.stage || 'मेलमिलाप छलफल',
      benchPresidedBy: data.benchPresidedBy || 'उपाध्यक्ष (संयोजक)',
      benchMembers: data.benchMembers || ['सदस्य-१', 'सदस्य-२'],
      status: 'scheduled',
    };
    const updated = [item, ...list];
    setStored('p5_judicial_cause_list', updated);
    return item;
  },

  // Stats
  getStats: async (): Promise<JudicialStats> => {
    try {
      const res = await api.get<any>('/judicial/stats');
      const data = res?.data || res;
      if (data && data.totalCases) return data;
    } catch {}
    const cases = getStored<JudicialCase[]>('p5_judicial_cases', INITIAL_CASES);
    const mediators = getStored<Mediator[]>('p5_judicial_mediators', INITIAL_MEDIATORS);
    const decided = cases.filter(c => c.status.includes('फैसला') || !!c.finalSettlement).length;
    const inHearing = cases.filter(c => c.status.includes('इजलास') || c.status.includes('सुनेको')).length;
    const inReconciliation = cases.filter(c => c.status.includes('मेलमिलाप')).length;

    return {
      totalCases: cases.length,
      decidedCases: decided,
      inHearing: inHearing || 1,
      inReconciliation: inReconciliation || 1,
      newRegistered: cases.length - decided,
      resolutionRate: Math.round((decided / (cases.length || 1)) * 100),
      totalMediators: mediators.length,
    };
  }
};
