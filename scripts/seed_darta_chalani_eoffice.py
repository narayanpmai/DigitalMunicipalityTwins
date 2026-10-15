import psycopg2
import uuid
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

DARTA_DATA = [
    {
        "registrationNo": "०१",
        "fiscalYear": "२०८१/०८२",
        "registeredDate": "२०८१/०५/१०",
        "registeredDateAd": "2024-08-26",
        "registeredTime": "१०:३०",
        "letterRefNo": "प.सं. ०८१/८२-१०२",
        "senderChalaniNo": "१२४",
        "letterDate": "२०८१/०५/०८",
        "senderName": "बाँसखर्क खानेपानी तथा सरसफाइ उपभोक्ता समिति",
        "senderAddress": "पाँचपोखरी थाङपाल-१, सिन्धुपाल्चोक",
        "senderContact": "9841234567",
        "subject": "बाँसखर्क खानेपानी आयोजना मर्मत सम्भार तथा पाइपलाइन विस्तार सम्बन्धमा।",
        "classification": "साधारण",
        "department": "पूर्वाधार विकास तथा प्राविधिक शाखा",
        "assignedBranch": "पूर्वाधार विकास तथा प्राविधिक शाखा",
        "assignedOfficer": "इन्जिनियर सुजन नेपाल",
        "tokAdesh": "स्थलगत निरीक्षण गरी लागत अनुमान पेश गर्नुहोला।",
        "tokGivenBy": "टासी लामा (गाउँपालिका अध्यक्ष)",
        "tokDate": "२०८१/०५/१०",
        "priority": "उच्च",
        "status": "कारबाही प्रक्रियामा",
        "approvalStatus": "approved",
        "approvedBy": "कृष्णप्रसाद पोखरेल (प्रमुख प्रशासकीय अधिकृत)"
    },
    {
        "registrationNo": "०२",
        "fiscalYear": "२०८१/०८२",
        "registeredDate": "२०८१/०५/१२",
        "registeredDateAd": "2024-08-28",
        "registeredTime": "११:१५",
        "letterRefNo": "प.सं. ०८१/८२-०४५",
        "senderChalaniNo": "५६",
        "letterDate": "२०८१/०५/११",
        "senderName": "श्री थाङपाल भ्याली आधारभूत विद्यालय",
        "senderAddress": "पाँचपोखरी थाङपाल-४, सिन्धुपाल्चोक",
        "senderContact": "9841987654",
        "subject": "विद्यालय भवन छाना मर्मत तथा कम्प्युटर ल्याब स्थापना अनुदान सम्बन्धमा।",
        "classification": "साधारण",
        "department": "शिक्षा, युवा तथा खेलकुद शाखा",
        "assignedBranch": "शिक्षा, युवा तथा खेलकुद शाखा",
        "assignedOfficer": "शिक्षा अधिकृत",
        "tokAdesh": "चालु आर्थिक वर्षको विद्यालय सुधार कार्यक्रमबाट सम्बोधन गर्ने गरी पेश गर्नुहोला।",
        "tokGivenBy": "सुनिता अधिकारी (गाउँपालिका उपाध्यक्ष)",
        "tokDate": "२०८१/०५/१२",
        "priority": "साधारण",
        "status": "दर्ता भएको",
        "approvalStatus": "approved",
        "approvedBy": "कृष्णप्रसाद पोखरेल (प्रमुख प्रशासकीय अधिकृत)"
    },
    {
        "registrationNo": "०३",
        "fiscalYear": "२०८१/०८२",
        "registeredDate": "२०८१/०५/१५",
        "registeredDateAd": "2024-08-31",
        "registeredTime": "१२:००",
        "letterRefNo": "प्र.जि.का. ०८१-९८०",
        "senderChalaniNo": "८९२",
        "letterDate": "२०८१/०५/१४",
        "senderName": "जिल्ला प्रशासन कार्यालय, सिन्धुपाल्चोक",
        "senderAddress": "चौतारा, सिन्धुपाल्चोक",
        "senderContact": "011-620111",
        "subject": "मनसुनजन्य विपद् प्रतिकार्य तथा राहत सामग्री तयारी अवस्थामा राख्ने बारे।",
        "classification": "गोप्य/अति जरुरी",
        "department": "विपद् व्यवस्थापन तथा वातावरण शाखा",
        "assignedBranch": "विपद् व्यवस्थापन तथा वातावरण शाखा",
        "assignedOfficer": "विपद् सम्पर्क अधिकृत",
        "tokAdesh": "सम्पूर्ण वडामा सतर्कता अपनाउन र आपतकालीन उद्धार टोली स्ट्यान्डबाइ राख्न सर्कुलर गर्नुहोला।",
        "tokGivenBy": "टासी लामा (गाउँपालिका अध्यक्ष)",
        "tokDate": "२०८१/०५/१५",
        "priority": "अति जरुरी",
        "status": "सम्पन्न",
        "approvalStatus": "approved",
        "approvedBy": "कृष्णप्रसाद पोखरेल (प्रमुख प्रशासकीय अधिकृत)"
    },
    {
        "registrationNo": "०४",
        "fiscalYear": "२०८१/०८२",
        "registeredDate": "२०८१/०५/१८",
        "registeredDateAd": "2024-09-03",
        "registeredTime": "०२:३०",
        "letterRefNo": "प.सं. ०८१/०८२-१२",
        "senderChalaniNo": "३४",
        "letterDate": "२०८१/०५/१७",
        "senderName": "भोताङ स्याउ तथा ट्राउट माछा कृषक समूह",
        "senderAddress": "पाँचपोखरी थाङपाल-३, भोताङ",
        "senderContact": "9841555666",
        "subject": "शीतभण्डार (Cold Store) तथा कृषि सडक निर्माण माग सम्बन्धमा।",
        "classification": "साधारण",
        "department": "कृषि तथा पशुपन्छी विकास शाखा",
        "assignedBranch": "कृषि तथा पशुपन्छी विकास शाखा",
        "assignedOfficer": "कृषि प्रसार अधिकृत",
        "tokAdesh": "प्राविधिक सम्भाव्यता अध्ययन गरी पेश गर्नू।",
        "tokGivenBy": "टासी लामा (गाउँपालिका अध्यक्ष)",
        "tokDate": "२०८१/०५/१८",
        "priority": "साधारण",
        "status": "कारबाही प्रक्रियामा",
        "approvalStatus": "approved",
        "approvedBy": "कृष्णप्रसाद पोखरेल"
    },
    {
        "registrationNo": "०५",
        "fiscalYear": "२०८१/०८२",
        "registeredDate": "२०८१/०५/२२",
        "registeredDateAd": "2024-09-07",
        "registeredTime": "०१:२०",
        "letterRefNo": "प.सं. ०८१/०८२-८८",
        "senderChalaniNo": "९०",
        "letterDate": "२०८१/०५/२१",
        "senderName": "बरुवा स्वास्थ्य चौकी व्यवस्थापन समिति",
        "senderAddress": "पाँचपोखरी थाङपाल-२, बरुवा",
        "senderContact": "9841888999",
        "subject": "प्रसूति गृह (Birthing Center) स्तरोन्नति तथा औषधि आपूर्तिको व्यवस्था सम्बन्धमा।",
        "classification": "जरुरी",
        "department": "स्वास्थ्य शाखा",
        "assignedBranch": "स्वास्थ्य शाखा",
        "assignedOfficer": "स्वास्थ्य शाखा प्रमुख",
        "tokAdesh": "आवश्यक औषधि खरिद प्रक्रिया तत्काल अघि बढाउनू।",
        "tokGivenBy": "सुनिता अधिकारी (गाउँपालिका उपाध्यक्ष)",
        "tokDate": "२०८१/०५/२२",
        "priority": "जरुरी",
        "status": "सम्पन्न",
        "approvalStatus": "approved",
        "approvedBy": "कृष्णप्रसाद पोखरेल"
    }
]

