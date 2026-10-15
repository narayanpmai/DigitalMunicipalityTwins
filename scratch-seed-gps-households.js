const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const TOLES_BY_WARD = {
  1: ['बाँसखर्क', 'मानेगाउँ', 'खर्कडाँडा', 'सिरानटोल', 'दहखर्क'],
  2: ['बरुवा', 'ह्योल्मो गाउँ', 'चेप्चे', 'सेर्माथाङ डाँडा', 'पाखाटोल'],
  3: ['भोताङ', 'याङरी बजार', 'चिम्ती', 'देउराली', 'माथिल्लो भोताङ'],
  4: ['थाङपालकोट', 'मानेखर्क', 'गुम्बाटोल', 'तामाङ बस्ती', 'रायोडिक'],
  5: ['गुन्सा', 'काउले', 'ढुङ्गेबजार', 'सिमखर्क', 'डाँडागाउँ'],
  6: ['थाङपालधाप', 'केन्द्र बजार', 'धापटोल', 'बेँसी', 'पिप्ले'],
  7: ['तिपेनी', 'भोटेनाम्लाङ', 'नदी किनार', 'बजारटोल', 'अँधेरी'],
  8: ['लागर्चे', 'तामाङटोल', 'भञ्ज्याङ', 'खोलापारि', 'सिरानबस्ती']
};

const COMMON_NAMES = {
  tamang: ['दोर्जे तामाङ', 'पासाङ तामाङ', 'निमा तामाङ', 'माया तामाङ', 'सोनाम तामाङ', 'दावा तामाङ', 'फुल्मु तामाङ', 'मिङ्मार तामाङ', 'लाक्पा तामाङ', 'छेवाङ तामाङ', 'पेम्बा तामाङ', 'कर्मा तामाङ', 'सुनिता तामाङ', 'उर्गेन तामाङ', 'छिरिङ तामाङ'],
  hyolmo_sherpa: ['छेवाङ शेर्पा', 'दावा ह्योल्मो', 'पासाङ ल्हामु शेर्पा', 'पेम्बा दोर्जे शेर्पा', 'ल्हाक्पा शेर्पा', 'आङ दावा शेर्पा', 'निमा ह्योल्मो', 'तेन्जिङ शेर्पा', 'डोल्मा ह्योल्मो', 'साङ्गे शेर्पा'],
  shrestha: ['हरि बहादुर श्रेष्ठ', 'राम कुमार श्रेष्ठ', 'सीता श्रेष्ठ', 'गोपाल श्रेष्ठ', 'लक्ष्मी श्रेष्ठ', 'नारायण श्रेष्ठ', 'राजेन्द्र श्रेष्ठ', 'सरिता श्रेष्ठ', 'कृष्ण श्रेष्ठ', 'बिष्णु श्रेष्ठ'],
  brahmin_chhetri: ['कृष्ण गिरी', 'राम चन्द्र सापकोटा', 'डिल्ली राम भण्डारी', 'सुरेश पराजुली', 'भवानी खत्री', 'सरस्वती गिरी', 'कमला पाण्डे', 'माधव दाहाल', 'केशव नेपाल', 'दिलीप खत्री']
};

