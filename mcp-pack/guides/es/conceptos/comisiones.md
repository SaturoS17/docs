---
title: "Comisiones"
description: "Cómo se cobra cada servicio y dónde ver tus condiciones"
slug: es/conceptos/comisiones
lang: es
source_url: https://docs.cbpayapp.com/es/conceptos/comisiones
---
Las comisiones las configura CBPay por **servicio, país y activo**.
Si no hay nada configurado para una combinación, la comisión es **0**.

## Cómo se cobran los payouts y payins

El pricing FX está en **tu tipo de cambio**: las tasas que ves en
`GET /v1/rates` son tus tasas, y son exactamente las que se usan al
ejecutar — sin porcentajes aparte. Cada país trae las dos puntas:

- `rate` — la tasa de tus **payouts** (dispersiones). Si dispersas el
  equivalente a 100 USDT, se debitan **100 USDT + el fijo** (si tu cuenta
  lo tiene configurado).
- `payin_rate` — la tasa de tus **payins** (cobros/depósitos fiat). El
  abono es el monto local convertido a esa tasa, **menos el fijo** (si tu
  cuenta lo tiene configurado).

```
payout:  usdt_amount   = monto_local / rate
         total_debit   = usdt_amount + fixed_amount
payin:   usdt_gross    = monto_local / payin_rate
         usdt_credited = usdt_gross − fixed_amount
```

Lo que recibe el beneficiario (payout) o lo que se te abona (payin) depende
de las tasas de tu cuenta para ese país. Cotizado = cobrado, siempre.

## Servicios con comisión fija u porcentual

