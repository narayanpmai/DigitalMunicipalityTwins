const https = require('https');
const fs = require('fs');

https.get('https://katarimun.deeyosoft.com/api/v1/schools/37', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      fs.writeFileSync('school_37_data.json', JSON.stringify(parsed, null, 2), 'utf8');
      console.log('Keys in data:', Object.keys(parsed.data));
      if (parsed.data.school) {
        console.log('Keys in school:', Object.keys(parsed.data.school));
      }
      console.log('School Name:', parsed.data.school?.schoolName || parsed.data.name);
      console.log('Profile keys:', parsed.data.profile ? Object.keys(parsed.data.profile) : 'no profile');
    } catch(e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('HTTPS Error:', err.message);
});
