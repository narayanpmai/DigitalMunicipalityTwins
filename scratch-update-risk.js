const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'p5admin',
    password: process.env.DB_PASSWORD || 'P5Digital@2024!',
    database: process.env.DB_NAME || 'p5digital'
  });

  await client.connect();

  await client.query(`
    UPDATE household_registries
    SET "riskLevel" = 'high',
        "isAtRisk" = true,
        "riskScore" = 78,
        "riskDetails" = 'विगतमा पहिरो गएको उच्च जोखिम क्षेत्र (High Hazard Area)'
    WHERE (meta->>'has_previous_landslide')::boolean = true;
  `);

  await client.query(`
    UPDATE household_registries
    SET "riskLevel" = 'medium',
        "isAtRisk" = true,
        "riskScore" = 52,
        "riskDetails" = 'नदी तथा खोला तटीय कटान/बाढी जोखिम क्षेत्र (River Proximity)'
    WHERE (meta->>'is_near_river')::boolean = true AND "riskLevel" != 'high';
  `);

  const summary = await client.query(`
    SELECT "riskLevel", COUNT(*) as count
    FROM household_registries
    GROUP BY "riskLevel"
    ORDER BY count DESC;
  `);
  console.log('Updated Risk Summary:');
  console.table(summary.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
