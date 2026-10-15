const fs = require('fs');
let content = fs.readFileSync('src/utils/nepalAdministrativeData.ts', 'utf8');

const startIdx = content.indexOf('export const NEPAL_ADMIN_STRUCTURE: ProvinceOption[] = [');
const endIdx = content.indexOf('/** Helper Functions */');

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    let gen = fs.readFileSync('generated_data.ts', 'utf8');
    
    gen = gen.replace('export const NEPAL_ADMIN_STRUCTURE = [', 'export const NEPAL_ADMIN_STRUCTURE: ProvinceOption[] = [');
    
    gen = gen.replace(/\"name\": \"पाँचपोखरी थाङपाल गाउँपालिका\",\n\s+\"totalWards\": \d+/g, '\"name\": \"पाँचपोखरी थाङपाल गाउँपालिका\", \"totalWards\": 8, \"customWards\": PANCHPOKHARI_WARDS');
    
    fs.writeFileSync('src/utils/nepalAdministrativeData.ts', before + gen + '\n\n' + after);
    console.log('Success');
} else {
    console.log('Could not find markers');
}
