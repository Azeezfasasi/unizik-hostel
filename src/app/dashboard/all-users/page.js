
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Users, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PageHeader from "@/components/dashboard-component/ui/PageHeader";
import { TableSkeleton } from "@/components/dashboard-component/ui/Skeleton";
import EmptyState from "@/components/dashboard-component/ui/EmptyState";
import Pagination from "@/components/dashboard-component/ui/Pagination";
import ConfirmModal from "@/components/dashboard-component/ui/ConfirmModal";
import StatusBadge from "@/components/dashboard-component/ui/StatusBadge";
import { notify } from "@/components/dashboard-component/ui/toast";

const PAGE_SIZE = 10;

export default function AllUsersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { token } = useAuth();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Modal states
  const [editModal, setEditModal] = useState({ open: false, user: null, loading: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, loading: false });
  const [statusModal, setStatusModal] = useState({ open: false, user: null, loading: false });
  const [roleModal, setRoleModal] = useState({ open: false, user: null, loading: false, newRole: "" });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    department: "",
    position: "",
  });

  // Set mounted flag
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      limit: PAGE_SIZE,
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { isActive: status }),
    });
    const res = await fetch(`/api/users?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, role, status, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleEdit(user) {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      company: user.company || "",
      department: user.department || "",
      position: user.position || "",
    });
    setEditModal({ open: true, user, loading: false });
  }

  function handleDelete(user) {
    setDeleteModal({ open: true, user, loading: false });
  }

  function handleChangeRole(user) {
    setRoleModal({ open: true, user, loading: false, newRole: user.role });
  }

  function handleChangeStatus(user) {
    setStatusModal({ open: true, user, loading: false });
  }

  async function submitEditUser() {
    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      notify.error("First name, last name, and email are required");
      return;
    }

    setEditModal(prev => ({ ...prev, loading: true }));
    try {
      const userId = editModal.user._id;
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        notify.success("User updated successfully");
        setEditModal({ open: false, user: null, loading: false });
        // Refresh users list
        await fetchUsers();
      } else {
        notify.error(data.message || `Failed to update user (${res.status})`);
      }
    } catch (err) {
      notify.error(`Error: ${err.message}`);
    } finally {
      setEditModal(prev => ({ ...prev, loading: false }));
    }
  }

  async function submitDeleteUser() {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const userId = deleteModal.user._id;
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        notify.success("User deleted successfully");
        // Remove user from local state immediately
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        // Update total count
        setTotal(prevTotal => Math.max(0, prevTotal - 1));
        setDeleteModal({ open: false, user: null, loading: false });
      } else {
        const data = await res.json();
        notify.error(data.message || `Failed to delete user (${res.status})`);
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      notify.error(`Error: ${err.message}`);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  }

  async function submitChangeStatus() {
    setStatusModal(prev => ({ ...prev, loading: true }));
    try {
      const userId = statusModal.user._id;
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        notify.success("User status updated successfully");
        setStatusModal({ open: false, user: null, loading: false });
        // Refresh users list
        await fetchUsers();
      } else {
        const data = await res.json();
        notify.error(data.message || `Failed to update status (${res.status})`);
      }
    } catch (err) {
      notify.error(`Error: ${err.message}`);
    } finally {
      setStatusModal(prev => ({ ...prev, loading: false }));
    }
  }

  async function submitChangeRole() {
    if (!roleModal.newRole) {
      notify.error("Please select a role");
      return;
    }

    setRoleModal(prev => ({ ...prev, loading: true }));
    try {
      const userId = roleModal.user._id;
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: roleModal.newRole }),
      });

      if (res.ok) {
        notify.success("User role updated successfully");
        setRoleModal({ open: false, user: null, loading: false, newRole: "" });
        // Refresh users list
        await fetchUsers();
      } else {
        const data = await res.json();
        notify.error(data.message || `Failed to update role (${res.status})`);
      }
    } catch (err) {
      notify.error(`Error: ${err.message}`);
    } finally {
      setRoleModal(prev => ({ ...prev, loading: false }));
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['super admin']}>
      <div className="max-w-7xl mx-auto space-y-6 mt-4 md:mt-8">
        <PageHeader
          icon={Users}
          title="All Users"
          subtitle="View and manage every account in the system"
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
            <select
              value={role}
              onChange={e => { setRole(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="super admin">Super Admin</option>
            </select>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : users.length === 0 ? (
            <EmptyState title="No users found" message="Try adjusting your search or filters." />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.firstName} {user.lastName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize whitespace-nowrap">{user.role}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => handleEdit(user)} className="px-2.5 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-xs font-medium transition-colors">Edit</button>
                            <button onClick={() => handleChangeRole(user)} className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition-colors">Change Role</button>
                            <button onClick={() => handleChangeStatus(user)} className="px-2.5 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-medium transition-colors">Change Status</button>
                            <button onClick={() => handleDelete(user)} className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
            pageSize={PAGE_SIZE}
          />
        </div>

        {/* Edit Modal */}
        {editModal.open && editModal.user && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Edit User</h2>
                <button
                  onClick={() => setEditModal({ open: false, user: null, loading: false })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 p-5 flex gap-3">
                <button
                  onClick={submitEditUser}
                  disabled={editModal.loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                >
                  {editModal.loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditModal({ open: false, user: null, loading: false })}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <ConfirmModal
          isOpen={deleteModal.open && !!deleteModal.user}
          title="Delete User"
          message={deleteModal.user ? `Are you sure you want to delete ${deleteModal.user.firstName} ${deleteModal.user.lastName}? This action cannot be undone.` : ''}
          confirmLabel="Delete"
          tone="danger"
          isLoading={deleteModal.loading}
          onConfirm={submitDeleteUser}
          onClose={() => setDeleteModal({ open: false, user: null, loading: false })}
        />

        {/* Change Status Modal */}
        <ConfirmModal
          isOpen={statusModal.open && !!statusModal.user}
          title="Change Status"
          message={statusModal.user ? `Change ${statusModal.user.firstName} ${statusModal.user.lastName} to ${statusModal.user.isActive ? 'Inactive' : 'Active'}?` : ''}
          confirmLabel="Confirm"
          tone="primary"
          isLoading={statusModal.loading}
          onConfirm={submitChangeStatus}
          onClose={() => setStatusModal({ open: false, user: null, loading: false })}
        />

        {/* Change Role Modal */}
        {roleModal.open && roleModal.user && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Change Role</h2>
                <button
                  onClick={() => setRoleModal({ open: false, user: null, loading: false, newRole: "" })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4">
                  Current role: <strong className="capitalize">{roleModal.user.role}</strong>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select New Role</label>
                <select
                  value={roleModal.newRole}
                  onChange={(e) => setRoleModal({ ...roleModal, newRole: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                >
                  <option value="">-- Select Role --</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="super admin">Super Admin</option>
                </select>
              </div>
              <div className="border-t border-gray-100 p-5 flex gap-3">
                <button
                  onClick={submitChangeRole}
                  disabled={roleModal.loading || !roleModal.newRole}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                >
                  {roleModal.loading ? "Updating..." : "Update Role"}
                </button>
                <button
                  onClick={() => setRoleModal({ open: false, user: null, loading: false, newRole: "" })}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
