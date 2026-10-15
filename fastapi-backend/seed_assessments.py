"""
Seed Student Exam Assessments (शिक्षा तथा विद्यार्थी परीक्षा मूल्याङ्कन प्रणाली)
Municipal Digital Twins — Panchpokhari Thangpal Rural Municipality
Populates:
  - assessments (academic exam results, GPAs, subject marks, and grades for registered students)
"""
import uuid
import datetime
import random
from core.database import SessionLocal
from models.education import School, Student, Assessment

def seed_assessments():
    db = SessionLocal()
    try:
        print("=== SEEDING OPTION 28: STUDENT ACADEMIC ASSESSMENTS ===")

        existing_count = db.query(Assessment).count()
        if existing_count > 0:
            print(f"assessments table already has {existing_count} records. Skipping...")
            return

        students = db.query(Student).filter(Student.deleted_at.is_(None)).all()
        schools = {str(s.id): s.name for s in db.query(School).all()}

        print(f"Found {len(students)} students across {len(schools)} schools.")
        if not students:
            print("No students found to evaluate.")
            return

        now = datetime.datetime.now(datetime.timezone.utc)

        base_subjects = [
            {"code": "NEP-101", "name": "अनिवार्य नेपाली (Nepali)", "credit": 4.0},
            {"code": "ENG-102", "name": "अनिवार्य अंग्रेजी (English)", "credit": 4.0},
            {"code": "MTH-103", "name": "अनिवार्य गणित (Mathematics)", "credit": 4.0},
            {"code": "SCI-104", "name": "विज्ञान तथा प्रविधि (Science & Technology)", "credit": 4.0},
            {"code": "SOC-105", "name": "सामाजिक अध्ययन तथा मानव मूल्य (Social Studies)", "credit": 4.0},
            {"code": "LOC-106", "name": "स्थानीय पाठ्यक्रम (पाँचपोखरी पहिचान र दिगो विकास)", "credit": 4.0},
            {"code": "OPT-107", "name": "ऐच्छिक विषय (अर्थशास्त्र / कम्प्युटर शिक्षा)", "credit": 4.0},
        ]

        def get_grade_info(pct):
            if pct >= 90:
                return "A+", 4.0, "Outstanding"
            elif pct >= 80:
                return "A", 3.6, "Excellent"
            elif pct >= 70:
                return "B+", 3.2, "Very Good"
            elif pct >= 60:
                return "B", 2.8, "Good"
            elif pct >= 50:
                return "C+", 2.4, "Satisfactory"
            else:
                return "C", 2.0, "Acceptable"

        assessments_to_add = []

        for idx, stu in enumerate(students):
            school_name = schools.get(str(stu.school_id)) or "श्री थाङपाल भ्याली माध्यमिक विद्यालय"
            class_grade = stu.class_grade or "कक्षा १०"

            # Determine exam type
            if "१०" in class_grade:
                exam_type = "SEE पूर्वतयारी परीक्षा, २०८१"
            elif "८" in class_grade:
                exam_type = "आधारभूत तह उत्तीर्ण परीक्षा (BLE) २०८१"
            else:
                exam_type = "वार्षिक परीक्षा, २०८१"

            # Generate subject marks
            subjects_list = []
            total_marks = 0.0
            weighted_gp = 0.0
            total_credits = 0.0

            # Bias slight variance based on student index for realism
            base_score = 65 + (idx % 25)

            for sub in base_subjects:
                theory_pct = min(98, max(45, base_score + random.randint(-8, 8)))
                practical_pct = min(100, max(80, base_score + 10 + random.randint(-4, 5)))

                theory_marks = round(theory_pct * 0.75, 1) # 75% theory
                practical_marks = round(practical_pct * 0.25, 1) # 25% practical
                sub_total = round(theory_marks + practical_marks, 1)
                sub_grade, sub_gp, remark = get_grade_info(sub_total)

                subjects_list.append({
                    "subjectCode": sub["code"],
                    "subjectName": sub["name"],
                    "creditHour": sub["credit"],
                    "theoryMarks": theory_marks,
                    "practicalMarks": practical_marks,
                    "totalMarks": sub_total,
                    "grade": sub_grade,
                    "gradePoint": sub_gp,
                    "remarks": remark
                })

                total_marks += sub_total
                weighted_gp += (sub_gp * sub["credit"])
                total_credits += sub["credit"]

            final_gpa = round(weighted_gp / total_credits, 2)
            overall_grade = "A+" if final_gpa >= 3.6 else ("A" if final_gpa >= 3.2 else ("B+" if final_gpa >= 2.8 else "B"))
            overall_status = "विशिष्ट (DISTINCTION)" if final_gpa >= 3.6 else "सफल (PROMOTED)"

            assessment = Assessment(
                id=uuid.uuid4(),
                student_id=str(stu.id),
                student_name=stu.full_name,
                school_name=school_name,
                class_grade=class_grade,
                exam_type=exam_type,
                total_marks=total_marks,
                gpa=final_gpa,
                grade=overall_grade,
                subjects_data=subjects_list,
                status=overall_status,
                created_at=now - datetime.timedelta(days=random.randint(10, 45)),
                updated_at=now - datetime.timedelta(days=5)
            )
            assessments_to_add.append(assessment)

        db.add_all(assessments_to_add)
        db.commit()
        print(f"SUCCESS: Seeded {len(assessments_to_add)} academic assessment records into 'assessments' table!")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding assessments: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_assessments()
