# 💼 Dashboard Financiero - FinanzasApp

Dashboard financiero moderno para gestión multi-empresa con autenticación Google OAuth, construido con Next.js 14, Supabase y Prisma.

## 🌟 Características

- ✅ **Autenticación con Google OAuth** mediante Supabase Auth
- ✅ **Multi-tenancy seguro** con Row Level Security (RLS)
- ✅ **Gestión de múltiples empresas** desde una sola cuenta
- ✅ **Dashboard interactivo** con métricas en tiempo real
- ✅ **Gestión de transacciones** (ingresos y gastos)
- ✅ **Control de cheques** con fechas de vencimiento
- ✅ **Gestión de créditos** con tasas de interés
- ✅ **Registro de proveedores** y contactos
- ✅ **Reportes visuales** con gráficos interactivos
- ✅ **Tema claro/oscuro** automático
- ✅ **Diseño responsive** mobile-first
- 🔄 **Integraciones futuras** con SII y bancos chilenos

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilado**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **ORM**: Prisma
- **Autenticación**: Supabase Auth + Google OAuth
- **Gráficos**: Recharts
- **Formularios**: React Hook Form + Zod
- **Fechas**: date-fns
- **Deployment**: Vercel

## 📋 Requisitos Previos

- Node.js 18+ y pnpm
- Cuenta de Supabase
- Cuenta de Google Cloud Platform (para OAuth)
- Cuenta de GitHub
- Cuenta de Vercel (para deployment)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/nicosantacruz/finanzasapp.git
cd finanzasapp
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Supabase

Sigue las instrucciones detalladas en [supabase/README.md](./supabase/README.md):

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Configura Google OAuth en Authentication > Providers
3. Ejecuta los scripts SQL de migración:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/rls-policies.sql`
4. Obtén las credenciales de API

### 4. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita la Google+ API
4. Crea credenciales OAuth 2.0
5. Configura las URIs de redirección:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

### 5. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_publica

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 6. Configurar Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con base de datos
npx prisma db push

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 7. Ejecutar en Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
finanzasapp/
├── app/                      # App Router de Next.js
│   ├── auth/                # Páginas de autenticación
│   ├── dashboard/           # Dashboard principal
│   ├── transactions/        # Gestión de transacciones
│   ├── checks/              # Gestión de cheques
│   ├── credits/             # Gestión de créditos
│   ├── suppliers/           # Gestión de proveedores
│   └── layout.tsx           # Layout principal
├── components/              # Componentes React
│   ├── ui/                  # Componentes UI de shadcn
│   ├── dashboard.tsx        # Componente principal del dashboard
│   └── ...                  # Otros componentes
├── contexts/                # React Contexts
│   ├── auth-context.tsx     # Context de autenticación
│   └── company-context.tsx  # Context de empresa seleccionada
├── lib/                     # Utilidades y servicios
│   ├── supabase/           # Clientes de Supabase
│   ├── services/           # Servicios de datos
│   └── money.ts            # Utilidades de dinero
├── prisma/                  # Configuración de Prisma
│   └── schema.prisma       # Schema de base de datos
├── supabase/               # Configuración de Supabase
│   ├── migrations/         # Migraciones SQL
│   └── rls-policies.sql    # Políticas RLS
├── types/                   # Tipos TypeScript
└── public/                  # Archivos estáticos
```

## 🔐 Seguridad

- **Row Level Security (RLS)**: Todas las tablas tienen políticas RLS configuradas
- **Multi-tenancy**: Los datos están aislados por `company_id`
- **Roles de usuario**: `owner`, `admin`, `viewer`
- **Autenticación**: Google OAuth mediante Supabase Auth
- **Middleware**: Protección de rutas automática
- **Validación**: Zod para validación de formularios

## 💰 Manejo de Dinero

Todos los valores monetarios se almacenan como **enteros en centavos** para evitar problemas de precisión con números de punto flotante.

```typescript
// Ejemplo
$100.50 USD → 10050 centavos
$1.000.000 CLP → 100000000 centavos

// Utilidades disponibles en lib/money.ts
import { formatMoney, toCents, fromCents } from '@/lib/money'

formatMoney(10050, 'USD') // "$100.50"
toCents(100.50) // 10050
fromCents(10050) // 100.50
```

## 📊 Funcionalidades Principales

### Dashboard

- Métricas de ingresos, gastos, utilidad neta y activos totales
- Gráfico de ingresos vs gastos mensuales
- Transacciones recientes
- Selector de empresa

### Transacciones

- Crear ingresos y gastos
- Categorización
- Búsqueda y filtrado
- Exportación de reportes

### Cheques

- Registro de cheques emitidos y recibidos
- Control de fechas de vencimiento
- Estados: pendiente, cobrado, rechazado
- Alertas de vencimiento

### Créditos

- Registro de préstamos y créditos
- Cálculo de intereses
- Fechas de inicio y fin
- Amortización

### Proveedores

- Registro de proveedores
- Información de contacto
- Cuentas por pagar
- Historial de transacciones

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente con cada push

```bash
# O usa el CLI de Vercel
pnpm install -g vercel
vercel
```

### Variables de Entorno en Producción

En Vercel, configura las siguientes variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_BASE_URL` (tu dominio de producción)

## 🔄 Integraciones Futuras

### SII (Servicio de Impuestos Internos)

- Importación automática de boletas y facturas
- Sincronización de ventas y compras
- Generación de reportes tributarios

### Bancos Chilenos

- Sincronización de movimientos bancarios
- Reconciliación automática
- Alertas de saldo

## 🧪 Testing

```bash
# Ejecutar tests (próximamente)
pnpm test

# Linting
pnpm lint

# Formateo de código
pnpm format
```

## 📝 Scripts Disponibles

```bash
pnpm dev          # Ejecutar en desarrollo
pnpm build        # Construir para producción
pnpm start        # Ejecutar en producción
pnpm lint         # Ejecutar ESLint
pnpm format       # Formatear código con Prettier
```

## 🐛 Troubleshooting

### Error de autenticación

- Verifica que las URLs de redirección estén correctamente configuradas en Google OAuth
- Asegúrate de que `NEXT_PUBLIC_BASE_URL` sea correcta

### Error de RLS

- Verifica que las políticas RLS estén habilitadas en todas las tablas
- Ejecuta `supabase/rls-policies.sql` nuevamente

### Error de Prisma

- Ejecuta `npx prisma generate` después de cambiar el schema
- Verifica que la `DATABASE_URL` sea correcta

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

**Nicolás Santacruz**

- GitHub: [@nicosantacruz](https://github.com/nicosantacruz)
- Repositorio: [finanzasapp](https://github.com/nicosantacruz/finanzasapp)

## 🙏 Agradecimientos

- [Vercel](https://vercel.com) por v0 y Next.js
- [Supabase](https://supabase.com) por el backend
- [shadcn/ui](https://ui.shadcn.com) por los componentes UI
- Comunidad de Next.js y React

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

Deploy trigger
