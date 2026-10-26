from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
from sqlalchemy.orm import Session
from typing import Optional, Any, List
from core.database import get_db
from models.municipality import MunicipalityProfile, SectorProfile
from models.representative import Representative
from schemas.municipality import (
    MunicipalityProfileSchema, MunicipalityProfileUpdate,
    SectorProfileSchema, SectorProfileCreate, SectorProfileUpdate
)
import uuid

router = APIRouter(
    prefix="/api/v1/municipality",
    tags=["Municipality (पालिका प्रोफाइल तथा क्षेत्र)"]
)

# ─── Default seed data ──────────────────────────────────────────────────────

DEFAULT_BOUNDARIES = {
    "east": "जुगल गाउँपालिका",
    "west": "हेलम्बु गाउँपालिका",
    "north": "रसुवा जिल्ला तथा चीनको तिब्बत स्वायत्त क्षेत्र",
    "south": "मेलम्ची नगरपालिका",
}

DEFAULT_CULTURAL_IDENTITY = [
    {
        "title": "पवित्र पाँचपोखरी कुण्ड (४,१०० मी.)",
        "desc": "विश्वकै ९औँ उच्च स्थानमा रहेको रामसार सिमसार क्षेत्र, जहाँ जनैपूर्णिमाका दिन विशाल धार्मिक मेला लाग्दछ।",
        "icon": "waves",
        "color": "#059669",
    },
    {
        "title": "आमा याङ्ग्री तथा ह्योल्मो संस्कृति",
        "desc": "ह्योल्मो, तामाङ र नेवार जातिको मौलिक संस्कृति, परम्परागत गुम्बा, माने र पदमार्ग पर्यटनको केन्द्रबिन्दु।",
        "icon": "mountain",
        "color": "#1e40af",
    },
    {
        "title": "अर्गानिक कृषि तथा ट्राउट मत्स्य",
        "desc": "हिमाली रातो आलु, किवी फल, अर्गानिक अलैंची, रेन्बो ट्राउट र चौँरी घ्यूको प्रसिद्ध उद्गम स्थल।",
        "icon": "apple",
        "color": "#9d174d",
    },
]

DEFAULT_GOOD_PRACTICES = [
    {"title": "पेपरलेस वडा कार्यालय", "desc": "सबै वडामा अनलाइन सेवा र डिजिटल दर्ता प्रणाली लागू।"},
    {"title": "पर्यटन रोयल्टी बाँडफाँड", "desc": "स्थानीय समुदायलाई पर्यटनबाट भएको आम्दानीको प्रत्यक्ष लाभ।"},
    {"title": "स्मार्ट विद्यालय", "desc": "आधारभूत विद्यालयहरूमा डिजिटल लर्निङ सेन्टर स्थापना।"},
]

DEFAULT_SECTORS = [
    {
        "sector_name": "Education",
        "description": "पाँचपोखरी थाङपाल गाउँपालिकामा आधारभूतदेखि माध्यमिक तहसम्मका विद्यालयहरू सञ्चालनमा छन्।",
        "stats": {"schools": 42, "students": 4850, "teachers": 215},
        "highlights": ["सबै वडामा आधारभूत विद्यालय", "बालमैत्री शिक्षण सिकाइ"],
    },
    {
        "sector_name": "Health",
        "description": "नागरिकलाई सर्वसुलभ स्वास्थ्य सेवा प्रदान गर्न स्वास्थ्य चौकीहरू स्थापना गरिएका छन्।",
        "stats": {"healthPosts": 8, "clinics": 4, "ambulances": 2},
        "highlights": ["आधारभूत स्वास्थ्य सेवामा सबैको पहुँच", "मातृशिशु सुरक्षा कार्यक्रम"],
    },
    {
        "sector_name": "Tourism",
        "description": "पाँचपोखरी ताल, आमायाङ्ग्री र अन्य प्राकृतिक तथा सांस्कृतिक सम्पदाले भरिपूर्ण।",
        "stats": {"majorSites": 12, "hotels": 25, "annualTourists": 15000},
        "highlights": ["पाँचपोखरी पदमार्ग", "पर्यटन प्रवर्द्धन कार्यक्रम"],
    },
]

# ─── Helper functions ────────────────────────────────────────────────────────

DEFAULT_DEMOGRAPHICS = {
    "totalPopulation": 20540,
    "male": 9950,
    "female": 10590,
    "households": 5805,
    "totalGpsHouses": 5357,
    "highRiskHouses": 142,
    "literacyRate": 72.4,
    "maleLiteracyRate": 78.5,
    "femaleLiteracyRate": 66.2,
    "economicallyActive": 8200,
    "participationRate": 68.0,
    "abroad": 1840,
    "averageFamilySize": 3.54,
    "sexRatio": 93.5,
    "density": 109.7,
}

