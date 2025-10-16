# Dashboard Financiero - Configuración de Supabase

## Pasos para Configurar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información:
   - **Name**: `finanzasapp`
   - **Database Password**: Genera una contraseña segura
   - **Region**: `South America (São Paulo)` o `US East (N. Virginia)`
   - **Pricing Plan**: Free tier para desarrollo

### 2. Configurar Autenticación con Google

1. En el dashboard de Supabase, ve a **Authentication** > **Providers**
2. Habilita **Google** como proveedor
3. Configura Google OAuth:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Google+
   - Ve a **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
   - Configura:
     - **Application type**: Web application
     - **Authorized redirect URIs**:
       - `https://your-project-ref.supabase.co/auth/v1/callback`
       - `http://localhost:3000/auth/callback` (para desarrollo)
   - Copia el **Client ID** y **Client Secret**
4. En Supabase, pega las credenciales de Google

### 3. Configurar Base de Datos

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el archivo `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el archivo `supabase/rls-policies.sql`
4. Verifica que todas las tablas se crearon correctamente

### 4. Obtener Credenciales

1. Ve a **Settings** > **API**
2. Copia las siguientes credenciales:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJ...` (clave pública)
   - **service_role key**: `eyJ...` (clave de servicio)

### 5. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu_clave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu_clave_service_role

# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Database URL (for Prisma)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_nextauth_secret_generado

# Integraciones futuras
SII_API_KEY=
BANK_API_KEY=
```

### 6. Configurar Prisma

1. Instala las dependencias:

   ```bash
   pnpm install
   ```

2. Genera el cliente de Prisma:

   ```bash
   npx prisma generate
   ```

3. Sincroniza el schema con la base de datos:

   ```bash
   npx prisma db push
   ```

4. (Opcional) Abre Prisma Studio para ver los datos:
   ```bash
   npx prisma studio
   ```

### 7. Probar la Configuración

1. Ejecuta el proyecto en desarrollo:

   ```bash
   pnpm dev
   ```

2. Ve a `http://localhost:3000`
3. Intenta iniciar sesión con Google
4. Verifica que se crea un usuario en la tabla `users`

### 8. Configurar Row Level Security (RLS)

Las políticas RLS ya están configuradas en `supabase/rls-policies.sql`. Estas políticas aseguran que:

- Los usuarios solo pueden ver datos de sus propias empresas
- Solo los propietarios pueden eliminar datos sensibles
- Los administradores pueden gestionar usuarios de la empresa
- Los visualizadores solo pueden ver datos

### 9. Configurar Dominio Personalizado (Producción)

1. En Supabase, ve a **Settings** > **Custom Domains**
2. Configura tu dominio personalizado
3. Actualiza las variables de entorno con el nuevo dominio

### 10. Configurar Backups

1. En Supabase, ve a **Settings** > **Database**
2. Habilita **Point-in-time Recovery** si es necesario
3. Configura backups automáticos

## Comandos Útiles

```bash
# Iniciar Supabase localmente
supabase start

# Detener Supabase local
supabase stop

# Resetear base de datos local
supabase db reset

# Ver logs de Supabase
supabase logs

# Generar tipos TypeScript
supabase gen types typescript --local > types/supabase.ts
```

## Troubleshooting

### Error de CORS

Si tienes problemas de CORS, verifica que las URLs estén configuradas correctamente en Google OAuth.

### Error de RLS

Si las políticas RLS no funcionan, verifica que estén habilitadas en todas las tablas.

### Error de Prisma

Si Prisma no puede conectarse, verifica que la `DATABASE_URL` sea correcta y que la base de datos esté accesible.

## Seguridad

- Nunca expongas la `SUPABASE_SERVICE_ROLE_KEY` en el frontend
- Usa la clave `anon` para operaciones del cliente
- Usa la clave `service_role` solo en el backend
- Configura políticas RLS apropiadas
- Usa HTTPS en producción
- Configura dominios permitidos en Supabase
