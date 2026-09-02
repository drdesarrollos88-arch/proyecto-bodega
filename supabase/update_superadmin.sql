-- ==============================================================================
-- ACTUALIZACIÓN DE ROL STAFF / SUPERADMIN
-- Ejecutar en Supabase SQL Editor si se desea sincronizar el rol 'superadmin'
-- ==============================================================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('tecnico', 'supervisor', 'bodeguero_admin', 'jefe_seccion', 'superadmin'));

INSERT INTO profiles (id, name, rut, role, cost_center_id, phone, email)
VALUES ('USR-00', 'Administrador General (Staff)', '10.000.000-1', 'superadmin', 'CC-104', '+56 9 9000 0000', 'admin@empresa.cl')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

