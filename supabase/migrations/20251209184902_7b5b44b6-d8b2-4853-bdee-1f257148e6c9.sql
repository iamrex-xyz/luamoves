-- Move pg_net extension from public to extensions schema
-- First, drop it from public and recreate in extensions
DROP EXTENSION IF EXISTS pg_net;

-- Create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Recreate pg_net in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;