CHALANI_DATA = [
    {
        "dispatchNo": "०१",
        "fiscalYear": "२०८१/०८२",
        "dispatchDate": "२०८१/०५/११",
        "dispatchDateAd": "2024-08-27",
        "dispatchTime": "०२:००",
        "letterRefNo": "प.सं. ०८१/८२-१०१",
        "receiverName": "बाँसखर्क खानेपानी तथा सरसफाइ उपभोक्ता समिति",
        "receiverAddress": "पाँचपोखरी थाङपाल-१",
        "receiverContact": "9841234567",
        "subject": "योजना सम्झौता तथा प्राविधिक लगत संकलन सम्बन्धमा।",
        "department": "पूर्वाधार विकास तथा प्राविधिक शाखा",
        "signedBy": "कृष्णप्रसाद पोखरेल (प्रमुख प्रशासकीय अधिकृत)",
        "classification": "साधारण",
        "priority": "साधारण",
        "letterBody": "प्रस्तुत विषयमा तहाँ समितिको माग बमोजिम खानेपानी आयोजनाको स्थलगत लगत संकलनका लागि प्राविधिक खटाइएको व्यहोरा अनुरोध छ।",
        "deliveryMethod": "हातै",
        "status": "चलानी भएको"
    },
    {
        "dispatchNo": "०२",
        "fiscalYear": "२०८१/०८२",
        "dispatchDate": "२०८१/०५/१६",
        "dispatchDateAd": "2024-09-01",
        "dispatchTime": "०३:३०",
        "letterRefNo": "प.सं. ०८१/८२-१०२",
        "receiverName": "सबै वडा कार्यालयहरू (वडा नं. १ देखि ८ सम्म)",
        "receiverAddress": "पाँचपोखरी थाङपाल गाउँपालिका",
        "receiverContact": "-",
        "subject": "मनसुनजन्य विपद् पूर्वतयारी तथा उद्धार टोली सतर्क अवस्थामा राख्ने बारे।",
        "department": "प्रशासन शाखा",
        "signedBy": "कृष्णप्रसाद पोखरेल (प्रमुख प्रशासकीय अधिकृत)",
        "classification": "अति जरुरी",
        "priority": "अति जरुरी",
        "letterBody": "जिल्ला प्रशासन कार्यालयको निर्देशन तथा यस गाउँपालिकाको विपद् व्यवस्थापन समितिको निर्णय अनुसार सबै वडामा विपद् प्रतिकार्य टोली तयारी अवस्थामा राख्न सूचित गरिन्छ।",
        "deliveryMethod": "ईमेल / डिजिटल सूचना",
        "status": "चलानी भएको"
    },
    {
        "dispatchNo": "०३",
        "fiscalYear": "२०८१/०८२",
        "dispatchDate": "२०८१/०५/२०",
        "dispatchDateAd": "2024-09-05",
        "dispatchTime": "११:००",
        "letterRefNo": "प.सं. ०८१/८२-१०३",
        "receiverName": "सहरी विकास मन्त्रालय, बागमती प्रदेश",
        "receiverAddress": "हेटौंडा, मकवानपुर",
        "receiverContact": "057-520111",
        "subject": "मेलम्ची-तिपेनी-भोताङ सडक स्तरोन्नति समपुरक अनुदान माग सम्बन्धमा।",
        "department": "योजना तथा अनुगमन शाखा",
        "signedBy": "टासी लामा (गाउँपालिका अध्यक्ष)",
        "classification": "साधारण",
        "priority": "उच्च",
        "letterBody": "पाँचपोखरी थाङपाल गाउँपालिकाको लाइफलाइन मानिने मेलम्ची-तिपेनी-भोताङ सडक खण्ड स्तरोन्नतिका लागि प्रदेश समपुरक अनुदान उपलब्ध गराइदिन अनुरोध छ।",
        "deliveryMethod": "दर्ता पत्र / हुलाक",
        "status": "चलानी भएको"
    }
]

