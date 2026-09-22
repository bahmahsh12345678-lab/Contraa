import fs from 'fs';
import crypto from 'crypto';

const DB_FILE = '/tmp/aro_users.json';

function loadUsers() {
  try { if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')); } catch {}
  return {};
}
function hash(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ hata: 'POST gerekli' });

  const { kullanici, sifre } = req.body || {};
  if (!kullanici || !sifre) return res.status(400).json({ hata: 'Kullanıcı ve şifre gerekli' });

  const users = loadUsers();
  const user = users[kullanici];
  if (!user) return res.status(401).json({ hata: 'Kullanıcı bulunamadı' });
  if (user.sifre_hash !== hash(sifre)) return res.status(401).json({ hata: 'Şifre hatalı' });

  const token = hash(kullanici + sifre + Date.now());
  return res.json({
    ok: true, token, kullanici,
    premium: user.premium,
    premium_until: user.premium_until
  });
}
