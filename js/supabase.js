/**
 * SERALICO - SUPABASE CLIENT ADAPTER & REAL-TIME SYNC
 */

import { SUPABASE_CONFIG } from './config.js';

const SUPABASE_STORAGE_URL_KEY = 'seralico_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'seralico_supabase_anon_key';

let supabaseClient = null;
let isConnected = false;

export class SupabaseService {
  /**
   * Retrieves active credentials from config.js or localStorage
   */
  static getCredentials() {
    const storedUrl = localStorage.getItem(SUPABASE_STORAGE_URL_KEY);
    const storedKey = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY);

    const url = (storedUrl || SUPABASE_CONFIG.url || '').trim();
    const anonKey = (storedKey || SUPABASE_CONFIG.anonKey || '').trim();

    return { url, anonKey };
  }

  /**
   * Saves credentials in localStorage
   */
  static saveCredentials(url, anonKey) {
    if (url) localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url.trim());
    if (anonKey) localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, anonKey.trim());
    supabaseClient = null;
    isConnected = false;
  }

  /**
   * Initializes Supabase Client using ESM CDN
   */
  static async getClient() {
    if (supabaseClient) return supabaseClient;

    const { url, anonKey } = SupabaseService.getCredentials();
    if (!url || !anonKey) {
      return null;
    }

    try {
      // Dynamic import from CDN
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      supabaseClient = createClient(url, anonKey);
      return supabaseClient;
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  }

  /**
   * Tests connection to Supabase database
   */
  static async testConnection() {
    try {
      const client = await SupabaseService.getClient();
      if (!client) {
        return { success: false, message: 'Faltan configurar URL y Clave Anon de Supabase.' };
      }

      const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        return { success: false, message: error.message };
      }

      isConnected = true;
      return { success: true, message: 'Conexión a Supabase establecida correctamente.' };
    } catch (e) {
      return { success: false, message: e.message || 'Error de red al conectar con Supabase.' };
    }
  }

  static isConfigured() {
    const { url, anonKey } = SupabaseService.getCredentials();
    return !!(url && anonKey);
  }

  /* --------------------------------------------------------------------------
     1. USERS SYNC
     -------------------------------------------------------------------------- */
  static async fetchUsers() {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const { data, error } = await client.from('users').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchUsers error:', error);
      return null;
    }
    return data.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      password: u.password,
      roleType: u.role_type,
      coloniasRole: u.colonias_role,
      roleLabel: u.role_label,
      scope: u.scope,
      sede: u.sede,
      active: u.active,
      createdAt: u.created_at ? u.created_at.split('T')[0] : '2026-01-01'
    }));
  }

  static async upsertUser(user) {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      password: user.password,
      role_type: user.roleType,
      colonias_role: user.coloniasRole || null,
      role_label: user.roleLabel || null,
      scope: user.scope || null,
      sede: user.sede || null,
      active: user.active !== false
    };

    const { data, error } = await client.from('users').upsert(payload).select().single();
    if (error) console.error('Supabase upsertUser error:', error);
    return data;
  }

  static async deleteUser(userId) {
    const client = await SupabaseService.getClient();
    if (!client) return null;
    const { error } = await client.from('users').delete().eq('id', userId);
    if (error) console.error('Supabase deleteUser error:', error);
  }

  /* --------------------------------------------------------------------------
     2. CAMPINGS CATALOG SYNC
     -------------------------------------------------------------------------- */
  static async fetchCatalog() {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const { data, error } = await client.from('camping_catalog').select('*').order('code', { ascending: true });
    if (error) {
      console.warn('Supabase fetchCatalog error:', error);
      return null;
    }
    return data;
  }

  static async upsertProduct(product) {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const payload = {
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      stock: parseInt(product.stock) || 0,
      active: product.active !== false
    };

    const { data, error } = await client.from('camping_catalog').upsert(payload).select().single();
    if (error) console.error('Supabase upsertProduct error:', error);
    return data;
  }

  static async deleteProduct(productId) {
    const client = await SupabaseService.getClient();
    if (!client) return null;
    const { error } = await client.from('camping_catalog').delete().eq('id', productId);
    if (error) console.error('Supabase deleteProduct error:', error);
  }

  /* --------------------------------------------------------------------------
     3. CAMPING ORDERS SYNC
     -------------------------------------------------------------------------- */
  static async fetchCampingOrders() {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const { data, error } = await client.from('camping_orders').select('*');
    if (error) {
      console.warn('Supabase fetchCampingOrders error:', error);
      return null;
    }

    const map = {};
    data.forEach(row => {
      if (!map[row.camping_name]) map[row.camping_name] = {};
      map[row.camping_name][row.product_id] = row.quantity;
    });
    return map;
  }

  static async updateCampingOrder(campingName, productId, quantity) {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const { data, error } = await client.from('camping_orders').upsert({
      camping_name: campingName,
      product_id: productId,
      quantity: parseInt(quantity) || 0,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'camping_name,product_id'
    });

    if (error) console.error('Supabase updateCampingOrder error:', error);
  }

  /* --------------------------------------------------------------------------
     4. DESAYUNO REQUESTS SYNC
     -------------------------------------------------------------------------- */
  static async fetchDesayunoRequests() {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const { data, error } = await client.from('desayuno_requests').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchDesayunoRequests error:', error);
      return null;
    }
    return data.map(r => ({
      id: r.id,
      item: r.item,
      quantity: r.quantity,
      category: r.category,
      urgency: r.urgency,
      status: r.status,
      requestedBy: r.requested_by,
      notes: r.notes,
      date: r.date
    }));
  }

  static async upsertDesayunoRequest(req) {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const payload = {
      id: req.id,
      item: req.item,
      quantity: req.quantity,
      category: req.category,
      urgency: req.urgency,
      status: req.status,
      requested_by: req.requestedBy,
      notes: req.notes,
      date: req.date
    };

    const { data, error } = await client.from('desayuno_requests').upsert(payload);
    if (error) console.error('Supabase upsertDesayunoRequest error:', error);
    return data;
  }

  /* --------------------------------------------------------------------------
     5. PLANTA REQUESTS SYNC
     -------------------------------------------------------------------------- */
  static async fetchPlantaRequests() {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const { data, error } = await client.from('planta_requests').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchPlantaRequests error:', error);
      return null;
    }
    return data.map(r => ({
      id: r.id,
      item: r.item,
      quantity: r.quantity,
      category: r.category,
      urgency: r.urgency,
      status: r.status,
      requestedBy: r.requested_by,
      notes: r.notes,
      date: r.date
    }));
  }

  static async upsertPlantaRequest(req) {
    const client = await SupabaseService.getClient();
    if (!client) return null;

    const payload = {
      id: req.id,
      item: req.item,
      quantity: req.quantity,
      category: req.category,
      urgency: req.urgency,
      status: req.status,
      requested_by: req.requestedBy,
      notes: req.notes,
      date: req.date
    };

    const { data, error } = await client.from('planta_requests').upsert(payload);
    if (error) console.error('Supabase upsertPlantaRequest error:', error);
    return data;
  }
}
