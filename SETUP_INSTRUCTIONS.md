# 📋 Instrucciones de Configuración - Pasos Siguientes

Este documento te guía paso a paso para completar la configuración del Dashboard Financiero.

## ✅ Lo que ya está listo

- ✅ Estructura del proyecto configurada
- ✅ Schema de base de datos diseñado (Prisma)
- ✅ Migraciones SQL creadas
- ✅ Políticas de Row Level Security (RLS) definidas
- ✅ Clientes de Supabase configurados (browser y server)
- ✅ Sistema de autenticación implementado
- ✅ Contextos de React (Auth y Company)
- ✅ Servicios de datos (CRUD operations)
- ✅ Componentes UI (Dashboard, Transactions, Checks, Credits, Suppliers)
- ✅ Middleware de protección de rutas
- ✅ Utilidades de manejo de dinero
- ✅ Estructura para integraciones futuras

## 🔴 Lo que necesitas hacer ahora

### Paso 1: Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa:
   - **Organization**: Crea una nueva o selecciona existente
   - **Name**: `finanzasapp`
   - **Database Password**: Genera y guarda una contraseña segura
   - **Region**: `South America (São Paulo)` (recomendado) o `US East (N. Virginia)`
   - **Pricing Plan**: Free tier (para desarrollo)
5. Espera 2-3 minutos mientras se crea el proyecto

### Paso 2: Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** (icono de engranaje)
2. Selecciona **API** en el menú lateral
3. Copia los siguientes valores:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (una clave muy larga)
4. También necesitarás:
   - **Project Reference ID**: Lo encuentras en la URL o en Settings > General
   - **Database Password**: La que generaste en el paso 1

### Paso 3: Ejecutar Migraciones SQL en Supabase

1. En Supabase, ve a **SQL Editor** (icono de hoja)
2. Haz clic en **New Query**
3. Abre el archivo `supabase/migrations/001_initial_schema.sql` de este proyecto
4. Copia TODO el contenido y pégalo en el editor SQL de Supabase
5. Haz clic en **Run** (botón abajo a la derecha)
6. Deberías ver: "Success. No rows returned"

7. Repite el proceso con `supabase/rls-policies.sql`:

   - New Query
   - Copiar contenido del archivo
   - Pegar en editor
   - Run

8. Verifica en **Table Editor** que se crearon las tablas:
   - users
   - companies
   - company_users
   - transactions
   - categories
   - checks
   - credits
   - suppliers

### Paso 4: Configurar Google OAuth

#### 4.1 En Google Cloud Console

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**:

   - Menu > APIs & Services > Library
   - Busca "Google+ API"
   - Haz clic y selecciona "Enable"

4. Crea credenciales OAuth 2.0:

   - Menu > APIs & Services > Credentials
   - Haz clic en "+ CREATE CREDENTIALS"
   - Selecciona "OAuth 2.0 Client IDs"
   - Si es la primera vez, configura la pantalla de consentimiento OAuth:
     - User Type: External
     - App name: "Dashboard Financiero"
     - User support email: tu email
     - Developer contact: tu email
     - Guarda

5. Configura el Cliente OAuth:

   - Application type: **Web application**
   - Name: `Dashboard Financiero`
   - Authorized redirect URIs:
     - `https://[tu-project-ref].supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo)
   - Haz clic en "CREATE"

6. Copia:
   - **Client ID**: `123456789-abc...googleusercontent.com`
   - **Client secret**: `GOCSPX-...`

#### 4.2 En Supabase

1. En tu proyecto de Supabase, ve a **Authentication** > **Providers**
2. Busca **Google** y haz clic en él
3. Habilita el toggle "Enable Sign in with Google"
4. Pega:
   - **Client ID** (de Google)
   - **Client Secret** (de Google)
5. Copia la **Callback URL** que te muestra Supabase
6. Asegúrate de que coincida con la que configuraste en Google
7. Haz clic en **Save**

### Paso 5: Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo llamado `.env.local` con el siguiente contenido:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[tu-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc[...]  # La clave anon que copiaste

# Database URL (for Prisma)
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.[tu-project-ref].supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Reemplaza**:

- `[tu-project-ref]`: El ID de tu proyecto de Supabase
- `[TU-PASSWORD]`: La contraseña de base de datos que generaste
- La clave `anon` completa

**Ejemplo real**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjM0NTY3OCwiZXhwIjoxOTI3OTIxNjc4fQ.xxx
DATABASE_URL=postgresql://postgres:tu_password_segura@db.abcdefghijklmnop.supabase.co:5432/postgres
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Paso 6: Instalar Dependencias y Configurar Prisma

En la terminal, dentro de la carpeta del proyecto:

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con base de datos
npx prisma db push
```