function getRandomHeadName(ward) {
  let pool = COMMON_NAMES.tamang;
  const rand = Math.random();
  if (ward === 2 || ward === 3 || ward === 4) {
    pool = rand < 0.45 ? COMMON_NAMES.hyolmo_sherpa : (rand < 0.85 ? COMMON_NAMES.tamang : COMMON_NAMES.shrestha);
  } else if (ward === 6 || ward === 7) {
    pool = rand < 0.4 ? COMMON_NAMES.shrestha : (rand < 0.75 ? COMMON_NAMES.tamang : COMMON_NAMES.brahmin_chhetri);
  } else if (ward === 5 || ward === 8) {
    pool = rand < 0.5 ? COMMON_NAMES.tamang : (rand < 0.8 ? COMMON_NAMES.brahmin_chhetri : COMMON_NAMES.shrestha);
  } else {
    pool = rand < 0.75 ? COMMON_NAMES.tamang : COMMON_NAMES.brahmin_chhetri;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function getRandomPhone() {
  const prefixes = ['९८४१', '९८४३', '९८५१', '९८६०', '९८१३', '९८२३'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const rest = Math.floor(100000 + Math.random() * 900000);
  return `${p}${rest}`;
}

function generateFamily(headName, ward) {
  const isFemale = headName.includes('माया') || headName.includes('सीता') || headName.includes('लक्ष्मी') || headName.includes('सुनिता') || headName.includes('डोल्मा') || headName.includes('सरस्वती') || headName.includes('कमला');
  const headGender = isFemale ? 'female' : 'male';
  const lastName = headName.split(' ').slice(-1)[0] || 'तामाङ';

  const members = [
    {
      name: headName,
      relation: isFemale ? 'घरमूली (महिला)' : 'घरमूली',
      gender: headGender,
      age: 42 + Math.floor(Math.random() * 25),
      education: Math.random() > 0.4 ? 'माध्यमिक तह' : 'साक्षर',
      occupation: ward === 3 || ward === 2 ? (Math.random() > 0.5 ? 'पर्यटन तथा याकपालन' : 'कृषि') : 'कृषि तथा पशुपालन',
      nid: `NID-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    }
  ];

  const spouseName = headGender === 'male'
    ? (['सुनिता', 'माया', 'फुल्मु', 'डोल्मा', 'सीता', 'लक्ष्मी', 'सरस्वती'][Math.floor(Math.random() * 7)] + ' ' + lastName)
    : (['दोर्जे', 'दावा', 'राम बहादुर', 'छेवाङ', 'कृष्ण', 'गोपाल'][Math.floor(Math.random() * 6)] + ' ' + lastName);

  members.push({
    name: spouseName,
    relation: headGender === 'male' ? 'श्रीमती' : 'श्रीमान्',
    gender: headGender === 'male' ? 'female' : 'male',
    age: members[0].age - 3,
    education: 'साक्षर',
    occupation: 'कृषि तथा घरायसी',
    nid: `NID-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const childrenCount = 1 + Math.floor(Math.random() * 3);
  const childFirstNames = ['अमित', 'सुमन', 'रोहन', 'अनिता', 'सृजना', 'दिपेश', 'दावा', 'फुपु', 'पासाङ'];
  for (let i = 0; i < childrenCount; i++) {
    const fn = childFirstNames[(i + Math.floor(Math.random() * childFirstNames.length)) % childFirstNames.length];
    const isGirl = ['अनिता', 'सृजना', 'माया'].includes(fn);
    members.push({
      name: `${fn} ${lastName}`,
      relation: isGirl ? 'छोरी' : 'छोरा',
      gender: isGirl ? 'female' : 'male',
      age: 12 + Math.floor(Math.random() * 16),
      education: 'विद्यालय / उच्च माध्यमिक',
      occupation: 'विद्यार्थी',
      nid: `NID-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  }

  return { headGender, members };
}

function translateRiskDetails(item) {
  const parts = [];
  if (item.slope_gt_30) parts.push('३०° भन्दा बढी भिरालो जमिन');
  if (item.is_near_river) parts.push('नदी / खोला किनार कटान क्षेत्र');
  if (item.has_previous_landslide) parts.push('विगतमा पहिरो गएको इतिहास');
  if (item.has_house_crack) parts.push('घरको पर्खालमा धाँजा/चर्किएको');
  if (item.elevation_gt_1800) parts.push('उच्च हिमाली भेग (>१८०० मिटर)');

  if (parts.length === 0) {
    return 'समतल तथा सुरक्षित बस्ती क्षेत्र (Safe terrain)';
  }
  return parts.join(', ');
}

async function run() {
  const candidatePaths = [
    '/app/panchpokhari_gps_houses.json',
    path.join(__dirname, 'backend', 'src', 'demographics', 'data', 'panchpokhari_gps_houses.json'),
    path.join(__dirname, '..', 'backend', 'src', 'demographics', 'data', 'panchpokhari_gps_houses.json'),
    path.join(process.cwd(), 'backend', 'src', 'demographics', 'data', 'panchpokhari_gps_houses.json'),
  ];
  const jsonPath = candidatePaths.find(p => fs.existsSync(p));
  if (!jsonPath) {
    console.error('File not found in any candidate paths:', candidatePaths);
    process.exit(1);
  }

  const rawHouses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawHouses.length} surveyed household points from JSON.`);

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'p5admin',
    password: process.env.DB_PASSWORD || 'P5Digital@2024!',
    database: process.env.DB_NAME || 'p5digital'
  });

  await client.connect();
  console.log('Connected to PostgreSQL p5digital database.');

  // Clean existing household_registries or update them
  await client.query('DELETE FROM household_registries;');
  console.log('Cleared existing temporary household rows.');

  // Prepare batch insertion
  const batchSize = 250;
  let inserted = 0;

  for (let i = 0; i < rawHouses.length; i += batchSize) {
    const chunk = rawHouses.slice(i, i + batchSize);
    const valuePlaceholders = [];
    const values = [];
    let pIdx = 1;

    for (const h of chunk) {
      const ward = h.ward_number || 1;
      const toles = TOLES_BY_WARD[ward] || ['थाङपालधाप'];
      const tole = toles[Math.floor(Math.random() * toles.length)];
      const headName = getRandomHeadName(ward);
      const phone = getRandomPhone();
      const { headGender, members } = generateFamily(headName, ward);

      // Sequence from matrix_house_no, e.g. P03-D35-M388-W01-H0001 => 1
      let seq = 1;
      const seqMatch = (h.matrix_house_no || '').match(/-H(\d+)$/);
      if (seqMatch) {
        seq = parseInt(seqMatch[1], 10);
      }

      const riskDetailsNep = translateRiskDetails(h);
      const houseType = h.risk_level === 'high' ? 'अस्थायी / ढुङ्गा माटो' : (Math.random() > 0.4 ? 'अर्ध-पक्की (जस्ता छाना)' : 'पक्की भवन (आरसीसी)');
      const waterSource = ward <= 2 ? 'मूल तथा कुवाको पानी' : 'धारा तथा पाइप प्रणाली';
      const qrToken = `QR-P5-${h.matrix_house_no}`;

      const meta = {
        is_near_river: h.is_near_river,
        has_previous_landslide: h.has_previous_landslide,
        has_house_crack: h.has_house_crack,
        slope_gt_30: h.slope_gt_30,
        elevation_gt_1800: h.elevation_gt_1800,
        survey_source: 'smartptrm.com GPS Survey 2024'
      };

      valuePlaceholders.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);

      values.push(
        h.uuid,
        h.matrix_house_no,
        ward,
        seq,
        headName,
        phone,
        headGender,
        JSON.stringify(members),
        h.lat,
        h.lon,
        tole,
        `पाँचपोखरी थाङपाल गाउँपालिका वडा नं. ${ward}, ${tole}`,
        houseType,
        waterSource,
        h.is_at_risk,
        h.risk_score || 0,
        h.risk_level || 'low',
        riskDetailsNep,
        qrToken,
        JSON.stringify(meta)
      );
    }

    const query = `
      INSERT INTO household_registries (
        id, "matrixHouseNo", "wardNumber", sequence, "householdName", "contactPhone",
        "headGender", "familyMembers", "gpsLat", "gpsLon", tole, address,
        "houseType", "drinkingWaterSource", "isAtRisk", "riskScore", "riskLevel",
        "riskDetails", "qrToken", meta
      ) VALUES ${valuePlaceholders.join(',\n')}
      ON CONFLICT ("matrixHouseNo") DO UPDATE SET
        "gpsLat" = EXCLUDED."gpsLat",
        "gpsLon" = EXCLUDED."gpsLon",
        "riskLevel" = EXCLUDED."riskLevel",
        "isAtRisk" = EXCLUDED."isAtRisk",
        "riskScore" = EXCLUDED."riskScore",
        "riskDetails" = EXCLUDED."riskDetails",
        meta = EXCLUDED.meta;
    `;

    await client.query(query, values);
    inserted += chunk.length;
    process.stdout.write(`\rInserted ${inserted} / ${rawHouses.length} authentic households...`);
  }

  console.log('\nSync completed successfully!');
  const countRes = await client.query('SELECT COUNT(*) as cnt, COUNT(CASE WHEN "riskLevel"=\'high\' THEN 1 END) as high, COUNT(CASE WHEN "riskLevel"=\'medium\' THEN 1 END) as med, COUNT(CASE WHEN "riskLevel"=\'low\' THEN 1 END) as low FROM household_registries;');
  console.log('Database summary:', countRes.rows[0]);

  const wardSummary = await client.query('SELECT "wardNumber", COUNT(*) as cnt FROM household_registries GROUP BY "wardNumber" ORDER BY "wardNumber";');
  console.table(wardSummary.rows);

  await client.end();
}

run().catch(err => {
  console.error('Error seeding households:', err);
  process.exit(1);
});
