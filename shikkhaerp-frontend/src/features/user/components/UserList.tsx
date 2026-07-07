// src/features/user/components/UserList.tsx
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

const PAGE_SIZE = 10;

export const UserList: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const currentRole = getUserRole();
  const isSuperAdmin = currentRole === 'super_admin';

  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      // Backend now enforces school scoping server-side for non-super-admins
      // (see UserController.resolveEffectiveSchoolId) — no client-side
      // filtering needed anymore. What comes back is already correctly scoped.
      const result = await userService.getAllPaginated(targetPage, PAGE_SIZE);

      setUsers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.pageNumber);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(0);
  }, [loadUsers]);

  const handleDeactivateToggle = async (target: AppUser) => {
    const nextEnabled = target.status !== 'ACTIVE';
    try {
      await userService.setEnabled(target.id, nextEnabled);
      loadUsers(page);
    } catch {
      setError(`Could not update status for ${target.name}.`);
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

  const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #DCE7F0', borderRadius: 16,
      boxShadow: '0 1px 3px rgba(20,35,52,0.05)', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 22px', borderBottom: '1px solid #DCE7F0', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#142334' }}>
          Users <span style={{ color: '#4A5A6B', fontWeight: 500, fontSize: 13, marginLeft: 8 }}>
            ({totalElements})
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '9px 16px',
            border: 'none', background: '#142334', color: '#fff', cursor: 'pointer',
          }}
        >
          + Add user
        </button>
      </div>

      {error && (
        <div style={{ background: '#FBEAE9', color: '#B3261E', fontSize: 13, padding: '10px 22px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#4A5A6B', fontSize: 13.5 }}>
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#4A5A6B', fontSize: 13.5 }}>
          No users found.
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
            {users.map((u) => (
              <tr key={u.id}>
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
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    color: u.status === 'ACTIVE' ? '#1B8A5A' : '#B3261E',
                    background: u.status === 'ACTIVE' ? '#E4F5EC' : '#FBEAE9',
                  }}>
                    {u.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #DCE7F0', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setEditingUser(u)}
                      style={{
                        fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '6px 11px',
                        border: '1px solid #DCE7F0', background: 'transparent', color: '#142334', cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivateToggle(u)}
                      style={{
                        fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '6px 11px',
                        border: '1px solid #DCE7F0', background: 'transparent', color: '#4A5A6B', cursor: 'pointer',
                      }}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setDeletingUser(u)}
                      style={{
                        fontWeight: 600, fontSize: 12.5, borderRadius: 8, padding: '6px 11px',
                        border: '1px solid #FBEAE9', background: 'transparent', color: '#B3261E', cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
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
        onCreated={() => loadUsers(0)}
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
              later from the deleted-users view.
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
    </div>
  );
};