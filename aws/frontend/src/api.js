const API = import.meta.env.VITE_API_URL;

export async function apiStart() {
  const res = await fetch(`${API}/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  return res.json();
}

export async function apiChat({ claimId, message }) {
  const res = await fetch(`${API}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claimId, message }) });
  return res.json();
}

export async function apiGetClaim(claimId) {
  const res = await fetch(`${API}/claim/${encodeURIComponent(claimId)}`);
  return res.json();
}

export async function apiUpload({ claimId, file }) {
  const base64 = await toBase64(file);
  const res = await fetch(`${API}/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claimId, fileName: file.name, base64: base64.split(',')[1] }) });
  return res.json();
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
