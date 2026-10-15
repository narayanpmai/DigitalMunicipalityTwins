import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Search,
  Plus,
  FileText,
  School as SchoolIcon,
  BookOpen,
  Eye,
  Trash2,
  BarChart2,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';
import { StudentAssessment, School } from '../../../types/education';
import { MarkSheetModal } from './MarkSheetModal';
import { AddAssessmentModal } from './AddAssessmentModal';

interface AssessmentsTabProps {
  schools: School[];
}

export const AssessmentsTab: React.FC<AssessmentsTabProps> = ({ schools }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<StudentAssessment | null>(null);
  const [isMarkSheetOpen, setIsMarkSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['assessment-stats'],
    queryFn: () => sectoralApi.getAssessmentStats(),
  });

  const { data: assessments = [], isLoading } = useQuery<StudentAssessment[]>({
    queryKey: ['assessments', selectedSchool, selectedClass, selectedGrade, searchQuery],
    queryFn: () =>
      sectoralApi.getAssessments({
        school_name: selectedSchool === 'all' ? undefined : selectedSchool,
        class_grade: selectedClass === 'all' ? undefined : selectedClass,
        grade: selectedGrade === 'all' ? undefined : selectedGrade,
        search: searchQuery || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
    },
  });

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'A':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'B+':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.6) return 'text-emerald-400';
    if (gpa >= 3.2) return 'text-blue-400';
    if (gpa >= 2.8) return 'text-amber-400';
    return 'text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">कुल परीक्षा मूल्याङ्कन</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats?.totalAssessments ?? assessments.length}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400">
            <span>पाँचपोखरी थाङपाल गाउँपालिका शैक्षिक सत्र २०८१</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">औसत गाउँपालिका GPA</p>
              <h3 className="text-2xl font-bold text-indigo-400 mt-1">
                {stats?.averageGpa ? stats.averageGpa.toFixed(2) : '३.३७'}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>कक्षा १० (SEE) तथा कक्षा ८ (BLE) एकीकृत</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">समग्र उत्तीर्ण दर (Pass Rate)</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {stats?.passRate ? `${stats.passRate}%` : '१००%'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>न्यूनतम C ग्रेड हासिल गरेका विद्यार्थी</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">विशिष्ट श्रेणी (A+ Distinction)</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">
                {stats?.distinctionCount ?? 6} जना
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>GPA ३.६० भन्दा माथि प्राप्त</span>
          </div>
        </div>
      </div>

      {/* ── Top School Academic Performance Bar ────────────────────────── */}
      {stats?.schoolPerformance && stats.schoolPerformance.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                विद्यालयगत नतिजा वरीयता तथा औसत GPA (School Academic Ranking)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">शीर्ष ८ सामुदायिक माध्यमिक विद्यालयहरू</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.schoolPerformance.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {item.schoolName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 shrink-0">
                    #{idx + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">परीक्षार्थी: {item.studentCount}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    GPA {item.averageGpa.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action & Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="विद्यार्थी वा विद्यालय खोज्नुहोस्..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 max-w-[200px]"
          >
            <option value="all">सबै विद्यालयहरू (All Schools)</option>
            {schools.map((s) => (
              <option key={s.id} value={s.nameNepali || s.name}>
                {s.nameNepali || s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">सबै कक्षाहरू</option>
            <option value="कक्षा १०">कक्षा १०</option>
            <option value="कक्षा ८">कक्षा ८</option>
            <option value="कक्षा ९">कक्षा ९</option>
            <option value="कक्षा ७">कक्षा ७</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">सबै ग्रेडहरू</option>
            <option value="A+">A+ (३.६ - ४.०)</option>
            <option value="A">A (३.२ - ३.६)</option>
            <option value="B+">B+ (२.८ - ३.२)</option>
            <option value="B">B (२.४ - २.८)</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          नयाँ नतिजा प्रविष्टि
        </button>
      </div>

      {/* ── Assessments Data Table ──────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">विद्यार्थी परीक्षा नतिजा तथा लब्धाङ्क सूची</h4>
          </div>
          <span className="text-xs text-slate-400">कुल रेकर्ड: {assessments.length}</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">परीक्षा नतिजा लोड हुँदैछ...</div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            कुनै परीक्षा नतिजा फेला परेन।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">विद्यार्थीको नाम</th>
                  <th className="px-5 py-3.5 font-semibold">विद्यालय</th>
                  <th className="px-4 py-3.5 font-semibold">कक्षा</th>
                  <th className="px-4 py-3.5 font-semibold">परीक्षा प्रकार</th>
                  <th className="px-4 py-3.5 font-semibold text-center">कुल प्राप्ताङ्क</th>
                  <th className="px-4 py-3.5 font-semibold text-center">GPA</th>
                  <th className="px-4 py-3.5 font-semibold text-center">ग्रेड</th>
                  <th className="px-4 py-3.5 font-semibold">स्थिति</th>
                  <th className="px-5 py-3.5 font-semibold text-right">कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {item.studentName.charAt(0)}
                        </div>
                        <span>{item.studentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 max-w-[200px] truncate">
                      {item.schoolName}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-200">{item.classGrade}</td>
                    <td className="px-4 py-4 text-slate-400">{item.examType}</td>
                    <td className="px-4 py-4 font-mono font-bold text-center text-slate-200">
                      {item.totalMarks}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-sm">
                      <span className={getGpaColor(item.gpa)}>{item.gpa?.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${getGradeBadge(
                          item.grade
                        )}`}
                      >
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAssessment(item);
                            setIsMarkSheetOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition"
                          title="लब्धाङ्क पत्र (Mark-Sheet) हेर्नुहोस्"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>मार्क-सिट</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`के तपाईं ${item.studentName} को नतिजा हटाउन निश्चित हुनुहुन्छ?`)) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="हटाउनुहोस्"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark-Sheet Modal */}
      <MarkSheetModal
        assessment={selectedAssessment}
        isOpen={isMarkSheetOpen}
        onClose={() => {
          setIsMarkSheetOpen(false);
          setSelectedAssessment(null);
        }}
      />

      {/* Add Assessment Modal */}
      <AddAssessmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['assessments'] });
          queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
        }}
        schools={schools}
      />
    </div>
  );
};
