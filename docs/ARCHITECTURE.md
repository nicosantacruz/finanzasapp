# Arquitectura del Sistema de Contabilidad

## Principios Fundamentales

### 1. Multi-tenancy con orgId
- Cada empresa tiene un `orgId` único
- Todas las tablas incluyen `orgId` para filtrado
- Row Level Security (RLS) en Supabase/Neon para seguridad

### 2. Manejo de Dinero
- **NUNCA usar float para dinero**
- Almacenar como enteros (centavos/cents)
- Usar funciones de `lib/money.ts` para operaciones
- Ejemplo: $1,000.50 CLP = 100050 (entero)

### 3. Timezones
- Almacenar siempre en UTC en la base de datos
- Mostrar en `America/Santiago` (o timezone de la empresa)
- Usar funciones de `lib/timezone.ts`

### 4. Permisos
- **owner**: Control total, puede eliminar empresa
- **admin**: Puede editar y gestionar usuarios
- **viewer**: Solo lectura
- Usar funciones de `lib/permissions.ts`

### 5. Datos de Prueba
- Empresa demo con datos falsos en `lib/seed-data.ts`
- Útil para validar UX sin datos reales

## Estructura de Carpetas

\`\`\`
/app                 # Next.js App Router pages
/components          # React components
/contexts            # React contexts (CompanyContext)
/hooks               # Custom hooks
/lib                 # Utilities (money, timezone, permissions)
/types               # TypeScript types
/docs                # Documentation
\`\`\`

## Migraciones y Deploy

### CI/CD
- Usar Prisma Migrate o SQL scripts en `/scripts`
- Ejecutar migraciones automáticamente en cada deploy a Vercel
- Mantener historial de migraciones

### Testing
- Vitest para lógica de negocio
- Probar: amortización, aging, cálculos de dinero
- Tests en `/tests` o `__tests__`

### Backups
- Snapshots diarios (Neon/Supabase)
- Retención de 30 días mínimo
- Proceso de restauración documentado

## Integraciones Externas

### Preparación para Escalabilidad
- Crear carpeta `/integrations` para proveedores externos
- Cada integración en su propia carpeta
- Ejemplo: `/integrations/stripe`, `/integrations/mercadopago`
- Usar variables de entorno para API keys
- Documentar cada integración en su README

### Patrón de Integración
\`\`\`typescript
// /integrations/[provider]/client.ts
export class ProviderClient {
  constructor(private apiKey: string) {}
  // métodos de integración
}

// /integrations/[provider]/types.ts
export interface ProviderConfig {
  // tipos específicos
}
\`\`\`

## Base de Datos

### Tablas Principales
- `companies` (orgId, name, currency, timezone)
- `company_users` (userId, companyId, role)
- `transactions` (id, companyId, amount, date, type)
- `accounts` (id, companyId, name, type)
- `suppliers` (id, companyId, name, contact)
- `invoices` (id, companyId, amount, status)

### RLS Policies (Supabase)
\`\`\`sql
-- Ejemplo de política RLS
CREATE POLICY "Users can only see their company data"
ON transactions
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users 
    WHERE user_id = auth.uid()
  )
);
\`\`\`

## Mejores Prácticas

1. **Siempre validar orgId** en cada operación
2. **Usar transacciones** para operaciones financieras
3. **Auditar cambios** (created_at, updated_at, updated_by)
4. **Validar permisos** antes de cada operación
5. **Manejar errores** con mensajes claros al usuario
