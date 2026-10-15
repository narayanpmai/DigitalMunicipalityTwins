-- Upgrade building_permits table for DUDBC Building Construction Guidance 2082
ALTER TABLE building_permits 
  ADD COLUMN IF NOT EXISTS "ownershipType" character varying DEFAULT 'आफ्नै (Self-Owned)',
  ADD COLUMN IF NOT EXISTS "leasePeriodYears" numeric(4,1),
  ADD COLUMN IF NOT EXISTS "cadVersion" character varying DEFAULT 'AutoCAD 2018 (.dwg)',
  ADD COLUMN IF NOT EXISTS "hasStructuralDrawing" character varying DEFAULT 'हो (NBC 105:2020)',
  ADD COLUMN IF NOT EXISTS "structuralModelType" character varying,
  ADD COLUMN IF NOT EXISTS "structuralModelFileUrl" character varying,
  ADD COLUMN IF NOT EXISTS "partialCompletionDetails" jsonb,
  ADD COLUMN IF NOT EXISTS "etabsChecks" jsonb;

-- Also add lowercase versions just in case queries reference either casing
ALTER TABLE building_permits 
  ADD COLUMN IF NOT EXISTS ownership_type character varying DEFAULT 'आफ्नै (Self-Owned)',
  ADD COLUMN IF NOT EXISTS lease_period_years numeric(4,1),
  ADD COLUMN IF NOT EXISTS cad_version character varying DEFAULT 'AutoCAD 2018 (.dwg)',
  ADD COLUMN IF NOT EXISTS has_structural_drawing character varying DEFAULT 'हो (NBC 105:2020)',
  ADD COLUMN IF NOT EXISTS structural_model_type character varying,
  ADD COLUMN IF NOT EXISTS structural_model_file_url character varying,
  ADD COLUMN IF NOT EXISTS partial_completion_details jsonb,
  ADD COLUMN IF NOT EXISTS etabs_checks jsonb;
