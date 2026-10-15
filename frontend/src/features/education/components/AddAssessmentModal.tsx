import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schools: Array<{ id: string; nameNepali?: string; name?: string }>;
}

export const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  schools,
}) => {
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState(schools[0]?.nameNepali || schools[0]?.name || 'श्री थाङपालधाप माध्यमिक विद्यालय');
  const [classGrade, setClassGrade] = useState('कक्षा १०');
  const [examType, setExamType] = useState('SEE पूर्वतयारी परीक्षा, २०८१');
  const [totalMarks, setTotalMarks] = useState<number>(540);
  const [gpa, setGpa] = useState<number>(3.45);
  const [grade, setGrade] = useState('A');
  const [status, setStatus] = useState('सफल (PROMOTED)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('कृपया विद्यार्थीको नाम प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await sectoralApi.createAssessment({
        studentName: studentName.trim(),
        schoolName,
        classGrade,
        examType,
        totalMarks: Number(totalMarks),
        gpa: Number(gpa),
        grade,
        status,
        subjectsData: [
          { subjectCode: 'NEP-101', subjectName: 'अनिवार्य नेपाली (Nepali)', creditHour: 4.0, theoryMarks: 52, practicalMarks: 20, totalMarks: 72, grade: 'B+', gradePoint: 3.2, remarks: 'Very Good' },
          { subjectCode: 'ENG-102', subjectName: 'अनिवार्य अंग्रेजी (English)', creditHour: 4.0, theoryMarks: 55, practicalMarks: 20, totalMarks: 75, grade: 'B+', gradePoint: 3.2, remarks: 'Very Good' },
          { subjectCode: 'MTH-103', subjectName: 'अनिवार्य गणित (Mathematics)', creditHour: 4.0, theoryMarks: 60, practicalMarks: 20, totalMarks: 80, grade: 'A', gradePoint: 3.6, remarks: 'Excellent' },
          { subjectCode: 'SCI-104', subjectName: 'विज्ञान तथा प्रविधि (Science & Technology)', creditHour: 4.0, theoryMarks: 58, practicalMarks: 22, totalMarks: 80, grade: 'A', gradePoint: 3.6, remarks: 'Excellent' },
          { subjectCode: 'SOC-105', subjectName: 'सामाजिक अध्ययन (Social Studies)', creditHour: 4.0, theoryMarks: 56, practicalMarks: 20, totalMarks: 76, grade: 'B+', gradePoint: 3.2, remarks: 'Very Good' },
          { subjectCode: 'LOC-106', subjectName: 'स्थानीय पाठ्यक्रम (पाँचपोखरी पहिचान)', creditHour: 4.0, theoryMarks: 60, practicalMarks: 22, totalMarks: 82, grade: 'A', gradePoint: 3.6, remarks: 'Excellent' },
          { subjectCode: 'OPT-107', subjectName: 'ऐच्छिक अर्थशास्त्र', creditHour: 4.0, theoryMarks: 55, practicalMarks: 20, totalMarks: 75, grade: 'B+', gradePoint: 3.2, remarks: 'Very Good' },
        ],
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create assessment:', err);
      setErrorMsg(err?.response?.data?.detail || 'परीक्षा नतिजा सुरक्षित गर्न सकिएन।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">नयाँ विद्यार्थी परीक्षा मूल्याङ्कन प्रविष्टि</h2>
              <p className="text-xs text-slate-400">Enter Exam Assessment & GPA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              विद्यार्थीको पूरा नाम <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="उदा. रोशन तामाङ"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">विद्यालयको नाम</label>
            <select
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {schools.map((s) => {
                const sName = s.nameNepali || s.name || '';
                return <option key={s.id} value={sName}>{sName}</option>;
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">कक्षा / तह</label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="कक्षा १०">कक्षा १० (SEE)</option>
                <option value="कक्षा ८">कक्षा ८ (BLE)</option>
                <option value="कक्षा ९">कक्षा ९</option>
                <option value="कक्षा ७">कक्षा ७</option>
                <option value="कक्षा ६">कक्षा ६</option>
                <option value="कक्षा ५">कक्षा ५</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">परीक्षा प्रकार</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="SEE पूर्वतयारी परीक्षा, २०८१">SEE पूर्वतयारी परीक्षा, २०८१</option>
                <option value="आधारभूत तह उत्तीर्ण परीक्षा (BLE) २०८१">आधारभूत तह उत्तीर्ण परीक्षा (BLE) २०८१</option>
                <option value="वार्षिक परीक्षा, २०८१">वार्षिक परीक्षा, २०८१</option>
                <option value="दोस्रो त्रैमासिक परीक्षा, २०८१">दोस्रो त्रैमासिक परीक्षा, २०८१</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">कुल प्राप्ताङ्क</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">GPA (०-४.०)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={gpa}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGpa(val);
                  setGrade(val >= 3.6 ? 'A+' : val >= 3.2 ? 'A' : val >= 2.8 ? 'B+' : 'B');
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold text-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ग्रेड (Grade)</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="A+">A+ (Distinction)</option>
                <option value="A">A (Excellent)</option>
                <option value="B+">B+ (Very Good)</option>
                <option value="B">B (Good)</option>
                <option value="C+">C+ (Satisfactory)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">नतिजा स्थिति</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="सफल (PROMOTED)">सफल (PROMOTED)</option>
              <option value="विशिष्ट (DISTINCTION)">विशिष्ट (DISTINCTION)</option>
              <option value="ग्रेड वृद्धि आवश्यक (GRADE INCREMENT)">ग्रेड वृद्धि आवश्यक (GRADE INCREMENT)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'सुरक्षित गर्दै...' : 'नतिजा प्रविष्टि गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
