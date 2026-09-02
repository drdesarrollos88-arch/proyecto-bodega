-- ==============================================================================
-- SISTEMA DE GESTIÓN DE BODEGA E INVENTARIOS
-- Esquema de Base de Datos PostgreSQL para Supabase
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE CENTROS DE COSTOS Y PRESUPUESTOS
CREATE TABLE IF NOT EXISTS cost_centers (
    id TEXT PRIMARY KEY, -- Ej: 'CC-101'
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    assigned_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    executed_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE PRODUCTOS E INVENTARIO
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Artículos de Oficina', 'EPP', 'Herramientas Menores', 'Otros')),
    unit TEXT NOT NULL DEFAULT 'unidad',
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock INTEGER NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    location TEXT NOT NULL DEFAULT 'Bodega Principal',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE USUARIOS / PERFILES
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rut TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('tecnico', 'supervisor', 'bodeguero_admin', 'jefe_seccion')),
    cost_center_id TEXT REFERENCES cost_centers(id),
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA DE SOLICITUDES DE MATERIALES
CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY, -- Ej: 'SOL-2026-0001'
    technician_id TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    technician_rut TEXT NOT NULL,
    cost_center_id TEXT NOT NULL REFERENCES cost_centers(id),
    work_order TEXT,
    reason TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Urgente')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada', 'entregada')),
    supervisor_id TEXT,
    supervisor_name TEXT,
    supervisor_notes TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DETALLE DE ARTÍCULOS SOLICITADOS
CREATE TABLE IF NOT EXISTS request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    delivered_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 7. TABLA DE ACTAS DE ENTREGA Y AUDITORÍA VERIFICABLE
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY, -- Ej: 'ACTA-2026-0001'
    request_id TEXT NOT NULL REFERENCES requests(id),
    technician_name TEXT NOT NULL,
    technician_rut TEXT NOT NULL,
    warehouse_staff_name TEXT NOT NULL,
    cost_center_id TEXT NOT NULL REFERENCES cost_centers(id),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    signature_data TEXT NOT NULL, -- Datos de la firma táctil (Base64 o URL Storage)
    photo_data TEXT NOT NULL,     -- Fotografía de la entrega (Base64 o URL Storage)
    observations TEXT,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABLA DE SOLICITUDES DE COMPRAS Y REABASTECIMIENTO
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY, -- Ej: 'OC-2026-0001'
    product_id UUID NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    estimated_unit_cost NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    supplier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'solicitada' CHECK (status IN ('solicitada', 'en_camino', 'recibida')),
    requested_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_at TIMESTAMPTZ
);

-- ==============================================================================
-- 9. DATOS SEMILLA (INICIALIZACIÓN DEL SISTEMA)
-- ==============================================================================

-- Centros de Costo y Presupuestos del Área
INSERT INTO cost_centers (id, code, name, area, assigned_budget, executed_budget) VALUES
('CC-101', 'CC-101', 'Operaciones de Terreno', 'Área de Telecomunicaciones y Redes', 15000000, 3420000),
('CC-102', 'CC-102', 'Mantenimiento e Infraestructura', 'Área de Telecomunicaciones y Redes', 12500000, 1890000),
('CC-103', 'CC-103', 'Fibra Óptica y Enlaces', 'Área de Telecomunicaciones y Redes', 18000000, 4150000),
('CC-104', 'CC-104', 'Administración y Logística', 'Área de Telecomunicaciones y Redes', 8000000, 920000)
ON CONFLICT (id) DO NOTHING;

