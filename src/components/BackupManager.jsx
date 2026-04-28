import React, { useRef, useState } from 'react';
import {
  backupToGoogleDrive,
  exportBackupToFile,
  isGoogleBackupConfigured,
  parseBackupText,
  restoreBackupPayload,
  restoreLatestFromGoogleDrive
} from '../services/backupService.js';

export default function BackupManager({ onRestoreDone }) {
  const [busyAction, setBusyAction] = useState('');
  const fileInputRef = useRef(null);
  const googleConfigured = isGoogleBackupConfigured();

  const runAction = async (actionName, action) => {
    try {
      setBusyAction(actionName);
      await action();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Action failed');
    } finally {
      setBusyAction('');
    }
  };

  const handleBackupDownload = () =>
    runAction('download', async () => {
      const result = await exportBackupToFile();
      alert(`Backup downloaded: ${result.fileName} (${result.count} bills)`);
    });

  const handleBackupGoogleDrive = () =>
    runAction('backup-drive', async () => {
      const result = await backupToGoogleDrive();
      alert(`Backup uploaded to Google Drive: ${result.fileName} (${result.count} bills)`);
    });

  const handleRestoreGoogleDrive = () =>
    runAction('restore-drive', async () => {
      const confirmed = window.confirm('Replace all current bills with latest backup from Google Drive?');
      if (!confirmed) return;

      const result = await restoreLatestFromGoogleDrive();
      onRestoreDone?.();
      alert(`Restored ${result.count} bills from ${result.fileName}`);
    });

  const handleRestoreFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    await runAction('restore-file', async () => {
      const confirmed = window.confirm('Replace all current bills with this backup file?');
      if (!confirmed) return;

      const text = await file.text();
      const payload = parseBackupText(text);
      const count = await restoreBackupPayload(payload);
      onRestoreDone?.();
      alert(`Restored ${count} bills from file`);
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg mt-8">
      <h2 className="text-xl font-semibold mb-2">Data Backup</h2>
      <p className="text-sm text-gray-600 mb-4">
        Keep a copy of your bills to avoid data loss when cache/app storage is cleared.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleBackupDownload}
          disabled={busyAction !== ''}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {busyAction === 'download' ? 'Working...' : 'Download Backup JSON'}
        </button>

        <button
          onClick={handleBackupGoogleDrive}
          disabled={busyAction !== '' || !googleConfigured}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          title={googleConfigured ? '' : 'Set VITE_GOOGLE_CLIENT_ID to enable Google Drive backup'}
        >
          {busyAction === 'backup-drive' ? 'Working...' : 'Backup to Google Drive'}
        </button>

        <button
          onClick={handleRestoreGoogleDrive}
          disabled={busyAction !== '' || !googleConfigured}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          title={googleConfigured ? '' : 'Set VITE_GOOGLE_CLIENT_ID to enable Google Drive restore'}
        >
          {busyAction === 'restore-drive' ? 'Working...' : 'Restore from Google Drive'}
        </button>

        <button
          onClick={handleRestoreFileClick}
          disabled={busyAction !== ''}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {busyAction === 'restore-file' ? 'Working...' : 'Restore from JSON File'}
        </button>
      </div>

      {!googleConfigured && (
        <p className="text-xs text-amber-700 mt-3">
          Google Drive backup needs `VITE_GOOGLE_CLIENT_ID` in your environment.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleRestoreFileChange}
      />
    </div>
  );
}
