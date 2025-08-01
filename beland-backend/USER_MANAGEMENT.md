# Sistema de Gestión de Usuarios y Roles - Beland

## Descripción General

Este sistema implementa una gestión completa de usuarios y roles para la aplicación Beland, basándose en las mejores prácticas del proyecto ComicViewer pero adaptado a las necesidades específicas de Beland.

## Características Principales

### 🔐 Autenticación

- **Auth0 Integration**: Preparado para integración con Auth0
- **Local Authentication**: Sistema de autenticación local para testing
- **JWT Tokens**: Manejo de tokens JWT para sesiones

### 👥 Gestión de Usuarios

- **CRUD Completo**: Crear, leer, actualizar y eliminar usuarios
- **Soft Delete**: Eliminación suave (desactivación) de usuarios
- **Paginación**: Listado paginado de usuarios
- **Filtros Avanzados**: Búsqueda por email, rol, estado de bloqueo
- **Perfil de Usuario**: Gestión de perfil personal
- **Bloqueo/Desbloqueo**: Control de acceso de usuarios

### 🎭 Sistema de Roles

- **Roles Predefinidos**: USER, LEADER, ADMIN, SUPERADMIN
- **Gestión de Roles**: CRUD completo de roles
- **Asignación de Roles**: Asignar roles a usuarios
- **Permisos**: Sistema de permisos por rol

### 🚀 Inicialización Automática

- **SUPERADMIN**: Creación automática del usuario SUPERADMIN
- **Roles por Defecto**: Creación automática de roles básicos
- **Email Único**: `belandproject@gmail.com` como único SUPERADMIN

## Estructura de Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_provider TEXT,
  email TEXT UNIQUE,
  username TEXT,
  full_name TEXT,
  profile_picture_url TEXT,
  current_balance NUMERIC DEFAULT 0,
  role TEXT DEFAULT 'USER',
  role_id UUID REFERENCES roles(role_id),
  auth0_id TEXT,
  password TEXT,
  address TEXT,
  phone NUMERIC,
  country TEXT,
  city TEXT,
  isBlocked BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla `roles`

```sql
CREATE TABLE roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Endpoints Disponibles

### Usuarios (`/users`)

#### 🔍 Consultas

- `GET /users` - Listar usuarios (con paginación y filtros)
- `GET /users/:id` - Obtener usuario por ID
- `GET /users/by-email?email=...` - Buscar usuario por email
- `GET /users/me` - Obtener perfil del usuario autenticado
- `GET /users/deactivated` - Listar usuarios desactivados

#### ✏️ Modificaciones

- `POST /users` - Crear nuevo usuario
- `PATCH /users/:id` - Actualizar usuario
- `PATCH /users/me` - Actualizar perfil propio
- `PATCH /users/:id/block-status` - Bloquear/desbloquear usuario
- `PATCH /users/:id/reactivate` - Reactivar usuario desactivado
- `DELETE /users/:id` - Desactivar usuario (soft delete)

### Roles (`/roles`)

#### 🔍 Consultas

- `GET /roles` - Listar todos los roles
- `GET /roles/:id` - Obtener rol por ID
- `GET /roles/:id/users` - Obtener usuarios por rol

#### ✏️ Modificaciones

- `POST /roles` - Crear nuevo rol
- `PATCH /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol

## Configuración

### Variables de Entorno Requeridas

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# Auth0 Configuration (Opcional)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp env.example .env
# Editar .env con tus valores
```

### 3. Ejecutar Migraciones

```bash
npm run migration:run
```

### 4. Iniciar la Aplicación

```bash
npm run start:dev
```

## Uso del Sistema

### Crear Usuario SUPERADMIN

El sistema automáticamente crea un usuario SUPERADMIN con:

- **Email**: `belandproject@gmail.com`
- **Rol**: `SUPERADMIN`
- **Nombre**: "Beland Project Super Admin"

### Roles Disponibles

1. **USER**: Usuario básico del sistema
2. **LEADER**: Líder de grupo
3. **ADMIN**: Administrador del sistema
4. **SUPERADMIN**: Super administrador (máximo privilegio)

### Ejemplos de Uso

#### Crear un Usuario

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "full_name": "Usuario Ejemplo",
    "password": "Clave!123",
    "confirmPassword": "Clave!123",
    "address": "Calle 123",
    "phone": 1234567890,
    "country": "Colombia",
    "city": "Bogotá"
  }'
```

#### Listar Usuarios

```bash
curl -X GET "http://localhost:3001/users?page=1&limit=10"
```

#### Bloquear Usuario

```bash
curl -X PATCH http://localhost:3001/users/{user-id}/block-status \
  -H "Content-Type: application/json" \
  -d '{"isBlocked": true}'
```

## Seguridad

### Guards Comentados

Los guards de autenticación están comentados temporalmente para facilitar el testing. Para activarlos:

1. Descomenta las líneas de guards en los controladores
2. Configura Auth0 completamente
3. Implementa los decoradores de roles y permisos

### Validaciones

- Validación de email único
- Validación de contraseñas seguras
- Validación de roles válidos
- Protección contra roles críticos

## Migraciones

### Ejecutar Migraciones

```bash
npm run migration:run
```

### Revertir Migraciones

```bash
npm run migration:revert
```

### Generar Nueva Migración

```bash
npm run migration:generate -- src/database/migrations/NombreMigracion
```

## Testing

### Endpoints de Testing

- `POST /auth/register` - Registro local para testing
- `POST /auth/login` - Login local para testing
- `GET /auth/me` - Obtener perfil autenticado

### Ejemplo de Testing

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Usuario Test",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "address": "Test Address",
    "phone": 1234567890,
    "country": "Colombia",
    "city": "Bogotá"
  }'

# 2. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# 3. Usar token en requests
curl -X GET http://localhost:3001/users/me \
  -H "Authorization: Bearer {token}"
```

## Notas Importantes

1. **SUPERADMIN Único**: Solo `belandproject@gmail.com` puede ser SUPERADMIN
2. **Roles Críticos**: Los roles USER, LEADER, ADMIN, SUPERADMIN no pueden ser eliminados
3. **Soft Delete**: Los usuarios se desactivan, no se eliminan físicamente
4. **Auth0 Ready**: El sistema está preparado para integración con Auth0
5. **Testing Mode**: Los guards están comentados para facilitar testing

## Próximos Pasos

1. **Integrar Auth0**: Configurar autenticación completa con Auth0
2. **Implementar Guards**: Activar guards de autenticación y autorización
3. **Agregar Permisos**: Implementar sistema de permisos granular
4. **Auditoría**: Agregar logs de auditoría para acciones críticas
5. **Notificaciones**: Implementar sistema de notificaciones por email
