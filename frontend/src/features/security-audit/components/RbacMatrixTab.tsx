import React, { useState } from 'react';
import { Shield, Key, Users, CheckCircle, Lock, UserCheck, ShieldAlert } from 'lucide-react';
import type { SecurityRole, SecurityUser } from '../../../types/admin';

interface RbacMatrixTabProps {
  roles: SecurityRole[];
  users: SecurityUser[];
  isLoading: boolean;
}

export const RbacMatrixTab: React.FC<RbacMatrixTabProps> = ({ roles, users, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredUsers = users.filter((u) => {
    if (selectedRole === 'all') return true;
    return u.roleId === selectedRole || u.roleName === selectedRole;
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <Shield className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#38bdf8' }} />
        भूमिका तथा अधिकार म्याट्रिक्स लोड हुँदैछ...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Roles Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
              १. प्रणाली भूमिकाहरू तथा अधिकार सूची (System Roles & Permission Matrix)
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              पाँचपोखरी थाङपाल गाउँपालिका स्थानीय सरकार सञ्चालन ऐन २०७४ बमोजिम वर्गीकृत भूमिकाहरू
            </p>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            कुल भूमिका: {roles.length}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
          }}
        >
          {roles.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#38bdf8',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {r.roleName}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 500, marginTop: '0.4rem' }}>
                    {r.description}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={14} /> {r.usersCount || users.filter((u) => u.roleId === r.id).length} जना
                </div>
              </div>

              {/* Permissions List */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
                  प्रदत्त अधिकारहरू (Granted Permissions):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {r.permissions.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#cbd5e1',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                      }}
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Users Section */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '14px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={20} style={{ color: '#22c55e' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              २. सुरक्षा प्रयोगकर्ता खाता तथा दायरा (Assigned Personnel Accounts)
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            कुल सुरक्षा खाता: <strong style={{ color: '#f8fafc' }}>{users.length}</strong>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>प्रयोगकर्ता नाम (Username)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>भूमिका (Assigned Role)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>कर्मचारी संकेत (Employee ID)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>वडा कार्यक्षेत्र (Ward Scope)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>पछिल्लो लगइन (Last Login)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>स्थिति (Status)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u.id || idx}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                    backgroundColor: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.2)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                    {u.username}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                      }}
                    >
                      {u.roleName || u.roleId}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1' }}>
                    {u.employeeId || 'N/A'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1' }}>
                    {u.wardRestriction ? (
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>वडा नं {u.wardRestriction} मात्र</span>
                    ) : (
                      <span style={{ color: '#86efac' }}>समग्र पालिका (Palika Wide)</span>
                    )}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('ne-NP') : 'अहिले सम्म लगइन नभएको'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: u.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: u.isActive ? '#86efac' : '#fca5a5',
                      }}
                    >
                      {u.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
