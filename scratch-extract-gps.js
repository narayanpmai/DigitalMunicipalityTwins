const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/Dell/.gemini/antigravity-ide/brain/64a9476b-da16-48a2-8e17-3be532d72edc/.system_generated/steps/2958/content.md';
const html = fs.readFileSync(srcPath, 'utf8');

const startTag = '<script id="houses-data" type="application/json">';
const endTag = '</script>';
const startIdx = html.indexOf(startTag);
if (startIdx === -1) {
  console.error('startTag not found');
  process.exit(1);
}
const jsonStart = startIdx + startTag.length;
const jsonEnd = html.indexOf(endTag, jsonStart);
const jsonStr = html.substring(jsonStart, jsonEnd);

const houses = JSON.parse(jsonStr);
console.log('Total houses extracted:', houses.length);

const wards = {};
const risks = {};
houses.forEach(h => {
  wards[h.ward_number] = (wards[h.ward_number] || 0) + 1;
  risks[h.risk_level] = (risks[h.risk_level] || 0) + 1;
});

console.log('Counts by ward:', wards);
console.log('Counts by risk level:', risks);
console.log('First house sample:', houses[0]);
console.log('Last house sample:', houses[houses.length - 1]);

// Also save this clean JSON into backend demographics data directory
const outPath = 'd:/Project/DigitalTwins/backend/src/demographics/data/panchpokhari_gps_houses.json';
fs.writeFileSync(outPath, JSON.stringify(houses, null, 2), 'utf8');
console.log('Saved clean dataset to:', outPath);
