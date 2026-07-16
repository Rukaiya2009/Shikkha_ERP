import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import userService, { AppUser } from '../../dashboard/services/user.service';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  DEVELOPER: 'Developer',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:               { label: 'Active',         color: '#1B8A5A', bg: '#E4F5EC' },
  INACTIVE:             { label: 'Inactive',       color: '#B3261E', bg: '#FBEAE9' },
  SUSPENDED:            { label: 'Suspended',      color: '#8A5A00', bg: '#FBF0DA' },
  PENDING_VERIFICATION: { label: 'Pending invite', color: '#1D4ED8', bg: '#E3EDFB' },
  LOCKED:               { label: 'Locked',         color: '#6B21A8', bg: '#F3E8FD' },
};

const statusStyle = (status: string) =>
  STATUS_STYLES[status] ?? { label: status, color: '#4A5A6B', bg: '#EEF3F8' };

const PAGE_SIZE = 10;

// Order shown in the status filter dropdown. Empty value = no filter.
const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '',                     label: 'All statuses' },
  { value: 'ACTIVE',               label: 'Active' },
  { value: 'INACTIVE',             label: 'Inactive' },
  { value: 'SUSPENDED',            label: 'Suspended' },
  { value: 'LOCKED',               label: 'Locked' },
  { value: 'PENDING_VERIFICATION', label: 'Pending invite' },
];

type ViewMode = 'active' | 'deleted';

