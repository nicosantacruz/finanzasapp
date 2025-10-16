# Integraciones Externas

Este directorio contiene las integraciones con servicios externos para el dashboard financiero.

## Estructura

```
integrations/
├── sii/           # Servicio de Impuestos Internos (Chile)
├── banks/         # Integraciones bancarias
└── README.md      # Este archivo
```

## Integraciones Disponibles

### SII (Servicio de Impuestos Internos)
- **Ubicación**: `integrations/sii/`
- **Propósito**: Integración con el sistema tributario chileno
- **Funcionalidades**:
  - Consulta de ventas y compras
  - Validación de RUTs
  - Generación de reportes tributarios
  - Sincronización de datos fiscales

### Bancos
- **Ubicación**: `integrations/banks/`
- **Propósito**: Integración con sistemas bancarios
- **Funcionalidades**:
  - Consulta de movimientos bancarios
  - Conciliación automática
  - Alertas de pagos
  - Estados de cuenta

## Configuración

Cada integración requiere variables de entorno específicas:

```env
# SII
SII_API_KEY=your_sii_api_key
SII_CLIENT_ID=your_sii_client_id
SII_CLIENT_SECRET=your_sii_client_secret

# Bancos
BANK_API_KEY=your_bank_api_key
BANK_CLIENT_ID=your_bank_client_id
BANK_CLIENT_SECRET=your_bank_client_secret
```

## Patrón de Implementación

Cada integración sigue el mismo patrón:

1. **Client**: Cliente para comunicación con la API externa
2. **Types**: Tipos TypeScript específicos de la integración
3. **Services**: Servicios de alto nivel para usar en la aplicación
4. **Utils**: Utilidades y helpers específicos
5. **README.md**: Documentación específica de la integración

## Uso

```typescript
import { SiiClient } from '@/integrations/sii/client'
import { BankClient } from '@/integrations/banks/client'

// Ejemplo de uso
const siiClient = new SiiClient(process.env.SII_API_KEY!)
const bankClient = new BankClient(process.env.BANK_API_KEY!)
```

## Seguridad

- Todas las API keys se almacenan en variables de entorno
- No se exponen credenciales en el código
- Se implementan rate limiting para evitar exceder límites de API
- Se manejan errores de forma segura sin exponer información sensible

## Testing

Cada integración incluye tests unitarios y de integración:

```bash
# Ejecutar tests de una integración específica
npm test integrations/sii
npm test integrations/banks

# Ejecutar todos los tests de integraciones
npm test integrations/
```
