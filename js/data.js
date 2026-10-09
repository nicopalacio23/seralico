/**
 * SERALICO ENTERPRISE DATA STORE - USERS, ROLES & MODULE SPECIFICATIONS
 */

import { SupabaseService } from './supabase.js';

export const COLONIAS_ROLES = [
  { id: 'referente_camping', label: 'Referente de Sede', requiresCamping: true },
  { id: 'deposito_central', label: 'Depósito Central', requiresCamping: false },
  { id: 'planta_elaboracion', label: 'Planta de Elaboración', requiresCamping: false },
  { id: 'recursos_humanos', label: 'Recursos Humanos', requiresCamping: false },
  { id: 'auditor', label: 'Auditor Bromatológico', requiresCamping: false },
  { id: 'sector_desayuno', label: 'Sector Desayuno & Meriendas', requiresCamping: false }
];

export const SEDES_LIST = [
  'Sede Colón',
  'Sede Rivadavia',
  'Sede Zonda'
];

export const CAMPINGS_LIST = SEDES_LIST; // Compatibility alias

export const HOSPITALES_SEDES = [
  'Hospital Central de Agudos - Sede Norte',
  'Complejo Hospitalario San Martín',
  'Sanatorio Metropolitano - Centro',
  'Hospital Materno Infantil - Zona Sur',
  'Planta Gastronómica y Lavandería Central'
];

export const MODULES_DATA = {
  calidad: {
    id: 'calidad',
    code: 'MOD-HOSP-QA',
    title: 'Control de Calidad',
    domain: 'hospitales',
    scope: 'Gestión Hospitalaria (Calidad + Stock unificados)',
    sharedWith: 'stock',
    accentColor: '#059669',
    description: 'Control higiénico-sanitario, auditorías de cocina y desinfección en hospitales. Mismas credenciales que Control de Stock.',
    defaultUser: 'hospitales@seralico.com.ar',
    defaultRole: 'Supervisor Hospitalario (Calidad y Stock)'
  },

  stock: {
    id: 'stock',
    code: 'MOD-HOSP-STK',
    title: 'Control de Stock',
    domain: 'hospitales',
    scope: 'Gestión Hospitalaria (Calidad + Stock unificados)',
    sharedWith: 'calidad',
    accentColor: '#D97706',
    description: 'Gestión de insumos químicos, pañol y materias primas hospitalarias. Mismas credenciales que Control de Calidad.',
    defaultUser: 'hospitales@seralico.com.ar',
    defaultRole: 'Supervisor Hospitalario (Calidad y Stock)'
  },

  colonias: {
    id: 'colonias',
    code: 'MOD-COLONIAS',
    title: 'Colonias de Verano',
    domain: 'colonias',
    scope: 'Gestión Estival Autónoma',
    sharedWith: null,
    accentColor: '#0284C7',
    description: 'Planificación de viandas infantiles, menús nutricionales, logística y coordinación estival con perfiles de acceso específicos.',
    defaultUser: 'referente.colon@seralico.com.ar',
    defaultRole: 'Referente Sede Colón'
  }
};