export const UserList: React.FC = () => {
  const { getUserRole } = useAuth();
  const currentRole = getUserRole();

  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Search + filter. `keyword` is the raw input; `debouncedKeyword` is what we
  // actually query with, so we don't fire a request on every keystroke.
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<AppUser | null>(null);
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  // Debounce the search box (350ms). Trim here so trailing spaces don't count
  // as a keyword and flip us into search mode.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  const isDeletedView = viewMode === 'deleted';
  const isSearchMode = !isDeletedView && debouncedKeyword.length > 0;

  const loadUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      if (viewMode === 'deleted') {
        const result = await userService.getDeletedPaginated(targetPage, PAGE_SIZE);
        setUsers(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setPage(result.pageNumber);
      } else if (debouncedKeyword) {
        // SEARCH MODE. The /search endpoint returns a flat, non-paginated list,
        // so pagination is hidden here. The status filter is applied client-side
        // on the results so search + status still compose for the user, even
        // though the backend search itself ignores status.
        const results = await userService.search(debouncedKeyword);
        const filtered = statusFilter
          ? results.filter((u) => u.status === statusFilter)
          : results;
        setUsers(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
        setPage(0);
      } else {
        const result = await userService.getAllPaginated(
          targetPage,
          PAGE_SIZE,
          undefined,
          statusFilter || undefined
        );
        setUsers(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setPage(result.pageNumber);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ||
        (viewMode === 'deleted' ? 'Could not load deleted users.' : 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }, [viewMode, debouncedKeyword, statusFilter]);

  // Any change to view / search / status rebuilds loadUsers and refetches from
  // page 0. Pagination buttons call loadUsers(page ± 1) directly.
  useEffect(() => {
    loadUsers(0);
  }, [loadUsers]);

  const switchView = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setError(null);
    setNotice(null);
    setKeyword('');
    setStatusFilter('');
    setViewMode(mode);
  };

  const handleActivate = async (target: AppUser) => {
    setNotice(null);
    try {
      await userService.setEnabled(target.id, true);
      loadUsers(page);
    } catch {
      setError(`Could not update status for ${target.name}.`);
    }
  };

  const handleDeactivateConfirmed = async () => {
    if (!deactivatingUser) return;
    setDeactivateSubmitting(true);
    setNotice(null);
    try {
      await userService.setEnabled(deactivatingUser.id, false);
      setDeactivatingUser(null);
      loadUsers(page);
    } catch {
      setError(`Could not deactivate ${deactivatingUser.name}.`);
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  const handleUnlock = async (target: AppUser) => {
    setUnlockingId(target.id);
    setError(null);
    setNotice(null);
    try {
      // Locked user's own email — see note in user.service.ts unlock().
      await userService.unlock(target.id, target.email);
      setNotice(`${target.name}'s account has been unlocked.`);
      loadUsers(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Could not unlock ${target.name}.`);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingUser) return;
    setDeleteSubmitting(true);
    try {
      await userService.delete(deletingUser.id);
      setDeletingUser(null);
      loadUsers(page);
    } catch {
      setError(`Could not delete ${deletingUser.name}.`);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleRestore = async (target: AppUser) => {
    setRestoringId(target.id);
    setError(null);
    try {
      await userService.restore(target.id);
      loadUsers(page);
    } catch {
      setError(`Could not restore ${target.name}.`);
    } finally {
      setRestoringId(null);
    }
  };

  const handleResendInvite = async (target: AppUser) => {
    setResendingId(target.id);
    setError(null);
    setNotice(null);
    try {
      await userService.resendInvite(target.id);
      setNotice(`Invitation re-sent to ${target.email}.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Could not resend the invitation to ${target.email}.`);
    } finally {
      setResendingId(null);
    }
  };

  const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const pendingCount = users.filter((u) => u.status === 'PENDING_VERIFICATION').length;

  const tabBtn = (mode: ViewMode, label: string) => (
    <button
      onClick={() => switchView(mode)}
      style={{
        fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '7px 14px',
        border: '1px solid #DCE7F0', cursor: 'pointer',
        background: viewMode === mode ? '#142334' : 'transparent',
        color: viewMode === mode ? '#fff' : '#4A5A6B',
      }}
    >
      {label}
    </button>
  );

  const smallBtn = (
    label: string,
    onClick: () => void,
    opts: { color: string; border: string; disabled?: boolean }
  ) => (
    <button
      onClick={onClick}
      disabled={opts.disabled}
      style={{
        fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '6px 11px',
        border: `1px solid ${opts.border}`, background: 'transparent', color: opts.color,
        cursor: opts.disabled ? 'not-allowed' : 'pointer', opacity: opts.disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #DCE7F0', borderRadius: 16,
      boxShadow: '0 1px 3px rgba(20,35,52,0.05)', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 22px', borderBottom: '1px solid #DCE7F0', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#142334' }}>
            {isDeletedView ? 'Deleted Users' : 'Users'}
            <span style={{ color: '#4A5A6B', fontWeight: 500, fontSize: 13, marginLeft: 8 }}>
              ({totalElements})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabBtn('active', 'Active')}
            {tabBtn('deleted', 'Deleted')}
          </div>
          {!isDeletedView && pendingCount > 0 && (
            <span style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: 100,
              fontSize: 12, fontWeight: 700, color: '#1D4ED8', background: '#E3EDFB',
            }}>
              {pendingCount} pending invite{pendingCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {!isDeletedView && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
              border: 'none', background: '#142334', color: '#fff', cursor: 'pointer',
            }}
          >
            + Add user
          </button>
        )}
      </div>

      {!isDeletedView && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '14px 22px', borderBottom: '1px solid #DCE7F0', flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#4A5A6B" strokeWidth="2" strokeLinecap="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search name, email, or school…"
              maxLength={120}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '8px 30px',
                fontSize: 13, border: '1px solid #DCE7F0', borderRadius: 9,
                color: '#142334', fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: '#4A5A6B', fontSize: 16, lineHeight: 1, padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 11px', fontSize: 13, border: '1px solid #DCE7F0', borderRadius: 9,
              color: '#142334', background: '#fff', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div style={{ background: '#FBEAE9', color: '#B3261E', fontSize: 13, padding: '10px 22px' }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: '#E4F5EC', color: '#1B8A5A', fontSize: 13, padding: '10px 22px' }}>
          {notice}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#4A5A6B', fontSize: 13.5 }}>
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#4A5A6B', fontSize: 13.5 }}>
          {isDeletedView
            ? 'No deleted users.'
            : isSearchMode
              ? `No users match "${debouncedKeyword}".`
              : 'No users found.'}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Role', 'School', 'Status', ''].map((h, i) => (
                <th key={i} style={{
                  textAlign: i === 4 ? 'right' : 'left', fontSize: 11.5, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: '#4A5A6B', fontWeight: 700,
                  padding: '12px 22px', borderBottom: '1px solid #DCE7F0', background: '#F8FBFE',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const s = statusStyle(u.status);
              const isPending = u.status === 'PENDING_VERIFICATION';
              return (
                <tr key={u.id} style={{ opacity: isDeletedView ? 0.72 : 1 }}>
                  <td style={{ padding: '14px 22px', borderBottom: '1px solid #DCE7F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontFamily: 'Manrope, sans-serif', fontWeight: 700,
                        fontSize: 13, color: '#06263D', background: '#81D5FF', flexShrink: 0,
                      }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</div>
                        <div style={{ color: '#4A5A6B', fontSize: 12.5 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: '1px solid #DCE7F0', fontSize: 13.5 }}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: '1px solid #DCE7F0', fontSize: 13.5 }}>
                    {u.schoolId ?? <span style={{ color: '#4A5A6B' }}>— platform —</span>}
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: '1px solid #DCE7F0' }}>
                    {isDeletedView ? (
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 100,
                        fontSize: 12, fontWeight: 700, color: '#8A5A00', background: '#FBF0DA',
                      }}>
                        Deleted
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 100,
                        fontSize: 12, fontWeight: 700, color: s.color, background: s.bg,
                      }}>
                        {s.label}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: '1px solid #DCE7F0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {isDeletedView ? (
                        smallBtn(
                          restoringId === u.id ? 'Restoring…' : 'Restore',
                          () => handleRestore(u),
                          { color: '#1B8A5A', border: '#CDE8D8', disabled: restoringId === u.id }
                        )
                      ) : (
                        <>
                          {u.status === 'LOCKED' && smallBtn(
                            unlockingId === u.id ? 'Unlocking…' : 'Unlock',
                            () => handleUnlock(u),
                            { color: '#6B21A8', border: '#D8C4F0', disabled: unlockingId === u.id }
                          )}
                          {isPending && smallBtn(
                            resendingId === u.id ? 'Sending…' : 'Resend invite',
                            () => handleResendInvite(u),
                            { color: '#1D4ED8', border: '#C7DBF7', disabled: resendingId === u.id }
                          )}
                          {smallBtn('Edit', () => setEditingUser(u), { color: '#142334', border: '#DCE7F0' })}
                          {smallBtn(
                            u.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
                            u.status === 'ACTIVE'
                              ? () => setDeactivatingUser(u)
                              : () => handleActivate(u),
                            { color: '#4A5A6B', border: '#DCE7F0' }
                          )}
                          {smallBtn('Delete', () => setDeletingUser(u), { color: '#B3261E', border: '#FBEAE9' })}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!loading && !isSearchMode && totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 22px', borderTop: '1px solid #DCE7F0', fontSize: 13,
        }}>
          <span style={{ color: '#4A5A6B' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => loadUsers(page - 1)}
              disabled={page === 0}
              style={{
                fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '6px 12px',
                border: '1px solid #DCE7F0', background: page === 0 ? '#EEF5FC' : 'transparent',
                color: page === 0 ? '#4A5A6B' : '#142334', cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <button
              onClick={() => loadUsers(page + 1)}
              disabled={page >= totalPages - 1}
              style={{
                fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '6px 12px',
                border: '1px solid #DCE7F0', background: page >= totalPages - 1 ? '#EEF5FC' : 'transparent',
                color: page >= totalPages - 1 ? '#4A5A6B' : '#142334',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => { setKeyword(''); setStatusFilter(''); loadUsers(0); }}
      />
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={() => loadUsers(page)}
      />

      {deletingUser && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
          }}
          onClick={() => !deleteSubmitting && setDeletingUser(null)}
        >
          <div
            style={{
              background: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth: 400,
              boxShadow: '0 20px 60px rgba(10,20,32,0.25)', fontFamily: 'Inter, sans-serif', padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#142334' }}>
              Delete {deletingUser.name}?
            </div>
            <div style={{ fontSize: 13, color: '#4A5A6B', marginTop: 10, lineHeight: 1.55 }}>
              This removes them from the active user list. It's a soft delete — their
              records (grades, attendance, history) are kept, and this can be reversed
              later from the Deleted view.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setDeletingUser(null)}
                disabled={deleteSubmitting}
                style={{
                  fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
                  border: '1px solid #DCE7F0', background: 'transparent', color: '#142334', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleteSubmitting}
                style={{
                  fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
                  border: 'none', background: '#B3261E', color: '#fff',
                  cursor: deleteSubmitting ? 'not-allowed' : 'pointer', opacity: deleteSubmitting ? 0.7 : 1,
                }}
              >
                {deleteSubmitting ? 'Deleting…' : 'Delete user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deactivatingUser && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,20,32,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
          }}
          onClick={() => !deactivateSubmitting && setDeactivatingUser(null)}
        >
          <div
            style={{
              background: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth: 400,
              boxShadow: '0 20px 60px rgba(10,20,32,0.25)', fontFamily: 'Inter, sans-serif', padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#142334' }}>
              Deactivate {deactivatingUser.name}?
            </div>
            <div style={{ fontSize: 13, color: '#4A5A6B', marginTop: 10, lineHeight: 1.55 }}>
              They'll stay in the user list but won't be able to sign in until an admin
              reactivates them. This is reversible.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setDeactivatingUser(null)}
                disabled={deactivateSubmitting}
                style={{
                  fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
                  border: '1px solid #DCE7F0', background: 'transparent', color: '#142334', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateConfirmed}
                disabled={deactivateSubmitting}
                style={{
                  fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
                  border: 'none', background: '#8A5A00', color: '#fff',
                  cursor: deactivateSubmitting ? 'not-allowed' : 'pointer', opacity: deactivateSubmitting ? 0.7 : 1,
                }}
              >
                {deactivateSubmitting ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};