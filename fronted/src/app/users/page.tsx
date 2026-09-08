"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedPage from "@/app/components/ProtectedPage";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const roles = [
  "Admin",
  "Fleet Manager",
  "Operations",
  "Finance",
  "Viewer",
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Viewer",
  });

  const [newPassword, setNewPassword] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/users");
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreateModal() {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "Viewer",
    });

    setError("");
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        await apiFetch(`/users/${editingUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
          }),
        });
      } else {
        await apiFetch("/users", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        });
      }

      setShowModal(false);
      setEditingUser(null);

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save user.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(user: User) {
    const action = user.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${user.name}?`,
      )
    ) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to change user status.",
      );
    }
  }

  function openPasswordModal(user: User) {
    setPasswordUser(user);
    setNewPassword("");
    setError("");
    setShowPasswordModal(true);
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();

    if (!passwordUser) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/users/${passwordUser.id}/password`, {
        method: "PATCH",
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      setShowPasswordModal(false);
      setPasswordUser(null);
      setNewPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to change password.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: User) {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${user.name}?`,
      )
    ) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/users/${user.id}`, {
        method: "DELETE",
      });

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user.",
      );
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && user.isActive) ||
      (statusFilter === "Inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUsers = users.filter(
    (user) => user.isActive,
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive,
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "Admin",
  ).length;

  return (
    <ProtectedPage permission="users">
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="mb-1 text-sm font-medium text-blue-400">
                ADMINISTRATION
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage FleetFlow users, roles, access and account
                status.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              + Create User
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total Users
              </p>
              <p className="mt-2 text-3xl font-bold">
                {users.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Active Users
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {activeUsers}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Inactive Users
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-400">
                {inactiveUsers}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Administrators
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-400">
                {adminUsers}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name or email..."
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All Roles</option>

                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            {loading ? (
              <div className="p-10 text-center text-slate-400">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-slate-800 bg-slate-950/60">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        User
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Role
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Created
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium">
                              {user.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {user.isActive ? (
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {new Date(
                            user.createdAt,
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                openEditModal(user)
                              }
                              className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                openPasswordModal(user)
                              }
                              className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                            >
                              Password
                            </button>

                            <button
                              onClick={() =>
                                changeStatus(user)
                              }
                              className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                                user.isActive
                                  ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                                  : "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                              }`}
                            >
                              {user.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              onClick={() =>
                                deleteUser(user)
                              }
                              className="rounded-md border border-red-500/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingUser
                    ? "Update the user's account information."
                    : "Create a new FleetFlow user account."}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Full Name
                  </label>

                  <input
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        email: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Password
                    </label>

                    <input
                      required
                      minLength={8}
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          password: event.target.value,
                        })
                      }
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        role: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingUser
                        ? "Save Changes"
                        : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && passwordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set a new password for {passwordUser.name}.
                </p>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    New Password
                  </label>

                  <input
                    required
                    minLength={8}
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!saving) {
                        setShowPasswordModal(false);
                        setPasswordUser(null);
                      }
                    }}
                    disabled={saving}
                    className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
