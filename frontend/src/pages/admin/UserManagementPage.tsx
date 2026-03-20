import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { userService } from '../../services/userService';
import type { CreateUserRequest, ImportUsersResponse } from '../../services/userService';
import type { User, UserQuota } from '../../types/user';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportUsersResponse | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleEditQuota = async (user: User) => {
    try {
      const userQuota = await userService.getUserQuota(user.id);
      setQuota(userQuota);
      setSelectedUser(user);
      setShowQuotaModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load quota');
    }
  };

  const handleSaveQuota = async () => {
    if (!selectedUser || !quota) return;

    try {
      await userService.updateQuota(selectedUser.id, {
        max_instances: quota.max_instances,
        max_cpu_cores: quota.max_cpu_cores,
        max_memory_gb: quota.max_memory_gb,
        max_storage_gb: quota.max_storage_gb,
        max_gpu_count: quota.max_gpu_count,
      });
      setShowQuotaModal(false);
      setSelectedUser(null);
      setQuota(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update quota');
    }
  };

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleSaveRole = async (newRole: 'admin' | 'user') => {
    if (!selectedUser) return;

    try {
      await userService.updateRole(selectedUser.id, { role: newRole });
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleAddUser = async () => {
    try {
      const created = await userService.createUser(newUser);
      setUsers([...users, created]);
      setShowAddModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      setError('Please select a CSV file to import');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      const result = await userService.importUsers(importFile);
      setImportResult(result);
      setShowImportModal(false);
      setImportFile(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import users');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      [
        'Username',
        'Email',
        'Role',
        'Max Instances',
        'Max CPU Cores',
        'Max Memory (GB)',
        'Max Storage (GB)',
        'Max GPU Count (optional)',
      ],
      ['alice', 'alice@example.com', 'user', '10', '40', '100', '500', '2'],
      ['bob', '', 'admin', '20', '80', '200', '1000', '4'],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clawmanager-user-import-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle click on modal background to close
  const handleModalBackgroundClick = (e: React.MouseEvent, closeFn: () => void) => {
    if (e.target === e.currentTarget) {
      closeFn();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="mb-6 flex justify-end gap-3">
        <button onClick={() => setShowImportModal(true)} className="app-button-secondary">
          Import Users
        </button>
        <button onClick={() => setShowAddModal(true)} className="app-button-primary">
          Add User
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {importResult && (
          <div className="app-panel mb-4 px-4 py-4 text-sm text-[#5f5957]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-[#171212]">
                  Import completed: {importResult.created_count} created, {importResult.failed_count} failed
                </div>
                <div className="mt-1 text-[#8f5b4b]">
                  Expected columns: <code>Username,Email,Role,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count (optional)</code>
                </div>
              </div>
              <button
                onClick={() => setImportResult(null)}
                className="text-[#8f5b4b] hover:text-[#171212]"
              >
                ×
              </button>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[#eadfd8] bg-white p-3">
                <ul className="space-y-2">
                  {importResult.errors.map((item, index) => (
                    <li key={`${item.line}-${index}`} className="text-sm text-[#5f5957]">
                      Line {item.line}{item.username ? ` (${item.username})` : ''}: {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {importResult.created_users.length > 0 && (
              <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-[#eadfd8] bg-white p-3">
                <div className="mb-2 text-sm font-medium text-[#171212]">Created Accounts</div>
                <ul className="space-y-2">
                  {importResult.created_users.map((item, index) => (
                    <li key={`${item.username}-${index}`} className="rounded-md bg-[#fff8f5] px-3 py-2 text-sm text-[#5f5957]">
                      <div><span className="font-medium text-[#171212]">{item.username}</span> · {item.role}</div>
                      <div>Email: {item.email}</div>
                      <div>
                        Quota: {item.max_instances} / {item.max_cpu_cores} CPU / {item.max_memory_gb} GB / {item.max_storage_gb} GB / {item.max_gpu_count} GPU
                      </div>
                      <div>Initial password: <code>{item.initial_password}</code></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="app-panel">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditQuota(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Quota
                    </button>
                    <button
                      onClick={() => handleEditRole(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Role
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add User Modal */}
      {showImportModal && (
        <div 
          className="fixed inset-0 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50"
          onClick={(e) => handleModalBackgroundClick(e, () => setShowImportModal(false))}
        >
          <div className="relative top-20 mx-auto w-[28rem] rounded-md border bg-white p-5 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Import Users
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg border border-[#eadfd8] bg-[#fff8f5] p-3 text-sm text-[#5f5957]">
                <div className="font-medium text-[#171212]">Supported format</div>
                <div className="mt-1">CSV file with headers:</div>
                <code className="mt-2 block rounded bg-white px-2 py-1 text-xs">Username,Email,Role,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count (optional)</code>
                <div className="mt-2 text-xs text-[#8f5b4b]">
                  Username, Role, Max Instances, Max CPU Cores, Max Memory (GB) and Max Storage (GB) are required. Email and Max GPU Count are optional.
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="mt-3 inline-flex items-center rounded-md border border-[#eadfd8] bg-white px-3 py-2 text-sm font-medium text-[#5f5957] hover:bg-[#fff2ea]"
                >
                  Download CSV Template
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Import File
                </label>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-[#dc2626]"
                  >
                    Choose File
                  </button>
                  <span className="text-sm text-gray-500">
                    {importFile ? importFile.name : 'No file selected'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleImportUsers}
                disabled={!importFile || importing}
                className="rounded-md bg-[#ef4444] px-4 py-2 text-white hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={(e) => handleModalBackgroundClick(e, () => setShowAddModal(false))}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New User
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="rounded-md border border-[#eadfd8] bg-[#fff8f5] px-3 py-2 text-sm text-[#5f5957]">
                Initial password: <span className="font-medium">{newUser.role === 'admin' ? 'admin123' : 'user123'}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quota Modal */}
      {showQuotaModal && quota && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={(e) => handleModalBackgroundClick(e, () => setShowQuotaModal(false))}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Quota for {selectedUser?.username}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Instances
                </label>
                <input
                  type="number"
                  value={quota.max_instances}
                  onChange={(e) => setQuota({ ...quota, max_instances: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max CPU Cores
                </label>
                <input
                  type="number"
                  value={quota.max_cpu_cores}
                  onChange={(e) => setQuota({ ...quota, max_cpu_cores: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Memory (GB)
                </label>
                <input
                  type="number"
                  value={quota.max_memory_gb}
                  onChange={(e) => setQuota({ ...quota, max_memory_gb: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Storage (GB)
                </label>
                <input
                  type="number"
                  value={quota.max_storage_gb}
                  onChange={(e) => setQuota({ ...quota, max_storage_gb: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max GPU Count
                </label>
                <input
                  type="number"
                  value={quota.max_gpu_count}
                  onChange={(e) => setQuota({ ...quota, max_gpu_count: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowQuotaModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={(e) => handleModalBackgroundClick(e, () => setShowRoleModal(false))}
        >
          <div className="relative top-20 mx-auto p-5 border w-80 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Role for {selectedUser?.username}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSaveRole('user')}
                className={`w-full px-4 py-2 rounded-md ${
                  selectedUser?.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                User
              </button>
              <button
                onClick={() => handleSaveRole('admin')}
                className={`w-full px-4 py-2 rounded-md ${
                  selectedUser?.role === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Admin
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={(e) => handleModalBackgroundClick(e, handleCancelDelete)}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete user <strong>{userToDelete.username}</strong>? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagementPage;
