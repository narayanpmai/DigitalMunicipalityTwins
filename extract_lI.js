const fs = require('fs');
const content = fs.readFileSync('index_katari.js', 'utf8');
const start = content.indexOf('const lI=');
const slice = content.substring(start, start + 35000);
fs.writeFileSync('lI_component_full.js', slice, 'utf8');

// Find all Nepali text in the component
const nepaliMatches = slice.match(/"([^"]*[\u0900-\u097F]+[^"]*)"/g) || [];
const uniqueTexts = [...new Set(nepaliMatches.map(s => s.slice(1, -1)))];
console.log('Total unique Nepali text segments:', uniqueTexts.length);
console.log('Segments:', uniqueTexts);
