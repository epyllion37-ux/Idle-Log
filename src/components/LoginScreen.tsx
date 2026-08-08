import React, { useState } from 'react';
import { UserAccount, UserSession } from '../types';
import { getStoredAccounts, saveAccounts, saveSession } from '../utils/storage';
import { Activity, Lock, User, AlertCircle, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [accounts, setAccounts] = useState<Record<string, UserAccount>>(() => getStoredAccounts());

  const [setupName, setSetupName] = useState('');
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const hasAccounts = Object.keys(accounts).length > 0;

  const handleSetupMaster = () => {
    setErrorMsg('');
    const name = setupName.trim();
    const user = setupUsername.trim().toLowerCase();
    const pass = setupPassword.trim();

    if (!name || !user || !pass) {
      setErrorMsg('Please fill in all fields to create your Master account.');
      return;
    }

    const updatedAccounts: Record<string, UserAccount> = {
      [user]: {
        displayName: name,
        password: pass,
        role: 'master'
      }
    };

    if (saveAccounts(updatedAccounts)) {
      setAccounts(updatedAccounts);
      saveSession(user);
      onLoginSuccess({
        username: user,
        displayName: name,
        role: 'master'
      });
    } else {
      setErrorMsg('Failed to save master account. Please try again.');
    }
  };

  const handleLogin = (uName?: string, pWord?: string) => {
    setErrorMsg('');
    const user = (uName || loginUsername).trim().toLowerCase();
    const pass = pWord || loginPassword;

    const acc = accounts[user];
    if (!acc || acc.password !== pass) {
      setErrorMsg('Incorrect username or password.');
      return;
    }

    saveSession(user);
    onLoginSuccess({
      username: user,
      displayName: acc.displayName,
      role: acc.role || 'supervisor'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-md relative">
        <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Idle Machine Log
            </h1>
            <div className="text-xs text-slate-500 font-medium">Knitting Floor Stoppage Logging System</div>
          </div>
        </div>

        {!hasAccounts ? (
          /* Master Account Setup View */
          <div>
            <h2 className="text-sm font-semibold text-indigo-600 mb-1.5">
              Set Up Initial Master Account
            </h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              No supervisor accounts exist yet. Create your first <b className="text-indigo-600 font-semibold">Master account</b> to start logging entries and managing supervisor logins.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="e.g. Rahim Uddin"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={setupUsername}
                    onChange={(e) => setSetupUsername(e.target.value)}
                    placeholder="e.g. rahim"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSetupMaster}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-xl transition-all cursor-pointer shadow-xs mt-2"
              >
                Create Master Account &amp; Continue
              </button>
            </div>
          </div>
        ) : (
          /* Standard Login View */
          <div>
            <h2 className="text-xs font-semibold text-slate-500 mb-4">
              Sign In to Supervisor Portal
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. rahim"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-xl transition-all cursor-pointer shadow-xs mt-2"
              >
                Log In
              </button>
            </form>

            {/* Quick Login Options for Convenience */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500 mb-2.5">
                Available Demo Logins:
              </div>
              <div className="space-y-2">
                {Object.keys(accounts).map((uname) => {
                  const acc = accounts[uname];
                  return (
                    <button
                      key={uname}
                      type="button"
                      onClick={() => {
                        setLoginUsername(uname);
                        setLoginPassword(acc.password);
                        handleLogin(uname, acc.password);
                      }}
                      className="w-full flex items-center justify-between text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800">{acc.displayName} ({uname})</span>
                      <span className="font-mono text-indigo-600 text-[11px] font-medium">
                        Password: {acc.password}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
