export interface School {
  id: string;
  code: string;
  emisCode?: string;
  name?: string;
  nameEn?: string;
  nameNepali: string;
  nameEnglish?: string;
  type?: 'public' | 'private' | 'community' | string;
  level: string;
  levelDetails?: string;
  wardNumber: number;
  location: string;
  tole?: string;
  principalName: string;
  contactNumber: string;
  contactPhone?: string;
  email?: string;
  portalUrl?: string;
  totalStudents: number;
  totalTeachers: number;
  maleStudents?: number;
  femaleStudents: number;
  latitude?: number;
  longitude?: number;
  hasIctLab: boolean;
  hasScienceLab: boolean;
  hasLibrary: boolean;
  hasDrinkingWater: boolean;
  hasElectricity: boolean;
}

export interface Student {
  id: string;
  fullName: string;
  admissionNo?: string;
  schoolId?: string;
  schoolName?: string;
  classGrade?: string;
  rollNumber: number;
  gender: string;
  dob?: string;
  parentName?: string;
  contactPhone?: string;
  casteCategory: string;
  scholarshipType?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  schoolId?: string;
  schoolName?: string;
  fullName: string;
  designation: string;
  serviceType?: string;
  mainSubject?: string;
  subject?: string;
  qualification?: string;
  contactPhone?: string;
  contactNumber?: string;
  email?: string;
  createdAt?: string;
}

export interface NutritionRecord {
  id: string;
  schoolName: string;
  wardNumber: number;
  beneficiaryCount: number;
  allocatedBudget: number;
  spentBudget: number;
  mealMenu: string;
  fiscalYear: string;
  month: string;
  remarks?: string;
  createdAt?: string;
}

export interface WardEducationSummary {
  wardNumber: number;
  schoolCount: number;
  totalStudents: number;
  totalTeachers: number;
}

export interface EducationOverviewStats {
  totalSchools: number;
  communitySchools?: number;
  privateSchools?: number;
  secondaryCount?: number;
  basicCount?: number;
  secondarySchools?: number;
  basicSchools?: number;
  totalStudents: number;
  boysCount?: number;
  girlsCount?: number;
  totalTeachers: number;
  permanentTeachers?: number;
  contractTeachers?: number;
  ptr?: string;
  studentTeacherRatio?: number;
  attendanceRate?: string;
  mealsBeneficiaries: number;
  ictEnabledSchools?: number;
  scienceLabSchools?: number;
  librarySchools?: number;
  drinkingWaterSchools?: number;
  electricitySchools?: number;
  systemStatus?: string;
  wardBreakdown?: WardEducationSummary[];
}

export interface SubjectScore {
  subjectCode: string;
  subjectName: string;
  creditHour: number;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
  remarks: string;
}

export interface StudentAssessment {
  id: string;
  studentId?: string;
  studentName: string;
  schoolName: string;
  classGrade: string;
  examType: string;
  totalMarks: number;
  gpa: number;
  grade: string;
  subjectsData?: SubjectScore[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentStats {
  totalAssessments: number;
  averageGpa: number;
  passRate: number;
  distinctionCount: number;
  gradeBreakdown: Record<string, number>;
  schoolPerformance: Array<{
    schoolName: string;
    studentCount: number;
    averageGpa: number;
  }>;
}