// INITIAL SEED USERS
const DEFAULT_USERS = [
  {
    id: 'usr_superadmin',
    name: 'Administrador General Seralico',
    username: 'superadmin@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'superadmin',
    roleLabel: 'Superusuario / Admin General',
    scope: 'all',
    sede: 'Sede Central CABA',
    active: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'usr_hospitales_1',
    name: 'Lic. Laura Benítez (Control Hospitales)',
    username: 'hospitales@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'hospitales',
    roleLabel: 'Supervisor Hospitalario (Calidad + Stock)',
    scope: 'hospitales', // Grants access to BOTH Calidad and Stock
    sede: 'Hospital Central de Agudos - Sede Norte',
    active: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'usr_col_ref_colon',
    name: 'Martín Gómez (Referente Sede Colón)',
    username: 'referente.colon@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'referente_camping',
    roleLabel: 'Referente de Sede (Colón)',
    scope: 'colonias',
    sede: 'Sede Colón',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_ref_rivadavia',
    name: 'Gonzalo Pérez (Referente Sede Rivadavia)',
    username: 'referente.rivadavia@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'referente_camping',
    roleLabel: 'Referente de Sede (Rivadavia)',
    scope: 'colonias',
    sede: 'Sede Rivadavia',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_ref_zonda',
    name: 'Valeria Luna (Referente Sede Zonda)',
    username: 'referente.zonda@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'referente_camping',
    roleLabel: 'Referente de Sede (Zonda)',
    scope: 'colonias',
    sede: 'Sede Zonda',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_deposito',
    name: 'Gonzalo Fernández (Pañol Central)',
    username: 'deposito.colonias@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'deposito_central',
    roleLabel: 'Depósito Central',
    scope: 'colonias',
    sede: 'Parque Roca (Centro Logístico)',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_planta',
    name: 'Estela Romero (Jefa de Cocina Central)',
    username: 'planta.colonias@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'planta_elaboracion',
    roleLabel: 'Planta de Elaboración',
    scope: 'colonias',
    sede: 'Planta Gastronómica y Lavandería Central',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_rrhh',
    name: 'Carolina Morales (Personal Estival)',
    username: 'rrhh.colonias@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'recursos_humanos',
    roleLabel: 'Recursos Humanos',
    scope: 'colonias',
    sede: 'Sede Central CABA',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_auditor',
    name: 'Dr. Claudio Rossi (Bromatología)',
    username: 'auditor.colonias@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'auditor',
    roleLabel: 'Auditor Bromatológico',
    scope: 'colonias',
    sede: 'Todas las sedes estivales',
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_col_desayuno',
    name: 'Mariana López (Sector Desayunos)',
    username: 'desayuno.colonias@seralico.com.ar',
    password: 'seralico2026',
    roleType: 'colonias',
    coloniasRole: 'sector_desayuno',
    roleLabel: 'Sector Desayuno & Meriendas',
    scope: 'colonias',
    sede: 'Sede Colón',
    active: true,
    createdAt: '2026-02-01'
  }
];

// USER STORAGE MANAGEMENT
const STORAGE_KEY = 'seralico_enterprise_users';

export class UserStore {
  static getUsers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if migration to 3 sedes is needed
        if (parsed.some(u => u.username === 'referente.colon@seralico.com.ar')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error, using defaults:', e);
    }
    UserStore.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  static saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }

  static addUser(userData) {
    const users = UserStore.getUsers();
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      ...userData
    };
    users.unshift(newUser);
    UserStore.saveUsers(users);

    // Sync to Supabase in background
    SupabaseService.upsertUser(newUser).catch(err => console.warn('Supabase async sync user error:', err));
    return newUser;
  }

  static deleteUser(userId) {
    let users = UserStore.getUsers();
    users = users.filter(u => u.id !== userId);
    UserStore.saveUsers(users);

    // Sync deletion to Supabase
    SupabaseService.deleteUser(userId).catch(err => console.warn('Supabase async delete user error:', err));
    return users;
  }

  static toggleUserStatus(userId) {
    const users = UserStore.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.active = !user.active;
      UserStore.saveUsers(users);
      SupabaseService.upsertUser(user).catch(err => console.warn('Supabase async toggle user error:', err));
    }
    return user;
  }

  static findUser(username, password) {
    const users = UserStore.getUsers();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    return users.find(u => 
      u.username.toLowerCase() === cleanUser && 
      u.password === cleanPass && 
      u.active !== false
    );
  }

  static checkAccess(user, targetModuleId) {
    if (!user) return false;
    // Superadmin has access to everything
    if (user.roleType === 'superadmin' || user.scope === 'all') return true;

    // Hospitales users have access to BOTH calidad and stock
    if (user.roleType === 'hospitales' || user.scope === 'hospitales') {
      return targetModuleId === 'calidad' || targetModuleId === 'stock';
    }

    // Colonias users ONLY have access to colonias
    if (user.roleType === 'colonias' || user.scope === 'colonias') {
      return targetModuleId === 'colonias';
    }

    return false;
  }
}