| Servicio | Cómo se cobra | Cuándo |
|---|---|---|
| `payout` | Fijo por operación (el pricing FX ya está en tu tasa) | Al crear el payout (incluido en `total_debit`) |
| `payin` | Fijo por operación (el pricing FX ya está en tu `payin_rate`) | Al acreditar (recibes `usdt_gross − fee`) |
| `payin_card` | `%` sobre el cobro + fijo, con `%` propio por moneda procesada (ej. BOB vs USD). Si tu cuenta no lo tiene configurado, aplica el fee `payin` genérico | Al acreditar un cobro pagado con tarjeta (payin directo `method: "card"`, link de checkout pagado con tarjeta o cobro de suscripción) |
| `funding` | `%` sobre el depósito + fijo | Al acreditar el depósito on-chain |
| `withdrawal` | `%` sobre el retiro + fijo | Al crear el retiro (incluido en `total_debit`) |
| `wallet_creation` | Fijo por wallet | Al crear cada wallet (personas: 1 por red; empresas: ilimitadas). Consultar wallets existentes es siempre gratis |
| `wallet_import` | Fijo por importación | Al importar una wallet externa a una [wallet segregada](https://docs.cbpayapp.com/es/guias/wallets-segregadas) (`POST /v1/segregated-wallets/import`) |
| `wallet_export` | Fijo por exportación | Al exportar la llave privada de una wallet segregada (`POST /v1/segregated-wallets/{id}/export`) |
| `wallet_send` | Fijo por envío | Al enviar on-chain desde una wallet segregada (`POST /v1/segregated-wallets/{id}/sends`); el gas de red lo pone el cliente |
| `compliance_person` | Fijo por llamada | Al screenear una persona por AML (`POST /v1/aml/screenings`) |
| `compliance_company` | Fijo por llamada | Al screenear una empresa por AML |
| `compliance_rescreen` | Fijo por llamada | Al re-ejecutar un screening AML |
| `compliance_monitoring` | Fijo por activación | Al activar monitoreo AML continuo (desactivar es gratis) |
| `kyc_verification` | Fijo por verificación | Al crear un link o submission KYC de un tercero ([verificación](https://docs.cbpayapp.com/es/guias/kyc)); tu propio onboarding es gratis |
| `kyb_verification` | Fijo por verificación | Al crear un link o submission KYB de un tercero |
| `address_screening` | Fijo por scan | Al evaluar el riesgo de una dirección blockchain ([screening de wallets](https://docs.cbpayapp.com/es/guias/screenings)); la protección automática de retiros/depósitos es gratis |
| `banking_customer` | Fijo por perfil | Al crear tu perfil bancario ([banking](https://docs.cbpayapp.com/es/guias/banking)) |
| `banking_account` | Fijo por cuenta | Al abrir cada cuenta bancaria |
| `banking_operation` | Fijo por pago | Al enviar cada pago bancario (cotizar con `prepare` es gratis) |
| `card_creation_virtual` | Fijo por tarjeta | Al emitir una tarjeta virtual ([tarjetas](https://docs.cbpayapp.com/es/guias/tarjetas)) |
| `card_creation_physical` | Fijo por tarjeta | Al emitir una tarjeta física |
| `card_monthly` | Fijo mensual | Mensualidad por tarjeta activa (sin saldo, la tarjeta se congela — sin deuda) |
| `card_cancellation` | Fijo por tarjeta | Al cancelar una tarjeta |
| `card_purchase_virtual` | `%` + fijo sobre el monto USD de la compra | Por cada compra con tarjeta virtual (estimado en la autorización, definitivo al liquidar; las reversas lo devuelven proporcional) |
| `card_purchase_physical` | `%` + fijo sobre el monto USD de la compra | Por cada compra con tarjeta física (mismo ciclo que la virtual) |
| `risk_report_person` | Fijo por informe | Al comprar un informe crediticio Qscore de una persona ([Qscore](https://docs.cbpayapp.com/es/guias/qscore)); se reembolsa automáticamente si el informe falla (`risk_report_refund`) |
| `risk_report_company` | Fijo por informe | Al comprar un informe crediticio Qscore de una empresa |

Para los servicios con `%`, la fórmula es
`fee = ceil(monto × percent / 100) + fixed_amount` (redondeo hacia arriba al
micro-USDT).

> **Nota**
Los cargos fijos standalone (compliance, verificación KYC/KYB, creación de
wallets y banking) se reembolsan automáticamente si la operación falla
aguas arriba (`compliance_refund` / `verification_fee_refund` /
`wallet_creation_refund` / `wallet_service_refund` / `banking_fee_refund`).
## Transferencias internas: siempre gratis

Las transferencias entre cuentas CBPay (`POST /v1/transfers`) **no tienen
comisión**, sin importar la combinación: persona↔persona, persona↔empresa o
empresa↔empresa. El dinero se mueve dentro del ecosistema.

## Tu tipo de cambio

`GET /v1/rates` devuelve **el tipo de cambio propio de tu cuenta** en cada
país — las mismas tasas con las que se ejecutan tus operaciones, sin
sorpresas: `rate` para payouts y `payin_rate` para payins
(`monto_local / tasa = USDT`).

## Consulta tus condiciones

`GET /v1/rates` devuelve, junto a tus tasas, la configuración de comisiones
vigente para tu cuenta:

```json
{
  "base": "USD",
  "rates": { "chile": { "currency": "CLP", "rate": "950.25", "payin_rate": "955.10" } },
  "asset_prices": {
    "USDT": { "currency": "USD", "unit": "usdt", "price": "1" },
    "USDC": { "currency": "USD", "unit": "usdc", "price": "1" },
    "BTC": { "currency": "USD", "unit": "btc", "price": "109853.24" },
    "GOLD": { "currency": "USD", "unit": "gram", "price": "107.5341" }
  },
  "fees": [
    {
      "service": "payout",
      "country": "CL",
      "asset": "USDT",
      "percent": "0",
      "fixed_amount": "0.30"
    }
  ]
}
```

`asset_prices` es el precio USD **de referencia** de cada saldo virtual
(para valorizarlos en pantalla) — no implica conversión ni spread. La
respuesta incluye además un bloque `settlement` con el **precio efectivo**
por asset si pagas operaciones desde un saldo distinto de USDT
([modelo de dinero](https://docs.cbpayapp.com/es/conceptos/modelo-de-dinero#elige-desde-que-saldo-pagas)):
ese precio ya incluye el margen de conversión, así que lo que ves es lo
que se aplica.

La comisión cobrada queda siempre explícita en la respuesta de cada
operación (campo `fee`) y en el ledger.

## Ejemplo completo

Payout equivalente a 100 USDT con `fixed_amount: "0.30"`:

```
usdt_amount = 100 USDT           (monto_local / rate)
fee         = 0.30 USDT          (fijo)
total_debit = 100.30 USDT
```

El beneficiario recibe el monto local completo que indicaste; a ti se te
debita el equivalente a tu tasa más el fijo.

Payin equivalente a 100 USDT con `fixed_amount: "0.30"`:

```
usdt_gross    = 100 USDT         (monto_local / payin_rate)
fee           = 0.30 USDT        (fijo)
usdt_credited = 99.70 USDT
```

El pagador paga el monto local exacto que indicaste; a ti se te abona el
equivalente a tu `payin_rate` menos el fijo.
