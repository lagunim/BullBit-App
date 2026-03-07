/**
 * ============================================
 * CLIENTE DE SUPABASE - BULLBIT APP
 * ============================================
 * Este archivo inicializa la conexión con Supabase,
 * el servicio de base de datos y autenticación.
 * 
 * CONFIGURACIÓN:
 * Las variables de entorno deben estar definidas en:
 * - PUBLIC_SUPABASE_URL: URL del proyecto Supabase
 * - PUBLIC_SUPABASE_ANON_KEY: Clave pública anónima
 * 
 * NOTA: Estas son variables públicas (PUBLIC_) por lo que
 * son seguras de exponer en el cliente.
 */

import { createClient } from '@supabase/supabase-js';

// URL del proyecto Supabase (definida en variables de entorno)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

// Clave anónima pública del proyecto (definida en variables de entorno)
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente de Supabase configurado y listo para usar.
 * Proporciona métodos para:
 * - Autenticación de usuarios (sign up, login, logout)
 * - Operaciones de base de datos (select, insert, update, delete)
 * - Storage de archivos
 * - Funciones edge
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