// ==========================================================================
// DEPOSITO CENTRAL STORE - CATALOG, CAMPINGS MATRIX, DESAYUNO & PLANTA
// ==========================================================================

const DEPOSITO_CATALOG_KEY = 'seralico_deposito_catalog';
const CAMPING_ORDERS_KEY = 'seralico_camping_orders';
const DESAYUNO_REQUESTS_KEY = 'seralico_desayuno_requests';
const PLANTA_REQUESTS_KEY = 'seralico_planta_requests';

// Initial default catalog of products available for campings to request
const INITIAL_CAMPING_PRODUCTS = [
  { id: 'prd_01', code: 'DESC-01', name: 'Vasos Descartables 180cc', category: 'Descartables', unit: 'Pack x 100 un.', stock: 350, active: true },
  { id: 'prd_02', code: 'DESC-02', name: 'Servilletas de Papel Blancas', category: 'Descartables', unit: 'Pack x 250 un.', stock: 240, active: true },
  { id: 'prd_03', code: 'DESC-03', name: 'Platos Plásticos Hondos Térmicos', category: 'Descartables', unit: 'Pack x 50 un.', stock: 180, active: true },
  { id: 'prd_04', code: 'DESC-04', name: 'Cucharas Descartables Reforzadas', category: 'Descartables', unit: 'Pack x 100 un.', stock: 220, active: true },
  { id: 'prd_05', code: 'LIMP-01', name: 'Lavandina Concentrada 55g/L', category: 'Limpieza', unit: 'Bidón 5 Litros', stock: 95, active: true },
  { id: 'prd_06', code: 'LIMP-02', name: 'Detergente Neutro Biodegradable', category: 'Limpieza', unit: 'Bidón 5 Litros', stock: 80, active: true },
  { id: 'prd_07', code: 'LIMP-03', name: 'Jabón Líquido Antibacterial Manos', category: 'Limpieza', unit: 'Bidón 5 Litros', stock: 65, active: true },
  { id: 'prd_08', code: 'LIMP-04', name: 'Bolsas de Consorcio Negras 80x110', category: 'Limpieza', unit: 'Paquete x 50 un.', stock: 140, active: true },
  { id: 'prd_09', code: 'LIMP-05', name: 'Paños Absorbentes Multiuso', category: 'Limpieza', unit: 'Pack x 10 un.', stock: 110, active: true },
  { id: 'prd_10', code: 'EQP-01', name: 'Termo Conservador Isotérmico 20L', category: 'Equipamiento', unit: 'Unidad', stock: 24, active: true },
  { id: 'prd_11', code: 'EQP-02', name: 'Bandejas de Distribución Térmica', category: 'Equipamiento', unit: 'Pack x 10 un.', stock: 45, active: true },
  { id: 'prd_12', code: 'SEG-01', name: 'Alcohol en Gel 70% con Dosificador', category: 'Seguridad', unit: 'Bidón 5 Litros', stock: 50, active: true },
  { id: 'prd_13', code: 'SEG-02', name: 'Guantes Descartables de Nitrilo', category: 'Seguridad', unit: 'Caja x 100 un.', stock: 160, active: true }
];

// Initial seeded orders per sede (Product ID -> quantity requested)
const INITIAL_CAMPING_ORDERS = {
  'Sede Colón': {
    'prd_01': 30, 'prd_02': 25, 'prd_03': 15, 'prd_04': 20, 'prd_05': 8, 'prd_06': 6, 'prd_08': 12, 'prd_12': 4, 'prd_13': 10
  },
  'Sede Rivadavia': {
    'prd_01': 24, 'prd_02': 20, 'prd_03': 12, 'prd_04': 18, 'prd_05': 6, 'prd_06': 5, 'prd_08': 10, 'prd_12': 3, 'prd_13': 8
  },
  'Sede Zonda': {
    'prd_01': 18, 'prd_02': 15, 'prd_03': 10, 'prd_04': 14, 'prd_05': 5, 'prd_06': 4, 'prd_08': 8, 'prd_12': 2, 'prd_13': 6
  }
};

