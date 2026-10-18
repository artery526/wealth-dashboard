const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const entriesDir = path.join(root, 'release-notes', 'entries');
const outputFile = path.join(root, 'release-notes.json');
const allowedStatuses = new Set(['planned', 'in_progress', 'released']);
const allowedPlatforms = new Set(['website', 'windows', 'app-script', 'nas', 'android']);

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

if (!fs.existsSync(entriesDir)) throw new Error(`Missing release-note entries directory: ${entriesDir}`);

const entries = [];
const ids = new Set();
for (const filename of fs.readdirSync(entriesDir).filter(name => name.endsWith('.json')).sort()) {
  const filePath = path.join(entriesDir, filename);
  let entry;
  try {
    entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in ${filename}: ${error.message}`);
  }

  const problems = [];
  if (!/^[a-z0-9][a-z0-9-]{2,90}$/.test(entry.id || '')) problems.push('id must be a short lowercase slug');
  if (ids.has(entry.id)) problems.push(`duplicate id: ${entry.id}`);
  if (!allowedStatuses.has(entry.status)) problems.push('status must be planned, in_progress, or released');
  if (!String(entry.area || '').trim() || String(entry.area).length > 40) problems.push('area is required (max 40 chars)');
  if (!String(entry.summary || '').trim() || String(entry.summary).length > 120) problems.push('summary is required (max 120 chars)');
  if (entry.details != null && String(entry.details).length > 500) problems.push('details must be at most 500 chars');
  if (!Array.isArray(entry.platforms) || entry.platforms.length === 0 || entry.platforms.some(value => !allowedPlatforms.has(value))) problems.push('platforms must contain supported platform names');
  if (entry.status === 'released' && !validDate(entry.date)) problems.push('released entries need a valid YYYY-MM-DD date');
  if (entry.status !== 'released' && entry.date != null && !validDate(entry.date)) problems.push('date must be null or YYYY-MM-DD');
  if (problems.length) throw new Error(`${filename}: ${problems.join('; ')}`);

  ids.add(entry.id);
  if (entry.status === 'released') {
    entries.push({
      id: entry.id,
      date: entry.date,
      area: String(entry.area).trim(),
      summary: String(entry.summary).trim(),
      details: String(entry.details || '').trim(),
      platforms: [...new Set(entry.platforms)]
    });
  }
}

entries.sort((a, b) => b.date.localeCompare(a.date) || a.area.localeCompare(b.area, 'zh-TW') || a.id.localeCompare(b.id));
const feed = { schemaVersion: 1, generatedAt: new Date().toISOString(), updates: entries };
fs.writeFileSync(outputFile, `${JSON.stringify(feed, null, 2)}\n`, 'utf8');
process.stdout.write(`Built release-notes.json with ${entries.length} released entries.\n`);
