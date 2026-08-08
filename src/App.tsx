import { useState, useEffect } from 'react';
import { IdleRecord, UserSession } from './types';
import { clearSession, getStoredSession, seedInitialDataIfEmpty } from './utils/storage';
import { Header } from './components/Header';
import { Tabs, TabType } from './components/Tabs';
import { EntryForm } from './components/EntryForm';
import { RecordsTable } from './components/RecordsTable';
import { Dashboard } from './components/Dashboard';
import { EditModal } from './components/EditModal';
import { HistoryModal } from './components/HistoryModal';
import { DeleteModal } from './components/DeleteModal';
import { UsersModal } from './components/UsersModal';
import { DataModal } from './components/DataModal';
import { LoginScreen } from './components/LoginScreen';
import { Toast } from './components/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('entry');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Modals state
  const [editingRecord, setEditingRecord] = useState<IdleRecord | null>(null);
  const [historyRecord, setHistoryRecord] = useState<IdleRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<IdleRecord | null>(null);
  const [isUsersOpen, setIsUsersOpen] = useState<boolean>(false);
  const [isDataOpen, setIsDataOpen] = useState<boolean>(false);

  // Reason search pass-through from Dashboard to Records
  const [initialReasonFilter, setInitialReasonFilter] = useState<string>('');

  useEffect(() => {
    // Seed sample data and accounts if empty
    seedInitialDataIfEmpty();

    // Check existing session
    const session = getStoredSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setToastMessage('Logged out');
  };

  const handleEntrySaved = (msg: string) => {
    setToastMessage(msg);
    triggerRefresh();
  };

  const handleDashboardReasonClick = (reason: string) => {
    setInitialReasonFilter(reason);
    setActiveTab('records');
  };

  if (!currentUser) {
    return (
      <>
        <LoginScreen onLoginSuccess={(session) => setCurrentUser(session)} />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 w-full flex flex-col">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1">
        {/* Top Header Board */}
        <Header
          user={currentUser}
          onOpenUsers={() => setIsUsersOpen(true)}
          onOpenData={() => setIsDataOpen(true)}
          onLogout={handleLogout}
        />

        {/* Tab Switcher */}
        <Tabs activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        {/* Tab Panels */}
        {activeTab === 'entry' && (
          <EntryForm user={currentUser} onEntrySaved={handleEntrySaved} />
        )}

        {activeTab === 'records' && (
          <RecordsTable
            onEdit={(rec) => setEditingRecord(rec)}
            onHistory={(rec) => setHistoryRecord(rec)}
            onDelete={(rec) => setDeletingRecord(rec)}
            refreshTrigger={refreshTrigger}
            initialReasonFilter={initialReasonFilter}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectReason={handleDashboardReasonClick}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Modals */}
        {editingRecord && (
          <EditModal
            record={editingRecord}
            user={currentUser}
            onClose={() => setEditingRecord(null)}
            onSaved={(msg) => {
              setToastMessage(msg);
              triggerRefresh();
            }}
          />
        )}

        {historyRecord && (
          <HistoryModal
            record={historyRecord}
            onClose={() => setHistoryRecord(null)}
          />
        )}

        {deletingRecord && (
          <DeleteModal
            record={deletingRecord}
            onClose={() => setDeletingRecord(null)}
            onDeleted={(msg) => {
              setToastMessage(msg);
              triggerRefresh();
            }}
          />
        )}

        {isUsersOpen && (
          <UsersModal
            user={currentUser}
            onClose={() => setIsUsersOpen(false)}
            onAccountsUpdated={(msg) => {
              setToastMessage(msg);
              triggerRefresh();
            }}
          />
        )}

        {isDataOpen && (
          <DataModal
            onClose={() => setIsDataOpen(false)}
            onArchived={(msg) => {
              setToastMessage(msg);
              triggerRefresh();
            }}
          />
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        )}
      </div>
    </div>
  );
}
