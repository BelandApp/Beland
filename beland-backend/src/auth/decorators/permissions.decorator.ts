import { SetMetadata } from '@nestjs/common';

// Define los nombres de los permisos que podemos verificar en la aplicación Beland
export type AdminPermission =
  | 'content_permission' // Permiso para gestionar contenido (ej. artículos, productos, publicaciones)
  | 'user_permission' // Permiso para gestionar usuarios (crear, actualizar, bloquear, desactivar, asignar roles)
  | 'moderation_permission' // Permiso para moderar (ej. comentarios, reportes, contenido inapropiado)
  | 'finance_permission' // Permiso para gestionar transacciones, saldos, pagos, etc.
  | 'analytics_permission' // Permiso para acceder a dashboards y reportes de datos de la aplicación.
  | 'settings_permission' // Permiso para cambiar configuraciones globales de la aplicación.
  | 'leader_management_permission' // Permiso para gestionar específicamente a los usuarios con rol 'LEADER'.
  | 'company_management_permission'; // Permiso para gestionar específicamente a los usuarios con rol 'EMPRESA'.

// Clave para almacenar los permisos requeridos en los metadatos de la ruta
export const PERMISSIONS_KEY = 'permissions';

// Decorador para especificar los permisos granulares requeridos en una ruta
export const RequiredPermissions = (...permissions: AdminPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
