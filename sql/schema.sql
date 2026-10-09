-- =============================================================================
-- SERALICO S.A. - SISTEMA DE CONTROL INTERNO
-- SUPABASE DATABASE SCHEMA & INITIAL SEED
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: USUARIOS Y CREDENCIALES CORPORATIVAS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('superadmin', 'hospitales', 'colonias')),
  colonias_role TEXT,
  role_label TEXT,
  scope TEXT,
  sede TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: CATÁLOGO DE INSUMOS PARA CAMPINGS (DEPÓSITO CENTRAL)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.camping_catalog (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: PEDIDOS Y DISTRIBUCIÓN POR CAMPING
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.camping_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camping_name TEXT NOT NULL,
  product_id TEXT REFERENCES public.camping_catalog(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_camping_product UNIQUE (camping_name, product_id)
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: SOLICITUDES DEL SECTOR DESAYUNO (INBOUND A DEPÓSITO)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.desayuno_requests (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  quantity TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'Media',
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Preparación', 'Despachado')),
  requested_by TEXT NOT NULL,
  notes TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: SOLICITUDES DE PLANTA DE ELABORACIÓN (INBOUND A DEPÓSITO)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planta_requests (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  quantity TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'Media',
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Preparación', 'Despachado')),
  requested_by TEXT NOT NULL,
  notes TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- HABILITAR ROW LEVEL SECURITY (RLS) CON ACCESO PARA CLIENTE ANON
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camping_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camping_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desayuno_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planta_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para la clave pública (anon)
CREATE POLICY "Allow anon all on users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on camping_catalog" ON public.camping_catalog FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on camping_orders" ON public.camping_orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on desayuno_requests" ON public.desayuno_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on planta_requests" ON public.planta_requests FOR ALL TO anon USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- SEED DE DATOS INICIALES
-- -----------------------------------------------------------------------------

-- 1. Usuarios del sistema
INSERT INTO public.users (id, name, username, password, role_type, colonias_role, role_label, scope, sede, active)
VALUES
  ('usr_superadmin', 'Administrador General Seralico', 'superadmin@seralico.com.ar', 'seralico2026', 'superadmin', NULL, 'Superusuario / Admin General', 'all', 'Sede Central CABA', true),
  ('usr_hospitales_1', 'Lic. Laura Benítez (Control Hospitales)', 'hospitales@seralico.com.ar', 'seralico2026', 'hospitales', NULL, 'Supervisor Hospitalario (Calidad + Stock)', 'hospitales', 'Hospital Central de Agudos - Sede Norte', true),
  ('usr_col_ref_colon', 'Martín Gómez (Referente Sede Colón)', 'referente.colon@seralico.com.ar', 'seralico2026', 'colonias', 'referente_camping', 'Referente de Sede (Colón)', 'colonias', 'Sede Colón', true),
  ('usr_col_ref_rivadavia', 'Gonzalo Pérez (Referente Sede Rivadavia)', 'referente.rivadavia@seralico.com.ar', 'seralico2026', 'colonias', 'referente_camping', 'Referente de Sede (Rivadavia)', 'colonias', 'Sede Rivadavia', true),
  ('usr_col_ref_zonda', 'Valeria Luna (Referente Sede Zonda)', 'referente.zonda@seralico.com.ar', 'seralico2026', 'colonias', 'referente_camping', 'Referente de Sede (Zonda)', 'colonias', 'Sede Zonda', true),
  ('usr_col_deposito', 'Gonzalo Fernández (Pañol Central)', 'deposito.colonias@seralico.com.ar', 'seralico2026', 'colonias', 'deposito_central', 'Depósito Central', 'colonias', 'Parque Roca (Centro Logístico)', true),
  ('usr_col_planta', 'Estela Romero (Jefa de Cocina Central)', 'planta.colonias@seralico.com.ar', 'seralico2026', 'colonias', 'planta_elaboracion', 'Planta de Elaboración', 'colonias', 'Planta Gastronómica y Lavandería Central', true),
  ('usr_col_rrhh', 'Carolina Morales (Personal Estival)', 'rrhh.colonias@seralico.com.ar', 'seralico2026', 'colonias', 'recursos_humanos', 'Recursos Humanos', 'colonias', 'Sede Central CABA', true),
  ('usr_col_auditor', 'Dr. Claudio Rossi (Bromatología)', 'auditor.colonias@seralico.com.ar', 'seralico2026', 'colonias', 'auditor', 'Auditor Bromatológico', 'colonias', 'Todas las sedes estivales', true),
  ('usr_col_desayuno', 'Mariana López (Sector Desayunos)', 'desayuno.colonias@seralico.com.ar', 'seralico2026', 'colonias', 'sector_desayuno', 'Sector Desayuno & Meriendas', 'colonias', 'Sede Colón', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  sede = EXCLUDED.sede,
  role_label = EXCLUDED.role_label;

-- 2. Catálogo de Insumos para Sedes
INSERT INTO public.camping_catalog (id, code, name, category, unit, stock, active)
VALUES
  ('prd_01', 'DESC-01', 'Vasos Descartables 180cc', 'Descartables', 'Pack x 100 un.', 350, true),
  ('prd_02', 'DESC-02', 'Servilletas de Papel Blancas', 'Descartables', 'Pack x 250 un.', 240, true),
  ('prd_03', 'DESC-03', 'Platos Plásticos Hondos Térmicos', 'Descartables', 'Pack x 50 un.', 180, true),
  ('prd_04', 'DESC-04', 'Cucharas Descartables Reforzadas', 'Descartables', 'Pack x 100 un.', 220, true),
  ('prd_05', 'LIMP-01', 'Lavandina Concentrada 55g/L', 'Limpieza', 'Bidón 5 Litros', 95, true),
  ('prd_06', 'LIMP-02', 'Detergente Neutro Biodegradable', 'Limpieza', 'Bidón 5 Litros', 80, true),
  ('prd_07', 'LIMP-03', 'Jabón Líquido Antibacterial Manos', 'Limpieza', 'Bidón 5 Litros', 65, true),
  ('prd_08', 'LIMP-04', 'Bolsas de Consorcio Negras 80x110', 'Limpieza', 'Paquete x 50 un.', 140, true),
  ('prd_09', 'LIMP-05', 'Paños Absorbentes Multiuso', 'Limpieza', 'Pack x 10 un.', 110, true),
  ('prd_10', 'EQP-01', 'Termo Conservador Isotérmico 20L', 'Equipamiento', 'Unidad', 24, true),
  ('prd_11', 'EQP-02', 'Bandejas de Distribución Térmica', 'Equipamiento', 'Pack x 10 un.', 45, true),
  ('prd_12', 'SEG-01', 'Alcohol en Gel 70% con Dosificador', 'Seguridad', 'Bidón 5 Litros', 50, true),
  ('prd_13', 'SEG-02', 'Guantes Descartables de Nitrilo', 'Seguridad', 'Caja x 100 un.', 160, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Pedidos Iniciales por Sede (Sede Colón, Sede Rivadavia, Sede Zonda)
INSERT INTO public.camping_orders (camping_name, product_id, quantity)
VALUES
  ('Sede Colón', 'prd_01', 30),
  ('Sede Colón', 'prd_02', 25),
  ('Sede Colón', 'prd_03', 15),
  ('Sede Colón', 'prd_04', 20),
  ('Sede Colón', 'prd_05', 8),
  ('Sede Colón', 'prd_06', 6),
  ('Sede Colón', 'prd_08', 12),
  ('Sede Colón', 'prd_12', 4),
  ('Sede Colón', 'prd_13', 10),
  ('Sede Rivadavia', 'prd_01', 24),
  ('Sede Rivadavia', 'prd_02', 20),
  ('Sede Rivadavia', 'prd_03', 12),
  ('Sede Rivadavia', 'prd_04', 18),
  ('Sede Rivadavia', 'prd_05', 6),
  ('Sede Rivadavia', 'prd_06', 5),
  ('Sede Rivadavia', 'prd_08', 10),
  ('Sede Rivadavia', 'prd_12', 3),
  ('Sede Rivadavia', 'prd_13', 8),
  ('Sede Zonda', 'prd_01', 18),
  ('Sede Zonda', 'prd_02', 15),
  ('Sede Zonda', 'prd_03', 10),
  ('Sede Zonda', 'prd_04', 14),
  ('Sede Zonda', 'prd_05', 5),
  ('Sede Zonda', 'prd_06', 4),
  ('Sede Zonda', 'prd_08', 8),
  ('Sede Zonda', 'prd_12', 2),
  ('Sede Zonda', 'prd_13', 6)
ON CONFLICT ON CONSTRAINT unique_camping_product DO UPDATE SET quantity = EXCLUDED.quantity;

-- 4. Solicitudes de Desayuno
INSERT INTO public.desayuno_requests (id, item, quantity, category, urgency, status, requested_by, notes, date)
VALUES
  ('req_des_01', 'Leche en Polvo Entera Fortificada', '6 bolsas x 25 Kg', 'Materia Prima Láctea', 'Alta', 'Pendiente', 'Mariana López (Sector Desayuno)', 'Para provisión del ciclo semanal de desayunos en las 3 sedes.', '2026-10-08'),
  ('req_des_02', 'Cacao en Polvo Amargo Institucional', '8 cajas x 5 Kg', 'Materia Prima Seca', 'Media', 'En Preparación', 'Mariana López (Sector Desayuno)', 'Preparación de chocolatadas frías y calientes.', '2026-10-08'),
  ('req_des_03', 'Galletitas Dulces Surtidas (Control Alérgenos)', '40 cajas x 10 Kg', 'Colaciones', 'Alta', 'Pendiente', 'Mariana López (Sector Desayuno)', 'Raciones individuales estandarizadas para merienda.', '2026-10-08'),
  ('req_des_04', 'Azúcar Común Tipo A', '10 bolsas x 50 Kg', 'Materia Prima Seca', 'Baja', 'Despachado', 'Mariana López (Sector Desayuno)', 'Entrega en sector dosificación.', '2026-10-07'),
  ('req_des_05', 'Vasos Térmicos para Líquidos Calientes 240cc', '15 packs x 100 un.', 'Insumos Descartables', 'Alta', 'Pendiente', 'Mariana López (Sector Desayuno)', 'Para los días de baja temperatura matutina.', '2026-10-08')
ON CONFLICT (id) DO NOTHING;

-- 5. Solicitudes de Planta
INSERT INTO public.planta_requests (id, item, quantity, category, urgency, status, requested_by, notes, date)
VALUES
  ('req_pln_01', 'Aceite de Girasol Alto Oleico', '15 bidones x 10 Litros', 'Materias Primas Cocina', 'Alta', 'Pendiente', 'Estela Romero (Jefa de Planta)', 'Para cocción de viandas calientes del menú de mediodía.', '2026-10-08'),
  ('req_pln_02', 'Bandejas Descartables Aptas Microondas con Tapa', '30 cajas x 100 un.', 'Packaging Viandas', 'Alta', 'En Preparación', 'Estela Romero (Jefa de Planta)', 'Envasado sellado al vacío de 3.500 viandas diarias.', '2026-10-08'),
  ('req_pln_03', 'Film de PVC Gastronómico Termosellable 1400m', '6 bobinas', 'Packaging Viandas', 'Media', 'Pendiente', 'Estela Romero (Jefa de Planta)', 'Línea de empaquetado y sellado de viandas frías.', '2026-10-08'),
  ('req_pln_04', 'Sanitizante para Hortalizas por Inmersión (Clorado)', '4 bidones x 5 Litros', 'Químicos Bromatológicos', 'Alta', 'Pendiente', 'Estela Romero (Jefa de Planta)', 'Protocolo obligatorio de lavado y desinfección de ensaladas.', '2026-10-08'),
  ('req_pln_05', 'Cofias y Barbijos Descartables de Cocina', '10 cajas x 100 un.', 'Indumentaria & EPP', 'Media', 'Despachado', 'Estela Romero (Jefa de Planta)', 'Reposición para el turno mañana y tarde de cocina.', '2026-10-07')
ON CONFLICT (id) DO NOTHING;

