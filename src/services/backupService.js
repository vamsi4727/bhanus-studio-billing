import { getAllBills, replaceAllBills } from './indexedDB.js';

const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME_PREFIX = 'bhanus-bills-backup';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function getBackupFileName() {
  return `${BACKUP_FILENAME_PREFIX}-${getTimestamp()}.json`;
}

function isValidBackupPayload(payload) {
  return (
    payload &&
    Array.isArray(payload.bills) &&
    typeof payload.exportedAt === 'string' &&
    typeof payload.app === 'string'
  );
}

export function createBackupPayload(bills) {
  return {
    app: 'bhanus-studio-billing',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    bills
  };
}

export async function exportBackupToFile() {
  const bills = await getAllBills();
  const payload = createBackupPayload(bills);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const fileName = getBackupFileName();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { fileName, count: bills.length };
}

export async function restoreBackupPayload(payload) {
  if (!isValidBackupPayload(payload)) {
    throw new Error('Invalid backup file format');
  }

  await replaceAllBills(payload.bills);
  return payload.bills.length;
}

export function parseBackupText(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('Backup file is not valid JSON');
  }

  if (!isValidBackupPayload(parsed)) {
    throw new Error('Backup JSON structure is invalid');
  }
  return parsed;
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });
}

async function getGoogleAccessToken() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google backup is not configured. Set VITE_GOOGLE_CLIENT_ID.');
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error) {
          reject(new Error(resp.error));
          return;
        }
        resolve(resp.access_token);
      }
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

async function uploadTextFileToDrive(accessToken, fileName, fileContent) {
  const metadata = {
    name: fileName,
    mimeType: 'application/json'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive upload failed: ${message}`);
  }

  return response.json();
}

async function fetchLatestBackupFromDrive(accessToken) {
  const query = encodeURIComponent(`name contains '${BACKUP_FILENAME_PREFIX}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&pageSize=1&fields=files(id,name,createdTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to list backups: ${message}`);
  }

  const data = await response.json();
  const latest = data.files?.[0];
  if (!latest) {
    throw new Error('No backup file found in Google Drive');
  }

  const downloadResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${latest.id}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!downloadResponse.ok) {
    const message = await downloadResponse.text();
    throw new Error(`Failed to download backup: ${message}`);
  }

  const text = await downloadResponse.text();
  return { fileName: latest.name, text };
}

export async function backupToGoogleDrive() {
  const accessToken = await getGoogleAccessToken();
  const bills = await getAllBills();
  const payload = createBackupPayload(bills);
  const fileName = getBackupFileName();

  await uploadTextFileToDrive(accessToken, fileName, JSON.stringify(payload, null, 2));
  return { fileName, count: bills.length };
}

export async function restoreLatestFromGoogleDrive() {
  const accessToken = await getGoogleAccessToken();
  const latestBackup = await fetchLatestBackupFromDrive(accessToken);
  const payload = parseBackupText(latestBackup.text);
  const count = await restoreBackupPayload(payload);
  return { fileName: latestBackup.fileName, count };
}

export function isGoogleBackupConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}
