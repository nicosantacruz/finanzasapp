# Integración Bancaria

Esta integración permite conectar el dashboard financiero con sistemas bancarios.

## Funcionalidades

- Consulta de movimientos bancarios
- Conciliación automática
- Alertas de pagos
- Estados de cuenta

## Configuración

```env
BANK_API_KEY=your_bank_api_key
BANK_CLIENT_ID=your_bank_client_id
BANK_CLIENT_SECRET=your_bank_client_secret
BANK_BASE_URL=https://api.bank.com
```

## Uso

```typescript
import { BankClient } from './client'

const client = new BankClient(process.env.BANK_API_KEY!)

// Consultar movimientos
const movimientos = await client.getMovimientos('2024-01-01', '2024-01-31')

// Conciliar transacciones
const conciliacion = await client.conciliarTransacciones(transacciones)

// Obtener estado de cuenta
const estado = await client.getEstadoCuenta()
```

## Endpoints Disponibles

- `GET /movimientos` - Consultar movimientos bancarios
- `POST /conciliar` - Conciliar transacciones
- `GET /estado-cuenta` - Obtener estado de cuenta
- `GET /alertas` - Obtener alertas de pagos

## Limitaciones

- Rate limit: 200 requests por minuto
- Solo disponible para cuentas autorizadas
- Requiere autenticación OAuth2