// Initial requests from Sector Desayuno to Depósito Central
const INITIAL_DESAYUNO_REQUESTS = [
  {
    id: 'req_des_01',
    item: 'Leche en Polvo Entera Fortificada',
    quantity: '6 bolsas x 25 Kg',
    category: 'Materia Prima Láctea',
    urgency: 'Alta',
    date: '2026-10-08',
    status: 'Pendiente',
    requestedBy: 'Mariana López (Sector Desayuno)',
    notes: 'Para provisión del ciclo semanal de desayunos en 6 sedes.'
  },
  {
    id: 'req_des_02',
    item: 'Cacao en Polvo Amargo Institucional',
    quantity: '8 cajas x 5 Kg',
    category: 'Materia Prima Seca',
    urgency: 'Media',
    date: '2026-10-08',
    status: 'En Preparación',
    requestedBy: 'Mariana López (Sector Desayuno)',
    notes: 'Preparación de chocolatadas frías y calientes.'
  },
  {
    id: 'req_des_03',
    item: 'Galletitas Dulces Surtidas (Control Alérgenos)',
    quantity: '40 cajas x 10 Kg',
    category: 'Colaciones',
    urgency: 'Alta',
    date: '2026-10-08',
    status: 'Pendiente',
    requestedBy: 'Mariana López (Sector Desayuno)',
    notes: 'Raciones individuales estandarizadas para merienda.'
  },
  {
    id: 'req_des_04',
    item: 'Azúcar Común Tipo A',
    quantity: '10 bolsas x 50 Kg',
    category: 'Materia Prima Seca',
    urgency: 'Baja',
    date: '2026-10-07',
    status: 'Despachado',
    requestedBy: 'Mariana López (Sector Desayuno)',
    notes: 'Entrega en sector dosificación.'
  },
  {
    id: 'req_des_05',
    item: 'Vasos Térmicos para Líquidos Calientes 240cc',
    quantity: '15 packs x 100 un.',
    category: 'Insumos Descartables',
    urgency: 'Alta',
    date: '2026-10-08',
    status: 'Pendiente',
    requestedBy: 'Mariana López (Sector Desayuno)',
    notes: 'Para los días de baja temperatura matutina.'
  }
];

// Initial requests from Planta de Elaboración (Cocina Central) to Depósito Central
const INITIAL_PLANTA_REQUESTS = [
  {
    id: 'req_pln_01',
    item: 'Aceite de Girasol Alto Oleico',
    quantity: '15 bidones x 10 Litros',
    category: 'Materias Primas Cocina',
    urgency: 'Alta',
    date: '2026-10-08',
    status: 'Pendiente',
    requestedBy: 'Estela Romero (Jefa de Planta)',
    notes: 'Para cocción de viandas calientes del menú de mediodía.'
  },
  {
    id: 'req_pln_02',
    item: 'Bandejas Descartables Aptas Microondas con Tapa',
    quantity: '30 cajas x 100 un.',
    category: 'Packaging Viandas',
    urgency: 'Alta',
    date: '2026-10-08',
    status: 'En Preparación',
    requestedBy: 'Estela Romero (Jefa de Planta)',
    notes: 'Envasado sellado al vacío de 3.500 viandas diarias.'
  },
  {
    id: 'req_pln_03',
    item: 'Film de PVC Gastronómico Termosellable 1400m',
    quantity: '6 bobinas',
    category: 'Packaging Viandas',
    urgency: 'Media',
    date: '2026-10-08',
    status: 'Pendiente',
    requestedBy: 'Estela Romero (Jefa de Planta)',
    notes: 'Línea de empaquetado y sellado de viandas frías.'
  },
  {
    id: 'req_pln_04',
    item: 'Sanitizante para Hortalizas por Inmersión (Clorado)',
    quantity: '4 bidones x 5 Litros',
    category: 'Químicos Bromatológicos',
    urgency: 'Alta',
    date: '2026-10-08',
    status: 'Pendiente',
    requestedBy: 'Estela Romero (Jefa de Planta)',
    notes: 'Protocolo obligatorio de lavado y desinfección de ensaladas.'
  },
  {
    id: 'req_pln_05',
    item: 'Cofias y Barbijos Descartables de Cocina',
    quantity: '10 cajas x 100 un.',
    category: 'Indumentaria & EPP',
    urgency: 'Media',
    date: '2026-10-07',
    status: 'Despachado',
    requestedBy: 'Estela Romero (Jefa de Planta)',
    notes: 'Reposición para el turno mañana y tarde de cocina.'
  }
];

