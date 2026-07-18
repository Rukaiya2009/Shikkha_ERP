import { useState } from 'react';
import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MIN_LENGTH = 8;

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState({ old: false, next: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    setShow({ old: false, next: false, confirm: false });
    setError(null); setDone(false); setSubmitting(false);
  };

  const close = () => { if (!submitting) { reset(); onClose(); } };

  // Mirrors the backend rules so the user gets instant feedback and we never
  // fire an obviously-invalid request.
  const validate = (): string | null => {
    if (!oldPassword) return 'Enter your current password.';
    if (newPassword.length < MIN_LENGTH) return `New password must be at least ${MIN_LENGTH} characters.`;
    if (newPassword === oldPassword) return 'New password must be different from your current one.';
    if (newPassword !== confirmPassword) return 'New password and confirmation do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    setError(null);
    try {
      // Bearer token is attached by the axios request interceptor; the backend
      // identifies the user from that JWT, so we send only the two passwords.
      await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
      setDone(true);
      onSuccess?.();
    } catch (err: any) {
      // 400 = business error (e.g. wrong current password) with a message.
      setError(err?.response?.data?.message || 'Could not change your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12.5, fontWeight: 600, color: '#142334', marginBottom: 6,
  };
  const wrapStyle: React.CSSProperties = { position: 'relative', marginBottom: 14 };
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 44px 9px 12px', fontSize: 13.5,
    border: '1px solid #DCE7F0', borderRadius: 10, color: '#142334',
    fontFamily: 'Inter, sans-serif', outline: 'none',
  };
  const eyeBtnStyle: React.CSSProperties = {
    position: 'absolute', right: 8, top: 32, border: 'none', background: 'transparent',
    cursor: 'pointer', color: '#4A5A6B', fontSize: 12, fontWeight: 600, padding: '4px 6px',
  };

  const field = (
    label: string,
    value: string,
    setter: (v: string) => void,
    key: 'old' | 'next' | 'confirm',
  ) => (
    <div style={wrapStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={show[key] ? 'text' : 'password'}
        value={value}
        onChange={(e) => setter(e.target.value)}
        disabled={submitting || done}
        autoComplete={key === 'old' ? 'current-password' : 'new-password'}
        style={inputStyle}
      />
      <button
        type="button"
        onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
        style={eyeBtnStyle}
        aria-label={show[key] ? 'Hide password' : 'Show password'}
      >
        {show[key] ? 'Hide' : 'Show'}
      </button>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
      }}
      onClick={close}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth: 400,
          boxShadow: '0 20px 60px rgba(10,20,32,0.25)', fontFamily: 'Inter, sans-serif', padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#142334' }}>
          Change password
        </div>

        {done ? (
          <>
            <div style={{ fontSize: 13, color: '#1B8A5A', marginTop: 12, lineHeight: 1.55 }}>
              Your password has been changed. You'll use the new one next time you sign in.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={close}
                style={{
                  fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
                  border: 'none', background: '#142334', color: '#fff', cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: '#4A5A6B', marginTop: 8, marginBottom: 16, lineHeight: 1.5 }}>
              Enter your current password, then choose a new one (at least {MIN_LENGTH} characters).
            </div>

            {field('Current password', oldPassword, setOldPassword, 'old')}
            {field('New password', newPassword, setNewPassword, 'next')}
            {field('Confirm new password', confirmPassword, setConfirmPassword, 'confirm')}

            {error && (
              <div style={{
                background: '#FBEAE9', color: '#B3261E', fontSize: 12.5,
                padding: '9px 12px', borderRadius: 10, marginTop: 4, marginBottom: 4,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button
                onClick={close}
                disabled={submitting}
                style={{
                  fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
                  border: '1px solid #DCE7F0', background: 'transparent', color: '#142334',
                  cursor: submitting ? 'not-allowed' : 'pointer',
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
                {submitting ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};