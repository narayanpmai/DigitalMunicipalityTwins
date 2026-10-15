"""
Seed E-Office File Movements and Digital Signatures
Municipal Digital Twins — Panchpokhari Thangpal Rural Municipality
Option 31 (विकल्प ३१)

Populates:
  1. eoffice_files (Ensures 6 files across departments)
  2. eoffice_file_movements (14 chronological routing records)
  3. eoffice_digital_signatures (8 cryptographic signature audit records)
"""
import uuid
import datetime
from core.database import SessionLocal
from models.e_office import EOfficeFile, Tippani, FileMovement, DigitalSignature

def seed_eoffice():
    db = SessionLocal()
    tenant_id = "panchpokhari"
    now = datetime.datetime.utcnow()

    print("🚀 Starting Seeding for Option 31: E-Office File Movements & Digital Signatures...")

    # 1. Ensure files exist
    files_data = [
        {
            "id": "file-infra-01",
            "file_no": "FILE-2081-INFRA-01",
            "subject": "आर्थिक वर्ष २०८१/८२ सडक तथा पूर्वाधार योजना फाइल",
            "classification": "General",
            "status": "In Progress",
            "created_by_branch": "पूर्वाधार विकास शाखा",
            "current_owner_id": "इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)",
        },
        {
            "id": "file-disaster-02",
            "file_no": "FILE-2081-DISASTER-02",
            "subject": "मनसुन विपद् प्रतिकार्य तथा राहत वितरण फाइल",
            "classification": "Urgent",
            "status": "Open",
            "created_by_branch": "विपद् व्यवस्थापन शाखा",
            "current_owner_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
        },
        {
            "id": "file-edu-03",
            "file_no": "FILE-2081-EDU-03",
            "subject": "विद्यालय भौतिक पूर्वाधार अनुदान तथा शिक्षक दरबन्दी फाइल",
            "classification": "General",
            "status": "In Progress",
            "created_by_branch": "शिक्षा, युवा तथा खेलकुद शाखा",
            "current_owner_id": "शिक्षा अधिकृत",
        },
        {
            "id": "file-health-04",
            "file_no": "FILE-2081-HEALTH-04",
            "subject": "स्वास्थ्य संस्था आधारभूत औषधि खरिद तथा कोल्डचेन उपकरण फाइल",
            "classification": "Urgent",
            "status": "In Progress",
            "created_by_branch": "स्वास्थ्य शाखा",
            "current_owner_id": "सुरेश केसी (लेखा अधिकृत)",
        },
        {
            "id": "file-admin-05",
            "file_no": "FILE-2081-ADMIN-05",
            "subject": "स्थानीय सेवा करार प्राविधिक कर्मचारी पदपूर्ति तथा म्याद नवीकरण फाइल",
            "classification": "Confidential",
            "status": "Open",
            "created_by_branch": "प्रशासन शाखा",
            "current_owner_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
        },
        {
            "id": "file-rev-06",
            "file_no": "FILE-2081-REVENUE-06",
            "subject": "स्थानीय सम्पत्ति तथा व्यवसाय कर दर पुनरावलोकन र राजस्व कार्ययोजना",
            "classification": "General",
            "status": "In Progress",
            "created_by_branch": "आर्थिक प्रशासन तथा राजस्व शाखा",
            "current_owner_id": "कमल तामाङ (राजस्व अधिकृत)",
        },
    ]

    for fd in files_data:
        existing = db.query(EOfficeFile).filter(EOfficeFile.file_no == fd["file_no"]).first()
        if not existing:
            nf = EOfficeFile(
                id=fd["id"],
                tenant_id=tenant_id,
                file_no=fd["file_no"],
                subject=fd["subject"],
                classification=fd["classification"],
                status=fd["status"],
                created_by_branch=fd["created_by_branch"],
                current_owner_id=fd["current_owner_id"],
                created_at=now - datetime.timedelta(days=45),
                updated_at=now,
            )
            db.add(nf)
        else:
            existing.current_owner_id = fd["current_owner_id"]

    db.commit()

    # Retrieve all files mapped by file_no
    all_files = {f.file_no: f for f in db.query(EOfficeFile).all()}
    print(f"  ✓ Verified {len(all_files)} E-Office files.")

    # 2. Seed File Movements (14 records)
    db.query(FileMovement).delete()

    movements_data = [
        # INFRA-01 movement cycle
        {
            "file_no": "FILE-2081-INFRA-01",
            "from_employee_id": "इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)",
            "to_employee_id": "दिलीप गिरी (योजना अधिकृत)",
            "action_requested": "Review & Approval",
            "remarks": "तिपेनी-बाँसखर्क कृषि सडक स्तरोन्नतिको विस्तृत प्राविधिक इस्टिमेट रु २५,००,०००/- स्वीकृतिको लागि पेश गर्दछु।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=20),
            "action_taken_date": now - datetime.timedelta(days=19),
        },
        {
            "file_no": "FILE-2081-INFRA-01",
            "from_employee_id": "दिलीप गिरी (योजना अधिकृत)",
            "to_employee_id": "सुरेश केसी (लेखा अधिकृत)",
            "action_requested": "Budget Assurance",
            "remarks": "वार्षिक योजना पुस्तकको सि.नं. २४ बमोजिम शीर्षक नं ३११५१ मा बजेट व्यवस्था रहेकोले वित्तीय जाँचको लागि पेश।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=18),
            "action_taken_date": now - datetime.timedelta(days=17),
        },
        {
            "file_no": "FILE-2081-INFRA-01",
            "from_employee_id": "सुरेश केसी (लेखा अधिकृत)",
            "to_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "action_requested": "Final Approval",
            "remarks": "बजेट उपशीर्षक नं ३११५१ मा रकम पर्याप्त रहेको, उपभोक्ता समितिसँग सम्झौता गर्न रायसहित पेश गर्दछु।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=16),
            "action_taken_date": now - datetime.timedelta(days=15),
        },
        {
            "file_no": "FILE-2081-INFRA-01",
            "from_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "to_employee_id": "इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)",
            "action_requested": "Implementation Order",
            "remarks": "प्रस्तावित टिप्पणी तथा सम्झौता स्वीकृत गरिएको छ। उपभोक्ता समितिसँग सम्झौता गरी कार्य प्रारम्भ गराउनुहोला।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=14),
            "action_taken_date": now - datetime.timedelta(days=13),
        },

        # DISASTER-02 movement cycle
        {
            "file_no": "FILE-2081-DISASTER-02",
            "from_employee_id": "विपद् सम्पर्क अधिकृत (विपद् शाखा)",
            "to_employee_id": "सुरेन्द्र श्रेष्ठ (वडा सचिव, वडा ३)",
            "action_requested": "Field Verification",
            "remarks": "भोताङ पहिरो प्रभावित ८ परिवारको स्थलगत मुचुल्का तथा क्षति विवरण प्रमाणित गरी पठाउनुहुन।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=12),
            "action_taken_date": now - datetime.timedelta(days=11),
        },
        {
            "file_no": "FILE-2081-DISASTER-02",
            "from_employee_id": "सुरेन्द्र श्रेष्ठ (वडा सचिव, वडा ३)",
            "to_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "action_requested": "Relief Grant Approval",
            "remarks": "वडा विपद् व्यवस्थापन समितिको सिफारिस तथा स्थलगत मुचुल्का संलग्न गरी प्रति परिवार रु २५,००० राहत निकासाका लागि पेश।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=10),
            "action_taken_date": now - datetime.timedelta(days=9),
        },
        {
            "file_no": "FILE-2081-DISASTER-02",
            "from_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "to_employee_id": "सुरेश केसी (लेखा अधिकृत)",
            "action_requested": "Payment Disbursement",
            "remarks": "गाउँ कार्यपालिका निर्णय अनुसार विपद् व्यवस्थापन कोषबाट तत्काल बैंक दाखिला गर्न स्वीकृति दिइएको छ।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=8),
            "action_taken_date": now - datetime.timedelta(days=7),
        },

        # EDU-03 movement cycle
        {
            "file_no": "FILE-2081-EDU-03",
            "from_employee_id": "शिक्षा अधिकृत (शिक्षा शाखा)",
            "to_employee_id": "दिलीप गिरी (योजना अधिकृत)",
            "action_requested": "Review & Proposal",
            "remarks": "आधारभूत विद्यालयहरूमा डिजिटल हाजिरी, शैक्षिक सामग्री तथा दिवा खाजा अनुगमन प्रतिवेदन पेश।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=6),
            "action_taken_date": now - datetime.timedelta(days=5),
        },
        {
            "file_no": "FILE-2081-EDU-03",
            "from_employee_id": "दिलीप गिरी (योजना अधिकृत)",
            "to_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "action_requested": "Decision Order",
            "remarks": "मापदण्ड पुगेका १४ विद्यालयहरूमा डिजिटल हाजिरी जडान सम्बन्धी लागत रु ४,२०,०००/- स्वीकृतिका लागि पेश।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=4),
            "action_taken_date": now - datetime.timedelta(days=3),
        },

        # HEALTH-04 movement cycle
        {
            "file_no": "FILE-2081-HEALTH-04",
            "from_employee_id": "अनिता लामा (स्वास्थ्य संयोजक)",
            "to_employee_id": "सुरेश केसी (लेखा अधिकृत)",
            "action_requested": "Procurement Verification",
            "remarks": "स्वास्थ्य चौकीहरूका लागि ९८ प्रकारका अत्यावश्यक औषधि तथा खोप कोल्डचेन बक्स खरिद दरभाउ फारम पेश।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=5),
            "action_taken_date": now - datetime.timedelta(days=4),
        },
        {
            "file_no": "FILE-2081-HEALTH-04",
            "from_employee_id": "सुरेश केसी (लेखा अधिकृत)",
            "to_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "action_requested": "Procurement Approval",
            "remarks": "औषधि खरिद ऐन बमोजिम न्यूनतम कबुल गर्ने सप्लायर्ससँग सम्झौता गर्न मनासिब देखिन्छ।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=3),
            "action_taken_date": now - datetime.timedelta(days=2),
        },

        # REVENUE-06 movement cycle
        {
            "file_no": "FILE-2081-REVENUE-06",
            "from_employee_id": "कमल तामाङ (राजस्व अधिकृत)",
            "to_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "action_requested": "Policy Approval",
            "remarks": "आर्थिक ऐन २०८१ बमोजिम व्यवसाय कर, घरबहाल कर तथा एकीकृत सम्पत्ति कर असुली कार्ययोजना पेश गरिएको।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=4),
            "action_taken_date": now - datetime.timedelta(days=3),
        },
        {
            "file_no": "FILE-2081-ADMIN-05",
            "from_employee_id": "प्रशासन अधिकृत",
            "to_employee_id": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "action_requested": "Contract Extension",
            "remarks": "कार्यसम्पादन मूल्याङ्कनमा ९०% भन्दा बढी अङ्क प्राप्त प्राविधिक कर्मचारीहरूको म्याद ६ महिना थप गर्न पेश।",
            "is_read": True,
            "dispatched_at": now - datetime.timedelta(days=2),
            "action_taken_date": now - datetime.timedelta(days=1),
        },
        {
            "file_no": "FILE-2081-INFRA-01",
            "from_employee_id": "इन्जिनियर सुजन नेपाल (पूर्वाधार शाखा)",
            "to_employee_id": "सुरेश केसी (लेखा अधिकृत)",
            "action_requested": "Running Bill Payment",
            "remarks": "पहिलो चरणको ट्र्याक खोल्ने कार्य सम्पन्न भई नापजाँच किताब (MB) सहित पहिलो रनिङ बिल पेश।",
            "is_read": False,
            "dispatched_at": now - datetime.timedelta(hours=6),
            "action_taken_date": None,
        },
    ]

    for m in movements_data:
        file_obj = all_files.get(m["file_no"])
        if file_obj:
            fm = FileMovement(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                file_id=file_obj.id,
                from_employee_id=m["from_employee_id"],
                to_employee_id=m["to_employee_id"],
                action_requested=m["action_requested"],
                remarks=m["remarks"],
                is_read=m["is_read"],
                action_taken_date=m["action_taken_date"],
                dispatched_at=m["dispatched_at"],
            )
            db.add(fm)

    db.commit()
    print("  ✓ Seeded 14 E-Office file movement records in eoffice_file_movements.")

    # 3. Seed Digital Signatures (8 records)
    db.query(DigitalSignature).delete()

    # Fetch tippanis to link
    tippanis = db.query(Tippani).all()
    print(f"  Found {len(tippanis)} existing tippanis for digital signature linking.")

    signatures_data = [
        {
            "document_id": tippanis[0].id if len(tippanis) > 0 else "tip-infra-01",
            "document_type": "TIPPANI",
            "signed_by": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "cert_thumbprint": "7C:4E:91:2B:A3:F8:50:DE:1C:89:D2:04:1E:55:7A:BC:33:91:EA:02",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYY29udGVudF9oYXNoX3N1amFuX25lcGFsX3RpcHBlbmktYmFuc2toYXJrYV9hZ3JpX3JvYWRfc2FuY3Rpb25lZF9hY2NvcmRpbmdfdG9fbG9jYWxfZ292ZXJubWVudF9vcGVyYXRpb25fYWN0XzIwNzRfcGFuY2hwb2toYXJp",
            "signed_at": now - datetime.timedelta(days=14),
        },
        {
            "document_id": tippanis[0].id if len(tippanis) > 0 else "tip-infra-01",
            "document_type": "TIPPANI",
            "signed_by": "सुरेश केसी (लेखा अधिकृत)",
            "cert_thumbprint": "3D:2A:8C:F1:10:E4:77:9B:AA:5C:80:61:9F:44:22:DE:09:12:34:56",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYYWNjX29mZmljZXJfc3VyZXNoX2ZpbmFuY2lhbF92ZXJpZmljYXRpb25fc3VjY2Vzc2Z1bF9idWRnZXRfc3ViX2hlYWRfMzExNTFfcGFuY2hwb2toYXJpX3RoYW5ncGFsXzIwODE=",
            "signed_at": now - datetime.timedelta(days=15),
        },
        {
            "document_id": tippanis[1].id if len(tippanis) > 1 else "tip-disaster-02",
            "document_type": "TIPPANI",
            "signed_by": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "cert_thumbprint": "7C:4E:91:2B:A3:F8:50:DE:1C:89:D2:04:1E:55:7A:BC:33:91:EA:02",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYYmhvdGFuZ19sYW5kc2xpZGVfcmVsaWVmX2Rpc2J1cnNlbWVudF9hcHByb3ZlZF9yYXN1dGFfcGFsaWthX2RlY2lzaW9uX25vXzE0XzIwODFfc2luZGh1cGFsY2hvaw==",
            "signed_at": now - datetime.timedelta(days=8),
        },
        {
            "document_id": tippanis[3].id if len(tippanis) > 3 else "tip-mela-04",
            "document_type": "TIPPANI",
            "signed_by": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "cert_thumbprint": "7C:4E:91:2B:A3:F8:50:DE:1C:89:D2:04:1E:55:7A:BC:33:91:EA:02",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYcGFuY2hwb2toYXJpX2phbmFpX3B1cm5pbWFfbWVsYV9zZWN1cml0eV92b2x1bnRlZXJfbW9iaWxpemF0aW9uX2RlY2lzaW9uXzIwODFfcGFsaWthX3RoYW5ncGFs",
            "signed_at": now - datetime.timedelta(days=12),
        },
        {
            "document_id": all_files["FILE-2081-INFRA-01"].id,
            "document_type": "FILE",
            "signed_by": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "cert_thumbprint": "7C:4E:91:2B:A3:F8:50:DE:1C:89:D2:04:1E:55:7A:BC:33:91:EA:02",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYZmlsZV9pbmZyYV8wMV9hbm51YWxfcHJvamVjdF9kb3NzaWVyX2Z1bGx5X2F1dGhlbnRpY2F0ZWRfcGFuY2hwb2toYXJpX3J1cmFsX211bmljaXBhbGl0eV9iYWdtYXRp",
            "signed_at": now - datetime.timedelta(days=14),
        },
        {
            "document_id": all_files["FILE-2081-DISASTER-02"].id,
            "document_type": "FILE",
            "signed_by": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "cert_thumbprint": "7C:4E:91:2B:A3:F8:50:DE:1C:89:D2:04:1E:55:7A:BC:33:91:EA:02",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYZGlzYXN0ZXJfcmVzcG9uc2Vfc2FjdGlvbl9yZWxpZWZfZG9zc2llcl9zaWduZWRfcGFuY2hwb2toYXJpX2Rycg==",
            "signed_at": now - datetime.timedelta(days=7),
        },
        {
            "document_id": "CH-2081-0891",
            "document_type": "CHALANI",
            "signed_by": "सुरेन्द्र श्रेष्ठ (वडा सचिव)",
            "cert_thumbprint": "4B:6C:1D:9E:00:88:51:F2:7A:3C:99:EE:22:11:00:FF:88:77:66:55",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYY2hhbGFuaV9kaXNwYXRjaF8yMDgxXzA4OTFfb2ZmaWNpYWxfbGV0dGVyX2F1dGhvcml6ZWRfd2FyZF8wM19iaG90YW5n",
            "signed_at": now - datetime.timedelta(days=5),
        },
        {
            "document_id": "CH-2081-0892",
            "document_type": "CHALANI",
            "signed_by": "राजन घिमिरे (प्रमुख प्रशासकीय अधिकृत)",
            "cert_thumbprint": "7C:4E:91:2B:A3:F8:50:DE:1C:89:D2:04:1E:55:7A:BC:33:91:EA:02",
            "signature_payload": "MIIEYgYJKoZIhvcNAQcCoIIEUzCCBE8CAQExDzANBglghkgBZQMEAgEFADCBqQYJKoZIhvcNAQcBoIGbBIGYY2hhbGFuaV9kaXNwYXRjaF8yMDgxXzA4OTJfcGFsaWthX2V4ZWN1dGl2ZV9kZWNpc2lvbl9tb3VfYWdyZWVlbnRz",
            "signed_at": now - datetime.timedelta(days=3),
        },
    ]

    for sig in signatures_data:
        ds = DigitalSignature(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            document_id=sig["document_id"],
            document_type=sig["document_type"],
            signed_by=sig["signed_by"],
            cert_thumbprint=sig["cert_thumbprint"],
            signature_payload=sig["signature_payload"],
            signed_at=sig["signed_at"],
        )
        db.add(ds)

    db.commit()
    print("  ✓ Seeded 8 E-Office cryptographic digital signatures in eoffice_digital_signatures.")

    db.close()
    print("🎉 Option 31 Seeding Successfully Completed!")

if __name__ == "__main__":
    seed_eoffice()
