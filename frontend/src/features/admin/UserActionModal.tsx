import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { usersApi, User } from '../../api/users';
import { ROLE_DEFINITIONS } from '../super-admin/SuperAdminPage';
import { type Branch } from '../../api/branches';

interface UserActionModalProps {
  isOpen: boolean;
  user: any;
  branches: Branch[];
  onClose: () => void;
}

export const UserActionModal: React.FC<UserActionModalProps> = ({
  isOpen,
  user,
  branches,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        const active = user.isActive !== undefined ? Boolean(user.isActive) : (user.is_active !== undefined ? Boolean(user.is_active) : true);
        setEditingUser({
          ...user,
          fullName: user.fullName || user.full_name || '',
          isActive: active,
          is_active: active,
          password: ''
        });
      } else {
        setEditingUser({ fullName: '', email: '', role: 'admin', branchId: '', isActive: true, is_active: true, password: '' });
      }
    }
  }, [isOpen, user]);

  const saveUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const active = data.isActive !== undefined ? Boolean(data.isActive) : (data.is_active !== undefined ? Boolean(data.is_active) : true);
      const payload = {
        fullName: data.fullName,
        full_name: data.fullName,
        email: data.email,
        role: data.role,
        branchId: data.branchId,
        isActive: active,
        is_active: active,
        ...(data.password && { password: data.password }),
      };

      if (data.id) return usersApi.update(data.id, payload);
      return usersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.response?.data?.detail?.[0]?.msg || 'प्रयोगकर्ता सुरक्षित गर्न असफल भयो।');
    }
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id && !editingUser?.password) {
      alert('नयाँ खाताको लागि पासवर्ड अनिवार्य छ!');
      return;
    }
    saveUserMutation.mutate(editingUser);
  };

  if (!isOpen || !editingUser) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {editingUser.id ? 'कर्मचारी विवरण सम्पादन' : 'नयाँ कर्मचारी खाता'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>नाम र पद *</label>
              <input
                type="text"
                required
                placeholder="उदा. राम बहादुर (सुब्बा)"
                value={editingUser.fullName}
                onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                className="dt-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>इमेल *</label>
              <input
                type="email"
                required
                placeholder="ram@example.com"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="dt-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>पासवर्ड (नयाँ सेट गर्न मात्र)</label>
              <input
                type="password"
                placeholder="नयाँ पासवर्ड राख्नुहोस्"
                value={editingUser.password || ''}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                className="dt-input"
                required={!editingUser.id}
              />
              <small style={{ color: '#64748b' }}>{editingUser.id ? 'पासवर्ड परिवर्तन गर्न मात्र भर्नुहोस्' : 'नयाँ खाताको लागि पासवर्ड अनिवार्य छ'}</small>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>भूमिका (Role) *</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="dt-input"
              >
                {ROLE_DEFINITIONS.filter(r => r.value !== 'super_admin').map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                शाखा / कार्यक्षेत्र (Branch/Ward) {!editingUser.role?.startsWith('public_') && '*'}
              </label>
              <select
                required={!editingUser.role?.startsWith('public_')}
                value={editingUser.branchId || ''}
                onChange={(e) => setEditingUser({ ...editingUser, branchId: e.target.value })}
                className="dt-input"
              >
                <option value="">
                  {editingUser.role?.startsWith('public_') ? 'लागू हुँदैन (सार्वजनिक खाता)' : 'छान्नुहोस्...'}
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>स्थिति</label>
              <select
                value={editingUser.isActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const val = e.target.value === 'active';
                  setEditingUser({ ...editingUser, isActive: val, is_active: val });
                }}
                className="dt-input"
              >
                <option value="active">सक्रिय (Active)</option>
                <option value="inactive">निष्क्रिय (Inactive)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="dt-btn dt-btn-outline" disabled={saveUserMutation.isPending}>
                रद्द गर्नुहोस्
              </button>
              <button type="submit" className="dt-btn dt-btn-primary" disabled={saveUserMutation.isPending}>
                {saveUserMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
