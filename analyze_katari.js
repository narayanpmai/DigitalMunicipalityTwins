const fs = require('fs');
const content = fs.readFileSync('index_katari.js', 'utf8');

// search for api
const apiMatches = content.match(/https?:\/\/[^\s\"\'\`]+/g);
const apis = (apiMatches || []).filter(u => u.includes('api') || u.includes('deeyosoft') || u.includes('backend'));
console.log('URLs:', [...new Set(apis)].slice(0, 20));

// search for school route
const idx = content.indexOf('/schools/:id');
if (idx !== -1) {
  console.log('--- Context around /schools/:id ---');
  console.log(content.substring(Math.max(0, idx - 300), Math.min(content.length, idx + 500)));
}

// search for nepali school detail text
const nepaliKeywords = ['विद्यालय विवरण', 'प्रधानाध्यापक', 'दरबन्दी', 'भौतिक पूर्वाधार', 'मूल्याङ्कन', 'विद्यार्थी', 'शिक्षक', 'कक्षा'];
for (const kw of nepaliKeywords) {
  const kIdx = content.indexOf(kw);
  if (kIdx !== -1) {
    console.log(`Keyword [${kw}] found at ${kIdx}:`, content.substring(kIdx - 100, kIdx + 200));
    break;
  }
}
