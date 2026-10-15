CREATE TABLE IF NOT EXISTS shelters (
    id VARCHAR PRIMARY KEY,
    tenant_id VARCHAR,
    name VARCHAR NOT NULL,
    "wardNumber" INTEGER,
    location VARCHAR,
    capacity INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'Active',
    "focalPerson" VARCHAR,
    "contactPhone" VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    "hasElectricity" BOOLEAN DEFAULT FALSE,
    "hasWaterSupply" BOOLEAN DEFAULT FALSE,
    notes VARCHAR,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id VARCHAR PRIMARY KEY,
    tenant_id VARCHAR,
    name VARCHAR NOT NULL,
    role VARCHAR,
    phone VARCHAR,
    "wardNumber" INTEGER,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);
