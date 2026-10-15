const { execSync } = require('child_process');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artDir = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5';

const targets = [
  { url: 'http://localhost:8080/facilities/h_01', out: 'health_h01_detail_page.png', prof: 'edge_hp' },
  { url: 'http://localhost:8080/facilities/w_04', out: 'ward_w04_detail_page.png', prof: 'edge_ward' },
  { url: 'http://localhost:8080/facilities/t_01', out: 'tourism_t01_detail_page.png', prof: 'edge_tour' },
  { url: 'http://localhost:8080/schools/s_15', out: 'school_s15_detail_page.png', prof: 'edge_s15' }
];

for (const t of targets) {
  const p = 'C:\\Users\\Dell\\AppData\\Local\\Temp\\' + t.prof;
  const cmd = `"${edge}" --headless --disable-gpu --user-data-dir="${p}" --window-size=1280,1100 --screenshot="${artDir}\\${t.out}" "${t.url}"`;
  console.log('Capturing:', t.out);
  try {
    execSync(cmd, { timeout: 15000, stdio: 'ignore' });
  } catch(e) {
    console.warn('Error on ' + t.out + ':', e.message);
  }
}
console.log('Done capturing all targets');
