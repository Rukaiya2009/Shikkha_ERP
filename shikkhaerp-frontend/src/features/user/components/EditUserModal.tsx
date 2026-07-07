// src/features/user/components/EditUserModal.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import userService, { AppUser, UpdateUserPayload } from '../../dashboard/services/user.service';

interface EditUserModalProps {
  isOpen: boolean;
  user: AppUser | null; // the user being edited
  onClose: () => void;
  onUpdated: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  DEVELOPER: 'Developer',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

function getAssignableRoles(currentRole: string): string[] {
  if (currentRole === 'super_admin') {
    return ['SUPER_ADMIN', 'DEVELOPER', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
  }
  return ['TEACHER', 'STUDENT', 'PARENT'];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, user: targetUser, onClose, onUpdated }) => {
  const { getUserRole } = useAuth();
  const currentRole = getUserRole();
  const isSuperAdmin = currentRole === 'super_admin';
  const assignableRoles = getAssignableRoles(currentRole);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync form fields whenever a different user is opened for editing
  useEffect(() => {
    if (targetUser) {
      setName(targetUser.name);
      setRole(targetUser.role);
      setError(null);
    }
  }, [targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError('Full name is required.');

    // Deliberately no `password` key here — matches UserService.updateUser()
    // on the backend, which never touches password on update.
    const payload: UpdateUserPayload = {
      name: name.trim(),
      role,
    };

    setSubmitting(true);
    try {
      await userService.update(targetUser.id, payload);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save changes. Please try again.');
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
      onClick={onClose}
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
            Edit {targetUser.name}
          </div>
          <div style={{ fontSize: 12.5, color: '#4A5A6B', marginTop: 4 }}>
            Password is never changed from this form.
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
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="Email">
            <input type="email" value={targetUser.email} disabled className="locked" />
          </Field>

          <Field
            label="Role"
            hint={!isSuperAdmin ? 'School Admins can only assign Teacher, Student, or Parent.' : undefined}
          >
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {assignableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </Field>

          <Field label="School">
            <input type="text" value={targetUser.schoolId ?? ''} disabled className="locked" />
          </Field>
        </div>

        <div style={{
          padding: '16px 24px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10,
          borderTop: '1px solid #DCE7F0', marginTop: 4,
        }}>
          <button
            onClick={onClose}
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
            {submitting ? 'Saving…' : 'Save changes'}
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