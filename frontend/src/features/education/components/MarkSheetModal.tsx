import React from 'react';
import { X, Printer, Award, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';
import { StudentAssessment } from '../../../types/education';

interface MarkSheetModalProps {
  assessment: StudentAssessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MarkSheetModal: React.FC<MarkSheetModalProps> = ({ assessment, isOpen, onClose }) => {
  if (!isOpen || !assessment) return null;

  const handlePrint = () => {
    window.print();
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'A':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'B+':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">विद्यार्थी लब्धाङ्क पत्र (Academic Grade-Sheet)</h2>
              <p className="text-xs text-slate-400">Panchpokhari Thangpal Municipal Education Board</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition"
            >
              <Printer className="w-4 h-4" /> प्रिन्ट (Print)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Mark-Sheet Canvas */}
        <div className="p-8 space-y-6 bg-slate-900/90">
          {/* Institutional Crest & Title */}
          <div className="text-center border-b border-slate-800 pb-5">
            <div className="inline-flex items-center justify-center p-2 bg-indigo-500/10 rounded-full mb-2">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider">पाँचपोखरी थाङपाल गाउँपालिका</h3>
            <h2 className="text-lg font-bold text-white">शिक्षा, युवा तथा खेलकुद शाखा</h2>
            <p className="text-xs text-slate-400">सिन्धुपाल्चोक, बागमती प्रदेश, नेपाल</p>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              {assessment.examType}
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">विद्यार्थीको नाम:</span>
              <strong className="text-white text-sm">{assessment.studentName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">विद्यालय:</span>
              <strong className="text-indigo-300">{assessment.schoolName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">कक्षा / तह:</span>
              <strong className="text-white">{assessment.classGrade}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">नतिजा स्थिति:</span>
              <strong className="text-emerald-400">{assessment.status}</strong>
            </div>
          </div>

          {/* Subject-Wise Marks Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">कोड</th>
                  <th className="px-4 py-3 font-semibold">विषय (Subject)</th>
                  <th className="px-3 py-3 font-semibold text-center">क्रेडिट</th>
                  <th className="px-3 py-3 font-semibold text-center">सैद्धान्तिक (TH)</th>
                  <th className="px-3 py-3 font-semibold text-center">प्रयोगात्मक (PR)</th>
                  <th className="px-3 py-3 font-semibold text-center">कुल (Total)</th>
                  <th className="px-3 py-3 font-semibold text-center">ग्रेड प्वाइन्ट</th>
                  <th className="px-3 py-3 font-semibold text-center">ग्रेड</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {assessment.subjectsData && assessment.subjectsData.length > 0 ? (
                  assessment.subjectsData.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{sub.subjectCode}</td>
                      <td className="px-4 py-2.5 font-medium text-white">{sub.subjectName}</td>
                      <td className="px-3 py-2.5 text-center font-mono">{sub.creditHour}</td>
                      <td className="px-3 py-2.5 text-center font-mono">{sub.theoryMarks}</td>
                      <td className="px-3 py-2.5 text-center font-mono">{sub.practicalMarks}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-white font-mono">{sub.totalMarks}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-indigo-400 font-semibold">{sub.gradePoint}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadge(sub.grade)}`}>
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                      विषयगत विस्तृत विवरण उपलब्ध छैन।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grade Summary Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 rounded-xl border border-indigo-500/20 shadow-lg">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">कुल प्राप्ताङ्क (Total Obtained):</span>
              <h4 className="text-xl font-bold text-white font-mono">{assessment.totalMarks}</h4>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-xs text-slate-400 block mb-1">ग्रेड प्वाइन्ट औसत (GPA)</span>
                <span className="text-2xl font-black text-indigo-400 font-mono">
                  {assessment.gpa?.toFixed(2)}
                </span>
              </div>

              <div className="text-center">
                <span className="text-xs text-slate-400 block mb-1">समग्र ग्रेड (Grade)</span>
                <span className={`px-3 py-1 rounded-lg text-lg font-black border ${getGradeBadge(assessment.grade)}`}>
                  {assessment.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Authentication Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-slate-500 text-xs">
            <div>
              <p>प्रमाणीकरण मिति: {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : '२०८१-०६-०१'}</p>
              <p className="text-[10px] text-slate-600">ID: {assessment.id}</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-slate-700 mb-1" />
              <p className="text-slate-400 font-medium">शिक्षा अधिकृतको हस्ताक्षर</p>
              <p className="text-[10px] text-slate-600">गाउँ कार्यपालिकाको कार्यालय</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