EOFFICE_FILES = [
    {
        "file_no": "FILE-2081-INFRA-01",
        "subject": "आर्थिक वर्ष २०८१/८२ सडक तथा पूर्वाधार योजना फाइल",
        "classification": "General",
        "status": "In Progress",
        "created_by_branch": "पूर्वाधार विकास शाखा"
    },
    {
        "file_no": "FILE-2081-DISASTER-02",
        "subject": "मनसुन विपद् प्रतिकार्य तथा राहत वितरण फाइल",
        "classification": "Urgent",
        "status": "Open",
        "created_by_branch": "विपद् व्यवस्थापन शाखा"
    },
    {
        "file_no": "FILE-2081-EDU-03",
        "subject": "विद्यालय भौतिक पूर्वाधार अनुदान तथा शिक्षक दरबन्दी फाइल",
        "classification": "General",
        "status": "Open",
        "created_by_branch": "शिक्षा शाखा"
    }
]

TIPPANI_DATA = [
    {
        "file_index": 0,
        "subject": "तिपेनी-बाँसखर्क कृषि सडक स्तरोन्नति उपभोक्ता समिति सम्झौता सम्बन्धमा",
        "content_html": "<p><strong>श्रीमान् प्रमुख प्रशासकीय अधिकृतज्यू,</strong></p><p>प्रस्तुत विषयमा पाँचपोखरी थाङपाल गाउँपालिका वडा नं. १ स्थित तिपेनी-बाँसखर्क कृषि सडक स्तरोन्नति कार्यका लागि विनियोजित रु. १५,००,०००/- (अक्षरेपी पन्ध्र लाख) बजेट अनुसार गठित उपभोक्ता समितिसँग नियमानुसार सम्झौता गरी कार्यदेश दिन मनासिब देखि निर्णयार्थ पेश गर्दछु।</p>",
        "status": "Approved",
        "initiated_by": "इन्जिनियर सुजन नेपाल (योजना शाखा)"
    },
    {
        "file_index": 1,
        "subject": "भोताङ पहिरो प्रभावित परिवारहरूलाई अस्थायी आवास तथा राहत वितरण निर्णय सम्बन्धमा",
        "content_html": "<p><strong>श्रीमान् गाउँपालिका अध्यक्षज्यू,</strong></p><p>गत अविरल वर्षाका कारण वडा नं. ३ भोताङमा पहिरोबाट विस्थापित भएका ५ परिवारलाई विपद् व्यवस्थापन कोषबाट प्रति परिवार रु. २५,०००/- का दरले तत्काल राहत उपलब्ध गराउन निर्णयार्थ यो टिप्पणी पेश गरिएको छ।</p>",
        "status": "Approved",
        "initiated_by": "विपद् सम्पर्क अधिकृत"
    },
    {
        "file_index": 2,
        "subject": "आधारभूत विद्यालयहरूमा डिजिटल हाजिरी तथा इन्टरनेट जडान कार्य सम्बन्धमा",
        "content_html": "<p><strong>श्रीमान् प्रमुख प्रशासकीय अधिकृतज्यू,</strong></p><p>पालिका भित्रका ४२ वटै विद्यालयहरूमा शैक्षिक गुणस्तर तथा शिक्षक उपस्थिति अनुगमनका लागि बायोमेट्रिक/डिजिटल हाजिरी तथा इन्टरनेट जडान गर्ने प्रस्ताव निर्णयार्थ पेश गर्दछु।</p>",
        "status": "Pending Review",
        "initiated_by": "शिक्षा अधिकृत"
    }
]