Si todo está correcto, deberías ver mensajes de éxito.

### Paso 7: Ejecutar el Proyecto

```bash
pnpm dev
```

Deberías ver:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Paso 8: Probar la Autenticación

1. Abre http://localhost:3000 en tu navegador
2. Serás redirigido a la página de login
3. Haz clic en "Continuar con Google"
4. Selecciona tu cuenta de Google
5. Autoriza la aplicación
6. Deberías ser redirigido al dashboard

### Paso 9: Crear tu Primera Empresa

Una vez autenticado:

1. En la barra lateral, no verás empresas aún
2. Ve a la sección "Empresas" o añade una empresa desde la consola de Supabase:

   - Ve a **Table Editor** > **companies**
   - Haz clic en **Insert row**
   - Completa:
     - `id`: (se genera automático)
     - `name`: "Mi Empresa S.A."
     - `currency`: "CLP"
     - `timezone`: "America/Santiago"
   - **Save**

3. Luego, vincula tu usuario con la empresa:

   - Ve a **Table Editor** > **company_users**
   - Haz clic en **Insert row**
   - Completa:
     - `user_id`: Tu ID de usuario (búscalo en la tabla `users`)
     - `company_id`: El ID de la empresa que acabas de crear
     - `role`: "owner"
   - **Save**

4. Refresca la página del dashboard
5. Deberías ver tu empresa en el selector

## 🎉 ¡Listo!

Tu Dashboard Financiero ya está configurado y listo para usar.

## 📍 Próximos Pasos Recomendados

1. **Añadir categorías**:

   - Ve a Table Editor > categories
   - Crea categorías como "Ventas", "Salarios", "Alquiler", etc.

2. **Crear transacciones de prueba**:

   - Usa la interfaz del dashboard
   - O inserta manualmente en Table Editor > transactions

3. **Explorar Prisma Studio** (opcional):

   ```bash
   npx prisma studio
   ```

   - Abre en http://localhost:5555
   - Permite ver y editar datos gráficamente

4. **Configurar deployment en Vercel**:
   - Sigue las instrucciones en la sección "Deployment" del README.md

## ❓ Problemas Comunes

### No puedo iniciar sesión con Google

- Verifica que las URLs de redirección coincidan exactamente
- Revisa que el Client ID y Secret sean correctos
- Verifica que la Google+ API esté habilitada

### Error "Invalid JWT"

- Verifica que las claves de Supabase sean correctas
- Asegúrate de estar usando la clave `anon`, no la `service_role`

### No veo mi empresa en el selector

- Verifica que existe el registro en `company_users`
- Verifica que el `user_id` coincida con tu ID de usuario
- Refresca la página

### Error de Prisma

- Ejecuta `npx prisma generate` después de cualquier cambio al schema
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté accesible

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12) para ver errores
2. Revisa los logs de Supabase en el dashboard
3. Verifica que todas las variables de entorno estén correctas
4. Asegúrate de que las migraciones SQL se ejecutaron sin errores

---

**¿Todo funcionando?** ¡Genial! Ahora puedes empezar a usar tu Dashboard Financiero. 🚀