def seed_panchpokhari_profile(db: Session) -> MunicipalityProfile:
    profile = MunicipalityProfile(
        id=str(uuid.uuid4()),
        tenant_id="panchpokhari",
        name_np="पाँचपोखरी थाङपाल गाउँपालिका",
        name_en="Panchpokhari Thangpal Rural Municipality",
        district="सिन्धुपाल्चोक",
        province="बागमती प्रदेश",
        type="गाउँपालिका",
        headquarters="थाङपालधाप",
        area_sq_km=187.29,
        ward_count=8,
        elevation_meters="१,१०० - ४,१०० मी.",
        introduction=(
            "पाँचपोखरी थाङपाल गाउँपालिका नेपालको बागमती प्रदेश अन्तर्गत सिन्धुपाल्चोक जिल्लाको "
            "उत्तर-पश्चिम भेगमा अवस्थित उच्च हिमाली तथा पहाडी भू-भाग ओगटेको एक प्राकृतिक, "
            "पर्यटकीय तथा सांस्कृतिक सम्पदाले भरिपूर्ण पालिका हो।"
        ),
        total_population=20540,
        total_households=5805,
        total_schools=42,
        total_health_posts=8,
        geography="पहाडी तथा हिमाली भूभाग",
        major_rivers="इन्द्रावती, मेलम्ची",
        major_religious_sites="पाँचपोखरी, आमायाङ्ग्री, चण्डेश्वरी",
        major_tourist_sites="पाँचपोखरी ताल, थाङपाल भञ्ज्याङ, हवेली",
        annual_budget="रु. ५८.४५ करोड",
        internal_revenue="रु. २.८ करोड",
        boundaries=DEFAULT_BOUNDARIES,
        cultural_identity=DEFAULT_CULTURAL_IDENTITY,
        good_practices=DEFAULT_GOOD_PRACTICES,
        demographics=DEFAULT_DEMOGRAPHICS,
        ai_summary=(
            "पाँचपोखरी थाङपाल गाउँपालिका पर्यटन, कृषि र जलस्रोतमा प्रचुर सम्भावना भएको पालिका हो। "
            "यसले भौतिक पूर्वाधारसँगै शिक्षा र स्वास्थ्यलाई प्राथमिकतामा राखेर दिगो विकासको अभ्यास गरिरहेको छ।"
        ),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def seed_profile_if_empty(db: Session, tenant_id: Optional[str] = None) -> MunicipalityProfile:
    eff_tenant = (tenant_id or "").strip().lower() if tenant_id else ""
    
    # If looking for panchpokhari or default
    if not eff_tenant or eff_tenant in ["panchpokhari", "default", "localhost", "all", "digitaltwin", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"]:
        profile = db.query(MunicipalityProfile).filter(
            (MunicipalityProfile.tenant_id == "panchpokhari") | (MunicipalityProfile.tenant_id == None)
        ).first()
        if not profile:
            profile = db.query(MunicipalityProfile).first()
        if not profile:
            profile = seed_panchpokhari_profile(db)
        elif profile.demographics is None:
            profile.demographics = DEFAULT_DEMOGRAPHICS
            db.commit()
            db.refresh(profile)
        return profile

    # Look up Tenant first
    from models.tenant import Tenant
    tenant = db.query(Tenant).filter(
        (Tenant.subdomain == eff_tenant) | (Tenant.id == eff_tenant)
    ).first()

    tenant_keys = [eff_tenant]
    if tenant:
        tenant_keys.extend([str(tenant.id), tenant.subdomain.lower()])

    profile = db.query(MunicipalityProfile).filter(
        (MunicipalityProfile.tenant_id.in_(tenant_keys)) | (MunicipalityProfile.id == eff_tenant)
    ).first()

    if profile:
        return profile

    if tenant:
        clean_np = tenant.name_np
        clean_en = tenant.name_en or eff_tenant.title()
        palika_type = "गाउँपालिका" if "गाउँपालिका" in clean_np else "नगरपालिका"

        if eff_tenant in ["gaushala", "gaushalamun", "gaushala_municipality"]:
            clean_np = "गौशाला नगरपालिका"
            clean_en = "Gaushala Municipality"
            dist_val = "महोत्तरी"
            prov_val = "मधेश प्रदेश"
            palika_type = "नगरपालिका"
            hq_val = "गौशाला बजार, महोत्तरी"
            wards_val = 12
            area_val = 144.73
            elev_val = "६१ मी. देखि १५० मी."
            pop_val = 72481
            hh_val = 14446
            schools_val = 58
            hp_val = 14
            geog_val = "महोत्तरी जिल्लाको मध्य-पश्चिम उर्वर तराई-मधेश भूभाग, मरहा र रातो नदी जलाधार"
            rivers_val = "मरहा नदी, रातो नदी, बडहरी खोला"
            relig_val = "गौशाला शिव मन्दिर, दुर्गा मन्दिर, रामजानकी मन्दिर, मदिना मस्जिद, विभिन्न वडाका ऐतिहासिक धार्मिक स्थलहरू"
            tourist_val = "गौशाला बजार, एभरेष्ट सुगर एण्ड केमिकल इन्डस्ट्रिज (चिनी मिल), निगौल गाई फार्म, रामनगर, कान्तिबजार, त्रिभुवन"
            bound_val = {
                "east": "औरही नगरपालिका तथा भंगाहा नगरपालिका",
                "west": "सर्लाही जिल्ला (ईश्वरपुर नगरपालिका)",
                "north": "बर्दिबास नगरपालिका",
                "south": "सम्सी गाउँपालिका तथा सोनमा गाउँपालिका"
            }
            demo_val = {
                "totalPopulation": 72481,
                "male": 36250,
                "female": 36231,
                "households": 14446,
                "totalGpsHouses": 13950,
                "highRiskHouses": 120,
                "literacyRate": 60.97,
                "maleLiteracyRate": 68.8,
                "femaleLiteracyRate": 53.1,
                "averageFamilySize": 5.02,
                "sexRatio": 100.05,
                "density": 500.8,
                "growthRate": 1.63,
                "economicallyActive": 28450,
                "participationRate": 62.4,
                "abroad": 4820
            }
            budget_val = "रु. ७४.५० करोड"
            rev_val = "रु. ४.२० करोड"
        elif eff_tenant in ["khadadevi", "khandadevi"]:
            dist_val = "रामेछाप"
            prov_val = "बागमती प्रदेश"
            hq_val = "माकादुम, रामेछाप"
            wards_val = 9
            area_val = 150.07
            elev_val = "४६५ मी. देखि १,९८५ मी."
            pop_val = 19312
            hh_val = 5501
            schools_val = 42
            hp_val = 9
            geog_val = "रामेछाप जिल्लाको दक्षिण-पश्चिमी पहाडी तथा सुनकोशी र तामाकोशी नदी तटीय भूभाग"
            rivers_val = "सुनकोशी नदी, तामाकोशी नदी, दुर्गा नदी, स्थानीय खोलाहरू"
            relig_val = "ऐतिहासिक खाँडादेवी मन्दिर (शक्तिपीठ), विश्वामित्र गुफा, अग्लेश्वर महादेव, कुशेश्वर महादेव, मुकुटेश्वरी, सहस्रधारा"
            tourist_val = "खाँडादेवी कोट/मन्दिर (१९८५ मी.), सित्खा झोलुङ्गे पुल, सुनकोशी रिभर बीच, अग्लेश्वर डाँडा, गागल भ्यु-पोइन्ट"
            bound_val = {
                "east": "मन्थली नगरपालिका (सदरमुकाम)",
                "west": "सुनापति गाउँपालिका र काभ्रेपलाञ्चोक जिल्ला",
                "north": "दोरम्बा गाउँपालिका र सुनापति गाउँपालिका",
                "south": "सिन्धुली जिल्ला (सुनकोशी नदी सिमाना)"
            }
            demo_val = {
                "totalPopulation": 19312,
                "male": 8995,
                "female": 10317,
                "households": 5501,
                "totalGpsHouses": 5420,
                "highRiskHouses": 68,
                "literacyRate": 62.2,
                "maleLiteracyRate": 72.2,
                "femaleLiteracyRate": 53.5,
                "averageFamilySize": 3.51,
                "sexRatio": 87.19,
                "density": 128.0,
                "growthRate": -2.77,
                "economicallyActive": 8450,
                "participationRate": 65.5,
                "abroad": 1280
            }
            budget_val = "रु. ४८.६० करोड"
            rev_val = "रु. १.९५ करोड"
        else:
            dist_val = "सिन्धुपाल्चोक"
            prov_val = "बागमती प्रदेश"
            hq_val = f"{clean_np} केन्द्र"
            wards_val = 8
            area_val = 154.25
            elev_val = "५५० मी. देखि २,६०० मी."
            pop_val = 24500
            hh_val = 5600
            schools_val = 32
            hp_val = 8
            geog_val = "पहाडी तथा नदी तटीय भूभाग"
            rivers_val = "स्थानीय नदी, खोलानाला तथा जलाधार"
            relig_val = f"{clean_np} क्षेत्रका ऐतिहासिक धार्मिक स्थलहरू"
            tourist_val = f"{clean_np} पदमार्ग तथा पर्यटकीय गन्तव्यहरू"
            bound_val = DEFAULT_BOUNDARIES
            demo_val = DEFAULT_DEMOGRAPHICS
            budget_val = "रु. ५२.३० करोड"
            rev_val = "रु. २.१५ करोड"

        profile = MunicipalityProfile(
            id=str(uuid.uuid4()),
            tenant_id=tenant.subdomain,
            name_np=clean_np,
            name_en=clean_en,
            district=dist_val,
            province=prov_val,
            type=palika_type,
            headquarters=hq_val,
            ward_count=wards_val,
            area_sq_km=area_val,
            elevation_meters=elev_val,
            introduction=(
                f"{clean_np} नेपालको {prov_val} अन्तर्गत {dist_val} जिल्लामा अवस्थित "
                f"प्राकृतिक, पर्यटकीय, कृषि तथा ऐतिहासिक सम्पदाले समृद्ध स्थानीय तह हो। "
                f"नागरिक सेवा प्रवाहलाई द्रुत, पारदर्शी तथा प्रविधिमैत्री बनाउन म्युनिसिपल डिजिटल ट्विन्स प्रणाली स्थापना गरिएको छ।"
            ),
            total_population=pop_val,
            total_households=hh_val,
            total_schools=schools_val,
            total_health_posts=hp_val,
            geography=geog_val,
            major_rivers=rivers_val,
            major_religious_sites=relig_val,
            major_tourist_sites=tourist_val,
            annual_budget=budget_val,
            internal_revenue=rev_val,
            boundaries=bound_val,
            cultural_identity=DEFAULT_CULTURAL_IDENTITY,
            good_practices=DEFAULT_GOOD_PRACTICES,
            demographics=demo_val,
            ai_summary=(
                f"{clean_np}को डिजिटल ट्विन प्रोफाइल सफलतापूर्वक सिर्जना गरिएको छ।"
            )
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    # Fallback
    profile = db.query(MunicipalityProfile).first()
    if not profile:
        profile = seed_panchpokhari_profile(db)
    return profile



def seed_sectors_if_empty(db: Session):
    count = db.query(SectorProfile).count()
    if count == 0:
        for s in DEFAULT_SECTORS:
            sector = SectorProfile(
                id=str(uuid.uuid4()),
                sector_name=s["sector_name"],
                description=s["description"],
                stats=s["stats"],
                highlights=s["highlights"],
            )
            db.add(sector)
        db.commit()


def build_profile_response(profile: MunicipalityProfile, db: Session) -> dict:
    """Build the enriched profile response including live leadership from representatives table and saved leadership."""
    is_gaushala = profile.tenant_id in ["gaushala", "gaushalamun", "gaushala_municipality"] or "गौशाला" in (profile.name_np or "")
    is_benighat = profile.tenant_id in ["benighatrorang", "benighat"] or "बेनिघाट" in (profile.name_np or "")
    is_khadadevi = profile.tenant_id in ["khadadevi", "khandadevi"] or "खाँडादेवी" in (profile.name_np or "")
    reps_query = db.query(Representative)
    if profile.tenant_id and profile.tenant_id not in ["panchpokhari", "default", "all", "digitaltwin", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"]:
        reps_query = reps_query.filter(Representative.tenant_id == profile.tenant_id)
    else:
        reps_query = reps_query.filter((Representative.tenant_id == "panchpokhari") | (Representative.tenant_id == None))
    reps = reps_query.order_by(Representative.ward_no).all()

    def find_rep(condition):
        return next((r for r in reps if condition(r)), None)

    mayor_rep = find_rep(
        lambda r: not r.ward_no and (
            (r.designation and "अध्यक्ष" in r.designation and "उपाध्यक्ष" not in r.designation) or
            (r.designation and "Mayor" in r.designation and "Deputy" not in r.designation) or
            (r.designation and "प्रमुख" in r.designation and "उपप्रमुख" not in r.designation)
        )
    )
    deputy_rep = find_rep(
        lambda r: not r.ward_no and r.designation and (
            "उपाध्यक्ष" in r.designation or "उपप्रमुख" in r.designation or "Deputy" in r.designation
        )
    )
    cao_rep = find_rep(
        lambda r: not r.ward_no and r.designation and (
            "अधिकृत" in r.designation or "CAO" in r.designation or "Officer" in r.designation or "प्रशासकीय" in r.designation
        )
    )
    spokesperson_rep = find_rep(
        lambda r: (r.designation and "प्रवक्ता" in r.designation) or (r.ward_no == (5 if is_gaushala else (6 if is_khadadevi else (2 if is_benighat else 3))))
    )

    saved_ld = profile.leadership if isinstance(profile.leadership, dict) else {}
    saved_mayor = saved_ld.get("mayor") or {}
    saved_deputy = saved_ld.get("deputyMayor") or {}
    saved_cao = saved_ld.get("chiefOfficer") or {}
    saved_spokesperson = saved_ld.get("spokesperson") or {}

    def get_initials(name: str) -> str:
        if not name:
            return "PL"
        parts = name.strip().split()
        if len(parts) >= 2:
            return f"{parts[0][0]}{parts[1][0]}"
        return name[:2]

    if is_gaushala:
        def_mayor_name = "डा. दिपेन्द्र महतो"
        def_mayor_role = "नगर प्रमुख"
        def_mayor_phone = "९८५४०२९१५८"
        def_mayor_email = "mayor@gaushalamun.gov.np"

        def_deputy_name = "रेनु कुमारी महतो"
        def_deputy_role = "नगर उपप्रमुख"
        def_deputy_phone = "९८५४०२९१५९"
        def_deputy_email = "deputymayor@gaushalamun.gov.np"

        def_cao_name = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_role = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_phone = "०४४-५८०१११"
        def_cao_email = "cao@gaushalamun.gov.np"

        def_spokesperson_name = "ओम प्रकाश गुप्ता"
        def_spokesperson_role = "प्रवक्ता तथा वडा अध्यक्ष (वडा ५)"
        def_spokesperson_phone = "९८५४०३४५८५"
        def_spokesperson_email = "wd5.gaushalamun@gmail.com"
    elif is_khadadevi:
        def_mayor_name = "ज्ञानकुमार श्रेष्ठ"
        def_mayor_role = "गाउँपालिका अध्यक्ष"
        def_mayor_phone = "०६०-४२०१०६"
        def_mayor_email = "mayor@khandadevimun.gov.np"

        def_deputy_name = "रमा घिसिङ"
        def_deputy_role = "गाउँपालिका उपाध्यक्ष"
        def_deputy_phone = "०६०-४२०१०६"
        def_deputy_email = "deputymayor@khandadevimun.gov.np"

        def_cao_name = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_role = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_phone = "०६०-४२०१०७"
        def_cao_email = "cao@khandadevimun.gov.np"

        def_spokesperson_name = "नारायण कार्की"
        def_spokesperson_role = "प्रवक्ता तथा वडा अध्यक्ष (वडा ६)"
        def_spokesperson_phone = "०६०-४२०१०६"
        def_spokesperson_email = "ward6@khandadevimun.gov.np"
    elif is_benighat:
        def_mayor_name = "श्री कृष्णबहादुर थपलिया (विवेक)"
        def_mayor_role = "गाउँपालिका अध्यक्ष"
        def_mayor_phone = "०१०-५२९००१"
        def_mayor_email = "chairperson@benighatrorangmun.gov.np"

        def_deputy_name = "श्रीमती टापकुमारी श्रेष्ठ"
        def_deputy_role = "गाउँपालिका उपाध्यक्ष"
        def_deputy_phone = "०१०-५२९००२"
        def_deputy_email = "vicechair@benighatrorangmun.gov.np"

        def_cao_name = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_role = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_phone = "०१०-५२९००३"
        def_cao_email = "cao@benighatrorangmun.gov.np"

        def_spokesperson_name = "श्री हेमराज त्रिपाठी"
        def_spokesperson_role = "प्रवक्ता तथा वडा अध्यक्ष (वडा २)"
        def_spokesperson_phone = "९८५१०१११०२"
        def_spokesperson_email = "spokesperson@benighatrorangmun.gov.np"
    else:
        def_mayor_name = "टासी लामा ह्योल्मो"
        def_mayor_role = "गाउँपालिका अध्यक्ष"
        def_mayor_phone = "९८५११०२८३७"
        def_mayor_email = "chairperson@panchpokharimun.gov.np"

        def_deputy_name = "सुनिता अधिकारी"
        def_deputy_role = "गाउँपालिका उपाध्यक्ष"
        def_deputy_phone = "९७४९३२६६२७"
        def_deputy_email = "vicechair@panchpokharimun.gov.np"

        def_cao_name = "लक्ष्मण कुईकेल"
        def_cao_role = "प्रमुख प्रशासकीय अधिकृत"
        def_cao_phone = "९७४९३२६६१९"
        def_cao_email = "cao@panchpokharimun.gov.np"

        def_spokesperson_name = "निमा दोर्जे तामाङ"
        def_spokesperson_role = "प्रवक्ता तथा वडा अध्यक्ष (वडा ३)"
        def_spokesperson_phone = "९८४१००११०३"
        def_spokesperson_email = "spokesperson@panchpokharimun.gov.np"

    mayor_name = saved_mayor.get("name") or (mayor_rep.name if mayor_rep else def_mayor_name)
    mayor_role = saved_mayor.get("designation") or (mayor_rep.designation if mayor_rep else def_mayor_role)
    mayor_phone = saved_mayor.get("phone") or (mayor_rep.phone if mayor_rep else None) or def_mayor_phone
    mayor_email = saved_mayor.get("email") or (mayor_rep.email if mayor_rep else None) or def_mayor_email

    deputy_name = saved_deputy.get("name") or (deputy_rep.name if deputy_rep else def_deputy_name)
    deputy_role = saved_deputy.get("designation") or (deputy_rep.designation if deputy_rep else def_deputy_role)
    deputy_phone = saved_deputy.get("phone") or (deputy_rep.phone if deputy_rep else None) or def_deputy_phone
    deputy_email = saved_deputy.get("email") or (deputy_rep.email if deputy_rep else None) or def_deputy_email

    cao_name = saved_cao.get("name") or (cao_rep.name if cao_rep else def_cao_name)
    cao_role = saved_cao.get("designation") or (cao_rep.designation if cao_rep else def_cao_role)
    cao_phone = saved_cao.get("phone") or (cao_rep.phone if cao_rep else None) or def_cao_phone
    cao_email = saved_cao.get("email") or (cao_rep.email if cao_rep else None) or def_cao_email

    spokesperson_name = saved_spokesperson.get("name") or (spokesperson_rep.name if spokesperson_rep else def_spokesperson_name)
    spokesperson_role = saved_spokesperson.get("designation") or (spokesperson_rep.designation if spokesperson_rep else def_spokesperson_role)
    spokesperson_phone = saved_spokesperson.get("phone") or (spokesperson_rep.phone if spokesperson_rep else None) or def_spokesperson_phone
    spokesperson_email = saved_spokesperson.get("email") or (spokesperson_rep.email if spokesperson_rep else None) or def_spokesperson_email

    leaders = [
        {
            "name": mayor_name,
            "role": mayor_role,
            "phone": mayor_phone,
            "email": mayor_email,
            "badge": "कार्यकारी प्रमुख",
            "color": "#0f4c81",
            "initials": get_initials(mayor_name),
        },
        {
            "name": deputy_name,
            "role": deputy_role,
            "phone": deputy_phone,
            "email": deputy_email,
            "badge": "न्यायिक समिति संयोजक",
            "color": "#047857",
            "initials": get_initials(deputy_name),
        },
        {
            "name": cao_name,
            "role": cao_role,
            "phone": cao_phone,
            "email": cao_email,
            "badge": "प्रशासनिक प्रमुख",
            "color": "#b45309",
            "initials": get_initials(cao_name),
        },
        {
            "name": spokesperson_name,
            "role": spokesperson_role,
            "phone": spokesperson_phone,
            "email": spokesperson_email,
            "badge": "सञ्चार तथा समन्वय",
            "color": "#6d28d9",
            "initials": get_initials(spokesperson_name),
        },
    ]

    cur_demo = dict(DEFAULT_DEMOGRAPHICS)
    if profile.demographics and isinstance(profile.demographics, dict):
        cur_demo.update(profile.demographics)

    total_pop = profile.total_population or cur_demo.get("totalPopulation") or 20540
    total_hh = profile.total_households or cur_demo.get("households") or 5805
    cur_demo["totalPopulation"] = total_pop
    cur_demo["households"] = total_hh

    male_val = cur_demo.get("male", 9950)
    female_val = cur_demo.get("female", 10590)
    if male_val and female_val:
        cur_demo["sexRatio"] = round((male_val / female_val) * 100, 1)
    if total_pop and total_hh:
        cur_demo["averageFamilySize"] = round(total_pop / total_hh, 2)
    area = profile.area_sq_km or 187.29
    if total_pop and area:
        cur_demo["density"] = round(total_pop / area, 1)

    return {
        "id": profile.id,
        "name": profile.name_np,
        "nameNp": profile.name_np,
        "nameEn": profile.name_en,
        "district": profile.district,
        "province": profile.province,
        "type": profile.type,
        "headquarters": profile.headquarters or "थाङपालधाप",
        "totalWards": profile.ward_count or 8,
        "totalAreaSqKm": profile.area_sq_km or 187.29,
        "elevationMeters": profile.elevation_meters or "१,१०० - ४,१०० मी.",
        "introduction": profile.introduction,
        "coordinates": {"lat": 26.9667, "lng": 85.8333} if is_gaushala else ({"lat": 27.5458, "lng": 85.9872} if is_khadadevi else ({"lat": 27.8182, "lng": 84.7645} if is_benighat else {"lat": 27.9736, "lng": 85.6425})),
        "boundaries": profile.boundaries or DEFAULT_BOUNDARIES,
        "culturalIdentity": profile.cultural_identity or DEFAULT_CULTURAL_IDENTITY,
        "goodPractices": profile.good_practices or DEFAULT_GOOD_PRACTICES,
        "annualBudget": profile.annual_budget or "रु. ५८.४५ करोड",
        "internalRevenue": profile.internal_revenue or "रु. २.८ करोड",
        "aiSummary": profile.ai_summary,
        "panoramaUrl": profile.panorama_url,
        "totalPopulation": total_pop,
        "totalHouseholds": total_hh,
        "demographics": cur_demo,
        "financials": {
            "annualBudget": profile.annual_budget or "रु. ५८.४५ करोड",
            "internalRevenue": profile.internal_revenue or "रु. २.८ करोड",
            "fiscalYear": "२०८१/८२",
        },
        "leadership": {
            "mayor": {"name": mayor_name, "designation": mayor_role, "phone": mayor_phone, "email": mayor_email},
            "deputyMayor": {"name": deputy_name, "designation": deputy_role, "phone": deputy_phone, "email": deputy_email},
            "chiefOfficer": {"name": cao_name, "designation": cao_role, "phone": cao_phone, "email": cao_email},
            "spokesperson": {"name": spokesperson_name, "designation": spokesperson_role, "phone": spokesperson_phone, "email": spokesperson_email},
        },
        "leaders": leaders,
    }


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/profile")
def get_profile(
    request: Request,
    fiscal_year: Optional[str] = Query(None, alias="fiscalYear"),
    tenant_id: Optional[str] = Query(None, description="Tenant subdomain or UUID"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    """पालिका प्रोफाइल प्राप्त गर्नुहोस् (मल्टि-टेनेन्ट र जनप्रतिनिधि तालिकाबाट लाइभ नेतृत्व सहित)"""
    eff_tenant = (tenant_id or x_tenant_id or "").strip()
    if not eff_tenant:
        from api.routers.auth import _get_token_payload
        from models.user import User
        payload = _get_token_payload(request)
        if payload and payload.get("sub"):
            u = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()
            if u and u.tenant_id and u.tenant_id not in ("all", "*"):
                eff_tenant = u.tenant_id

    profile = seed_profile_if_empty(db, eff_tenant)
    return build_profile_response(profile, db)


@router.put("/profile")
def update_profile(
    request: Request,
    data: MunicipalityProfileUpdate,
    tenant_id: Optional[str] = Query(None, description="Tenant subdomain or UUID"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    """पालिका प्रोफाइल अद्यावधिक गर्नुहोस् र जनप्रतिनिधि तालिकामा नेतृत्व सिंक्रोनाइज गर्नुहोस्"""
    eff_tenant = (tenant_id or x_tenant_id or "").strip()
    if not eff_tenant:
        from api.routers.auth import _get_token_payload
        from models.user import User
        payload = _get_token_payload(request)
        if payload and payload.get("sub"):
            u = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()
            if u and u.tenant_id and u.tenant_id not in ("all", "*"):
                eff_tenant = u.tenant_id

    profile = seed_profile_if_empty(db, eff_tenant)

    raw_data = data.model_dump(exclude_unset=True)
    leadership_val = raw_data.pop("leadership", None)
    leaders_val = raw_data.pop("leaders", None)
    demographics_val = raw_data.pop("demographics", None)
    male_pop = raw_data.pop("male_population", None)
    female_pop = raw_data.pop("female_population", None)


    for field, value in raw_data.items():
        if value is not None and hasattr(profile, field):
            setattr(profile, field, value)

    # Persist demographics to MunicipalityProfile JSONB column
    cur_demo = dict(profile.demographics or DEFAULT_DEMOGRAPHICS)
    if demographics_val and isinstance(demographics_val, dict):
        cur_demo.update(demographics_val)
        if "totalPopulation" in demographics_val and demographics_val["totalPopulation"] is not None:
            profile.total_population = int(demographics_val["totalPopulation"])
        if "households" in demographics_val and demographics_val["households"] is not None:
            profile.total_households = int(demographics_val["households"])
        if "male" in demographics_val and demographics_val["male"] is not None:
            cur_demo["male"] = int(demographics_val["male"])
        if "female" in demographics_val and demographics_val["female"] is not None:
            cur_demo["female"] = int(demographics_val["female"])

    if male_pop is not None:
        cur_demo["male"] = int(male_pop)
    if female_pop is not None:
        cur_demo["female"] = int(female_pop)

    if profile.total_population:
        cur_demo["totalPopulation"] = profile.total_population
    if profile.total_households:
        cur_demo["households"] = profile.total_households

    if cur_demo.get("male") and cur_demo.get("female"):
        cur_demo["sexRatio"] = round((cur_demo["male"] / cur_demo["female"]) * 100, 1)
    if profile.total_population and profile.total_households:
        cur_demo["averageFamilySize"] = round(profile.total_population / profile.total_households, 2)
    if profile.total_population and profile.area_sq_km:
        cur_demo["density"] = round(profile.total_population / profile.area_sq_km, 1)

    profile.demographics = cur_demo

    # Persist leadership to MunicipalityProfile JSONB column
    if leadership_val is not None:
        profile.leadership = leadership_val
    elif leaders_val is not None and isinstance(leaders_val, list):
        profile.leadership = {
            "mayor": leaders_val[0] if len(leaders_val) > 0 else {},
            "deputyMayor": leaders_val[1] if len(leaders_val) > 1 else {},
            "chiefOfficer": leaders_val[2] if len(leaders_val) > 2 else {},
            "spokesperson": leaders_val[3] if len(leaders_val) > 3 else {},
        }

    # Leadership sync: Single Source of Truth – update representatives table
    def sync_leadership(role_type: str, info: dict):
        if not info or not info.get("name"):
            return
        reps = db.query(Representative).all()
        target = None

        if role_type == "mayor":
            target = next(
                (r for r in reps if not r.ward_no and r.designation and
                 "अध्यक्ष" in r.designation and "उपाध्यक्ष" not in r.designation), None
            )
        elif role_type == "deputyMayor":
            target = next(
                (r for r in reps if not r.ward_no and r.designation and "उपाध्यक्ष" in r.designation), None
            )
        elif role_type == "chiefOfficer":
            target = next(
                (r for r in reps if not r.ward_no and r.designation and (
                    "अधिकृत" in r.designation or "CAO" in r.designation or "प्रशासकीय" in r.designation
                )), None
            )
        elif role_type == "spokesperson":
            target = next(
                (r for r in reps if (r.designation and "प्रवक्ता" in r.designation) or (r.ward_no == 3)), None
            )

        if target:
            if info.get("name"):
                target.name = info["name"]
            if info.get("phone"):
                target.phone = info["phone"]
            if info.get("email"):
                target.email = info["email"]
            if info.get("designation"):
                target.designation = info["designation"]
            db.add(target)

    active_ld = profile.leadership or {}
    if active_ld.get("mayor"):
        sync_leadership("mayor", active_ld["mayor"])
    if active_ld.get("deputyMayor"):
        sync_leadership("deputyMayor", active_ld["deputyMayor"])
    if active_ld.get("chiefOfficer"):
        sync_leadership("chiefOfficer", active_ld["chiefOfficer"])
    if active_ld.get("spokesperson"):
        sync_leadership("spokesperson", active_ld["spokesperson"])

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return build_profile_response(profile, db)


@router.get("/sectors", response_model=List[SectorProfileSchema])
def get_sectors(db: Session = Depends(get_db)):
    """सबै क्षेत्रीय प्रोफाइलहरू प्राप्त गर्नुहोस् (शिक्षा, स्वास्थ्य, पर्यटन, आदि)"""
    seed_sectors_if_empty(db)
    return db.query(SectorProfile).all()


@router.post("/sectors", response_model=SectorProfileSchema)
def create_sector(data: SectorProfileCreate, db: Session = Depends(get_db)):
    sector = SectorProfile(
        id=str(uuid.uuid4()),
        sector_name=data.sector_name,
        description=data.description,
        stats=data.stats,
        highlights=data.highlights,
        tenant_id=data.tenant_id,
    )
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector


@router.put("/sectors/{id}", response_model=SectorProfileSchema)
def update_sector(id: str, data: SectorProfileUpdate, db: Session = Depends(get_db)):
    sector = db.query(SectorProfile).filter(SectorProfile.id == id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(sector, field, value)
    db.commit()
    db.refresh(sector)
    return sector


@router.delete("/sectors/{id}")
def delete_sector(id: str, db: Session = Depends(get_db)):
    sector = db.query(SectorProfile).filter(SectorProfile.id == id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    db.delete(sector)
    db.commit()
    return {"success": True, "message": f"Sector '{sector.sector_name}' deleted"}