export class DepositoStore {
  // 1. PRODUCTS CATALOG
  static getCatalog() {
    try {
      const stored = localStorage.getItem(DEPOSITO_CATALOG_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading catalog from storage:', e);
    }
    DepositoStore.saveCatalog(INITIAL_CAMPING_PRODUCTS);
    return INITIAL_CAMPING_PRODUCTS;
  }

  static saveCatalog(products) {
    localStorage.setItem(DEPOSITO_CATALOG_KEY, JSON.stringify(products));
  }

  static addProduct(productData) {
    const products = DepositoStore.getCatalog();
    const newProduct = {
      id: 'prd_' + Date.now().toString(36),
      code: 'PRD-' + (products.length + 1).toString().padStart(2, '0'),
      active: true,
      ...productData
    };
    products.push(newProduct);
    DepositoStore.saveCatalog(products);

    // Sync to Supabase in background
    SupabaseService.upsertProduct(newProduct).catch(err => console.warn('Supabase product sync error:', err));
    return newProduct;
  }

  static deleteProduct(productId) {
    let products = DepositoStore.getCatalog();
    products = products.filter(p => p.id !== productId);
    DepositoStore.saveCatalog(products);

    // Sync deletion to Supabase
    SupabaseService.deleteProduct(productId).catch(err => console.warn('Supabase delete product error:', err));
    return products;
  }

  static updateProductStock(productId, newStock) {
    const products = DepositoStore.getCatalog();
    const p = products.find(x => x.id === productId);
    if (p) {
      p.stock = parseInt(newStock) || 0;
      DepositoStore.saveCatalog(products);
      SupabaseService.upsertProduct(p).catch(err => console.warn('Supabase stock sync error:', err));
    }
    return p;
  }

  // 2. SEDES ORDERS MATRIX
  static getCampingOrders() {
    try {
      const stored = localStorage.getItem(CAMPING_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed['Sede Colón']) return parsed;
      }
    } catch (e) {
      console.warn('Error reading camping orders:', e);
    }
    DepositoStore.saveCampingOrders(INITIAL_CAMPING_ORDERS);
    return INITIAL_CAMPING_ORDERS;
  }

  static saveCampingOrders(orders) {
    localStorage.setItem(CAMPING_ORDERS_KEY, JSON.stringify(orders));
  }

  static updateCampingOrderQty(camping, productId, qty) {
    const orders = DepositoStore.getCampingOrders();
    if (!orders[camping]) orders[camping] = {};
    orders[camping][productId] = parseInt(qty) || 0;
    DepositoStore.saveCampingOrders(orders);

    // Sync to Supabase
    SupabaseService.updateCampingOrder(camping, productId, qty).catch(err => console.warn('Supabase camping order sync error:', err));
  }

