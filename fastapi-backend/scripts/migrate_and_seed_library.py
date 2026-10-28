import psycopg
import uuid
from datetime import datetime

DATABASE_URL = "postgresql://p5admin:P5_Prod_Secure_Passwd_2026!@localhost:5432/municipal_twin_db"

def main():
    conn = psycopg.connect(DATABASE_URL)
    cur = conn.cursor()

    print("1. Migrating legacy NULL tenant_id to 'panchpokhari'...")
    cur.execute("UPDATE library_books SET tenant_id = 'panchpokhari' WHERE tenant_id IS NULL")
    updated_books = cur.rowcount
    cur.execute("UPDATE library_borrow_records SET tenant_id = 'panchpokhari' WHERE tenant_id IS NULL")
    updated_borrows = cur.rowcount
    print(f"Updated {updated_books} books and {updated_borrows} borrow records.")

    print("\n2. Checking existing books for 'khadadevi'...")
    cur.execute("SELECT count(*) FROM library_books WHERE tenant_id IN ('khadadevi', 'khandadevi', '94bf02d3-9c23-4d84-a346-6461f414bcda')")
    khadadevi_count = cur.fetchone()[0]
    print(f"Current khadadevi books count: {khadadevi_count}")

    if khadadevi_count == 0:
        print("Seeding books for खाँडादेवी गाउँपालिका...")
        khadadevi_books = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0001",
                "isbn": "978-9937-0-1011-1",
                "title": "हाम्रो खाँडादेवी — स्थानीय पाठ्यक्रम तथा सन्दर्भ सामग्री (कक्षा १-८)",
                "author": "खाँडादेवी गाउँपालिका शिक्षा, युवा तथा खेलकुद शाखा",
                "publisher": "खाँडादेवी गाउँपालिका कार्यपालिकाको कार्यालय, रामेछाप",
                "publicationYear": "२०८०",
                "edition": "दोस्रो",
                "language": "नेपाली",
                "category": "पाठ्यपुस्तक तथा शिक्षा",
                "subject": "स्थानीय पाठ्यक्रम र सामान्य ज्ञान",
                "mediaType": "ebook",
                "totalCopies": 25,
                "availableCopies": 25,
                "rackNo": "R-EDU-01",
                "shelfNo": "S-1",
                "physicalLocation": "केन्द्रीय पुस्तकालय, खाँडादेवी ३",
                "isAvailablePhysical": True,
                "borrowStatus": "available",
                "pages": 198,
                "coverUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
                "digitalFileUrl": "https://raw.githubusercontent.com/narayanpmai/sample-docs/main/khandadevi_curriculum.pdf",
                "summary": "खाँडादेवी गाउँपालिकाको भूगोल, संस्कृति, प्राकृतिक स्रोत, ऐतिहासिक सम्पदा र जीवनशैलीसम्बन्धी स्थानीय पाठ्यक्रम सन्दर्भ सामग्री।",
                "keywords": "खाँडादेवी, स्थानीय पाठ्यक्रम, शिक्षा, रामेछाप, पाठ्यपुस्तक",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0002",
                "isbn": "978-9937-0-1012-8",
                "title": "खाँडादेवी मन्दिर: ऐतिहासिक, धार्मिक तथा पुरातात्विक अध्ययन",
                "author": "डा. विद्यानाथ कोइराला / डा. हरिराम जोशी",
                "publisher": "खाँडादेवी सम्पदा संरक्षण प्रतिष्ठान",
                "publicationYear": "२०७९",
                "edition": "पहिलो",
                "language": "नेपाली",
                "category": "इतिहास तथा संस्कृति",
                "subject": "ऐतिहासिक सम्पदा तथा धार्मिक पर्यटन",
                "mediaType": "physical",
                "totalCopies": 10,
                "availableCopies": 9,
                "rackNo": "R-HIS-02",
                "shelfNo": "S-2",
                "physicalLocation": "ऐतिहासिक सम्पदा कक्ष, खाँडादेवी",
                "isAvailablePhysical": True,
                "borrowStatus": "available",
                "pages": 240,
                "coverUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
                "digitalFileUrl": "",
                "summary": "प्रसिद्ध शक्तिपीठ खाँडादेवी मन्दिरको उत्पत्ति, ऐतिहासिक प्रमाण, मन्दिर निर्माण, जात्रा तथा पुरातात्विक महत्वको विशद अध्ययन।",
                "keywords": "खाँडादेवी मन्दिर, शक्तिपीठ, रामेछाप, इतिहास, सम्पदा",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0003",
                "isbn": "978-9937-0-1013-5",
                "title": "खाँडादेवी गाउँपालिका वस्तुगत विवरण तथा डिजिटल पार्श्वचित्र २०८०/८१",
                "author": "योजना, अनुगमन तथा तथ्याङ्क शाखा",
                "publisher": "गाउँ कार्यपालिकाको कार्यालय, खाँडादेवी, रामेछाप",
                "publicationYear": "२०८१",
                "edition": "आर्थिक वर्ष २०८०/८१",
                "language": "नेपाली",
                "category": "कानुन तथा स्थानीय शासन",
                "subject": "तथ्याङ्क तथा पार्श्वचित्र",
                "mediaType": "ebook",
                "totalCopies": 50,
                "availableCopies": 50,
                "rackNo": "R-DOC-01",
                "shelfNo": "S-3",
                "physicalLocation": "डिजिटल अर्काइभ तथा तथ्याङ्क कक्ष",
                "isAvailablePhysical": True,
                "borrowStatus": "available",
                "pages": 310,
                "coverUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80",
                "digitalFileUrl": "https://raw.githubusercontent.com/narayanpmai/sample-docs/main/khandadevi_profile.pdf",
                "summary": "खाँडादेवी गाउँपालिकाको समग्र सामाजिक, आर्थिक, भौतिक पूर्वाधार, शिक्षा, स्वास्थ्य, कृषि तथा पर्यटनसम्बन्धी अध्यावधिक तथ्याङ्क पुस्तक।",
                "keywords": "वस्तुगत विवरण, तथ्याङ्क, खाँडादेवी, पार्श्वचित्र, विकास",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0004",
                "isbn": "978-9937-0-1014-2",
                "title": "रामेछाप र सुनकोशी जलाधार: कृषि, सुन्तला-जुनार तथा जडीबुटी खेती हातेपुस्तिका",
                "author": "कृषि विकास महाशाखा",
                "publisher": "खाँडादेवी कृषि शाखा तथा बागमती प्रदेश कृषि मन्त्रालय",
                "publicationYear": "२०८०",
                "edition": "पहिलो",
                "language": "नेपाली",
                "category": "कृषि, प्रविधि तथा सीप",
                "subject": "फलफूल खेती तथा व्यावसायिक कृषि",
                "mediaType": "ebook",
                "totalCopies": 15,
                "availableCopies": 15,
                "rackNo": "R-AGR-01",
                "shelfNo": "S-2",
                "physicalLocation": "कृषि शाखा पुस्तकालय",
                "isAvailablePhysical": True,
                "borrowStatus": "available",
                "pages": 164,
                "coverUrl": "https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=80",
                "digitalFileUrl": "",
                "summary": "खाँडादेवी क्षेत्रमा उपयुक्त हुने जुनार, सुन्तला, कागती र व्यवसायिक बाख्रापालन तथा बेमौसमी तरकारी खेती प्रविधि।",
                "keywords": "कृषि, सुन्तला खेती, जुनार, बाख्रापालन, खाँडादेवी",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0005",
                "isbn": "978-9937-0-1015-9",
                "title": "तामाङ र माझी जातिको लोकसंस्कृति र गाल्पा-माकादुमका लोकगीत (अडियो संग्रह)",
                "author": "सांस्कृतिक अनुसन्धान समाज, रामेछाप",
                "publisher": "खाँडादेवी प्रज्ञा समाज",
                "publicationYear": "२०८१",
                "edition": "डिजिटल अडियो संस्करण",
                "language": "नेपाली",
                "category": "इतिहास तथा संस्कृति",
                "subject": "लोकसंस्कृति र अडियो अभिलेख",
                "mediaType": "audiobook",
                "totalCopies": 100,
                "availableCopies": 100,
                "rackNo": "AUD-01",
                "shelfNo": "A-1",
                "physicalLocation": "डिजिटल अडियो/भिडियो कक्ष",
                "isAvailablePhysical": False,
                "borrowStatus": "available",
                "pages": 0,
                "audioUrl": "https://assets.mixkit.co/music/preview/mixkit-acoustic-guitar-chill-161.mp3",
                "audioDuration": "४५ मिनेट",
                "coverUrl": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
                "summary": "खाँडादेवी गाउँपालिका क्षेत्रमा बसोबास गर्ने माझी र तामाङ समुदायका मौलिक लोकगीत, सेलो, फापरे तथा भाकाहरूको अडियो संग्रह।",
                "keywords": "अडियोबुक, माझी जाति, तामाङ सेलो, लोकगीत, संस्कृति",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0006",
                "isbn": "978-9937-0-1016-6",
                "title": "खाँडादेवी गाउँपालिकाका ऐन, कानुन, निर्देशिका तथा कार्यविधि सङ्ग्रह २०८१",
                "author": "कानुन तथा न्याय शाखा",
                "publisher": "खाँडादेवी गाउँपालिका, रामेछाप",
                "publicationYear": "२०८१",
                "edition": "अद्यावधिक तेस्रो संस्करण",
                "language": "नेपाली",
                "category": "कानुन तथा स्थानीय शासन",
                "subject": "स्थानीय ऐन तथा कार्यविधि",
                "mediaType": "ebook",
                "totalCopies": 20,
                "availableCopies": 20,
                "rackNo": "R-LAW-01",
                "shelfNo": "S-1",
                "physicalLocation": "कानुनी पुस्तकालय कक्ष",
                "isAvailablePhysical": True,
                "borrowStatus": "available",
                "pages": 380,
                "coverUrl": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80",
                "digitalFileUrl": "",
                "summary": "स्थानीय राजपत्रमा प्रकाशित गाउँसभाबाट पारित सम्पूर्ण स्थानीय ऐन, कार्यविधि, नियमावली र मापदण्डहरूको आधिकारिक सङ्ग्रह।",
                "keywords": "ऐन, कानुन, राजपत्र, खाँडादेवी, कार्यविधि",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0007",
                "isbn": "978-9937-0-1017-3",
                "title": "डिजिटल साक्षरता तथा ई-सेवा प्रयोग निर्देशिका (भिडियो ई-कक्षा)",
                "author": "सूचना प्रविधि शाखा, खाँडादेवी गाउँपालिका",
                "publisher": "खाँडादेवी गाउँपालिका",
                "publicationYear": "२०८१",
                "edition": "भिडियो ट्युटोरियल",
                "language": "नेपाली",
                "category": "कृषि, प्रविधि तथा सीप",
                "subject": "सूचना प्रविधि र डिजिटल ई-कक्षा",
                "mediaType": "videobook",
                "totalCopies": 50,
                "availableCopies": 50,
                "rackNo": "VID-01",
                "shelfNo": "V-1",
                "physicalLocation": "डिजिटल सिकाई केन्द्र",
                "isAvailablePhysical": False,
                "borrowStatus": "available",
                "pages": 0,
                "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "videoDuration": "२५ मिनेट",
                "coverUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
                "summary": "नागरिकहरूलाई अनलाइन सिफारिस, राजस्व भुक्तानी र डिजिटल नागरिक बडापत्र प्रयोग गर्न सिकाउने दृश्यकक्षा।",
                "keywords": "भिडियो ई-कक्षा, डिजिटल साक्षरता, ई-सेवा, खाँडादेवी",
                "verificationStatus": "Published",
                "copyrightStatus": "Municipality Owned"
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": "khadadevi",
                "bookId": "KHD-LIB-0008",
                "isbn": "978-9937-0-1018-0",
                "title": "सिक्ने र रमाउने बाल कथामाला (चित्रकथा सङ्ग्रह)",
                "author": "शान्ता सुवेदी / रमेश विकल",
                "publisher": "बाल साहित्य समाज",
                "publicationYear": "२०८०",
                "edition": "पहिलो",
                "language": "नेपाली",
                "category": "बालबालिका",
                "subject": "सचित्र बाल साहित्य तथा नैतिक कथा",
                "mediaType": "physical",
                "totalCopies": 12,
                "availableCopies": 11,
                "rackNo": "R-KID-01",
                "shelfNo": "S-1",
                "physicalLocation": "बाल कुना, केन्द्रीय पुस्तकालय",
                "isAvailablePhysical": True,
                "borrowStatus": "available",
                "pages": 88,
                "coverUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
                "digitalFileUrl": "",
                "summary": "बालबालिकाहरूका लागि नैतिक शिक्षा, वातावरण माया र सहकार्य सिकाउने रंगीन चित्रकथाहरूको संग्रह।",
                "keywords": "बाल कथा, चित्रकथा, बालबालिका, शिक्षा, खाँडादेवी",
                "verificationStatus": "Published",
                "copyrightStatus": "Public Domain"
            }
        ]

        insert_sql = """
            INSERT INTO library_books (
                id, tenant_id, "bookId", isbn, title, author, publisher, "publicationYear",
                edition, language, category, subject, "mediaType", "totalCopies", "availableCopies",
                "rackNo", "shelfNo", "physicalLocation", "isAvailablePhysical", "borrowStatus",
                pages, "coverUrl", "digitalFileUrl", "audioUrl", "audioDuration", "videoUrl",
                "videoDuration", "copyrightStatus", summary, keywords, "verificationStatus",
                "createdAt", "updatedAt"
            ) VALUES (
                %(id)s, %(tenant_id)s, %(bookId)s, %(isbn)s, %(title)s, %(author)s, %(publisher)s, %(publicationYear)s,
                %(edition)s, %(language)s, %(category)s, %(subject)s, %(mediaType)s, %(totalCopies)s, %(availableCopies)s,
                %(rackNo)s, %(shelfNo)s, %(physicalLocation)s, %(isAvailablePhysical)s, %(borrowStatus)s,
                %(pages)s, %(coverUrl)s, %(digitalFileUrl)s, %(audioUrl)s, %(audioDuration)s, %(videoUrl)s,
                %(videoDuration)s, %(copyrightStatus)s, %(summary)s, %(keywords)s, %(verificationStatus)s,
                NOW(), NOW()
            )
        """
        for b in khadadevi_books:
            b.setdefault("digitalFileUrl", None)
            b.setdefault("audioUrl", None)
            b.setdefault("audioDuration", None)
            b.setdefault("videoUrl", None)
            b.setdefault("videoDuration", None)
            cur.execute(insert_sql, b)
        print(f"Inserted {len(khadadevi_books)} books for खाँडादेवी.")

    conn.commit()

    print("\n3. Current breakdown of library_books:")
    cur.execute("SELECT tenant_id, count(*) FROM library_books GROUP BY tenant_id")
    for row in cur.fetchall():
        print(f"Tenant: {row[0]} -> {row[1]} books")

    conn.close()

if __name__ == "__main__":
    main()
