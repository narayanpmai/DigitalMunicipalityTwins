-- P5 Digital Twin - PostgreSQL Initialization
-- Enable required extensions

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE EXTENSION IF NOT EXISTS vector; -- Enable if pgvector available

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE p5digital TO p5admin;