-- Usuarios Iniciales para Cada Rol
INSERT INTO profiles (id, name, rut, role, cost_center_id, phone, email) VALUES
('USR-01', 'Carlos Muñoz Alarcón', '16.894.221-5', 'tecnico', 'CC-101', '+56 9 8452 1190', 'carlos.munoz@empresa.cl'),
('USR-02', 'Roberto Valenzuela Tapia', '14.238.995-2', 'supervisor', 'CC-101', '+56 9 9123 4455', 'roberto.valenzuela@empresa.cl'),
('USR-03', 'Marisol Soto Cárdenas', '15.671.304-K', 'bodeguero_admin', 'CC-104', '+56 9 7344 8812', 'bodega@empresa.cl'),
('USR-04', 'Ing. Patricio Lagos M.', '11.450.812-3', 'jefe_seccion', 'CC-104', '+56 9 9888 1234', 'patricio.lagos@empresa.cl')
ON CONFLICT (id) DO NOTHING;

-- Catálogo de Artículos de Bodega
INSERT INTO products (sku, name, category, unit, current_stock, min_stock, unit_price, location) VALUES
-- EPP
('EPP-001', 'Casco de Seguridad Blanco con Barbiquejo Dieléctrico', 'EPP', 'unidad', 28, 10, 14500, 'Pasillo 1 - Estante A1'),
('EPP-002', 'Guantes de Cabritilla Reforzados para Faena', 'EPP', 'par', 65, 20, 4200, 'Pasillo 1 - Estante A2'),
('EPP-003', 'Lentes de Seguridad Oscuros Anti-Empañante UV', 'EPP', 'unidad', 42, 15, 3800, 'Pasillo 1 - Estante A3'),
('EPP-004', 'Zapatos de Seguridad Dieléctricos Talla 42', 'EPP', 'par', 6, 8, 48900, 'Pasillo 1 - Estante B1'), -- Crítico
('EPP-005', 'Chaleco Geólogo Reflectante Alta Visibilidad Naranjo', 'EPP', 'unidad', 18, 10, 8900, 'Pasillo 1 - Estante B2'),
('EPP-006', 'Protector Auditivo Tipo Copa para Casco SNR 28dB', 'EPP', 'unidad', 14, 10, 12500, 'Pasillo 1 - Estante B3'),
('EPP-007', 'Arnés de Seguridad 4 Argollas con Cabo de Vida', 'EPP', 'unidad', 4, 6, 65000, 'Pasillo 1 - Estante C1'), -- Crítico

-- Herramientas Menores
('HER-001', 'Multitéster Digital Profesional con True RMS Cat III', 'Herramientas Menores', 'unidad', 8, 5, 38500, 'Pasillo 2 - Estante A1'),
('HER-002', 'Pelacables Automático Frontal 0.2 a 6mm²', 'Herramientas Menores', 'unidad', 12, 6, 16900, 'Pasillo 2 - Estante A2'),
('HER-003', 'Alicate Universal Aislado 1000V 8 Pulgadas', 'Herramientas Menores', 'unidad', 15, 8, 14200, 'Pasillo 2 - Estante A3'),
('HER-004', 'Juego de Destornilladores Dieléctricos 1000V (6 piezas)', 'Herramientas Menores', 'set', 9, 6, 22500, 'Pasillo 2 - Estante B1'),
('HER-005', 'Crimpadora de Conectores RJ45 / RJ11 con Testeador', 'Herramientas Menores', 'unidad', 5, 6, 28900, 'Pasillo 2 - Estante B2'), -- Crítico
('HER-006', 'Huincha de Medir 8 Metros Anti-Impacto Auto-Lock', 'Herramientas Menores', 'unidad', 22, 10, 6900, 'Pasillo 2 - Estante B3'),
('HER-007', 'Linterna Frontal LED Recargable 800 Lúmenes IP65', 'Herramientas Menores', 'unidad', 11, 8, 18500, 'Pasillo 2 - Estante C1'),