  // 3. SECTOR DESAYUNO REQUESTS
  static getDesayunoRequests() {
    try {
      const stored = localStorage.getItem(DESAYUNO_REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading desayuno requests:', e);
    }
    DepositoStore.saveDesayunoRequests(INITIAL_DESAYUNO_REQUESTS);
    return INITIAL_DESAYUNO_REQUESTS;
  }

  static saveDesayunoRequests(requests) {
    localStorage.setItem(DESAYUNO_REQUESTS_KEY, JSON.stringify(requests));
  }

  static addDesayunoRequest(reqData) {
    const requests = DepositoStore.getDesayunoRequests();
    const newReq = {
      id: 'req_des_' + Date.now().toString(36),
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      requestedBy: 'Sector Desayuno Colonias',
      ...reqData
    };
    requests.unshift(newReq);
    DepositoStore.saveDesayunoRequests(requests);

    // Sync to Supabase
    SupabaseService.upsertDesayunoRequest(newReq).catch(err => console.warn('Supabase desayuno sync error:', err));
    return newReq;
  }

  static updateDesayunoStatus(reqId, status) {
    const requests = DepositoStore.getDesayunoRequests();
    const req = requests.find(r => r.id === reqId);
    if (req) {
      req.status = status;
      DepositoStore.saveDesayunoRequests(requests);
      SupabaseService.upsertDesayunoRequest(req).catch(err => console.warn('Supabase desayuno status sync error:', err));
    }
    return req;
  }

  // 4. PLANTA DE ELABORACION REQUESTS
  static getPlantaRequests() {
    try {
      const stored = localStorage.getItem(PLANTA_REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading planta requests:', e);
    }
    DepositoStore.savePlantaRequests(INITIAL_PLANTA_REQUESTS);
    return INITIAL_PLANTA_REQUESTS;
  }

  static savePlantaRequests(requests) {
    localStorage.setItem(PLANTA_REQUESTS_KEY, JSON.stringify(requests));
  }

  static addPlantaRequest(reqData) {
    const requests = DepositoStore.getPlantaRequests();
    const newReq = {
      id: 'req_pln_' + Date.now().toString(36),
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      requestedBy: 'Planta Gastronómica Mataderos',
      ...reqData
    };
    requests.unshift(newReq);
    DepositoStore.savePlantaRequests(requests);

    // Sync to Supabase
    SupabaseService.upsertPlantaRequest(newReq).catch(err => console.warn('Supabase planta sync error:', err));
    return newReq;
  }

  static updatePlantaStatus(reqId, status) {
    const requests = DepositoStore.getPlantaRequests();
    const req = requests.find(r => r.id === reqId);
    if (req) {
      req.status = status;
      DepositoStore.savePlantaRequests(requests);
      SupabaseService.upsertPlantaRequest(req).catch(err => console.warn('Supabase planta status sync error:', err));
    }
    return req;
  }
}

/**
 * Global Synchronizer to pull fresh data from Supabase
 */
export class DataSync {
  static async syncAllFromSupabase() {
    if (!SupabaseService.isConfigured()) return { synced: false, reason: 'unconfigured' };

    try {
      const [remoteUsers, remoteCatalog, remoteOrders, remoteDesayuno, remotePlanta] = await Promise.all([
        SupabaseService.fetchUsers(),
        SupabaseService.fetchCatalog(),
        SupabaseService.fetchCampingOrders(),
        SupabaseService.fetchDesayunoRequests(),
        SupabaseService.fetchPlantaRequests()
      ]);

      if (remoteUsers && remoteUsers.length > 0) UserStore.saveUsers(remoteUsers);
      if (remoteCatalog && remoteCatalog.length > 0) DepositoStore.saveCatalog(remoteCatalog);
      if (remoteOrders && Object.keys(remoteOrders).length > 0) DepositoStore.saveCampingOrders(remoteOrders);
      if (remoteDesayuno && remoteDesayuno.length > 0) DepositoStore.saveDesayunoRequests(remoteDesayuno);
      if (remotePlanta && remotePlanta.length > 0) DepositoStore.savePlantaRequests(remotePlanta);

      return { synced: true };
    } catch (e) {
      console.warn('Sync from Supabase failed, using local storage cache:', e);
      return { synced: false, error: e };
    }
  }
}


