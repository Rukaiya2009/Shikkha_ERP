// src/features/user/components/AddUserModal.tsx
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import userService, { CreateUserPayload } from '../../dashboard/services/user.service';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void; // call this to refresh the user list after a successful create
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  DEVELOPER: 'Developer',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

// Mirrors the backend rule: a School Admin must never be able to grant
// super_admin or developer. These options simply don't exist in their form —
// this isn't just hidden by CSS, the <option> is never rendered.
function getAssignableRoles(currentRole: string): string[] {
  if (currentRole === 'super_admin') {
    return ['SUPER_ADMIN', 'DEVELOPER', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
  }
  return ['TEACHER', 'STUDENT', 'PARENT'];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { user, getUserRole } = useAuth();
  const currentRole = getUserRole(); // 'super_admin' | 'school_admin' | ...
  const isSuperAdmin = currentRole === 'super_admin';
  const assignableRoles = getAssignableRoles(currentRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(assignableRoles[0]);
  const [schoolId, setSchoolId] = useState(isSuperAdmin ? '' : (user?.schoolId ?? ''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setName('');
    setEmail('');
    setRole(assignableRoles[0]);
    setSchoolId(isSuperAdmin ? '' : (user?.schoolId ?? ''));
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) return setError('Full name is required.');
    if (!email.trim()) return setError('Email is required.');

    const payload: CreateUserPayload = {
      name: name.trim(),
      email: email.trim(),
      role,
      // School Admins can only ever create users in their own school —
      // this is enforced here, not left to whatever they type.
      schoolId: isSuperAdmin ? (schoolId.trim() || null) : (user?.schoolId ?? null),
    };

    setSubmitting(true);
    try {
      await userService.create(payload);
      onCreated();
      resetAndClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create user. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
      }}
      onClick={resetAndClose}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth: 460,
          boxShadow: '0 20px 60px rgba(10,20,32,0.25)', fontFamily: 'Inter, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#142334' }}>
            Add user
          </div>
          <div style={{ fontSize: 12.5, color: '#4A5A6B', marginTop: 4 }}>
            They'll receive an email to set up their own password.
          </div>
        </div>

        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{
              background: '#FBEAE9', color: '#B3261E', fontSize: 13, padding: '10px 12px',
              borderRadius: 9, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <Field label="Full name">
            <input
              type="text"
              placeholder="e.g. Nusrat Jahan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              placeholder="name@school.edu.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field
            label="Role"
            hint={!isSuperAdmin ? 'School Admins can only create Teacher, Student, or Parent accounts.' : undefined}
          >
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {assignableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </Field>

          <Field label="School">
            {isSuperAdmin ? (
              <input
                type="text"
                placeholder="e.g. PISD (leave blank for platform-level)"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
              />
            ) : (
              <input type="text" value={user?.schoolId ?? ''} disabled className="locked" />
            )}
          </Field>
        </div>

        <div style={{
          padding: '16px 24px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10,
          borderTop: '1px solid #DCE7F0', marginTop: 4,
        }}>
          <button
            onClick={resetAndClose}
            disabled={submitting}
            style={{
              fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
              border: '1px solid #DCE7F0', background: 'transparent', color: '#142334', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
              border: 'none', background: '#142334', color: '#fff',
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Sending invite…' : 'Send invite'}
          </button>
        </div>
      </div>

      <style>{`
        input, select {
          width: 100%; padding: 10px 12px; border-radius: 9px; border: 1px solid #DCE7F0;
          font-family: 'Inter', sans-serif; font-size: 13.5px; background: #FAFCFE; box-sizing: border-box;
        }
        input:focus, select:focus {
          outline: 2px solid #81D5FF; outline-offset: 1px; border-color: #2E9BE0;
        }
        input.locked {
          background: #EEF5FC !important; color: #4A5A6B; cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: '#142334' }}>
      {label}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11.5, color: '#4A5A6B', marginTop: 5 }}>{hint}</div>}
  </div>
);