-- Artículos de Oficina
('OFI-001', 'Cuaderno de Cargo Cuadriculado Empastado 100 Hojas', 'Artículos de Oficina', 'unidad', 45, 15, 3200, 'Pasillo 3 - Estante A1'),
('OFI-002', 'Archivador Palanca Oficio Lomo Ancho Plastificado', 'Artículos de Oficina', 'unidad', 35, 15, 2950, 'Pasillo 3 - Estante A2'),
('OFI-003', 'Resma Papel Carta 75g (500 Hojas) Alta Blancura', 'Artículos de Oficina', 'resma', 18, 20, 4800, 'Pasillo 3 - Estante A3'), -- Crítico
('OFI-004', 'Set Marcadores Permanentes Punta Biselada (Pack 4)', 'Artículos de Oficina', 'pack', 25, 12, 3400, 'Pasillo 3 - Estante B1'),
('OFI-005', 'Cinta Embalaje Transparente 48mm x 100m Industrial', 'Artículos de Oficina', 'unidad', 50, 20, 1850, 'Pasillo 3 - Estante B2'),
('OFI-006', 'Tóner Negro Compatible HP LaserJet Enterprise', 'Artículos de Oficina', 'unidad', 2, 4, 45000, 'Pasillo 3 - Estante B3'), -- Crítico

-- Otros Artículos
('OTR-001', 'Alcohol Isopropílico 99.8% Botella 1 Litro', 'Otros', 'litro', 14, 8, 7200, 'Pasillo 4 - Estante A1'),
('OTR-002', 'Paño Microfibra Antiestático para Fibra Óptica (Pack 10)', 'Otros', 'pack', 20, 10, 5900, 'Pasillo 4 - Estante A2'),
('OTR-003', 'Amarres Plásticos Negros 300mm x 4.8mm (Bolsa 100 un)', 'Otros', 'bolsa', 40, 15, 4500, 'Pasillo 4 - Estante B1'),
('OTR-004', 'Cinta Autofundente de Goma para Aislamiento 19mm x 9m', 'Otros', 'rollo', 16, 10, 6800, 'Pasillo 4 - Estante B2')
ON CONFLICT (sku) DO NOTHING;

-- Solicitudes de Prueba Iniciales
INSERT INTO requests (id, technician_id, technician_name, technician_rut, cost_center_id, work_order, reason, priority, status, supervisor_id, supervisor_name, supervisor_notes, approved_at, created_at) VALUES
('SOL-2026-0001', 'USR-01', 'Carlos Muñoz Alarcón', '16.894.221-5', 'CC-101', 'OT-4892', 'Mantención enlace repetidor Cerro La Campana', 'Normal', 'aprobada', 'USR-02', 'Roberto Valenzuela Tapia', 'Autorizado para retiro de turno matutino', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '4 hours'),
('SOL-2026-0002', 'USR-01', 'Carlos Muñoz Alarcón', '16.894.221-5', 'CC-102', 'OT-4901', 'Reparación de tramo secundario fibra poste 42', 'Urgente', 'pendiente', NULL, NULL, NULL, NULL, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Ítems de la solicitud aprobada (lista para retiro)
INSERT INTO request_items (request_id, product_id, product_name, product_sku, quantity, delivered_quantity, unit_price, total_price)
SELECT 'SOL-2026-0001', id, name, sku, 2, 0, unit_price, (2 * unit_price)
FROM products WHERE sku = 'EPP-002'
ON CONFLICT DO NOTHING;

INSERT INTO request_items (request_id, product_id, product_name, product_sku, quantity, delivered_quantity, unit_price, total_price)
SELECT 'SOL-2026-0001', id, name, sku, 1, 0, unit_price, (1 * unit_price)
FROM products WHERE sku = 'HER-002'
ON CONFLICT DO NOTHING;

-- Ítems de la solicitud pendiente
INSERT INTO request_items (request_id, product_id, product_name, product_sku, quantity, delivered_quantity, unit_price, total_price)
SELECT 'SOL-2026-0002', id, name, sku, 1, 0, unit_price, (1 * unit_price)
FROM products WHERE sku = 'HER-005'
ON CONFLICT DO NOTHING;

INSERT INTO request_items (request_id, product_id, product_name, product_sku, quantity, delivered_quantity, unit_price, total_price)
SELECT 'SOL-2026-0002', id, name, sku, 2, 0, unit_price, (2 * unit_price)
FROM products WHERE sku = 'OTR-004'
ON CONFLICT DO NOTHING;
