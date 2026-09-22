import fs from 'fs';
import crypto from 'crypto';

const DB_FILE = '/tmp/aro_users.json';
function loadUsers() {
  try { if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')); } catch {}
  return {};
}
function saveUsers(u) { try { fs.writeFileSync(DB_FILE, JSON.stringify(u, null, 2)); } catch {} }
function hash(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ hata: 'POST gerekli' });

  const { kullanici, sifre } = req.body || {};
  if (!kullanici || !sifre) return res.status(400).json({ hata: 'Kullanıcı ve şifre gerekli' });
  if (kullanici.length < 3) return res.status(400).json({ hata: 'Kullanıcı adı en az 3 karakter' });
  if (sifre.length < 4) return res.status(400).json({ hata: 'Şifre en az 4 karakter' });

  const users = loadUsers();
  if (users[kullanici]) return res.status(409).json({ hata: 'Bu kullanıcı zaten var' });

  users[kullanici] = {
    sifre_hash: hash(sifre),
    kayit_tarihi: new Date().toISOString(),
    premium: false,
    premium_until: null
  };
  saveUsers(users);
  return res.json({ ok: true, mesaj: 'Kayıt başarılı' });
}
