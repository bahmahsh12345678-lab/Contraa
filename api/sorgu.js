import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const ALLOWED_BASES = [
  'https://apiv2.ajaxsystems.fun',
  'https://searchulp.xyz/api'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ hata: 'url parametresi gerekli' });

  const decoded = decodeURIComponent(url);
  if (!ALLOWED_BASES.some(b => decoded.startsWith(b))) {
    return res.status(403).json({ hata: 'Bu URL izinli değil' });
  }

  const UAS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  ];
  const ua = UAS[Math.floor(Math.random() * UAS.length)];

  const cmd = `curl -s -L --max-time 15 -H "User-Agent: ${ua}" -H "Accept: application/json" "${decoded}"`;

  try {
    const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
    if (stderr && !stdout) return res.status(500).json({ hata: stderr });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try { return res.json({ ok: true, data: JSON.parse(stdout) }); }
    catch { return res.json({ ok: true, raw: stdout }); }
  } catch (e) {
    return res.status(500).json({ hata: e.message });
  }
}
