import React, { useState } from 'react';
import { NepaliDatePicker } from '../../components/common/NepaliDatePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Employee } from './EmployeeManagementPage';
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  X,
  User,
  Flag,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';

export interface EmployeeTask {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  assignedBy: string;
  priority: string;
  status: string;
  dueDateBs: string;
  department?: string;
  collaboratorIds?: string[];
}

export const TaskBoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    collaboratorIds: [] as string[],
    priority: 'Medium',
    status: 'To Do',
    dueDateBs: '',
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<EmployeeTask[]>({
    queryKey: ['employee-tasks'],
    queryFn: () => api.get<EmployeeTask[]>('/employee-tasks'),
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => api.get<Employee[]>('/employees'),
  });

  const addMutation = useMutation({
    mutationFn: (newTask: any) => api.post('/employee-tasks', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      setShowAddModal(false);
      setEditingTaskId(null);
      setFormData({ title: '', description: '', assigneeId: '', collaboratorIds: [], priority: 'Medium', status: 'To Do', dueDateBs: '' });
    },
  });

  const editMutation = useMutation({
    mutationFn: (updatedTask: any) => api.put(`/employee-tasks/${editingTaskId}`, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      setShowAddModal(false);
      setEditingTaskId(null);
      setFormData({ title: '', description: '', assigneeId: '', collaboratorIds: [], priority: 'Medium', status: 'To Do', dueDateBs: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employee-tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/employee-tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEmployee = employees.find(emp => emp.id === formData.assigneeId);
    const department = selectedEmployee ? selectedEmployee.department : null;
    
    if (editingTaskId) {
      editMutation.mutate({ ...formData, assignedBy: 'Super Admin', department });
    } else {
      addMutation.mutate({ ...formData, assignedBy: 'Super Admin', department });
    }
  };

  const handleEdit = (task: EmployeeTask) => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      assigneeId: task.assigneeId || '',
      collaboratorIds: task.collaboratorIds || [],
      priority: task.priority || 'Medium',
      status: task.status || 'To Do',
      dueDateBs: task.dueDateBs || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("के तपाइँ निश्चित रूपमा यो कार्य हटाउन चाहनुहुन्छ?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTasks = departmentFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.department === departmentFilter || (t as any).assignee?.department === departmentFilter || employees.find(e => e.id === t.assigneeId)?.department === departmentFilter);

  const todoTasks = filteredTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed');

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const getPriorityColor = (p: string) => {
    if (p === 'High') return '#ef4444';
    if (p === 'Medium') return '#f59e0b';
    return '#10b981';
  };

  const renderTaskCard = (task: EmployeeTask) => {
    const assignee = employees.find(e => e.id === task.assigneeId);
    
    return (
    <div key={task.id} style={{ 
      background: 'rgba(255, 255, 255, 0.7)', 
      backdropFilter: 'blur(16px)',
      padding: '1.25rem', 
      borderRadius: '16px', 
      border: '1px solid rgba(255, 255, 255, 0.4)', 
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)', 
      marginBottom: '1.2rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(31, 38, 135, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.07)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, background: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority), letterSpacing: '0.5px' }}>
          {task.priority.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.9)', padding: '0.2rem 0.4rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <button onClick={() => handleEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: '4px' }} title="Edit Task">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Delete Task">
            <Trash2 size={14} />
          </button>
          
          <div style={{ width: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>

          {task.status !== 'To Do' && (
            <button onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'To Do' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }} title="Move to To Do">
              <AlertCircle size={14} />
            </button>
          )}
          {task.status !== 'In Progress' && (
            <button onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'In Progress' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }} title="Move to In Progress">
              <Clock size={14} />
            </button>
          )}
          {task.status !== 'Completed' && (
            <button onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'Completed' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }} title="Mark as Completed">
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: 700, letterSpacing: '-0.3px' }}>{task.title}</h4>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>{task.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid rgba(203, 213, 225, 0.4)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}>
              {assignee?.fullName.charAt(0) || '?'}
            </div>
            {assignee?.fullName || 'Unassigned'}
          </div>
          {task.collaboratorIds && task.collaboratorIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px' }}>सहयोगी:</span> 
              <span style={{ lineHeight: 1.4 }}>
                {task.collaboratorIds.map(id => employees.find(e => e.id === id)?.fullName).filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        {task.dueDateBs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, flexShrink: 0, marginTop: '2px', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
            <Calendar size={12} /> {task.dueDateBs}
          </div>
        )}
      </div>
    </div>
  );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={28} color="#8b5cf6" /> कार्य व्यवस्थापन (Task Board)
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>कर्मचारीहरूलाई कार्य तोक्ने र प्रगति ट्र्याक गर्ने आधुनिक Kanban बोर्ड।</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ padding: '0.8rem 1.25rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#fff', fontWeight: 600, color: '#334155' }}
          >
            <option value="all">सबै शाखाहरू (All Departments)</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ padding: '0.85rem 1.5rem', background: '#8b5cf6', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}
          >
            <Plus size={18} /> कार्य असाइन गर्नुहोस्
          </button>
        </div>
      </div>

      {tasksLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>लोड हुँदैछ...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', minHeight: '600px' }}>
          {/* TO DO Column */}
          <div style={{ background: 'rgba(241, 245, 249, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '1.25rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.7), 0 10px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid rgba(100, 116, 139, 0.1)' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.3px' }}>
                <AlertCircle size={18} color="#64748b" /> गर्नुपर्ने कार्यहरू (To Do)
              </h3>
              <span style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>{todoTasks.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {todoTasks.map(renderTaskCard)}
              {todoTasks.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '2rem' }}>कुनै कार्य छैन।</div>}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div style={{ background: '#f0f9ff', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #bae6fd' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#0ea5e9" /> गर्दै गरेको (In Progress)
              </h3>
              <span style={{ background: '#bae6fd', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>{inProgressTasks.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {inProgressTasks.map(renderTaskCard)}
              {inProgressTasks.length === 0 && <div style={{ textAlign: 'center', color: '#7dd3fc', fontSize: '0.85rem', marginTop: '2rem' }}>कुनै कार्य छैन।</div>}
            </div>
          </div>

          {/* COMPLETED Column */}
          <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #bbf7d0' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="#22c55e" /> सम्पन्न भएका (Completed)
              </h3>
              <span style={{ background: '#bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>{completedTasks.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {completedTasks.map(renderTaskCard)}
              {completedTasks.length === 0 && <div style={{ textAlign: 'center', color: '#86efac', fontSize: '0.85rem', marginTop: '2rem' }}>कुनै कार्य छैन।</div>}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>नयाँ कार्य (Task) सुम्पिनुहोस्</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>कार्यको शीर्षक *</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>विवरण</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>कर्मचारी छान्नुहोस् *</label>
                  <select required value={formData.assigneeId} onChange={(e) => setFormData({...formData, assigneeId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="">-- छान्नुहोस् --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.designation})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>सहयोगी कर्मचारीहरू (Collaborators)</label>
                  <select multiple value={formData.collaboratorIds} onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, collaboratorIds: options});
                  }} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', height: 'auto', minHeight: '60px' }}>
                    {employees.filter(emp => emp.id !== formData.assigneeId).map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                  </select>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', marginBottom: 0 }}>Ctrl/Cmd थिचेर धेरै छान्न सक्नुहुन्छ</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>प्राथमिकता *</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="High">उच्च (High)</option>
                    <option value="Medium">मध्यम (Medium)</option>
                    <option value="Low">न्यून (Low)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>म्याद (Due Date B.S.)</label>
                  <NepaliDatePicker 
                    value={formData.dueDateBs} 
                    onChange={(bsDate) => setFormData({...formData, dueDateBs: bsDate})} 
                    inputStyle={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>रद्द गर्नुहोस्</button>
                <button type="submit" disabled={addMutation.isPending} style={{ padding: '0.75rem 1.5rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> असाइन गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
