# Integración SII (Servicio de Impuestos Internos)

Esta integración permite conectar el dashboard financiero con el sistema tributario chileno.

## Funcionalidades

- Consulta de ventas y compras del SII
- Validación de RUTs
- Generación de reportes tributarios
- Sincronización de datos fiscales

## Configuración

```env
SII_API_KEY=your_sii_api_key
SII_CLIENT_ID=your_sii_client_id
SII_CLIENT_SECRET=your_sii_client_secret
SII_BASE_URL=https://api.sii.cl
```

## Uso

```typescript
import { SiiClient } from './client'

const client = new SiiClient(process.env.SII_API_KEY!)

// Consultar ventas del mes
const ventas = await client.getVentas('2024-01')

// Validar RUT
const isValid = await client.validateRut('12345678-9')

// Obtener reporte tributario
const reporte = await client.getReporteTributario('2024')
```

## Endpoints Disponibles

- `GET /ventas` - Consultar ventas
- `GET /compras` - Consultar compras
- `POST /validate-rut` - Validar RUT
- `GET /reportes` - Obtener reportes tributarios

## Limitaciones

- Rate limit: 100 requests por minuto
- Solo disponible para empresas chilenas
- Requiere certificado digital válido
