import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HardHat,
  CheckCircle2,
  Clock,
  Home,
  Plus,
  Search,
  Building2,
  FileSpreadsheet,
  Users,
  Coins,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { disasterApi, RecoveryProject, DamageReport } from '../../../api/disaster';
import { AddRecoveryProjectModal } from './AddRecoveryProjectModal';

export const RecoveryProjectsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubView, setActiveSubView] = useState<'projects' | 'damage_reports'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [incidentFilter, setIncidentFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['recovery-projects-stats'],
    queryFn: () => disasterApi.getRecoveryProjectsStats(),
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery<RecoveryProject[]>({
    queryKey: ['recovery-projects', statusFilter, incidentFilter, searchQuery],
    queryFn: () =>
      disasterApi.getRecoveryProjects({
        status: statusFilter === 'all' ? undefined : statusFilter,
        incident_id: incidentFilter === 'all' ? undefined : incidentFilter,
        search: searchQuery || undefined,
      }),
  });

  const { data: damageReports = [], isLoading: isDamageLoading } = useQuery<DamageReport[]>({
    queryKey: ['disaster-damage-reports'],
    queryFn: () => disasterApi.getDamageReports(),
  });

  // Mutation for quick status toggle
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      disasterApi.updateRecoveryProjectStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery-projects'] });
      queryClient.invalidateQueries({ queryKey: ['recovery-projects-stats'] });
      queryClient.invalidateQueries({ queryKey: ['disaster-stats'] });
    },
  });

  const totalLossNPR = damageReports.reduce((sum, r) => sum + (r.estimated_loss_amount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> सम्पन्न (Completed)
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> कार्यान्वयनमा (In Progress)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> योजना (Planned)
          </span>
        );
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'Completed':
        return 100;
      case 'In Progress':
        return 65;
      default:
        return 20;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">कुल पुनर्निर्माण आयोजनाहरू</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats?.totalProjects ?? projects.length}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <HardHat className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
            <span>सिन्धुपाल्चोक पाँचपोखरी थाङपाल पुनर्लाभ</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">सम्पन्न पुनर्निर्माण कार्य</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {stats?.completedProjects ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>
              सफलता दर:{' '}
              {stats?.totalProjects
                ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">कार्यान्वयन भइरहेका आयोजना</p>
              <h3 className="text-2xl font-bold text-amber-300 mt-1">
                {stats?.inProgressProjects ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>योजना चरणमा: {stats?.plannedProjects ?? 0}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">विपद् क्षति मूल्याङ्कन (कुल)</p>
              <h3 className="text-xl font-bold text-rose-400 mt-1">
                रु. {(totalLossNPR / 100000).toFixed(1)} लाख
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>प्रत्यक्ष राहत तथा पुनर्स्थापना</span>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation & Action Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubView === 'projects'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HardHat className="w-4 h-4" />
            पुनर्निर्माण आयोजनाहरू ({projects.length})
          </button>
          <button
            onClick={() => setActiveSubView('damage_reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubView === 'damage_reports'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            विपद् क्षति मूल्याङ्कन प्रतिवेदन ({damageReports.length})
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          नयाँ पुनर्निर्माण आयोजना
        </button>
      </div>

      {/* ── SUB VIEW 1: RECONSTRUCTION PROJECTS ────────────────────────────── */}
      {activeSubView === 'projects' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="पुनर्निर्माण प्रकार वा घटना खोज्नुहोस्..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">सबै स्थिति (Status: All)</option>
              <option value="Completed">सम्पन्न (Completed)</option>
              <option value="In Progress">कार्यान्वयनमा (In Progress)</option>
              <option value="Planned">योजना (Planned)</option>
            </select>

            <select
              value={incidentFilter}
              onChange={(e) => setIncidentFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">सबै विपद् घटनाहरू (All Incidents)</option>
              <option value="drrm-inc-01">वडा ४: मानेखर्क पहिरो</option>
              <option value="drrm-inc-02">वडा ७: तिपेनी मेलम्ची बाढी</option>
              <option value="drrm-inc-03">वडा ३: भोताङ सडक पहिरो</option>
              <option value="drrm-inc-04">वडा १: बाँसखर्क डढेलो</option>
            </select>
          </div>

          {/* Projects Cards Grid */}
          {isProjectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
              <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-medium text-slate-300">कुनै पुनर्निर्माण आयोजना भेटिएन</h4>
              <p className="text-xs text-slate-500 mt-1">
                फिल्टर परिवर्तन गर्नुहोस् वा "+ नयाँ पुनर्निर्माण आयोजना" मार्फत थप्नुहोस्।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const pct = getProgressPercentage(proj.recovery_status);
                return (
                  <div
                    key={proj.id}
                    className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
                  >
                    <div>
                      {/* Header with Incident Badge & Status */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {proj.id}
                        </span>
                        {getStatusBadge(proj.recovery_status)}
                      </div>

                      {/* Reconstruction Type Title */}
                      <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition line-clamp-2 mb-2">
                        {proj.reconstruction_type}
                      </h4>

                      {/* Incident Link Details */}
                      <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>सम्बन्धित विपद्:</span>
                          <span className="text-amber-400 font-medium">
                            {proj.incident_description || proj.incident_id}
                          </span>
                        </div>
                        {proj.ward_id && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>कार्यक्षेत्र:</span>
                            <span className="text-slate-300">
                              वडा नं. {proj.ward_id.replace('ward-0', '').replace('ward-', '')}
                            </span>
                          </div>
                        )}
                        {proj.beneficiary_household_id && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Home className="w-3 h-3 text-emerald-400" /> लाभान्वित घर:
                            </span>
                            <span className="text-emerald-400 font-mono text-[11px]">
                              {proj.beneficiary_household_id.substring(0, 8)}...
                            </span>
                          </div>
                        )}
                        {proj.project_id && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-sky-400" /> पालिका योजना:
                            </span>
                            <span className="text-sky-400 font-mono text-[11px]">
                              {proj.project_id.substring(0, 8)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {/* Progress Bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">भौतिक प्रगति</span>
                          <span className="font-semibold text-slate-200">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct === 100
                                ? 'bg-emerald-500'
                                : pct >= 50
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Status Action */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">स्थिति परिवर्तन:</span>
                        <div className="flex items-center gap-1">
                          {proj.recovery_status !== 'Completed' && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: proj.id,
                                  status: 'Completed',
                                })
                              }
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-medium transition"
                            >
                              सम्पन्न गर्नुहोस्
                            </button>
                          )}
                          {proj.recovery_status === 'Planned' && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: proj.id,
                                  status: 'In Progress',
                                })
                              }
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-medium transition"
                            >
                              सुरु गर्नुहोस्
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB VIEW 2: DAMAGE ASSESSMENTS ─────────────────────────────────── */}
      {activeSubView === 'damage_reports' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">विपद् क्षति मूल्याङ्कन तथा तत्काल राहत प्रतिवेदन</h4>
                <p className="text-xs text-slate-400 mt-0.5">Post-Incident Rapid Damage Assessments & Relief Log</p>
              </div>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-semibold">
                कुल मूल्याङ्कन: रु. {(totalLossNPR).toLocaleString('en-IN')}
              </span>
            </div>

            {isDamageLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">विवरण लोड हुँदैछ...</div>
            ) : damageReports.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">कुनै क्षति प्रतिवेदन उपलब्ध छैन।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">प्रतिवेदन ID</th>
                      <th className="px-5 py-3.5 font-semibold">विपद् घटना</th>
                      <th className="px-5 py-3.5 font-semibold">घाइते / मानवीय क्षति</th>
                      <th className="px-5 py-3.5 font-semibold">अनुमानित आर्थिक क्षति</th>
                      <th className="px-5 py-3.5 font-semibold">उपलब्ध गराइएको राहत विवरण</th>
                      <th className="px-5 py-3.5 font-semibold">मूल्याङ्कन मिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {damageReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 font-mono font-medium text-amber-400">
                          {report.id}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{report.incident_description || report.incident_id}</p>
                          <span className="text-[11px] text-slate-500">{report.incident_id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              मानवीय क्षति: {report.human_casualties || 0}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                              घाइते: {report.injured_count || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-rose-400">
                          रु. {report.estimated_loss_amount?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {report.relief_provided &&
                              Object.entries(report.relief_provided).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]"
                                >
                                  {key}: <strong className="text-white">{String(val)}</strong>
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-[11px]">
                          {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'हालै'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddRecoveryProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['recovery-projects'] });
          queryClient.invalidateQueries({ queryKey: ['recovery-projects-stats'] });
          queryClient.invalidateQueries({ queryKey: ['disaster-stats'] });
        }}
      />
    </div>
  );
};
