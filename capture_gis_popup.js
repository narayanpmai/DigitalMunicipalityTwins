const { execSync } = require('child_process');
const fs = require('fs');

// We can test by injecting a small script or opening the map page
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artDir = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5';
const p = 'C:\\Users\\Dell\\AppData\\Local\\Temp\\edge_gis_popup';

const cmd = `"${edge}" --headless --disable-gpu --user-data-dir="${p}" --window-size=1280,850 --screenshot="${artDir}\\gis_map_with_popup.png" "http://localhost:8080/app/gis"`;
console.log('Capturing GIS map page...');
try {
  execSync(cmd, { timeout: 15000, stdio: 'ignore' });
} catch(e) {}
console.log('Done.');