def seed():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    # 1. Seed Darta
    print("Seeding Darta records...")
    cur.execute("DELETE FROM darta;")
    for d in DARTA_DATA:
        cur.execute("""
            INSERT INTO darta (
                id, tenant_id, "registrationNo", "fiscalYear", "registeredDate", "registeredDateAd",
                "registeredTime", "letterRefNo", "senderChalaniNo", "letterDate", "senderName",
                "senderAddress", "senderContact", subject, classification, department,
                "assignedBranch", "assignedOfficer", "tokAdesh", "tokGivenBy", "tokDate",
                priority, status, "approvalStatus", "approvedBy", "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid4()), "panchpokhari", d["registrationNo"], d["fiscalYear"], d["registeredDate"], d["registeredDateAd"],
            d["registeredTime"], d["letterRefNo"], d["senderChalaniNo"], d["letterDate"], d["senderName"],
            d["senderAddress"], d["senderContact"], d["subject"], d["classification"], d["department"],
            d["assignedBranch"], d["assignedOfficer"], d["tokAdesh"], d["tokGivenBy"], d["tokDate"],
            d["priority"], d["status"], d["approvalStatus"], d["approvedBy"], datetime.utcnow(), datetime.utcnow()
        ))
        print(f"  ✓ Darta No. {d['registrationNo']}: {d['subject'][:45]}...")

    # 2. Seed Chalani
    print("\nSeeding Chalani records...")
    cur.execute("DELETE FROM chalani;")
    for c in CHALANI_DATA:
        cur.execute("""
            INSERT INTO chalani (
                id, tenant_id, "dispatchNo", "fiscalYear", "dispatchDate", "dispatchDateAd",
                "dispatchTime", "letterRefNo", "receiverName", "receiverAddress", "receiverContact",
                subject, department, "signedBy", classification, priority, "letterBody",
                "deliveryMethod", status, "approvalStatus", "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid4()), "panchpokhari", c["dispatchNo"], c["fiscalYear"], c["dispatchDate"], c["dispatchDateAd"],
            c["dispatchTime"], c["letterRefNo"], c["receiverName"], c["receiverAddress"], c["receiverContact"],
            c["subject"], c["department"], c["signedBy"], c["classification"], c["priority"], c["letterBody"],
            c["deliveryMethod"], c["status"], "approved", datetime.utcnow(), datetime.utcnow()
        ))
        print(f"  ✓ Chalani No. {c['dispatchNo']}: {c['subject'][:45]}...")

    # 3. Seed E-Office Files & Tippani
    print("\nSeeding E-Office Files & Tippani...")
    cur.execute("DELETE FROM eoffice_tippani;")
    cur.execute("DELETE FROM eoffice_files;")

    created_file_ids = []
    for f in EOFFICE_FILES:
        f_id = str(uuid.uuid4())
        created_file_ids.append(f_id)
        cur.execute("""
            INSERT INTO eoffice_files (
                id, tenant_id, file_no, subject, classification, status, created_by_branch, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            f_id, "panchpokhari", f["file_no"], f["subject"], f["classification"], f["status"], f["created_by_branch"],
            datetime.utcnow(), datetime.utcnow()
        ))
        print(f"  ✓ File: {f['file_no']} - {f['subject']}")

    for t in TIPPANI_DATA:
        parent_file_id = created_file_ids[t["file_index"]]
        t_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO eoffice_tippani (
                id, tenant_id, file_id, subject, content_html, status, initiated_by, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            t_id, "panchpokhari", parent_file_id, t["subject"], t["content_html"], t["status"], t["initiated_by"],
            datetime.utcnow(), datetime.utcnow()
        ))
        print(f"  ✓ Tippani: [{t['status']}] {t['subject'][:50]}...")

    conn.commit()
    conn.close()
    print("\n✅ Successfully seeded Darta, Chalani, and E-Office Tippani!")

if __name__ == '__main__':
    seed()
