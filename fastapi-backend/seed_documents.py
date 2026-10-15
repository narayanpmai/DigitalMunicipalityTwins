import uuid
from datetime import datetime
from core.database import SessionLocal
from models.document import DocumentArchive

DOCS = [
    {
        "title": "पाँचपोखरी थाङपाल गाउँ कार्यपालिका कार्यसम्पादन नियमावली, २०७४",
        "fiscal_year": "२०८०/०८१",
        "file_name": "panchpokhari_karyabidhi_2074.pdf",
        "file_url": "/uploads/documents/panchpokhari_karyabidhi_2074.pdf"
    },
    {
        "title": "पाँचपोखरी थाङपाल गाउँपालिकाको आर्थिक ऐन, २०८१",
        "fiscal_year": "२०८१/०८२",
        "file_name": "arthik_ain_2081.pdf",
        "file_url": "/uploads/documents/arthik_ain_2081.pdf"
    },
    {
        "title": "गाउँपालिकाको विनियोजन ऐन तथा बजेट वक्तव्य, २०८१",
        "fiscal_year": "२०८१/०८२",
        "file_name": "biniyojan_ain_2081.pdf",
        "file_url": "/uploads/documents/biniyojan_ain_2081.pdf"
    },
    {
        "title": "स्थानीय शिक्षा ऐन तथा विद्यालय व्यवस्थापन निर्देशिका, २०७८",
        "fiscal_year": "२०७९/०८०",
        "file_name": "shiksha_nirdeshika_2078.pdf",
        "file_url": "/uploads/documents/shiksha_nirdeshika_2078.pdf"
    },
    {
        "title": "विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन ऐन, २०७६",
        "fiscal_year": "२०७९/०८०",
        "file_name": "bipad_ain_2076.pdf",
        "file_url": "/uploads/documents/bipad_ain_2076.pdf"
    },
    {
        "title": "स्थानीय वातावरण तथा प्राकृतिक स्रोत संरक्षण ऐन, २०७९",
        "fiscal_year": "२०८०/०८१",
        "file_name": "batabaran_ain_2079.pdf",
        "file_url": "/uploads/documents/batabaran_ain_2079.pdf"
    }
]

def seed():
    db = SessionLocal()
    try:
        for d in DOCS:
            existing = db.query(DocumentArchive).filter(DocumentArchive.title == d["title"]).first()
            if not existing:
                doc = DocumentArchive(
                    id=uuid.uuid4(),
                    title=d["title"],
                    fiscal_year=d["fiscal_year"],
                    file_name=d["file_name"],
                    file_url=d["file_url"],
                    status="Verified",
                    uploaded_at=datetime.utcnow()
                )
                db.add(doc)
        db.commit()
        print("Successfully seeded municipal legal documents!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
