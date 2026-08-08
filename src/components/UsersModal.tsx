import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';
import { getStoredAccounts, saveAccounts } from '../utils/storage';
import { X, UserPlus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface UsersModalProps {
  user: UserSession;
  onClose: () => void;
  onAccountsUpdated: (msg: string) => void;
}

export const UsersModal: React.FC<UsersModalProps> = ({ user, onClose, onAccountsUpdated }) => {
  const [accountsMap, setAccountsMap] = useState(getStoredAccounts());

  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('supervisor');
  const [errorMsg, setErrorMsg] = useState('');

  const isMaster = user.role === 'master';

  const handleAddUser = () => {
    setErrorMsg('');
    const trimmedName = newName.trim();
    const trimmedUser = newUsername.trim().toLowerCase();
    const trimmedPass = newPassword.trim();

    if (!trimmedName || !trimmedUser || !trimmedPass) {
      setErrorMsg('Please fill in all fields (Name, Username, and Password).');
      return;
    }

    if (accountsMap[trimmedUser]) {
      setErrorMsg('An account with that username already exists.');
      return;
    }

    const updated = {
      ...accountsMap,
      [trimmedUser]: {
        displayName: trimmedName,
        password: trimmedPass,
        role: newRole
      }
    };

    if (saveAccounts(updated)) {
      setAccountsMap(updated);
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      onAccountsUpdated(`User account "${trimmedName}" created.`);
    } else {
      setErrorMsg('Failed to save account. Please try again.');
    }
  };

  const handleRemoveUser = (username: string) => {
    if (username === user.username) return;

    const updated = { ...accountsMap };
    delete updated[username];

    if (saveAccounts(updated)) {
      setAccountsMap(updated);
      onAccountsUpdated(`Account "${username}" removed.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-xl relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Supervisor Accounts
            </h2>
            <p className="text-xs text-slate-500 font-medium">Manage team access permissions</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account List */}
        <div className="divide-y divide-slate-100 mb-6">
          {Object.keys(accountsMap).map((uname) => {
            const acc = accountsMap[uname];
            const isSelf = uname === user.username;

            return (
              <div key={uname} className="py-3 flex items-center justify-between text-xs md:text-sm">
                <div>
                  <span className="font-semibold text-slate-900">{acc.displayName}</span>{' '}
                  <span className="text-slate-500 font-medium">({uname})</span>
                  {acc.role === 'master' ? (
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold ml-2">
                      Master
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 ml-2 font-medium">
                      Supervisor
                    </span>
                  )}
                </div>

                <div>
                  {isSelf ? (
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                      you
                    </span>
                  ) : (
                    isMaster && (
                      <button
                        onClick={() => handleRemoveUser(uname)}
                        className="text-rose-600 hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add User Form (Master Only) */}
        {isMaster ? (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Add New Supervisor
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Karim Hossain"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. karim"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="master">Master</option>
                </select>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleAddUser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-4">
            Only Master accounts can add or remove supervisor logins.
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
