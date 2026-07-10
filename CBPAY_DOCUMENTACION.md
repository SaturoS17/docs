# CBPay — Documentación de la API

Pagos y cobros fiat en toda Latinoamérica, transferencias internas,
USDT on-chain, tarjetas y verificación KYC/KYB — una sola API, un
solo saldo.

> Documento generado automáticamente desde la documentación oficial
> (https://docs.cbpayapp.com). No editar a mano: se regenera con
> `python docs-mintlify/tools/build_cbpay_md.py`.
>
> **Documento actualizado:** 2026-07-10 12:31 UTC · versión `cbacf7f8fbee`

**Datos clave**

| Dato | Valor |
|---|---|
| Versión de la documentación | v1.35 (10 de julio de 2026) |
| URL base | `https://api.qbank.cl/platform` |
| Autenticación | Header `Authorization: Bearer <token>` (o `X-API-Key`) |
| Moneda del saldo | USDT, 6 decimales, siempre como string |
| API Reference interactiva | https://docs.cbpayapp.com |

## Índice

- **Comenzar**
  - [Introducción](#introduccion)
  - [Inicio rápido](#inicio-rapido)
  - [Autenticación y cuenta](#autenticacion-y-cuenta)
  - [Login social (Google, Apple, Microsoft, Meta)](#login-social-google-apple-microsoft-meta)
  - [Ambiente y pruebas](#ambiente-y-pruebas)
- **Conceptos**
  - [Modelo de dinero](#modelo-de-dinero)
  - [Comisiones](#comisiones)
  - [Idempotencia](#idempotencia)
  - [Personas y empresas](#personas-y-empresas)
  - [Servicios habilitados](#servicios-habilitados)
  - [Estados y ciclo de vida](#estados-y-ciclo-de-vida)
  - [Movimientos y conciliación](#movimientos-y-conciliacion)
- **Flujos de integración**
  - [Flujos de integración](#flujos-de-integracion)
- **Productos**
  - [Payouts](#payouts)
  - [Payins](#payins)
  - [Transferencias internas](#transferencias-internas)
  - [Contactos](#contactos)
  - [Crypto: wallets, depósitos y retiros](#crypto-wallets-depositos-y-retiros)
  - [Tarjetas: virtuales y físicas](#tarjetas-virtuales-y-fisicas)
  - [Banking](#banking)
  - [Verificación KYC y KYB](#verificacion-kyc-y-kyb)
  - [AML screening](#aml-screening)
  - [Cartola (estado de cuenta)](#cartola-estado-de-cuenta)
- **Integración**
  - [Seguridad y 2FA (OTP)](#seguridad-y-2fa-otp)
  - [Webhooks](#webhooks)
  - [Errores](#errores)
  - [Preguntas frecuentes](#preguntas-frecuentes)
- **Recursos**
  - [Postman](#postman)
  - [Novedades](#novedades)


# Comenzar


## Introducción

*Qué es CBPay y qué puedes construir con la API*

CBPay es una plataforma de pagos multi-moneda para Latinoamérica. Cada
cuenta mantiene **cuatro saldos virtuales independientes** — `USDT` (la
moneda operativa), `USDC`, `BTC` y `GOLD` (gramos de oro) — y opera sobre
ellos:

- **Payouts fiat** — Dispersa dinero a cuentas bancarias locales en Chile, Perú, México, Venezuela, Bolivia, Brasil y Paraguay, debitado de tu saldo USDT.
- **Payins fiat** — Cobra en moneda local (QR, transferencias, página de pago y cobro pull) y recibe el abono automáticamente en USDT.
- **Transferencias internas** — Mueve saldo a cualquier otra cuenta CBPay, al instante y sin comisión.
- **Crypto on-chain** — Fondea con USDT por TRON o Ethereum y retira on-chain a cualquier dirección.
- **Tarjetas** — Emite tarjetas virtuales y físicas que gastan directo de cualquier saldo de la cuenta (USDT, USDC, BTC o GOLD), en tiempo real.
- **Banking** — Cuentas bancarias reales a tu nombre: recibe, mantén y envía dinero por rieles internacionales (SEPA, SWIFT, ACH).
- **KYC/KYB** — Verificación de personas y empresas con screening AML, rescreening y monitoreo continuo.
- **Cartola** — Estado de cuenta completo por período en JSON, PDF o Excel, con cuadratura contable garantizada.
Todos los eventos llegan a tus **webhooks firmados**
([guía](#webhooks)).

### Cómo funciona

La operación fiat gira alrededor del saldo USDT (los saldos USDC, BTC y
GOLD se mueven con transferencias internas, depósitos on-chain y abonos del
operador) — el dinero entra por un lado, se convierte, y sale por el otro:

```mermaid
flowchart LR
    subgraph entra [Entra dinero]
        payin["Payin fiat<br/>(QR, transferencia, pull)"]
        deposito["Depósito USDT<br/>on-chain"]
        transfIn["Transferencia interna<br/>recibida"]
    end
    subgraph saldo [Tu cuenta CBPay]
        usdt(("Saldo USDT<br/>available + held"))
    end
    subgraph sale [Sale dinero]
        payout["Payout fiat<br/>(banco, Yape, PIX, QR...)"]
        retiro["Retiro USDT<br/>on-chain"]
        transfOut["Transferencia interna<br/>enviada"]
    end
    payin -->|"FX a tu tasa − fee"| usdt
    deposito -->|"− fee funding"| usdt
    transfIn -->|"gratis"| usdt
    usdt -->|"FX a tu tasa + fee"| payout
    usdt -->|"+ fee retiro"| retiro
    usdt -->|"gratis"| transfOut
    banking["Banking: cuentas bancarias reales<br/>(saldo propio, separado del USDT)"]
    usdt -.->|"solo fees fijos"| banking
```

1. CBPay te da acceso: registro con email/contraseña
   o una API key directa.
2. Fondeas tu cuenta: con un payin fiat o un depósito USDT on-chain.
3. Operas: payouts, transferencias, retiros — todo se debita y acredita
   sobre tu saldo USDT con conversión FX al momento.
4. Te enteras de todo: cada movimiento queda en un historial inmutable
   (`GET /v1/movements`) y los eventos llegan a tus webhooks.

### URL base

```
https://api.qbank.cl/platform
```

Todas las rutas de esta documentación son relativas a esa URL base.

> **Nota**
Los montos son siempre **strings decimales** (ej. `"10.500000"`), nunca
números flotantes. Cada moneda usa su precisión: 6 decimales para
`USDT`/`USDC`/`GOLD` y 8 para `BTC`.
### Siguientes pasos

### Crea tu cuenta y token

Sigue el [inicio rápido](#inicio-rapido) para registrarte y hacer tu
primera llamada.
### Entiende el modelo de dinero

Lee [modelo de dinero](#modelo-de-dinero) y
[comisiones](#comisiones).
### Integra tu primer producto

Empieza por [payouts](#payouts) o [payins](#payins).


## Inicio rápido

*De cero a tu primer payout — con el ciclo cerrado por webhook — en seis pasos*

Este es el camino completo de una primera integración: registro → saldo →
tasas → payout → webhook. Al terminar habrás cerrado el ciclo entero:

```mermaid
flowchart LR
    reg["1-2. Registro y<br/>autenticación"] --> saldo["3. Saldo<br/>(fondea con payin o crypto)"]
    saldo --> tasas["4. Tasas y<br/>comisiones"]
    tasas --> payout["5. Primer payout<br/>(processing)"]
    payout --> wh["6. Webhook<br/>payout_status_changed"]
    wh --> fin(("Ciclo<br/>cerrado"))
```

Antes de empezar, los datos que vas a necesitar en todos lados:

| Dato | Valor |
|---|---|
| **URL base** | `https://api.qbank.cl/platform` |
| **Autenticación** | Header `Authorization: Bearer <token>` (o `X-API-Key`) |
| **Slug de organización** | `cbpay` (para registro y login) |
| **Monedas del saldo** | 4 saldos independientes: USDT (operativa), USDC, BTC y GOLD — montos siempre como string (`"52.618258"`) |
| **Ambiente** | Producción directa — no hay sandbox; prueba con montos pequeños |

> **Nota**
Si CBPay ya te creó la cuenta y te entregó una API key `pk_...`, salta
directo al paso 3. ¿Dudas típicas? Están respondidas en las
[preguntas frecuentes](#preguntas-frecuentes).
### Regístrate

Crea tu cuenta (persona o empresa — mismo endpoint, cambia `type`):

```bash Persona
curl -X POST https://api.qbank.cl/platform/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "org": "cbpay",
    "type": "person",
    "email": "ana@ejemplo.com",
    "password": "una-clave-segura",
    "display_name": "Ana Pérez",
    "country": "CL"
  }'
```

```bash Empresa
curl -X POST https://api.qbank.cl/platform/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "org": "cbpay",
    "type": "company",
    "email": "legal@andina.cl",
    "password": "una-clave-segura",
    "display_name": "Comercial Andina SpA",
    "tax_id": "76.543.210-8",
    "country": "CL"
  }'
```

La respuesta incluye tu `access_token` (sesión de 24 horas):

```json
{
  "account": { "id": "…", "type": "person", "kyc_status": "none", "…": "…" },
  "access_token": "eyJhbGciOiJIUzI1NiIs…",
  "expires_at": "2026-07-08T00:00:00Z"
}
```

### Autentícate en cada llamada

Envía el token en el header `Authorization`:

```bash
curl https://api.qbank.cl/platform/v1/me \
  -H "Authorization: Bearer <access_token>"
```

Para integraciones servidor-a-servidor, emite una **API key permanente** con
`POST /v1/api-keys` — se muestra una sola vez. Más detalles en
[autenticación](#autenticacion-y-cuenta).

### Consulta tu saldo

```bash
curl https://api.qbank.cl/platform/v1/balances \
  -H "Authorization: Bearer <token>"
```

```json
{
  "account_id": "…",
  "balances": [
    { "asset": "USDT", "available": "0.000000", "held": "0.000000" },
    { "asset": "USDC", "available": "0.000000", "held": "0.000000" },
    { "asset": "BTC", "available": "0.00000000", "held": "0.00000000" },
    { "asset": "GOLD", "available": "0.000000", "held": "0.000000" }
  ]
}
```

Para operar necesitas fondos: crea un [payin](#payins) o deposita
USDT on-chain con [crypto funding](#crypto-wallets-depositos-y-retiros).

### Revisa tasas y comisiones

Antes de un payout, consulta la tasa FX vigente y tus comisiones efectivas:

```bash
curl https://api.qbank.cl/platform/v1/rates \
  -H "Authorization: Bearer <token>"
```

```json
{
  "base": "USD",
  "rates": {
    "chile": { "currency": "CLP", "rate": "950.25" },
    "mexico": { "currency": "MXN", "rate": "17.50" },
    "bolivia": { "currency": "BOB", "rate": "6.91" }
  },
  "fees": [
    { "service": "payout", "country": "CL", "percent": "0", "fixed": "0.50" }
  ],
  "updated_at": "2026-07-07T12:00:00Z"
}
```

Las tasas ya incluyen tu margen FX, así que puedes estimar el costo antes
de crear: `usdt_amount ≈ monto_local / rate` (redondeo hacia arriba) y
`total_debit = usdt_amount + fijo`.

### Crea tu primer payout

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "CL",
    "currency": "CLP",
    "method": "bank_transfer",
    "amount": "50000",
    "beneficiary": {
      "name": "Juan Soto",
      "rut": "12345678-9",
      "bank_code": "012",
      "account_type": "checking",
      "account_number": "001122334455"
    },
    "description": "Pago proveedor",
    "idempotency_key": "mi-pago-0001"
  }'
```

Respuesta `202 Accepted` — el payout queda `processing` y el estado final
llega por [webhook](#webhooks) (`payout_status_changed`):

```json
{
  "payout_id": "…",
  "status": "processing",
  "local_amount": "50000",
  "fx_rate": "950.25",
  "usdt_amount": "52.618258",
  "fee": "0.500000",
  "total_debit": "53.118258"
}
```

> **Importante**
Los campos de `beneficiary` dependen del país y método. Consulta
`GET /v1/payouts/methods` y `GET /v1/payouts/banks?country=CL` para conocer
los requisitos de cada corredor — la referencia completa está en
los [ejemplos por país de la guía de payouts](#payouts).
### Cierra el ciclo: suscríbete al webhook

El estado final del payout llega por push. Suscribe tu endpoint HTTPS (en
desarrollo usa un [túnel](#ambiente-y-pruebas)):

```bash
curl -X POST https://api.qbank.cl/platform/v1/webhooks/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payout_status_changed",
    "callback_url": "https://tuapp.com/webhooks/cbpay",
    "secret": "un-secreto-largo-y-aleatorio"
  }'
```

Minutos después recibirás el cierre del payout del paso 5:

```json
{
  "payout_id": "…",
  "status": "completed",
  "local_amount": "50000",
  "usdt_amount": "52.618258",
  "total_debit": "53.118258",
  "status_code": ""
}
```

Verifica **siempre** la firma HMAC de la entrega
(`X-Webhook-Signature`) — receta con código en [webhooks](#webhooks).
Si el payout hubiera fallado, `status: failed` llega con el reembolso
completo ya aplicado.

### ¿Y ahora?

- **Flujos de integración** — Fondear, dispersar, cobrar, conciliar y banking — los cinco flujos E2E con diagramas.
- **Modelo de dinero** — Débitos, holds, reembolsos y el ledger inmutable.
- **Ambiente y pruebas** — Cómo probar seguro y el checklist de go-live.
- **Preguntas frecuentes** — Las dudas reales de integradores, respondidas — y la API Reference completa vive en su propia pestaña, con playground interactivo.


## Autenticación y cuenta

*Sesiones JWT, API keys, tu perfil de cuenta y los miembros de una empresa*

Todas las llamadas (salvo registro y login) requieren una credencial en el
header `Authorization`:

```
Authorization: Bearer <token>
```

También se acepta `X-API-Key: <token>` como header alternativo.

### Tipos de credencial

#### Sesión JWT (personas con login)

Se obtiene con `POST /v1/auth/register` o `POST /v1/auth/login` y dura
**24 horas**. Pensada para apps con usuarios que inician sesión.

```bash
curl -X POST https://api.qbank.cl/platform/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "org": "cbpay", "email": "ana@ejemplo.com", "password": "…" }'
```

```json
{
  "access_token": "eyJ…",
  "expires_at": "2026-07-08T00:00:00Z",
  "account_id": "…",
  "role": "owner"
}
```

Las cuentas empresa pueden tener varios **miembros** con roles — ver
[miembros de una empresa](#miembros-de-una-empresa) más abajo.

> **Nota**
Si la política de la cuenta exige **OTP en el login**, la respuesta trae
`otp_required: true` con un `pending_token` en vez de la sesión: el segundo
paso se completa en `POST /v1/auth/login/otp` con el código recibido por
SMS/WhatsApp. Flujo completo en [seguridad y 2FA](#seguridad-y-2fa-otp).
> **Nota**
También puedes ofrecer **registro e inicio de sesión con Google, Apple,
Microsoft o Facebook** (sin contraseña) — ver [login social](#login-social-google-apple-microsoft-meta).
#### API key (servidor a servidor)

Formato `pk_<key_id>.<secret>`. No expira y no depende de una sesión.
Se emite con:

```bash
curl -X POST https://api.qbank.cl/platform/v1/api-keys \
  -H "Authorization: Bearer <token-de-sesion>" \
  -H "Content-Type: application/json" \
  -d '{ "label": "backend-produccion" }'
```

```json
{
  "api_key_id": "…",
  "key_id": "a1b2c3d4e5f60718",
  "token": "pk_a1b2c3d4e5f60718.XXXXXXXX…",
  "note": "store this token now; it cannot be retrieved again"
}
```

> **Importante**
El token en claro se muestra **una sola vez**. En el servidor solo se guarda
un hash — si lo pierdes, emite una key nueva.
### Nivel de acceso

Tu credencial (JWT de sesión o API key) opera **tu propia cuenta**: saldos,
payouts, payins, transferencias, crypto, KYC/KYB y webhooks propios. Si un
endpoint responde `403 account_required` o `403 org_admin_required`, esa
operación corresponde a otro nivel de credencial — contacta al equipo de
CBPay.

### Tu perfil de cuenta

```bash
# Leer el perfil (incluye kyc_status y type)
curl https://api.qbank.cl/platform/v1/me \
  -H "Authorization: Bearer <token>"

# Actualizar campos del perfil (todos opcionales)
curl -X PATCH https://api.qbank.cl/platform/v1/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Comercial Andina SpA",
    "tax_id": "76.543.210-8",
    "phone": "+56 9 1234 5678",
    "country": "CL"
  }'
```

```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "type": "company",
  "display_name": "Comercial Andina SpA",
  "email": "legal@andina.cl",
  "tax_id": "76.543.210-8",
  "phone": "+56 9 1234 5678",
  "country": "CL",
  "status": "active",
  "kyc_status": "approved",
  "created_at": "2026-06-01T12:00:00Z"
}
```

`PATCH /v1/me` acepta `display_name`, `tax_id`, `phone` y `country` (envía
solo los que cambian). El `email`, `status` y `kyc_status` no se
autogestionan: los resuelve el administrador.

### Miembros de una empresa

Las cuentas **empresa** pueden tener varios usuarios con login propio y
distinto nivel de permiso:

| Rol | Permisos |
|---|---|
| `owner` | Todo: opera, administra miembros y credenciales |
| `operator` | Opera el día a día (default al crear un miembro) |
| `viewer` | Solo lectura |

```bash
# Agregar un miembro (solo cuentas company)
curl -X POST https://api.qbank.cl/platform/v1/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "finanzas@andina.cl",
    "password": "una-clave-segura",
    "role": "viewer"
  }'

# Listar miembros
curl "https://api.qbank.cl/platform/v1/members?page_size=50" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "page": 1,
  "page_size": 50,
  "members": [
    { "id": "…", "email": "legal@andina.cl", "role": "owner", "status": "active" },
    { "id": "…", "email": "finanzas@andina.cl", "role": "viewer", "status": "active" }
  ]
}
```

En una cuenta persona, `POST /v1/members` responde `403 company_only`.

### Buenas prácticas

- Guarda las API keys en un gestor de secretos; nunca en el código ni en el
  navegador.
- Usa una key por ambiente/servicio (`label` descriptivo) para poder rotar
  sin downtime.

### Rotación sin downtime

Emite la key nueva con `POST /v1/api-keys` (label nuevo).
### Despliega

Actualiza tu servicio para usar la key nueva.
### Retira la antigua

Pide al equipo de CBPay revocar la key anterior una vez que el tráfico
migró.
- Las sesiones JWT son para front-ends; para procesos automatizados usa
  siempre API keys.


## Login social (Google, Apple, Microsoft, Meta)

*Registro e inicio de sesión con Google, Apple, Microsoft y Facebook, sin contraseñas*

Tus usuarios pueden registrarse e iniciar sesión con **Google, Apple,
Microsoft o Facebook** — sin crear ni recordar contraseñas. CBPay usa el
modelo **token exchange**: el botón "Continuar con…" vive en tu front, el
usuario aprueba en el proveedor, tu front recibe una credencial y te la pasa
a la API; CBPay la **verifica criptográficamente** y te devuelve la sesión.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Tu front
    participant G as Proveedor (Google/Apple/MS/Meta)
    participant API as CBPay API
    U->>F: clic "Continuar con Google"
    F->>G: SDK del proveedor (popup)
    G-->>F: credencial (id_token / access_token)
    F->>API: POST /v1/auth/oauth {org, provider, credential}
    API->>G: verifica firma y audiencia
    API-->>F: sesión CBPay (access_token)
```

> **Nota**
El login social lo habilita tu operador (organización) y **cada
organización usa sus propias apps** de Google/Apple/Microsoft/Meta, así el
usuario ve TU marca en la pantalla de consentimiento. Consulta qué
proveedores están activos con `GET /v1/auth/oauth/providers`.
### 1. Descubre los proveedores habilitados

Para pintar los botones correctos, tu front pregunta qué proveedores están
activos y con qué `client_id`:

```bash
curl "https://api.qbank.cl/platform/v1/auth/oauth/providers?org=cbpay"
```

```json
{
  "providers": [
    { "provider": "google", "client_id": "1234567890-abc.apps.googleusercontent.com" },
    { "provider": "apple", "client_id": "com.tuempresa.cbpay.web" }
  ]
}
```

Es un endpoint público (no requiere token): el `client_id` no es secreto.

### 2. Obtén la credencial en tu front

Cada proveedor entrega una credencial con su propio SDK. Ejemplos mínimos:

#### Google

Con [Google Identity Services](https://developers.google.com/identity/gsi/web):

```html
<script src="https://accounts.google.com/gsi/client" async></script>
<div id="g_id_onload"
     data-client_id="TU_CLIENT_ID"
     data-callback="onGoogle"></div>
<div class="g_id_signin"></div>
<script>
function onGoogle(response) {
  // response.credential es el id_token (JWT) que envías a CBPay
  fetch("https://api.qbank.cl/platform/v1/auth/oauth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      org: "cbpay", provider: "google", credential: response.credential
    })
  });
}
</script>
```

#### Apple

Con [Sign in with Apple JS](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js):
el objeto de respuesta trae `authorization.id_token`, que es lo que envías
como `credential`.

```js
const data = await AppleID.auth.signIn();
await fetch("https://api.qbank.cl/platform/v1/auth/oauth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    org: "cbpay", provider: "apple", credential: data.authorization.id_token
  })
});
```

Apple entrega el nombre del usuario **solo la primera vez**; guárdalo en tu
front si lo necesitas. El email puede ser un alias de relay privado
(`...@privaterelay.appleid.com`) — es válido y estable.

#### Microsoft

Con [MSAL.js](https://learn.microsoft.com/entra/identity-platform/msal-overview):
tras `loginPopup`, el `idToken` del resultado es la credencial.

```js
const result = await msalInstance.loginPopup({ scopes: ["openid", "email", "profile"] });
await fetch("https://api.qbank.cl/platform/v1/auth/oauth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    org: "cbpay", provider: "microsoft", credential: result.idToken
  })
});
```

#### Meta (Facebook)

Con el [Facebook Login SDK](https://developers.facebook.com/docs/facebook-login/web):
Facebook no es OIDC, así que envías el **access_token** de la sesión.

```js
FB.login(function(response) {
  if (response.authResponse) {
    fetch("https://api.qbank.cl/platform/v1/auth/oauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org: "cbpay", provider: "facebook",
        credential: response.authResponse.accessToken
      })
    });
  }
}, { scope: "email" });
```

### 3. Intercambia la credencial por una sesión

```bash
curl -X POST https://api.qbank.cl/platform/v1/auth/oauth \
  -H "Content-Type: application/json" \
  -d '{
    "org": "cbpay",
    "provider": "google",
    "credential": "eyJhbGciOiJSUzI1Ni…",
    "type": "person"
  }'
```

**Usuario nuevo** → se crea la cuenta y devuelve `201`:

```json
{
  "account": { "id": "9b1deb4d-…", "type": "person", "email": "ana@gmail.com", "display_name": "Ana" },
  "access_token": "eyJhbGciOiJIUzI1Ni…",
  "expires_at": "2026-07-09T21:00:00Z",
  "created": true
}
```

**Usuario que ya existe** → inicia sesión y devuelve `200` con
`access_token`, `account_id` y `role` (igual que el login por contraseña).

El campo `type` (`person` | `company`, default `person`) solo se usa al
crear la cuenta; se ignora si ya existe.

#### Cómo se decide crear vs. entrar

```mermaid
flowchart TD
    A[Credencial verificada] --> B{¿Identidad ya vinculada?}
    B -->|sí| C[Inicia sesión en esa cuenta]
    B -->|no| D{¿Existe cuenta con ese email<br/>y el proveedor lo verificó?}
    D -->|sí| E[Vincula el proveedor y entra]
    D -->|no| F[Crea cuenta nueva + sesión]
```

### 4. Login social y 2FA

Si la cuenta tiene **OTP activo en el login**
([seguridad y 2FA](#seguridad-y-2fa-otp)), el login social respeta ese segundo
paso: en vez de la sesión, `POST /v1/auth/oauth` devuelve
`otp_required: true` + `pending_token`, y completas con
`POST /v1/auth/login/otp` igual que en el login por contraseña.

### 5. Vincular y desvincular proveedores

Un usuario en sesión puede administrar sus métodos de acceso:

```bash
# Ver proveedores vinculados
curl https://api.qbank.cl/platform/v1/me/identities \
  -H "Authorization: Bearer <token>"

# Vincular otro proveedor (con una credencial fresca de ese proveedor)
curl -X POST https://api.qbank.cl/platform/v1/me/identities \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "provider": "apple", "credential": "eyJhbGci…" }'

# Desvincular
curl -X DELETE https://api.qbank.cl/platform/v1/me/identities/apple \
  -H "Authorization: Bearer <token>"
```

No puedes desvincular tu **único** método de acceso: si la cuenta no tiene
contraseña y ese proveedor es el único vinculado, la API responde
`409 last_login_method` (primero define una contraseña o vincula otro
proveedor).

### Errores

| HTTP | `error` | Qué significa |
|---|---|---|
| 400 | `invalid_provider` | Proveedor fuera de `google/apple/microsoft/facebook` |
| 400 | `provider_not_configured` | Tu organización no tiene ese proveedor habilitado |
| 401 | `invalid_credential` | La credencial es inválida, expiró o es de otra app |
| 409 | `email_conflict` | Ya existe una cuenta con ese email; entra con tu método actual y vincula el proveedor desde la sesión |
| 409 | `identity_taken` | Ese proveedor ya está vinculado a otra cuenta |
| 409 | `last_login_method` | No puedes desvincular tu único método de acceso |

### FAQ

#### ¿Necesito manejar redirects u OAuth callbacks?
    No. El flujo de consentimiento ocurre en tu front con el SDK del
    proveedor; a CBPay solo le mandas la credencial resultante. No hay
    páginas de callback ni estado en el servidor.
#### ¿Un usuario puede tener contraseña Y login social?
    Sí. Puede registrarse con email/contraseña y luego vincular Google, o
    al revés. Todos los métodos apuntan a la misma cuenta mientras el email
    coincida y esté verificado.
#### ¿Qué pasa si el proveedor no entrega email verificado?
    No se vincula automáticamente por email (evita que alguien reclame el
    email de otro). Se crea una cuenta independiente ligada a esa identidad;
    el usuario puede añadir email/contraseña después.
#### ¿La credencial del proveedor sirve como token de CBPay?
    No. La credencial del proveedor solo se usa una vez para verificarte;
    todas las llamadas siguientes usan el `access_token` de CBPay.


## Ambiente y pruebas

*Cómo probar tu integración de forma segura: ambiente, montos, webhooks en local y checklist de go-live*

CBPay opera sobre **un único ambiente de producción**: no existe un sandbox
separado. Esta página explica cómo probar de forma segura y qué revisar
antes de salir a producción con tráfico real.

### Un solo ambiente (producción)

```
https://api.qbank.cl/platform
```

No hay sandbox: cada payout dispersa dinero real y cada payin cobra dinero
real. La forma segura de probar es la misma que usan los equipos de pago
profesionales:

### Prueba con montos mínimos

Usa los montos más pequeños que el corredor permita (ej. 1.000 CLP,
10 BOB). La API no impone mínimos técnicos; con montos muy chicos la
comisión fija puede superar el monto — para pruebas está bien.
### Usa cuentas y beneficiarios propios

Dispersa a cuentas bancarias de tu propio equipo y cobra desde tus
propios medios de pago, así el dinero nunca sale de tu control.
### Aprovecha la idempotencia

Toda operación de dinero exige `idempotency_key`: puedes reintentar sin
miedo — un retry con la misma clave jamás duplica. Ver
[idempotencia](#idempotencia).
### Verifica cada paso con lecturas

Después de cada operación consulta `GET /v1/balances`,
`GET /v1/movements` y el `GET` del recurso para confirmar el estado
real. Nada es write-only.
> **Importante**
Las operaciones son **reales e irreversibles** una vez completadas. Un
payout `completed` ya está en la cuenta del beneficiario; la única vía de
reverso es fuera de la API (contacto con el equipo CBPay).
### Probar webhooks en desarrollo local

Las URLs de callback deben ser **HTTPS públicas**: `localhost`, IPs
privadas y dominios `.local` se rechazan al crear la suscripción. Para
desarrollar en tu máquina usa un túnel HTTPS:

```bash Cloudflare Tunnel (gratis)
# Instala cloudflared y expone tu puerto local
cloudflared tunnel --url http://localhost:3000
# → https://<aleatorio>.trycloudflare.com  ← úsala como callback_url
```

```bash ngrok
ngrok http 3000
# → https://<aleatorio>.ngrok-free.app  ← úsala como callback_url
```

Luego crea la suscripción con esa URL pública:

```bash
curl -X POST https://api.qbank.cl/platform/v1/webhooks/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payin_credited",
    "callback_url": "https://tu-tunel.trycloudflare.com/webhooks/cbpay",
    "secret": "un-secreto-largo-y-aleatorio"
  }'
```

> **Tip**
Los eventos fallidos se reintentan hasta **5 veces con backoff
incremental**, así que si tu túnel se cae unos minutos no pierdes el
evento. Verifica siempre la firma HMAC — receta completa en
[webhooks](#webhooks).
### Simular cada flujo con seguridad

| Producto | Cómo probarlo barato |
|---|---|
| Payout | Dispersa un monto mínimo a una cuenta bancaria de tu equipo |
| Payin | Crea un cargo QR o página de pago y págalo tú mismo; el abono vuelve a tu saldo |
| Transferencia | Crea una segunda cuenta en tu organización y transfiere entre ambas (gratis) |
| Crypto | Deposita un monto pequeño de USDT a tu wallet y retíralo a una dirección propia |
| KYC | Envía el screening con los datos reales de tu empresa (el resultado es reutilizable) |
| Tarjetas | Emite una tarjeta virtual y haz una compra pequeña online |

### Checklist de go-live

Antes de enviar tráfico de clientes reales:

- [ ] Guardas las API keys en un gestor de secretos (nunca en el front ni en el repo).
- [ ] Toda operación de dinero envía `idempotency_key` derivada de TU id interno (no un UUID aleatorio por intento).
- [ ] Ante timeout o `5xx` **no reintentas con clave nueva**: repites con la misma clave o consultas el estado con el `GET`.
- [ ] Verificas la firma HMAC de cada webhook y respondes `2xx` rápido (procesa async).
- [ ] Manejas los estados no finales (`pending`, `processing`) sin asumir éxito.
- [ ] Consultas `GET /v1/services` para mostrar solo los productos habilitados — ver [servicios](#servicios-habilitados).
- [ ] Concilias a diario con `GET /v1/movements` o la [cartola](#cartola-estado-de-cuenta).
- [ ] Tienes un canal con el equipo CBPay para depósitos `unassigned` o incidencias.

> **Nota**
¿Dudas que no cubre esta página? Revisa el [FAQ](#preguntas-frecuentes) — y si falta
algo, repórtalo: la documentación se actualiza con cada pregunta real.


# Conceptos


## Modelo de dinero

*Saldos virtuales por moneda, conversión FX, holds y el ledger inmutable*

### Cuatro saldos virtuales independientes

Cada cuenta mantiene **cuatro saldos virtuales, uno por moneda**. Son
totalmente independientes entre sí: nunca se mezclan ni se convierten
automáticamente.

| Moneda | Qué es | Decimales | Cómo se fondea |
|---|---|---|---|
| `USDT` | Stablecoin USD — **la moneda operativa** | 6 | Payins fiat, depósitos on-chain (TRON/Ethereum), transferencias |
| `USDC` | Stablecoin USD | 6 | Depósitos on-chain (Ethereum), transferencias |
| `BTC` | Bitcoin | 8 (satoshis) | Abonos del operador y transferencias internas |
| `GOLD` | **Gramos de oro fino** con respaldo en custodio | 6 | Abonos del operador y transferencias internas |

`GET /v1/balances` devuelve siempre los cuatro (con ceros si no has operado
esa moneda), como **strings decimales**:

```json
{
  "account_id": "…",
  "balances": [
    { "asset": "USDT", "available": "125.430000", "held": "10.000000" },
    { "asset": "USDC", "available": "50.000000", "held": "0.000000" },
    { "asset": "BTC", "available": "0.00060000", "held": "0.00000000" },
    { "asset": "GOLD", "available": "12.500000", "held": "0.000000" }
  ]
}
```

> **Nota**
Internamente cada monto se almacena como entero en la unidad mínima de su
moneda (micro-USDT, satoshis, micro-gramos) y se calcula con aritmética
racional exacta. Nunca hay floats ni errores de redondeo acumulados.
**USDT es la moneda operativa**: los precios de payouts, payins fiat y
comisiones de servicios se cotizan siempre en USDT. Pero el **pago** puede
salir de cualquiera de los cuatro saldos — ver
[Elige desde qué saldo pagas](#elige-desde-que-saldo-pagas). Los payins
siempre acreditan al saldo USDT; los otros saldos se fondean con
[transferencias internas](#transferencias-internas) (siempre entre saldos
de la misma moneda), depósitos on-chain (USDC) o abonos de tu operador
(BTC y GOLD).

### Elige desde qué saldo pagas

Los **payouts** y las **comisiones de servicios** (KYC, creación de
wallets, banking) pueden debitarse desde cualquiera de tus cuatro saldos.
El pipeline de pricing no cambia: la operación se cotiza en USDT como
siempre, y al final el total se traduce al asset elegido con el **precio
efectivo de settlement** del momento.

- **Predeterminado por cuenta**: `PUT /v1/settlement` con
  `{"default_settlement_asset": "BTC"}`. Desde ahí, todo payout y toda
  comisión de servicio sale del saldo BTC (si alcanza; no hay cascadas a
  otros saldos).
- **Override por operación**: envía `settlement_asset` en
  `POST /v1/payouts` (o en el confirm de QR) para pagar esa operación
  puntual desde otro saldo, sin tocar el predeterminado.

```bash
# Definir BTC como saldo de pago predeterminado
curl -X PUT "https://api.qbank.cl/platform/v1/settlement" \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"default_settlement_asset": "BTC"}'
```

Reglas del settlement multi-asset:

| Regla | Detalle |
|---|---|
| Precio de ejecución | BTC y GOLD usan un feed on-chain de ejecución (no el precio de referencia). Si el feed está viejo o no disponible, la operación devuelve `503 pricing_unavailable` — nunca se ejecuta con un precio dudoso. |
| Débito, hold y reembolso | Los tres viven en el asset elegido. Si el payout falla, se reembolsa el `settlement_amount` **exacto** — jamás se re-cotiza. |
| Idempotencia | El replay con la misma llave devuelve el monto original; el precio no se recalcula. |
| Límite por operación | Los assets volátiles (BTC/GOLD) tienen un límite por operación (equivalente USDT, visible en `GET /v1/settlement`); si lo superas: `422 settlement_limit_exceeded`. |
| Límite diario por cuenta | Los assets volátiles también tienen un tope de volumen en 24 h móviles (`volatile_daily_limit_usdt` en `GET /v1/settlement`); al superarlo: `422 settlement_daily_limit_exceeded`. Paga en USDT/USDC o reintenta más tarde. |
| USDT | Sigue siendo el camino por defecto y no cambia en nada para quien no toca esta configuración. |

El bloque `settlement` de `GET /v1/rates` muestra el precio efectivo por
asset (spread incluido) para estimar antes de operar, y la respuesta del
payout registra `settlement_asset`, `settlement_amount` y
`settlement_rate` para auditoría.

### `available` y `held`

Cada saldo tiene sus dos contadores:

| Campo | Significado |
|---|---|
| `available` | Saldo disponible para operar |
| `held` | Reservado por operaciones en vuelo (payouts y retiros pendientes) |

Cuando creas un payout o retiro, el débito (`monto + comisión`) sale de
`available` y queda en `held` hasta que la operación llega a estado final:

- **`completed`** → el hold se consume; el dinero salió.
- **`failed`** → se reembolsa el débito completo (monto + comisión) a
  `available`.

### Conversión FX (fiat ↔ USDT)

Las operaciones fiat se convierten a USDT con **las tasas de tu cuenta** al
momento de ejecutar (las mismas que devuelve `GET /v1/rates`, base USD):
`rate` para payouts y `payin_rate` para payins. La conversión redondea
**hacia arriba** en los débitos y **hacia abajo** en los abonos, con una
diferencia máxima de 1 micro-USDT.

Ejemplo de un payout de 50.000 CLP con tasa 950.25:

```
usdt_amount = ceil(50000 / 950.25 × 10^6) / 10^6 = 52.618258 USDT
total_debit = usdt_amount + fee
```

Ejemplo de un payin de 50.000 CLP con `payin_rate` 955.10:

```
usdt_gross    = floor(50000 / 955.10 × 10^6) / 10^6 = 52.350539 USDT
usdt_credited = usdt_gross − fee
```

La tasa usada queda registrada en el objeto (`fx_rate`) para auditoría.

### Precios de referencia y de settlement

`GET /v1/rates` incluye un bloque `asset_prices` con el **precio USD de
referencia** de cada moneda (BTC por unidad, GOLD por gramo; USDT y USDC
valen 1 por convención), para valorizar tus saldos en pantalla, y un bloque
`settlement` con el **precio efectivo** al que se valoraría tu saldo si
pagas una operación desde ese asset (spread incluido):

```json
{
  "asset_prices": {
    "USDT": { "currency": "USD", "unit": "usdt", "price": "1" },
    "USDC": { "currency": "USD", "unit": "usdc", "price": "1" },
    "BTC": { "currency": "USD", "unit": "btc", "price": "109853.24",
             "source": "chainlink", "updated_at": "2026-07-07T11:59:41Z",
             "settlement_grade": true },
    "GOLD": { "currency": "USD", "unit": "gram", "price": "107.5341",
              "source": "chainlink", "updated_at": "2026-07-07T09:12:05Z",
              "settlement_grade": true }
  },
  "settlement": {
    "default_asset": "USDT",
    "assets": [
      { "asset": "USDT", "available": true, "settlement_rate": "1" },
      { "asset": "USDC", "available": true, "settlement_rate": "0.99900000" },
      { "asset": "BTC", "available": true, "settlement_rate": "109029.34070000" },
      { "asset": "GOLD", "available": true, "settlement_rate": "106.99642950" }
    ]
  }
}
```

`settlement_grade: true` indica que el precio está lo bastante fresco para
ejecutar operaciones; si baja a `false`, los pagos desde ese asset
responden `503 pricing_unavailable` hasta que el precio vuelva.

### Ledger inmutable

Cada movimiento genera una entrada inmutable con saldo resultante
(`balance_after`) **en la moneda del movimiento**. Tu historial completo
está en `GET /v1/movements` (filtra por moneda con `?asset=`):

| `type` | Qué representa |
|---|---|
| `payin_credit` | Abono de un cobro fiat |
| `payout_debit` / `payout_refund` | Débito de payout / reembolso si falló |
| `transfer_in` / `transfer_out` | Transferencia interna recibida / enviada |
| `funding` | Depósito on-chain acreditado (USDT o USDC, cada uno en su saldo) |
| `withdrawal_debit` / `withdrawal_refund` | Retiro on-chain / reembolso si falló |
| `compliance_fee` / `compliance_refund` | Cargo por servicio KYC/KYB / reembolso |
| `wallet_creation_fee` / `wallet_creation_refund` | Cargo por creación de wallet / reembolso |
| `adjustment` | Ajuste manual de CBPay (auditado) |

```bash
curl "https://api.qbank.cl/platform/v1/movements?type=payout_debit&from=2026-07-01&to=2026-07-07&page_size=20" \
  -H "Authorization: Bearer <token>"

# Solo los movimientos del saldo GOLD
curl "https://api.qbank.cl/platform/v1/movements?asset=GOLD&from=2026-07-01&to=2026-07-07" \
  -H "Authorization: Bearer <token>"
```

Todos los listados (`/v1/movements`, `/v1/payouts`, `/v1/payins`,
`/v1/crypto/transactions`, `/v1/banking/operations`) aceptan paginación
(`page`, `page_size` hasta 200) y filtros de fecha `from`/`to`
(YYYY-MM-DD, UTC, inclusive).

### Estados de operación

Payouts y retiros crypto siguen el mismo ciclo:

```mermaid
flowchart LR
    pending --> processing
    processing --> completed
    processing --> failed
    pending --> failed
```

Los estados finales (`completed`/`failed`) llegan por
[webhook](#webhooks); no es necesario hacer polling.


## Comisiones

*Cómo se cobra cada servicio y dónde ver tus condiciones*

Las comisiones las configura CBPay por **servicio, país y activo**.
Si no hay nada configurado para una combinación, la comisión es **0**.

### Cómo se cobran los payouts y payins

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

### Servicios con comisión fija u porcentual

| Servicio | Cómo se cobra | Cuándo |
|---|---|---|
| `payout` | Fijo por operación (el pricing FX ya está en tu tasa) | Al crear el payout (incluido en `total_debit`) |
| `payin` | Fijo por operación (el pricing FX ya está en tu `payin_rate`) | Al acreditar (recibes `usdt_gross − fee`) |
| `funding` | `%` sobre el depósito + fijo | Al acreditar el depósito on-chain |
| `withdrawal` | `%` sobre el retiro + fijo | Al crear el retiro (incluido en `total_debit`) |
| `wallet_creation` | Fijo por wallet | Al crear cada wallet (personas: 1 por red; empresas: ilimitadas). Consultar wallets existentes es siempre gratis |
| `compliance_person` | Fijo por llamada | Al screenear una persona por AML (`POST /v1/aml/screenings`) |
| `compliance_company` | Fijo por llamada | Al screenear una empresa por AML |
| `compliance_rescreen` | Fijo por llamada | Al re-ejecutar un screening AML |
| `compliance_monitoring` | Fijo por activación | Al activar monitoreo AML continuo (desactivar es gratis) |
| `kyc_verification` | Fijo por verificación | Al crear un link o submission KYC de un tercero ([verificación](#verificacion-kyc-y-kyb)); tu propio onboarding es gratis |
| `kyb_verification` | Fijo por verificación | Al crear un link o submission KYB de un tercero |
| `banking_customer` | Fijo por perfil | Al crear tu perfil bancario ([banking](#banking)) |
| `banking_account` | Fijo por cuenta | Al abrir cada cuenta bancaria |
| `banking_operation` | Fijo por pago | Al enviar cada pago bancario (cotizar con `prepare` es gratis) |
| `card_creation_virtual` | Fijo por tarjeta | Al emitir una tarjeta virtual ([tarjetas](#tarjetas-virtuales-y-fisicas)) |
| `card_creation_physical` | Fijo por tarjeta | Al emitir una tarjeta física |
| `card_monthly` | Fijo mensual | Mensualidad por tarjeta activa (sin saldo, la tarjeta se congela — sin deuda) |
| `card_cancellation` | Fijo por tarjeta | Al cancelar una tarjeta |

Para los servicios con `%`, la fórmula es
`fee = ceil(monto × percent / 100) + fixed_amount` (redondeo hacia arriba al
micro-USDT).

> **Nota**
Los cargos fijos standalone (compliance, verificación KYC/KYB, creación de
wallets y banking) se reembolsan automáticamente si la operación falla
aguas arriba (`compliance_refund` / `verification_fee_refund` /
`wallet_creation_refund` / `banking_fee_refund`).
### Transferencias internas: siempre gratis

Las transferencias entre cuentas CBPay (`POST /v1/transfers`) **no tienen
comisión**, sin importar la combinación: persona↔persona, persona↔empresa o
empresa↔empresa. El dinero se mueve dentro del ecosistema.

### Tu tipo de cambio

`GET /v1/rates` devuelve **el tipo de cambio propio de tu cuenta** en cada
país — las mismas tasas con las que se ejecutan tus operaciones, sin
sorpresas: `rate` para payouts y `payin_rate` para payins
(`monto_local / tasa = USDT`).

### Consulta tus condiciones

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
([modelo de dinero](#modelo-de-dinero)):
ese precio ya incluye el margen de conversión, así que lo que ves es lo
que se aplica.

La comisión cobrada queda siempre explícita en la respuesta de cada
operación (campo `fee`) y en el ledger.

### Ejemplo completo

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


## Idempotencia

*Reintenta con seguridad sin duplicar operaciones*

Toda operación que mueve dinero exige una **clave de idempotencia**. La
tabla completa:

| Endpoint | Clave | Por qué |
|---|---|---|
| `POST /v1/payouts` | **Obligatoria** | Debita tu saldo y dispersa |
| `POST /v1/payouts/qr/confirm` | **Obligatoria** | Debita y paga el QR (el `scan` es gratis y no la necesita) |
| `POST /v1/payins/collect` | **Obligatoria** | Ejecuta un débito real contra el pagador |
| `POST /v1/transfers` | **Obligatoria** | Mueve saldo entre cuentas |
| `POST /v1/crypto/withdrawals` | **Obligatoria** | Debita y transmite on-chain |
| `POST /v1/banking/operations` | **Obligatoria** | Envía un pago bancario (el `prepare` es gratis y no la necesita) |
| `POST /v1/cards` | **Obligatoria** | Puede cobrar el fee de emisión |
| `POST /v1/payins` con `method: "fintoc"` | Opcional, **recomendada** | Un retry con la misma clave devuelve la misma sesión de pago (no abre una segunda) |
| `POST /v1/payins` (qr / bank_transfer) | No aplica | El cargo no mueve dinero hasta que alguien paga; un duplicado sin pagar simplemente vence |

### Cómo enviarla

Dos formas equivalentes (si mandas ambas, gana el body):

```bash Body
curl -X POST …/v1/payouts \
  -d '{ "idempotency_key": "pago-nomina-2026-07-001", … }'
```

```bash Header
curl -X POST …/v1/payouts \
  -H "Idempotency-Key: pago-nomina-2026-07-001" \
  -d '{ … }'
```

Si la omites recibes `400 idempotency_key_required`.

### Qué pasa al reintentar

La clave es única por **cuenta origen**. Si repites una llamada con la misma
clave:

- No se crea una operación nueva ni se mueve dinero otra vez.
- Recibes `200 OK` (en vez de `201`/`202`) con el objeto original más el
  campo `idempotency_hit: true`.

```json
{
  "payout_id": "el-mismo-de-la-primera-vez",
  "status": "processing",
  "idempotency_hit": true
}
```

### ¿Con qué clave reintento?

La regla de decisión completa, para no dudar nunca:

```mermaid
flowchart LR
    llamada["Llamas a la API"] --> resultado{"¿Qué recibiste?"}
    resultado -->|"2xx"| ok["Listo — guarda el ID"]
    resultado -->|"Timeout / error de red / 5xx"| misma["Reintenta con la<br/>MISMA clave"]
    misma --> replay["200 idempotency_hit: true<br/>si ya se había creado"]
    resultado -->|"4xx de validación"| corrige["Corrige el request"]
    corrige --> nueva["Usa una clave NUEVA<br/>(es una operación nueva)"]
    resultado -->|"422 con status failed"| decide{"¿Quieres volver<br/>a intentarlo?"}
    decide -->|"Sí"| nueva
```

### Recomendaciones

- Usa un identificador de **tu** sistema (ID de orden, de nómina, etc.), no
  un timestamp ni un UUID generado al vuelo en cada retry.
- Guarda la clave antes de llamar a la API; así puedes reintentar tras un
  timeout con garantía de no duplicar.
- Ante un error de red o `5xx`, **reintenta con la misma clave**. Ante un
  `4xx` de validación, corrige el request y usa una clave nueva.


## Personas y empresas

*Las diferencias entre los dos tipos de cuenta, producto por producto, en una sola página*

CBPay tiene dos tipos de cuenta — **persona** (`type: "person"`) y
**empresa** (`type: "company"`) — que usan **la misma API** con los mismos
endpoints. Esta página reúne TODAS las diferencias en un solo lugar, para
que nunca tengas que adivinar cuál aplica.

El tipo se define al crear la cuenta y no cambia. Lo ves en
`GET /v1/me` → `type`.

### Tabla completa de diferencias

| Capacidad | Persona | Empresa |
|---|---|---|
| Saldo USDT, payouts, payins, transferencias, banking, cartola | Igual | Igual |
| **Wallets crypto** por red | **1** (`422 wallet_limit_reached` en la segunda) | **Ilimitadas** (usa `label` para distinguirlas) |
| **Tarjetas** | **1 virtual + 1 física**, solo para sí misma | **Ilimitadas**, para la empresa o para **personas designadas** (empleados) |
| **Miembros con login** (`POST /v1/members`) | No (`403 company_only`) | Sí — roles `owner` / `operator` / `viewer` |
| **Verificación de identidad** (`/v1/me/verification`) | Onboarding **KYC** (wizard con documentos + prueba de vida) | Onboarding **KYB** (wizard con documentos societarios) |
| **Verificar a terceros** (`/v1/{kyc,kyb}/links` y submissions) | No (`403 company_account_required`) | Sí — links hosteados o datos por API, cobra `kyc_verification`/`kyb_verification` |
| **AML screening** (`POST /v1/aml/screenings`) | Screening de **persona** (`customer.person`), cobra `compliance_person` | Screening de **empresa** (`customer.company`), cobra `compliance_company` |
| Titular de tarjetas (primera emisión) | Datos personales + documentos de identidad | Datos societarios + documentos corporativos (o los de la persona designada) |
| Registro | `type: "person"` | `type: "company"` (+ `tax_id` recomendado) |

Todo lo demás — autenticación, idempotencia, webhooks, estados, errores,
límites de gasto por tarjeta, servicios habilitados — funciona idéntico.

### Cómo se ve en la práctica

#### Cuenta persona

- Registro: `POST /v1/auth/register` con `type: "person"` (o la crea tu
  operador).
- Verificación: pide tu link KYC con `POST /v1/me/verification/link` y
  completa el wizard — hasta aprobar solo puedes fondear
  ([guía](#verificacion-kyc-y-kyb)).
- Crypto: **una wallet por red** (TRON y ETH). ¿Necesitas más direcciones?
  Ese es un caso de cuenta empresa.
- Tarjetas: hasta **1 virtual + 1 física**; la primera emisión lleva tus
  datos y documentos — [guía](#tarjetas-virtuales-y-fisicas).
- Sin miembros: tu login y tus API keys operan la cuenta.

#### Cuenta empresa

- Registro: `type: "company"`, idealmente con `tax_id`.
- Verificación: pide tu link KYB con `POST /v1/me/verification/link` y
  completa el wizard con los datos societarios; aprobada, puedes además
  verificar a tus propios clientes ([guía](#verificacion-kyc-y-kyb)).
- Crypto: **wallets ilimitadas** por red (una por sucursal, por producto,
  por proveedor…), con `label` descriptivo.
- Tarjetas: **ilimitadas** — corporativas (titular = la empresa, con
  documentos societarios en la primera) o para **empleados** (persona
  designada con sus datos en cada designación) —
  [guía](#tarjetas-virtuales-y-fisicas).
- Miembros: agrega usuarios con login propio y permisos
  (`owner`/`operator`/`viewer`) — [guía](#autenticacion-y-cuenta).

### Errores que delatan el tipo de cuenta

| `error` | Qué significa |
|---|---|
| `403 company_only` | Intentaste una función de empresa (miembros) desde una cuenta persona |
| `422 wallet_limit_reached` | Una persona intentó su segunda wallet en la misma red |
| `409 card_limit_reached` | Una persona intentó su segunda tarjeta del mismo tipo |

> **Nota**
¿Tu operación creció de persona a empresa? El tipo de cuenta no se cambia
por API: pide a tu administrador CBPay crear la cuenta empresa y migrar el
saldo con una transferencia interna (gratis e instantánea).


## Servicios habilitados

*Qué productos tiene habilitados tu cuenta y cómo reaccionar a service_disabled*

Cada cuenta tiene un **conjunto de servicios habilitados** según su acuerdo
comercial con CBPay. Antes de mostrar un producto en tu UI (o de intentar
usarlo), consulta el mapa efectivo:

```bash
curl https://api.qbank.cl/platform/v1/services \
  -H "Authorization: Bearer <token>"
```

```json
{
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "services": {
    "payouts": true,
    "payins": true,
    "transfers": true,
    "crypto": true,
    "banking": false,
    "kyc": true,
    "cards": false
  }
}
```

### Catálogo de servicios

| Servicio | Qué habilita |
|---|---|
| `payouts` | Dispersiones fiat (`POST /v1/payouts`, QR scan/confirm) |
| `payins` | Cobros fiat (QR, transferencia, página de pago, collect, CLABE) |
| `transfers` | Transferencias internas entre cuentas CBPay |
| `crypto` | Wallets on-chain y retiros USDT |
| `banking` | Cuentas bancarias internacionales (perfil, cuentas, pagos) |
| `kyc` | Verificación de identidad KYC/KYB de terceros (links, submissions, documentos, liveness) |
| `aml` | AML screening contra listas, rescreening y monitoreo |
| `cards` | Emisión y operación de tarjetas |

### Qué pasa cuando un servicio está apagado

Las **acciones** del producto responden `403 service_disabled`:

```json
{
  "error": "service_disabled",
  "message": "this service is not enabled for your account"
}
```

Reglas importantes:

- **Las lecturas nunca se bloquean**: siempre puedes listar y consultar tus
  operaciones históricas, saldos y movimientos.
- **El dinero en tránsito termina su ciclo**: un payout `processing` se
  completa (o reembolsa) aunque el servicio se apague después.
- Con `cards` apagado, las compras con tarjeta dejan de autorizarse al
  instante y no se generan mensualidades.

### Patrón recomendado en tu integración

```mermaid
flowchart LR
    inicio["Al iniciar sesión /<br/>cargar el dashboard"] --> get["GET /v1/services"]
    get --> ui{"services.X"}
    ui -->|"true"| muestra["Muestra el producto"]
    ui -->|"false"| oculta["Oculta o deshabilita<br/>el producto"]
    muestra --> accion["El usuario opera"]
    accion --> err{"403 service_disabled?"}
    err -->|"sí"| refresca["Refresca GET /v1/services<br/>y actualiza la UI"]
```

1. Consulta `GET /v1/services` al cargar tu aplicación (y cachea unos minutos).
2. Muestra solo los productos en `true`.
3. Aun así, maneja `403 service_disabled` en cualquier acción: la
   configuración puede cambiar entre tu caché y la operación.

> **Nota**
Los servicios los habilita tu organización según el acuerdo comercial. Si
necesitas activar un producto (por ejemplo `banking` o `cards`), contacta a
tu administrador CBPay — el cambio es inmediato, sin redeploy.


## Estados y ciclo de vida

*Todos los estados de cada producto, cuáles son finales y qué hacer en cada uno*

Todas las operaciones de CBPay siguen ciclos de vida explícitos. Esta
página reúne **todos los estados de todos los productos** en un solo lugar,
con la regla de oro: nunca asumas éxito hasta ver un **estado final**.

### Tabla unificada

| Producto | Estados | Finales | Evento webhook |
|---|---|---|---|
| Payout | `pending` → `processing` → `completed` / `failed` | `completed`, `failed` | `payout_status_changed` |
| Payin | `pending` → `credited` / `expired` / `failed` (+ `unassigned`) | `credited`, `expired`, `failed` | `payin_credited` |
| Transferencia | `completed` (síncrona) | `completed` | `transfer_received` (al receptor) |
| Depósito crypto | detección → `credited` al confirmar la red | `credited` | `crypto_deposit_credited` |
| Retiro crypto | `pending` → `processing` → `completed` / `failed` | `completed`, `failed` | `crypto_withdrawal_status_changed` |
| Banking (pago) | según riel: `pending` → `processing` → `completed` / `failed` | `completed`, `failed` | `banking_operation_status_changed` |
| Tarjeta | `pending_activation` → `active` ⇄ `frozen` → `cancelled` | `cancelled` | `card_status_changed` |
| KYC de la cuenta | `none` → `pending` → `approved` / `rejected` | `approved`, `rejected` | — (consultar `GET /v1/me`) |

### Payouts: el ciclo con dinero retenido

```mermaid
stateDiagram-v2
    [*] --> pending: POST /v1/payouts<br/>(debito a held)
    pending --> processing: el corredor acepta
    processing --> completed: pagado al beneficiario<br/>(hold consumido)
    processing --> failed: rechazo del corredor<br/>(reembolso TOTAL a available)
    pending --> failed: rechazo inmediato<br/>(reembolso TOTAL)
    completed --> [*]
    failed --> [*]
```

- El débito completo (`total_debit`) sale de `available` y queda en `held`
  mientras la operación está en vuelo.
- `failed` **siempre reembolsa el débito completo** (monto + comisión) a
  `available`, automáticamente.
- Un payout en `processing` no se puede cancelar por API: espera el estado
  final (webhook o `GET /v1/payouts/{id}`).

#### Catálogo de `status_code` en payouts fallidos

Cuando un payout falla, `status_code` y `status_message` explican la causa
en términos neutros:

| `status_code` | Significado | Qué hacer |
|---|---|---|
| `core_rejected` | El procesador rechazó la operación al crearla (datos del beneficiario inválidos, cuenta destino inexistente, corredor no disponible) | Lee `status_message`, corrige los datos y crea un payout nuevo (clave nueva) |
| *código del corredor* | Rechazo posterior del riel bancario (p. ej. cuenta cerrada) | Igual: corrige y reintenta como operación nueva |
| *(vacío)* con `failed` | Fallo genérico reportado por el corredor | Revisa `status_message`; si no es claro, contacta soporte con el `payout_id` |

El reembolso ya ocurrió en todos los casos: verifícalo en
`GET /v1/movements` (entrada `payout_refund`).

### Payins: estados de un cobro

- `pending` — el cargo existe y espera el pago. Los QR y páginas de pago
  tienen vencimiento (`expired` si nadie paga).
- `credited` — pago recibido, convertido a tu `payin_rate` y abonado.
- `unassigned` — llegó un depósito que no se pudo asociar a ninguna cuenta;
  el administrador lo asigna manualmente y entonces se acredita con la tasa
  y comisiones de la cuenta destino.
- `failed` — el cobro falló (p. ej. un collect rechazado por el pagador).
  No se movió dinero.

### Retiros crypto: confirmación on-chain

Un retiro pasa a `completed` cuando la transacción se confirma en la red.
Tiempos típicos: **TRON ~1 minuto** (19 confirmaciones), **Ethereum algunos
minutos** según congestión. El `tx_id` viene en la respuesta y en el
webhook para que lo verifiques en el explorador.

Si el retiro falla antes de transmitirse, el débito completo se reembolsa
(entrada `withdrawal_refund`).

### Tarjetas

- `pending_activation` — física emitida, viaja inactiva; se activa con
  `POST /v1/cards/{id}/activate`.
- `active` — autoriza compras en tiempo real contra el saldo del asset de
  gasto de la tarjeta (`spending_asset`: USDT, USDC, BTC o GOLD).
- `frozen` — congelada (manual o por mensualidad impaga); las compras se
  rechazan con `unfunded_card_frozen`. Se descongela pagando lo pendiente.
- `cancelled` — final; no se puede revertir.

### Reglas transversales

#### ¿Cuándo confío en un estado?
Estado final por webhook **o** por `GET` del recurso — ambos son fuentes de
verdad equivalentes. El webhook es push (recomendado); el `GET` es tu
respaldo si un webhook se pierde.
#### ¿Qué hago ante timeout creando una operación?
NO reintentes con clave nueva. Repite el mismo request con la **misma**
`idempotency_key` (te devuelve el original con `idempotency_hit: true`) o
consulta el listado del recurso. Detalle en
[idempotencia](#idempotencia).
#### ¿Un estado puede retroceder?
No. Los ciclos son monótonos: `completed` y `failed` son definitivos, y una
operación nunca vuelve a un estado anterior.
#### ¿Dónde veo el efecto de cada estado en mi saldo?
En `GET /v1/movements`: cada transición con efecto económico deja una
entrada inmutable (`payout_debit`, `payout_refund`, `payin_credit`…). Ver
[movimientos y conciliación](#movimientos-y-conciliacion).


## Movimientos y conciliación

*El ledger inmutable (GET /v1/movements), todos los tipos de asiento y cómo conciliar contra la cartola y los webhooks*

Cada vez que tu saldo cambia, CBPay escribe una **entrada inmutable** en el
ledger con el saldo resultante. `GET /v1/movements` es tu fuente de verdad
para conciliar: nada mueve dinero sin dejar asiento.

### Consultar movimientos

```bash
curl "https://api.qbank.cl/platform/v1/movements?from=2026-07-01&to=2026-07-08&page_size=100" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "page": 1,
  "page_size": 100,
  "movements": [
    {
      "id": "a3f1…",
      "asset": "USDT",
      "amount": "-101.602460",
      "type": "payout_debit",
      "reference_type": "payout",
      "reference_id": "8e2a…",
      "description": "Payout 700.00 BOB",
      "balance_after": "3898.397540",
      "created_at": "2026-07-07T15:22:10Z"
    }
  ]
}
```

Filtros: `from`/`to` (`YYYY-MM-DD`, UTC), `type`, `asset`, `page`,
`page_size` (máx. 200). Cada entrada trae `reference_type` +
`reference_id`: el recurso de negocio que la originó.

### Catálogo completo de tipos

| `type` | Signo | Origen (`reference_type`) |
|---|---|---|
| `payin_credit` | + | Cobro fiat abonado (`payin`) |
| `payout_debit` / `payout_refund` | − / + | Payout creado / reembolso si falló (`payout`) |
| `transfer_in` / `transfer_out` | + / − | Transferencia interna recibida / enviada (`transfer`) |
| `funding` | + | Depósito USDT on-chain acreditado (`deposit`) |
| `withdrawal_debit` / `withdrawal_refund` | − / + | Retiro on-chain / reembolso si falló (`withdrawal`) |
| `card_debit` / `card_refund` | − / + | Compra con tarjeta / reversa (`card_transaction`) |
| `card_fee` / `card_fee_refund` | − / + | Fee de tarjeta (emisión, mensualidad, cancelación) |
| `compliance_fee` / `compliance_refund` | − / + | Cobro por screening KYC / reembolso si falló |
| `wallet_creation_fee` / `wallet_creation_refund` | − / + | Fee por creación de wallet |
| `banking_fee` / `banking_fee_refund` | − / + | Fee de operación banking |
| `adjustment` | ± | Ajuste manual auditado del administrador |

> **Nota**
Los saldos de banking viven en tus cuentas bancarias (no en el ledger
USDT): aquí solo aparecen sus **fees**. Las comisiones transaccionales de
payout/payin/retiro no tienen asiento propio — viajan dentro del monto de
su operación (`total_debit`, `usdt_credited`).
### Conciliación en tres capas

Tu integración tiene tres vistas del mismo dinero. Así se mapean:

| Capa | Qué es | Clave de cruce |
|---|---|---|
| **Webhooks** | Notificación push de cada evento | `payout_id` / `payin_id` / `transfer_id` / `withdrawal_id` |
| **Movements** | Asiento contable inmutable con `balance_after` | `reference_id` = el mismo id del recurso |
| **Cartola** | Estado de cuenta del período (JSON/PDF/Excel) con cuadratura | Secciones por producto con los mismos ids |

```mermaid
flowchart LR
    evento["Webhook<br/>payin_credited (payin_id)"] --> negocio["Recurso de negocio<br/>GET /v1/payins/{id}"]
    negocio --> asiento["Movimiento<br/>type=payin_credit<br/>reference_id=payin_id"]
    asiento --> cartola["Cartola del período<br/>sección payins"]
    cartola --> cuadre["Cuadratura:<br/>saldo inicial + créditos − débitos = saldo final"]
```

#### Receta de conciliación diaria

### Descarga los movimientos del día

`GET /v1/movements?from=AYER&to=AYER` paginando hasta el final.
### Cruza contra tu registro interno

Tu `idempotency_key` derivada de tu id interno te permite unir cada
operación tuya con su `reference_id` de CBPay.
### Verifica la continuidad del saldo

Ordena por fecha: el `balance_after` de cada entrada debe ser el
anterior ± `amount`. Cualquier salto es señal de que te falta una
entrada (no de un error del ledger — es inmutable).
### Cierra el período con la cartola

La [cartola](#cartola-estado-de-cuenta) garantiza la identidad contable
`saldo_inicial + créditos − débitos = saldo_final` y te sirve como
respaldo formal (PDF/Excel).
### Movements vs cartola: ¿cuándo usar cuál?

- **`GET /v1/movements`** — programático, paginado, en vivo: para tu
  conciliación automática y tu UI de historial.
- **Cartola** — snapshot del período con totales, desgloses por producto/
  país/moneda y cuadratura garantizada: para cierres contables, auditoría
  y para compartir con tu equipo de finanzas.

Ambos leen el mismo ledger: nunca van a discrepar entre sí.


# Flujos de integración


## Flujos de integración

*Los cinco flujos end-to-end de una integración típica, con diagramas de secuencia paso a paso*

Esta página conecta los productos en **flujos completos de negocio**: qué
llamar, qué esperar y qué webhook cierra cada ciclo. Cada flujo linkea a la
guía detallada de su producto.

### 1. Fondear la cuenta

Tres caminos para que entre dinero; todos terminan en un abono al saldo
USDT y un webhook:

```mermaid
sequenceDiagram
    participant App as Tu app
    participant CB as CBPay
    participant Pagador as Pagador / Red
    App->>CB: POST /v1/payins (o wallet crypto)
    CB-->>App: pending + datos de pago (QR, URL, referencia, dirección)
    App->>Pagador: comparte el medio de pago
    Pagador->>CB: paga (transferencia, QR, USDT on-chain)
    CB->>CB: convierte a tu payin_rate − fee (fiat)
    CB-->>App: webhook payin_credited / crypto_deposit_credited
    App->>CB: GET /v1/balances (verifica)
```

| Camino | Endpoint | Webhook de cierre |
|---|---|---|
| Cobro fiat (QR, transferencia, página de pago, pull) | `POST /v1/payins` / `/collect` | `payin_credited` |
| Depósito USDT on-chain | `POST /v1/crypto/wallets` (dirección fija) | `crypto_deposit_credited` |
| Transferencia interna de otra cuenta | — (la inicia el emisor) | `transfer_received` |

Detalle: [payins](#payins) · [crypto](#crypto-wallets-depositos-y-retiros) ·
[transferencias](#transferencias-internas).

### 2. Dispersar (payout)

```mermaid
sequenceDiagram
    participant App as Tu app
    participant CB as CBPay
    participant Banco as Riel local
    App->>CB: POST /v1/payouts (idempotency_key)
    CB-->>App: 202 processing (fx_rate, total_debit; débito queda en held)
    CB->>Banco: ejecuta la dispersión
    alt pagado
        Banco-->>CB: confirmación
        CB-->>App: webhook payout_status_changed (completed)
    else rechazo
        Banco-->>CB: rechazo
        CB->>CB: reembolsa el débito COMPLETO a available
        CB-->>App: webhook payout_status_changed (failed + status_code)
    end
    App->>CB: GET /v1/payouts/{id} (verifica estado final)
```

Variante **QR** (Bolivia): `POST /v1/payouts/qr/scan` (gratis, decodifica)
→ muestra los datos → `POST /v1/payouts/qr/confirm` (cobra como un payout
normal). Detalle: [payouts](#payouts).

### 3. Cobrar a un cliente

Elige la modalidad según el país y la experiencia que quieras dar:

| Modalidad | Países | Experiencia del pagador | Confirmación |
|---|---|---|---|
| Página de pago hosted | CL | Abre una URL y paga desde su banco | Automática |
| QR | BO, BR (PIX) | Escanea con su app bancaria | Automática |
| Transferencia anunciada | CL, PE, MX, BR | Transfiere incluyendo la referencia | Automática por referencia (o monto) |
| CLABE dedicada | MX | Transfiere a una CLABE fija tuya | Automática, sin referencias |
| Cobro pull (c2p / débito) | VE | Autoriza con OTP y tú ejecutas el cobro | **Síncrona** en la misma llamada |

Todos cierran con `payin_credited` y el abono neto en tu saldo.
Detalle: [payins](#payins).

### 4. Conciliar

```mermaid
flowchart LR
    webhooks["Webhooks<br/>(push, por evento)"] --> interno["Tu registro interno<br/>(por idempotency_key)"]
    movements["GET /v1/movements<br/>(ledger inmutable)"] --> interno
    cartola["Cartola del período<br/>(JSON/PDF/Excel)"] --> cierre["Cierre contable<br/>con cuadratura"]
    interno --> cierre
```

Receta completa en
[movimientos y conciliación](#movimientos-y-conciliacion) y
[cartola](#cartola-estado-de-cuenta).

### 5. Banking internacional end-to-end

```mermaid
sequenceDiagram
    participant App as Tu app
    participant CB as CBPay
    App->>CB: POST /v1/banking/customers (perfil, una vez)
    CB-->>App: webhook banking_customer_status_changed (approved)
    App->>CB: POST /v1/banking/accounts (cuenta USD/EUR)
    App->>CB: POST /v1/banking/operations/prepare (cotiza, gratis)
    App->>CB: POST /v1/banking/operations (idempotency_key)
    CB-->>App: webhook banking_operation_status_changed (completed/failed)
```

El saldo banking vive en tus cuentas bancarias (separado del USDT); CBPay
solo cobra los fees fijos configurados. Detalle:
[banking](#banking).

> **Tip**
¿Primera integración? Sigue el [inicio rápido](#inicio-rapido) (fondeo →
payout → webhook) y vuelve aquí cuando agregues productos.


# Productos


## Payouts

*Dispersa fiat a cuentas bancarias locales debitando tu saldo USDT*

Un payout envía dinero en moneda local a una cuenta bancaria del país
destino. El monto se convierte de moneda local a USDT con **la tasa de tu
cuenta** (la de `GET /v1/rates`) y se debita `usdt_amount + fee` (el fijo,
si está configurado) de tu saldo.

Así se ve el ciclo completo, incluido qué pasa con tu saldo en cada paso:

```mermaid
sequenceDiagram
    autonumber
    participant App as Tu app
    participant CB as CBPay
    participant Rail as Rail bancario local
    App->>CB: POST /v1/payouts (idempotency_key)
    CB->>CB: Convierte a tu tasa y debita<br/>usdt_amount + fee (available → held)
    CB-->>App: 202 processing (fx_rate, total_debit)
    CB->>Rail: Dispersa en moneda local
    alt El dinero llega
        Rail-->>CB: Confirmado
        CB->>CB: Consume el hold — final
        CB-->>App: Webhook payout_status_changed (completed)
    else El rail rechaza
        Rail-->>CB: Rechazado
        CB->>CB: Reembolsa el débito completo a available
        CB-->>App: Webhook payout_status_changed (failed + status_code)
    end
```

### 1. Descubre los corredores disponibles

Los países, monedas y métodos disponibles los define CBPay.
Consúltalos siempre por catálogo:

```bash
curl https://api.qbank.cl/platform/v1/payouts/methods \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    { "country": "CL", "currency": "CLP", "method": "bank_transfer" },
    { "country": "PE", "currency": "PEN", "method": "bank_transfer" },
    { "country": "PE", "currency": "PEN", "method": "yape" },
    { "country": "BO", "currency": "BOB", "method": "qr" }
  ],
  "meta": { "retrieved": 4 }
}
```

Corredores y métodos disponibles:

| País | Moneda | Métodos |
|---|---|---|
| Chile | CLP | `bank_transfer` |
| Perú | PEN | `bank_transfer`, `yape` |
| México | MXN | `bank_transfer` (SPEI: CLABE o tarjeta de débito) |
| Venezuela | VES | `bank_transfer`, `pago_movil` |
| Bolivia | BOB / USD | `bank_transfer`, `qr` (ver [Payout QR](#payout-qr)) |
| Brasil | BRL | `pix` (por llave), `qr` (ver [Payout QR](#payout-qr)) |
| Paraguay | PYG | `bank_transfer` |

La disponibilidad puede variar; el catálogo (`GET /v1/payouts/methods`) es
siempre la fuente de verdad. Si un país tiene un solo método, `method` es
opcional. Todos los métodos se cobran igual: tu tasa + fijo.

Para transferencias bancarias necesitas además el catálogo de bancos (de
ahí sale el `bank_code` del beneficiario):

```bash
curl "https://api.qbank.cl/platform/v1/payouts/banks?country=CL" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    { "code": "001", "name": "Banco de Chile" },
    { "code": "012", "name": "Banco del Estado de Chile" },
    { "code": "016", "name": "Banco de Crédito e Inversiones" }
  ],
  "meta": { "retrieved": 3 }
}
```

### 2. Crea el payout

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "MX",
    "currency": "MXN",
    "method": "bank_transfer",
    "amount": "1500.00",
    "beneficiary": {
      "name": "María López",
      "account_type": "clabe",
      "account_number": "012180001234567895"
    },
    "description": "Pago factura 8841",
    "idempotency_key": "factura-8841"
  }'
```

> **Importante**
`beneficiary` es un objeto de pares clave/valor cuyos campos requeridos
dependen del corredor (RUT y banco en Chile, CLABE en México, CCI en Perú,
llave PIX en Brasil, etc.). El catálogo de métodos documenta los campos de
cada uno.
> **Nota**
Cada payout guarda al beneficiario como [contacto](#contactos)
automáticamente (`"save_contact": false` para no guardarlo). Para repetirle
un pago sin re-tipear sus datos, envía `"beneficiary_contact_id"` en vez de
`beneficiary` — se usa su beneficiario guardado más reciente para ese país
y método (`422 no_saved_destination` si no tiene).
Respuesta `202 Accepted`:

```json
{
  "payout_id": "0d4f…",
  "account_id": "…",
  "idempotency_key": "factura-8841",
  "country": "MX",
  "currency": "MXN",
  "method": "bank_transfer",
  "local_amount": "1500.00",
  "fx_rate": "17.50",
  "usdt_amount": "85.714286",
  "fee": "0.300000",
  "total_debit": "86.014286",
  "settlement_asset": "USDT",
  "settlement_amount": "86.014286",
  "settlement_rate": "1",
  "status": "processing",
  "created_at": "2026-07-06T20:00:00Z"
}
```

En ese momento tu saldo ya refleja el débito: `total_debit` pasó de
`available` a `held` (en el saldo del `settlement_asset`).

#### Pagar desde otro saldo (`settlement_asset`)

Por defecto el débito sale de tu asset de settlement predeterminado (USDT
salvo que lo cambies con `PUT /v1/settlement`). Para pagar una operación
puntual desde otro saldo, agrega `settlement_asset` al request. Ejemplo:
un payout de 100.000 CLP pagado desde el saldo BTC pasa por cuatro
transformaciones, todas registradas en la respuesta:

1. **CLP → USDT** a tu tasa: `100000 / 950.25 = 105.235465 USDT`.
2. **+ comisión fija**: `105.235465 + 0.30 = 105.535465 USDT` (`total_debit`).
3. **USDT → BTC** al precio efectivo de settlement (`settlement_rate`
   `109029.34070000`): `105.535465 / 109029.3407 = 0.00096795 BTC`
   (redondeo hacia arriba al satoshi).
4. **Débito y hold en BTC**: `settlement_amount` `0.00096795` sale de tu
   saldo BTC; el beneficiario recibe sus 100.000 CLP igual que siempre.

```json
{
  "country": "CL",
  "currency": "CLP",
  "local_amount": "100000",
  "fx_rate": "950.25",
  "usdt_amount": "105.235465",
  "fee": "0.300000",
  "total_debit": "105.535465",
  "settlement_asset": "BTC",
  "settlement_amount": "0.00096795",
  "settlement_rate": "109029.34070000",
  "status": "processing"
}
```

Si el payout falla, se reembolsa el `settlement_amount` exacto a tu saldo
BTC — nunca se re-cotiza. Si el precio de ejecución de BTC/GOLD no está
disponible en ese momento recibirás `503 pricing_unavailable`, y los
assets volátiles tienen un límite por operación
(`422 settlement_limit_exceeded`; consúltalo en `GET /v1/settlement`).

### 3. Recibe el estado final

Suscríbete al evento `payout_status_changed` ([webhooks](#webhooks)):

```json
{
  "payout_id": "0d4f…",
  "account_id": "…",
  "country": "MX",
  "currency": "MXN",
  "local_amount": "1500.00",
  "usdt_amount": "85.714286",
  "total_debit": "86.014286",
  "status": "completed",
  "status_code": ""
}
```

- **`completed`**: el dinero llegó; el hold se consume.
- **`failed`**: se reembolsa el débito completo automáticamente
  (`payout_refund` en tu ledger).

También puedes consultar en cualquier momento:

```bash
curl https://api.qbank.cl/platform/v1/payouts/0d4f… \
  -H "Authorization: Bearer <token>"
```

#### Estados del payout

| Estado | Significado | ¿Tu saldo? |
|---|---|---|
| `processing` | Aceptado y en ejecución en el rail local | Débito retenido en `held` |
| `completed` | El dinero llegó al beneficiario | Hold consumido — final |
| `failed` | El corredor lo rechazó o falló | **Reembolso automático completo** (monto + comisión) |

### Consulta e historial

Cada payout se puede leer individualmente y el listado acepta filtros:

```bash
# Un payout
curl https://api.qbank.cl/platform/v1/payouts/0d4f… \
  -H "Authorization: Bearer <token>"

# Historial con filtros: fechas, estado y paginación
curl "https://api.qbank.cl/platform/v1/payouts?from=2026-07-01&to=2026-07-08&status=failed&page=1&page_size=50" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "page": 1,
  "page_size": 50,
  "payouts": [
    {
      "payout_id": "0d4f…",
      "country": "MX",
      "currency": "MXN",
      "method": "bank_transfer",
      "local_amount": "1500.00",
      "fx_rate": "17.50",
      "usdt_amount": "85.714286",
      "fee": "0.300000",
      "total_debit": "86.014286",
      "status": "failed",
      "status_code": "core_rejected",
      "status_message": "beneficiary account does not exist",
      "created_at": "2026-07-06T20:00:00Z"
    }
  ]
}
```

`from`/`to` van en `YYYY-MM-DD` (UTC, ambos inclusive); una fecha inválida
responde `400 invalid_range`.

### Ejemplos por país

Cada corredor con su `beneficiary` exacto, el request completo y la
respuesta real. Las tasas (`fx_rate`) son ilustrativas — siempre aplican
las de tu cuenta en `GET /v1/rates`; el débito es `usdt_amount + fee`
(fijo, si está configurado; aquí `0.30`).

#### Campos del beneficiary por corredor

| País | Método | Campos del `beneficiary` |
|---|---|---|
| CL | `bank_transfer` | `name`, `tax_id` (RUT), `bank_code`, `account_type`, `account_number` |
| PE | `bank_transfer` | `name`, `account_number` (CCI de 20 dígitos) |
| PE | `yape` | `name`, `phone` (`51XXXXXXXXX`) |
| MX | `bank_transfer` | `name`, `account_type` (`clabe`/`debit_card`), `account_number` (+ `bank_code` si es tarjeta) |
| VE | `pago_movil` | `phone`, `bank_code` (SUDEBAN), `document_value` |
| VE | `bank_transfer` | `name`, `account_number` (20 dígitos), `document_value` |
| BO | `bank_transfer` | `name`, `tax_id`, `bank_code`, `account_number` |
| BR | `pix` | `name`, `tax_id`, `pix_key_type`, `pix_key` |
| PY | `bank_transfer` | `name` (≤35), `tax_id`, `bank_code`, `account_number` |

#### Chile

Transferencia bancaria en CLP. Requiere RUT, banco y cuenta:

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "CL",
    "currency": "CLP",
    "method": "bank_transfer",
    "amount": "100000",
    "beneficiary": {
      "name": "Pedro Soto Fuentes",
      "tax_id": "12.345.678-5",
      "bank_code": "012",
      "account_type": "checking",
      "account_number": "123456789"
    },
    "description": "Pago proveedor",
    "idempotency_key": "cl-prov-0091"
  }'
```

```json
{
  "payout_id": "b3e1…",
  "country": "CL",
  "currency": "CLP",
  "method": "bank_transfer",
  "local_amount": "100000",
  "fx_rate": "925.69",
  "usdt_amount": "108.027528",
  "fee": "0.300000",
  "total_debit": "108.327528",
  "status": "processing"
}
```

El catálogo de bancos (`GET /v1/payouts/banks?country=CL`) da los
`bank_code` vigentes.

#### Perú

Dos métodos: transferencia bancaria (CCI interbancario) y **Yape** (al
número de teléfono).

```bash bank_transfer (CCI)
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "PE",
    "currency": "PEN",
    "method": "bank_transfer",
    "amount": "1000.00",
    "beneficiary": {
      "name": "Rosa Álvarez Díaz",
      "account_number": "00219300123456789012"
    },
    "idempotency_key": "pe-cci-3310"
  }'
```

```bash yape (teléfono)
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "PE",
    "currency": "PEN",
    "method": "yape",
    "amount": "150.00",
    "beneficiary": {
      "name": "Luis Ramos Vega",
      "phone": "51987654321"
    },
    "idempotency_key": "pe-yape-8874"
  }'
```

```json
{
  "payout_id": "c7a2…",
  "country": "PE",
  "currency": "PEN",
  "method": "yape",
  "local_amount": "150.00",
  "fx_rate": "3.40",
  "usdt_amount": "44.117648",
  "fee": "0.300000",
  "total_debit": "44.417648",
  "status": "completed"
}
```

En `yape` el teléfono va en formato `51XXXXXXXXX` (11 dígitos con código de
país). El resultado suele ser síncrono.

#### México

SPEI en MXN, a CLABE (18 dígitos) o a tarjeta de débito:

```bash CLABE
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "MX",
    "currency": "MXN",
    "method": "bank_transfer",
    "amount": "1500.00",
    "beneficiary": {
      "name": "María López",
      "account_type": "clabe",
      "account_number": "012180001234567895"
    },
    "idempotency_key": "mx-clabe-8841"
  }'
```

```bash Tarjeta de débito
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "MX",
    "currency": "MXN",
    "method": "bank_transfer",
    "amount": "800.00",
    "beneficiary": {
      "name": "Jorge Herrera",
      "account_type": "debit_card",
      "account_number": "4152313412341234",
      "bank_code": "40012"
    },
    "idempotency_key": "mx-card-1102"
  }'
```

```json
{
  "payout_id": "0d4f…",
  "country": "MX",
  "currency": "MXN",
  "method": "bank_transfer",
  "local_amount": "1500.00",
  "fx_rate": "17.50",
  "usdt_amount": "85.714286",
  "fee": "0.300000",
  "total_debit": "86.014286",
  "status": "processing"
}
```

Con CLABE el banco destino se deriva de los primeros dígitos; con tarjeta
es obligatorio `bank_code`.

#### Venezuela

Dos métodos: **Pago Móvil** (teléfono + banco + cédula) y transferencia
bancaria (cuenta de 20 dígitos):

```bash pago_movil
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "VE",
    "currency": "VES",
    "method": "pago_movil",
    "amount": "2000.00",
    "beneficiary": {
      "phone": "04141234567",
      "bank_code": "0102",
      "document_value": "V12345678"
    },
    "idempotency_key": "ve-pm-5567"
  }'
```

```bash bank_transfer
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "VE",
    "currency": "VES",
    "method": "bank_transfer",
    "amount": "5000.00",
    "beneficiary": {
      "name": "Carmen Delgado",
      "account_number": "01020123456789012345",
      "document_value": "V87654321"
    },
    "idempotency_key": "ve-bank-7810"
  }'
```

```json
{
  "payout_id": "e9b4…",
  "country": "VE",
  "currency": "VES",
  "method": "pago_movil",
  "local_amount": "2000.00",
  "fx_rate": "666.00",
  "usdt_amount": "3.003004",
  "fee": "0.300000",
  "total_debit": "3.303004",
  "status": "completed"
}
```

`bank_code` usa códigos SUDEBAN; en `bank_transfer` puede derivarse de los
primeros 4 dígitos de la cuenta.

#### Bolivia

Transferencia ACH en BOB o USD (además del
[payout QR](#payout-qr)):

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "BO",
    "currency": "BOB",
    "method": "bank_transfer",
    "amount": "1382.00",
    "beneficiary": {
      "name": "Juan Quispe Mamani",
      "tax_id": "4567890",
      "bank_code": "1016",
      "account_number": "1234567890"
    },
    "idempotency_key": "bo-ach-2204"
  }'
```

```json
{
  "payout_id": "f2c8…",
  "country": "BO",
  "currency": "BOB",
  "method": "bank_transfer",
  "local_amount": "1382.00",
  "fx_rate": "6.91",
  "usdt_amount": "200.000000",
  "fee": "0.300000",
  "total_debit": "200.300000",
  "status": "processing"
}
```

Para USD envía `currency: "USD"` con la misma estructura.

#### Brasil

PIX por llave (además del
[QR PIX](#payout-qr)):

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "BR",
    "currency": "BRL",
    "method": "pix",
    "amount": "350.00",
    "beneficiary": {
      "name": "João da Silva",
      "tax_id": "123.456.789-09",
      "pix_key_type": "cpf",
      "pix_key": "12345678909"
    },
    "idempotency_key": "br-pix-3321"
  }'
```

```json
{
  "payout_id": "a6d1…",
  "country": "BR",
  "currency": "BRL",
  "method": "pix",
  "local_amount": "350.00",
  "fx_rate": "5.13",
  "usdt_amount": "68.226121",
  "fee": "0.300000",
  "total_debit": "68.526121",
  "status": "processing"
}
```

`pix_key_type`: `cpf`, `cnpj`, `phone`, `email` o `evp` (llave aleatoria).

#### Paraguay

Transferencia bancaria en PYG:

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "PY",
    "currency": "PYG",
    "method": "bank_transfer",
    "amount": "500000",
    "beneficiary": {
      "name": "Sofía Benítez",
      "tax_id": "4123456",
      "bank_code": "0011",
      "account_number": "600123456"
    },
    "idempotency_key": "py-bank-9917"
  }'
```

```json
{
  "payout_id": "d4e7…",
  "country": "PY",
  "currency": "PYG",
  "method": "bank_transfer",
  "local_amount": "500000",
  "fx_rate": "6055.76",
  "usdt_amount": "82.566020",
  "fee": "0.300000",
  "total_debit": "82.866020",
  "status": "processing"
}
```

`name` acepta hasta 35 caracteres en este corredor.

### Payout QR

En Bolivia (QR interoperable local) y Brasil (QR PIX) también puedes
**pagar a un QR de cobro** en dos pasos: escanear y confirmar. El escaneo
es **gratis**; solo se cobra al confirmar, igual que un payout normal (tu
tasa + fijo). Si no envías `country`/`currency`, se asume Bolivia (BOB);
para Brasil envía `country: "BR"` y `currency: "BRL"`.

```mermaid
flowchart LR
    scan["1. POST qr/scan<br/>(gratis)"] --> datos["Datos del destinatario<br/>+ provider_reference"]
    datos --> confirmaUsuario{"¿El usuario<br/>confirma?"}
    confirmaUsuario -->|"Sí"| confirm["2. POST qr/confirm<br/>(se cobra: tu tasa + fijo)"]
    confirmaUsuario -->|"No"| fin["Nada se cobró"]
    confirm --> resultado{"Resultado<br/>síncrono"}
    resultado -->|"completed"| pagado["Pagado — débito consumido"]
    resultado -->|"failed"| refund["Reembolso automático<br/>completo"]
```

#### 1. Escanea el QR (gratis)

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts/qr/scan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_payload": "<contenido del QR>",
    "currency": "BOB"
  }'
```

Devuelve los datos del destinatario para que el usuario confirme a quién le
paga:

```json
{
  "scan_id": "…",
  "provider_reference": "…",
  "beneficiary_name": "Juan Quispe",
  "destination_account": "…",
  "amount": "700.00",
  "currency": "BOB",
  "glosa": "",
  "status": "…"
}
```

#### 2. Confirma el pago (se cobra aquí)

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts/qr/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_reference": "<del scan>",
    "amount": "700.00",
    "currency": "BOB",
    "description": "Pago QR almuerzo",
    "idempotency_key": "qr-2026-07-07-a"
  }'
```

- Se debita `usdt_amount + fijo` a **tu tasa**, igual que un
  `bank_transfer`.
- El resultado es **síncrono**: la respuesta ya trae el estado final
  (`completed` o `failed` con reembolso automático) — sin esperas.
- Un mismo QR escaneado solo puede pagarse una vez; reintentos con la misma
  `idempotency_key` devuelven el payout original.
- En Brasil, `qr_payload` acepta el contenido del QR o el código
  "copia e cola" de PIX; el mismo flujo cubre QR estáticos y dinámicos.

### Errores frecuentes

| HTTP | `error` | Qué hacer |
|---|---|---|
| 400 | `idempotency_key_required` | Envía la clave en body o header |
| 400 | `beneficiary_required` | Incluye el objeto `beneficiary` |
| 402 | `insufficient_funds` | Fondea la cuenta; el payout no se creó |
| 403 | `account_blocked` | La cuenta no está activa; contacta al equipo de CBPay |
| 403 | `service_disabled` | Payouts no está habilitado para tu cuenta — ver [servicios](#servicios-habilitados) |
| 422 | `currency_not_supported` | No hay tasa FX para esa moneda |
| 422 | (payout con `status: failed`) | El corredor rechazó los datos; el débito ya fue reembolsado — corrige `beneficiary` y reintenta con clave nueva |

### Rechazo inmediato vs fallo posterior

Si el procesador rechaza el payout al crearlo, recibes `422` con el objeto
en `status: failed` y el reembolso ya aplicado. Si falla después (por
ejemplo, cuenta destino inexistente detectada por el banco), te llega el
webhook con `status: failed` y el reembolso automático en ese momento.

#### Cómo leer `status_code` en un payout fallido

| `status_code` | Significado | Acción |
|---|---|---|
| `core_rejected` | El procesador rechazó la operación al crearla (datos del beneficiario inválidos, corredor no disponible) | Lee `status_message`, corrige y crea un payout nuevo con clave nueva |
| *otro código* | Rechazo posterior del riel bancario (p. ej. cuenta destino cerrada) | Igual: corrige los datos y crea una operación nueva |
| *(vacío)* | Fallo genérico del corredor | Revisa `status_message`; si no es claro, contacta soporte con el `payout_id` |

En todos los casos el reembolso ya está aplicado — verifícalo con la
entrada `payout_refund` en
[movimientos](#movimientos-y-conciliacion).

> **Nota**
Un payout en `processing` no se puede cancelar por API: el rail ya lo tiene.
Espera el estado final por webhook o `GET` — llega siempre, con reembolso
automático si falla.


## Payins

*Cobra en moneda local y recibe el abono en USDT*

Un payin es un cobro fiat: tu cliente paga en moneda local y tu cuenta
recibe el abono en USDT automáticamente, convertido a **tu tasa de payin**
(`payin_rate` en `GET /v1/rates`) menos la comisión fija de payin si tu
cuenta la tiene configurada.

Sea cual sea la modalidad, todos los caminos terminan igual — abono
automático + webhook:

```mermaid
flowchart LR
    qr["QR de cobro<br/>(BO, BR·PIX)"] --> pago["Tu cliente paga<br/>en moneda local"]
    hosted["Página de pago hosted<br/>(CL: fintoc)"] --> pago
    anunciada["Transferencia anunciada<br/>(CL, PE, MX, PY, BR)"] --> pago
    pull["Cobro activo pull<br/>(VE: c2p, débito)"] --> pago
    clabe["Cuenta CLABE dedicada<br/>(MX)"] --> pago
    pago --> conv["Conversión FX a tu<br/>payin_rate − fee fijo"]
    conv --> credito(("Abono USDT<br/>a tu saldo"))
    credito --> wh["Webhook payin_credited"]
```

### 1. Descubre los corredores disponibles

Los países, monedas y modalidades disponibles los define CBPay.
Consúltalos siempre por catálogo:

```bash
curl https://api.qbank.cl/platform/v1/payins/methods \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    { "country": "BO", "currency": "BOB", "method": "qr", "delivery": "push" },
    { "country": "VE", "currency": "VES", "method": "c2p", "delivery": "push+polling" },
    { "country": "MX", "currency": "MXN", "method": "bank_transfer", "delivery": "push" }
  ],
  "meta": { "retrieved": 3 }
}
```

`delivery` indica cómo se confirma el pago del lado de CBPay (notificación
del banco, sondeo o ambos) — no cambia nada en tu integración: tú siempre
recibes el webhook `payin_credited`.

Corredores y modalidades de cobro:

| País | Moneda | Modalidades |
|---|---|---|
| Chile | CLP | Página de pago hosted (`fintoc`), transferencia anunciada |
| Perú | PEN | Transferencia anunciada |
| México | MXN | Cuenta CLABE dedicada, transferencia anunciada |
| Venezuela | VES | Cobro activo `c2p` y `debito_inmediato` (pull) |
| Bolivia | BOB / USD | QR de cobro |
| Paraguay | PYG | Transferencia anunciada |
| Brasil | BRL | QR PIX dinámico, transferencia anunciada |

La disponibilidad puede variar; el catálogo (`GET /v1/payins/methods`) es
siempre la fuente de verdad. En todos los casos el abono llega igual: se
convierte a USDT a tu `payin_rate` del momento y se acredita neto de la
comisión fija de payin.

### 2. Elige la modalidad y crea el cobro

Cada país tiene su propia modalidad de cobro. El request y la respuesta
real de cada una:

#### Chile

**Página de pago hosted (`fintoc`)** — recomendado: recibes una
`payment_url`; el pagador la abre y transfiere desde **cualquier banco o
billetera chilena** (Banco Estado, Santander, Mach, Tenpo, Mercado
Pago…). El pago se detecta y valida automáticamente — sin referencias
manuales.

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "CL",
    "currency": "CLP",
    "method": "fintoc",
    "amount": "150000",
    "description": "Recarga pedido 8841",
    "idempotency_key": "topup-8841"
  }'
```

Respuesta `201`:

```json
{
  "payin_id": "7a2b…",
  "status": "pending",
  "reference": "7a2b…",
  "payment_url": "https://pay.fintoc.com/plink_K2zwNNSxPyx8w3GZ",
  "expires_at": "2026-07-08T18:48:25Z",
  "note": "share the payment_url with the payer; the deposit is credited automatically once the transfer is detected"
}
```

Comparte la `payment_url` con el pagador (link, redirección o WebView).
Cuando el pago se confirma, tu cuenta se acredita en USDT y recibes el
webhook `payin_credited`. El monto CLP debe ser entero (el peso chileno no
usa decimales) y la sesión de pago vence en 24 horas por defecto. Un retry
con la misma `idempotency_key` devuelve el mismo payin y la misma URL —
nunca abre una segunda sesión de pago.

**Transferencia anunciada** (alternativa manual): anuncias el depósito
entrante y compartes la referencia con quien transfiere.

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "CL",
    "currency": "CLP",
    "method": "bank_transfer",
    "amount": "500000"
  }'
```

Respuesta `201`:

```json
{
  "payin_id": "4f81…",
  "status": "pending",
  "reference": "CBJ6T3W9M2K5",
  "note": "include the reference in the transfer description so the deposit is credited automatically"
}
```

Cuando la transferencia llega, se matchea por la referencia en la glosa (o
por monto+moneda como respaldo) y tu cuenta se acredita automáticamente.

#### Perú

**Transferencia anunciada**, igual que Chile pero en soles:

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "PE",
    "currency": "PEN",
    "method": "bank_transfer",
    "amount": "1800.00"
  }'
```

Respuesta `201`:

```json
{
  "payin_id": "6d20…",
  "status": "pending",
  "reference": "CBK7M2Q9X4T3",
  "note": "include the reference in the transfer description so the deposit is credited automatically"
}
```

La `reference` es un **código corto de 12 caracteres alfanuméricos** (cabe
en cualquier concepto bancario) y debe viajar en la descripción de la
transferencia para el match automático; como respaldo también se matchea
por monto+moneda.

#### México

**Cuenta CLABE dedicada** (recomendado): creas una CLABE fija vinculada a
tu cuenta — todo SPEI que llegue a ella se acredita automáticamente, sin
referencias:

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins/deposit-accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "country": "MX", "currency": "MXN" }'
```

Respuesta `201`:

```json
{
  "instrument_id": "a1d4…",
  "account_id": "…",
  "country": "MX",
  "currency": "MXN",
  "method": "bank_transfer",
  "instrument": "734180000151000006",
  "status": "active"
}
```

`instrument` es la CLABE que compartes con tus pagadores. La creación es
gratis; cada depósito paga la comisión de payin normal. Lista tus cuentas
con `GET /v1/payins/deposit-accounts`.

También puedes usar la **transferencia anunciada** puntual
(`POST /v1/payins` con `method: "bank_transfer"`, `country: "MX"`).

#### Venezuela

**Cobro activo (pull)**: cobras directamente al pagador con su
autorización. El resultado es **síncrono** — si el cobro se aprueba, el
abono se acredita en la misma llamada.

Para `debito_inmediato`, primero solicita el OTP (gratis):

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins/collect/otp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "debito_inmediato",
    "amount": "1200.00",
    "payer_document": "V12345678",
    "payer_phone": "04141234567",
    "payer_bank": "0102",
    "payer_account": "01020123456789012345"
  }'
```

```json
{
  "method": "debito_inmediato",
  "result": { "status": "sent", "otp_reference": "OTP-5521" }
}
```

Luego ejecuta el cobro:

```bash c2p (teléfono + cédula + OTP del pagador)
curl -X POST https://api.qbank.cl/platform/v1/payins/collect \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "c2p",
    "amount": "1200.00",
    "description": "Cobro pedido 5512",
    "payer_document": "V12345678",
    "payer_phone": "04141234567",
    "payer_bank": "0102",
    "otp": "12345678",
    "idempotency_key": "cobro-5512"
  }'
```

```bash debito_inmediato (cuenta + OTP solicitado antes)
curl -X POST https://api.qbank.cl/platform/v1/payins/collect \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "debito_inmediato",
    "amount": "1200.00",
    "description": "Cobro pedido 5512",
    "payer_document": "V12345678",
    "payer_account": "01020123456789012345",
    "payer_bank": "0102",
    "payer_account_type": "CNTA",
    "otp": "87654321",
    "otp_reference": "OTP-5521",
    "idempotency_key": "cobro-5512"
  }'
```

> **Nota**
El cobro activo ejecuta un débito real contra el pagador, así que
`idempotency_key` es **obligatoria** (body o header `Idempotency-Key`): un
reintento con la misma clave devuelve el resultado original con
`idempotency_hit` y nunca vuelve a cobrar.
Respuesta `200` (cobro aprobado y acreditado):

```json
{
  "payin_id": "7b3c…",
  "kind": "collect",
  "method": "c2p",
  "status": "credited",
  "local_amount": "1200.00",
  "fx_rate": "36.50",
  "usdt_gross": "32.876712",
  "fee": "0.300000",
  "usdt_credited": "32.576712",
  "paid": true,
  "provider_reference": "…"
}
```

Si el pagador rechaza o falla la autorización, `paid` es `false`, el payin
queda `failed` y no se cobra nada.

#### Bolivia

**QR de cobro** (estándar interoperable local): generas el QR y tu cliente
lo escanea con su app bancaria.

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "BO",
    "currency": "BOB",
    "method": "qr",
    "amount": "700.00",
    "description": "Recarga app",
    "expires_in": 3600
  }'
```

Respuesta `201`:

```json
{
  "payin_id": "9c2a…",
  "status": "pending",
  "charge": {
    "charge_id": "…",
    "qr_image": "<base64>",
    "qr_payload": "<contenido del QR>",
    "our_reference": "482915073",
    "status": "pending"
  }
}
```

Muestra `qr_image` a tu cliente; cuando paga, tu cuenta se acredita
automáticamente. También funciona en USD (`currency: "USD"`).

#### Paraguay

**Transferencia anunciada** en guaraníes: anuncias el depósito, tu pagador
transfiere (SIPAP interbancaria o transferencia interna del banco receptor)
con la referencia en el concepto, y el abono se detecta automáticamente.

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "PY",
    "currency": "PYG",
    "method": "bank_transfer",
    "amount": "596000"
  }'
```

Respuesta `201`:

```json
{
  "payin_id": "8f41…",
  "status": "pending",
  "reference": "CBW4N8R2T6P9",
  "note": "include the reference in the transfer description so the deposit is credited automatically"
}
```

> **Nota**
Los guaraníes no usan decimales: anuncia el monto **entero exacto** que
transferirá tu pagador (ej. `"596000"`). La `reference` es un código corto
de 12 caracteres alfanuméricos — diseñado para el concepto SIPAP, que
acepta **máximo 20 caracteres sin caracteres especiales** — y ponerla en
el concepto asegura el match automático; como respaldo también se matchea
por monto+moneda.
#### Brasil

**QR PIX dinámico**: el mismo endpoint genera un QR PIX con el monto
embebido.

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "BR",
    "currency": "BRL",
    "method": "qr",
    "amount": "120.00",
    "description": "Pedido 7719",
    "expires_in": 1800
  }'
```

En la respuesta, `charge.qr_payload` es el código **"copia e cola"** de
PIX, para que el pagador pueda pegarlo en su app bancaria si no escanea la
imagen (`charge.qr_image`).

También puedes usar la **transferencia anunciada** compartiendo la
referencia en la descripción del PIX:

```bash
curl -X POST https://api.qbank.cl/platform/v1/payins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "BR",
    "currency": "BRL",
    "method": "bank_transfer",
    "amount": "350.00"
  }'
```

Respuesta `201`:

```json
{
  "payin_id": "b1a7…",
  "status": "pending",
  "reference": "CBQ8H4X7N3R6",
  "note": "include the reference in the transfer description so the deposit is credited automatically"
}
```

### 3. Recibe el abono

Cuando el pago llega (por cualquiera de las modalidades), tu cuenta se
acredita automáticamente y se emite el webhook `payin_credited`:

```json
{
  "payin_id": "9c2a…",
  "account_id": "…",
  "country": "BO",
  "currency": "BOB",
  "local_amount": "700.00",
  "fx_rate": "6.91",
  "usdt_credited": "100.302460",
  "fee": "1.000000"
}
```

`fx_rate` es tu `payin_rate` del momento del abono — la conversión se hace
exactamente a esa tasa: `usdt_gross = 700.00 / 6.91`.

El objeto payin queda con el detalle completo:

```bash
curl https://api.qbank.cl/platform/v1/payins/9c2a… \
  -H "Authorization: Bearer <token>"
```

```json
{
  "payin_id": "9c2a…",
  "kind": "qr",
  "status": "credited",
  "local_amount": "700.00",
  "fx_rate": "6.91",
  "usdt_gross": "101.302460",
  "fee": "1.000000",
  "usdt_credited": "100.302460"
}
```

### Estados

| Estado | Significado |
|---|---|
| `pending` | Cargo creado, esperando el pago |
| `credited` | Pago recibido y abonado en USDT |
| `unassigned` | Depósito recibido sin match automático (lo asigna el administrador) |
| `expired` | El cargo venció sin pago |
| `failed` | El cobro falló |

> **Nota**
Los depósitos que llegan por transferencia directa sin referencia clara
quedan `unassigned` hasta que el equipo de CBPay los asigna a una cuenta.
Al asignarse, se acreditan con la tasa y comisiones de la cuenta destino.
### Consulta e historial

```bash
# Un payin
curl https://api.qbank.cl/platform/v1/payins/9c2a… \
  -H "Authorization: Bearer <token>"

# Historial con filtros
curl "https://api.qbank.cl/platform/v1/payins?from=2026-07-01&to=2026-07-08&status=credited&page_size=50" \
  -H "Authorization: Bearer <token>"
```

`from`/`to` van en `YYYY-MM-DD` (UTC); fecha inválida responde
`400 invalid_range`.

### Errores frecuentes

| HTTP | `error` | Qué hacer |
|---|---|---|
| 400 | `invalid_request` | Revisa `method` (qr, bank_transfer, fintoc; collect va en su endpoint) |
| 400 | `idempotency_key_required` | El collect exige clave de idempotencia (débito real al pagador) |
| 403 | `service_disabled` | Payins no está habilitado para tu cuenta — ver [servicios](#servicios-habilitados) |
| 422 | `core_rejected` | El procesador rechazó el cargo; revisa el mensaje |
| 502 | `core_unavailable` | No se pudo crear el cargo; reintenta la creación (no se cobró nada) |


## Transferencias internas

*Mueve USDT, USDC, BTC o GOLD entre cuentas CBPay, gratis y al instante*

Las transferencias internas mueven saldo entre dos cuentas **CBPay**, de
forma atómica en el ledger y **siempre sin comisión** — el dinero nunca sale
del ecosistema. Funcionan con las cuatro monedas (`USDT`, `USDC`, `BTC`,
`GOLD`) y siempre **entre saldos de la misma moneda**: el `asset` que envías
es el `asset` que recibe el destino, sin conversión.

```mermaid
sequenceDiagram
    participant A as Cuenta origen
    participant CB as CBPay (ledger)
    participant B as Cuenta destino
    A->>CB: POST /v1/transfers (idempotency_key)
    CB->>CB: Movimiento atómico:<br/>transfer_out (A) + transfer_in (B)
    CB-->>A: 201 completed (síncrono)
    CB-->>B: Webhook transfer_received
```

Funcionan entre **cualquier combinación de cuentas**:

| Origen | Destino | Comisión |
|---|---|---|
| Persona | Persona | 0 |
| Persona | Empresa | 0 |
| Empresa | Persona | 0 |
| Empresa | Empresa | 0 |

### Crear una transferencia

El destino se identifica por `to_account_id`, `to_email`, **`to_phone`**
(teléfono verificado) o **`to_contact_id`** (un
[contacto](#contactos) de tu libreta):

```bash Por teléfono (verificado)
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+56987654321",
    "amount": "25.000000",
    "description": "Almuerzo",
    "idempotency_key": "alm-2026-07-10-a"
  }'
```

```bash Por contacto
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_contact_id": "3f8a1b2c-…",
    "amount": "10.000000",
    "idempotency_key": "t-991"
  }'
```

```bash Por email (persona → persona)
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "carlos@ejemplo.com",
    "amount": "25.000000",
    "description": "Split de gastos",
    "idempotency_key": "split-2026-07-06-a"
  }'
```

```bash Por account_id (persona → empresa)
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_account_id": "ae8cf540-22a9-414d-82cc-8ac04732be4f",
    "amount": "120.500000",
    "description": "Pago servicio mensual",
    "idempotency_key": "serv-2026-07-a"
  }'
```

```bash Empresa → persona (nómina)
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token de la empresa>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "empleado@ejemplo.com",
    "amount": "850.000000",
    "description": "Sueldo julio",
    "idempotency_key": "nomina-2026-07-emp01"
  }'
```

```bash En otra moneda (GOLD, gramos de oro)
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "carlos@ejemplo.com",
    "asset": "GOLD",
    "amount": "2.500000",
    "description": "Regalo en oro",
    "idempotency_key": "oro-2026-07-09-a"
  }'
```

La forma del request es idéntica en todas las combinaciones (persona o
empresa, en cualquier dirección) — cambia solo la credencial que llama.
`asset` es opcional y por defecto `USDT`; acepta `USDT`, `USDC`, `BTC` o
`GOLD` y el destino recibe **en esa misma moneda**.

Respuesta `201` — la transferencia es **síncrona e inmediata**:

```json
{
  "transfer_id": "77b1…",
  "from_account_id": "…",
  "to_account_id": "…",
  "asset": "USDT",
  "amount": "25.000000",
  "description": "Split de gastos",
  "status": "completed",
  "created_at": "2026-07-06T20:10:00Z"
}
```

Replay con la misma `idempotency_key` — `200` con la transferencia
original:

```json
{
  "transfer_id": "77b1…",
  "amount": "25.000000",
  "status": "completed",
  "idempotency_hit": true
}
```

El receptor puede enterarse por el webhook `transfer_received` y ambos ven
el movimiento en su historial (`transfer_out` / `transfer_in`).

> **Nota**
Cada transferencia guarda al destinatario como [contacto](#contactos)
automáticamente (envía `"save_contact": false` para no guardarlo). Por
seguridad, `to_phone` solo resuelve cuentas con el teléfono **verificado
por OTP**; si más de una cuenta comparte el número responde
`422 recipient_ambiguous`.
### Consultar transferencias

Lista las transferencias de tu cuenta (enviadas y recibidas), con
paginación y filtros de fecha:

```bash
curl "https://api.qbank.cl/platform/v1/transfers?from=2026-07-01&to=2026-07-07&page_size=50" \
  -H "Authorization: Bearer <token>"
```

O una en particular por su ID (solo visible para las dos partes):

```bash
curl https://api.qbank.cl/platform/v1/transfers/77b1… \
  -H "Authorization: Bearer <token>"
```

Cada fila trae `direction` (`sent` o `received`) desde tu perspectiva.

### Reglas

- Solo entre cuentas CBPay **activas**; las cuentas internas del sistema no
  pueden recibir.
- Siempre **misma moneda en origen y destino**: no hay conversión entre
  saldos (`USDT`→`USDT`, `GOLD`→`GOLD`, …).
- No puedes transferirte a ti mismo (`400 self_transfer`).
- Requiere `idempotency_key` (body o header `Idempotency-Key`); el replay
  devuelve `200` con `idempotency_hit: true`.
- `amount` acepta hasta los decimales de la moneda: 6 para `USDT`/`USDC`/
  `GOLD`, 8 para `BTC`.

### Errores

| HTTP | `error` | Causa |
|---|---|---|
| 400 | `recipient_required` | Falta `to_account_id`, `to_email`, `to_phone` y `to_contact_id` |
| 400 | `invalid_amount` | Monto inválido, demasiados decimales o `asset` no soportado |
| 400 | `invalid_phone` | `to_phone` no se pudo normalizar a E.164 |
| 400 | `self_transfer` | Origen y destino son la misma cuenta |
| 402 | `insufficient_funds` | Saldo disponible insuficiente en esa moneda |
| 404 | `recipient_not_found` | El email/ID no corresponde a una cuenta CBPay, o ningún teléfono verificado coincide |
| 422 | `recipient_ambiguous` | Más de una cuenta comparte ese teléfono (usa `to_account_id` o `to_email`) |
| 422 | `contact_not_linked` | El contacto no tiene cuenta CBPay asociada |
| 422 | `recipient_unavailable` | La cuenta destino está bloqueada/cerrada |


## Contactos

*Libreta de contactos: se llena sola con cada envío, importa la agenda del celular, descubre quién tiene CBPay y permite enviar plata por teléfono*

La **libreta de contactos** elimina el tipeo repetido de datos: cada envío
(transferencia interna, payout fiat o retiro crypto) guarda el destino como
contacto automáticamente, puedes **importar la agenda del celular** para
descubrir quién de tus contactos tiene CBPay, y las transferencias aceptan
directamente un **número de teléfono** o un `contact_id` como destino.

```mermaid
flowchart LR
    envio["Cualquier envío<br/>(transfer / payout / crypto)"] -->|"auto-guardado"| contacto["Contacto + destinos<br/>reutilizables"]
    agenda["POST /v1/contacts/import<br/>(agenda del celular)"] --> contacto
    contacto -->|"has_cbpay: true"| cbpay["Tiene CBPay"]
    contacto -->|"contact_id"| envio2["Envío rápido"]
    fono["to_phone (verificado)"] --> envio2
```

### Los contactos se crean solos

Cada envío guarda su destino en tu libreta (deduplicado: repetir el mismo
destino no crea contactos duplicados, solo lo marca como usado):

| Envío | Qué se guarda |
|---|---|
| Transferencia interna | La cuenta CBPay destino (nombre, email y su teléfono si está verificado) |
| Payout fiat | El beneficiario completo (banco, cuenta, documento…) por país y método |
| Retiro crypto | La dirección por red (nómbrala con `contact_name` en el retiro) |

¿No quieres guardar un destino puntual? Agrega `"save_contact": false` al
body del envío. El auto-guardado jamás afecta el envío: si algo falla, el
envío sale igual.

### Importar la agenda del celular

Sube los contactos del teléfono (hasta **1.000 por request**; pagina si hay
más) y CBPay te dice **quién ya tiene cuenta** — el match es por número de
teléfono y solo contra cuentas del mismo operador:

```bash
curl -X POST https://api.qbank.cl/platform/v1/contacts/import \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      { "name": "Carlos Soto", "phones": ["+56 9 8765 4321"] },
      { "name": "Ana Pérez", "phones": ["912345678"] },
      { "name": "Tía Rosa", "phones": ["no-es-numero"] }
    ]
  }'
```

Respuesta `200`:

```json
{
  "imported": 2,
  "matched": 1,
  "total": 3,
  "contacts": [
    { "name": "Carlos Soto", "phone": "+56987654321", "contact_id": "3f8a…", "has_cbpay": true },
    { "name": "Ana Pérez", "phone": "+56912345678", "contact_id": "9c1d…", "has_cbpay": false },
    { "name": "Tía Rosa", "skipped": true, "reason": "no_valid_phone" }
  ]
}
```

- Los números se normalizan a **E.164** solos: acepta `+…`, `00…` y números
  locales (se les antepone el país de tu cuenta). Los inválidos se saltan.
- Re-importar es seguro: los contactos existentes no se duplican.
- `has_cbpay: true` significa que ese teléfono corresponde a una cuenta
  activa del mismo operador — puedes transferirle al instante.

### Enviar plata por teléfono

Las transferencias internas aceptan `to_phone` (además de `to_account_id`,
`to_email` y `to_contact_id`):

```bash
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+56987654321",
    "amount": "25.000000",
    "description": "Almuerzo",
    "idempotency_key": "alm-2026-07-10"
  }'
```

> **Importante**
Por seguridad, `to_phone` solo resuelve cuentas con el teléfono
**verificado por OTP** (jamás adivinamos un destino de dinero con un número
sin verificar). Si el número no está verificado: `404 recipient_not_found`;
si más de una cuenta comparte el número: `422 recipient_ambiguous` (usa
`to_account_id` o `to_email`).
### Enviar a un contacto

Cualquier envío acepta el contacto directo:

```bash Transferencia (contacto con CBPay)
curl -X POST https://api.qbank.cl/platform/v1/transfers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "to_contact_id": "3f8a…", "amount": "10.000000", "idempotency_key": "t-991" }'
```

```bash Payout (beneficiario guardado)
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "CL", "currency": "CLP", "amount": "45000",
    "beneficiary_contact_id": "7b2c…",
    "idempotency_key": "pago-arriendo-07"
  }'
```

```bash Retiro crypto (dirección guardada)
curl -X POST https://api.qbank.cl/platform/v1/crypto/withdrawals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "chain": "tron", "to_contact_id": "5d4e…", "amount": "100.000000", "idempotency_key": "w-2211" }'
```

- **Payouts**: usa el beneficiario guardado más reciente del contacto para
  ese país (y método si lo envías; si no, se usa el del destino guardado).
  Un `beneficiary` explícito en el body siempre gana. Sin destino guardado
  para ese corredor: `422 no_saved_destination`.
- **Crypto**: usa la dirección guardada para esa `chain`; un `to_address`
  explícito gana.
- **Transfers**: usa la cuenta CBPay enlazada del contacto; si el contacto
  solo tiene teléfono, se intenta por su número (verificado). Contacto sin
  ninguno: `422 contact_not_linked`.

### Administrar la libreta

```bash
# Listado con búsqueda y filtros
curl "https://api.qbank.cl/platform/v1/contacts?q=carlos&has_cbpay=true&page=1&page_size=50" \
  -H "Authorization: Bearer <token>"

# Crear a mano
curl -X POST https://api.qbank.cl/platform/v1/contacts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "display_name": "Carlos Soto", "phone": "+56987654321", "email": "carlos@mail.com", "favorite": true }'

# Detalle (incluye los destinos guardados)
curl https://api.qbank.cl/platform/v1/contacts/{contact_id} \
  -H "Authorization: Bearer <token>"

# Editar / borrar
curl -X PATCH https://api.qbank.cl/platform/v1/contacts/{contact_id} \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "alias": "Carlitos", "favorite": true }'
curl -X DELETE https://api.qbank.cl/platform/v1/contacts/{contact_id} \
  -H "Authorization: Bearer <token>"
```

Detalle de un contacto (`200`):

```json
{
  "contact_id": "3f8a1b2c-…",
  "display_name": "Carlos Soto",
  "alias": "Carlitos",
  "phone": "+56987654321",
  "email": "carlos@mail.com",
  "has_cbpay": true,
  "cbpay_account_id": "389d34a3-…",
  "source": "import",
  "favorite": true,
  "destinations": [
    { "destination_id": "aa11…", "type": "cbpay", "last_used_at": "2026-07-10T15:00:00Z", "created_at": "2026-07-08T10:00:00Z" },
    { "destination_id": "bb22…", "type": "payout", "country": "CL", "currency": "CLP", "method": "bank_transfer",
      "details": { "name": "Carlos Soto", "tax_id": "12.345.678-5", "bank_code": "012", "account_type": "checking", "account_number": "123456789" },
      "last_used_at": "2026-07-09T18:30:00Z", "created_at": "2026-07-09T18:30:00Z" },
    { "destination_id": "cc33…", "type": "crypto", "chain": "tron", "address": "TVJ6njG5Fyrq6XwYok3xPQx8kR7HQx6vXk",
      "last_used_at": "2026-07-07T12:00:00Z", "created_at": "2026-07-07T12:00:00Z" }
  ],
  "created_at": "2026-07-07T12:00:00Z",
  "updated_at": "2026-07-10T15:00:00Z"
}
```

También puedes agregar destinos a mano (`POST
/v1/contacts/{id}/destinations` con `type: payout|crypto|cbpay` y sus
campos) y borrarlos (`DELETE .../destinations/{destination_id}`).

### Errores

| HTTP | `error` | Causa | Solución |
|---|---|---|---|
| 400 | `invalid_phone` | El teléfono no se pudo normalizar a E.164 | Envíalo como `+<país><número>` |
| 400 | `batch_too_large` | Import con más de 1.000 contactos | Pagina la subida |
| 404 | `not_found` | El contacto/destino no existe o no es tuyo | Verifica el id |
| 404 | `recipient_not_found` | Ningún teléfono verificado coincide | Pide al destinatario verificar su teléfono, o usa email/account_id |
| 409 | `duplicate` | Ya tienes un contacto con ese teléfono/email | Edita el existente |
| 422 | `recipient_ambiguous` | Más de una cuenta comparte el teléfono | Usa `to_account_id` o `to_email` |
| 422 | `contact_not_linked` | El contacto no tiene cuenta CBPay asociada | Transfiérele por otro medio o hazle un payout |
| 422 | `no_saved_destination` | El contacto no tiene destino guardado para ese corredor/chain | Envía el `beneficiary`/`to_address` explícito (quedará guardado) |

### Preguntas frecuentes

#### ¿El destinatario se entera de que lo tengo como contacto?
No. La libreta es privada de tu cuenta: importar la agenda o guardar
contactos no notifica a nadie ni comparte tus datos. Solo tú ves tu libreta.
#### ¿Por qué un contacto que sé que tiene CBPay aparece has_cbpay: false?
El match es por número de teléfono exacto (E.164) contra cuentas del mismo
operador. Si esa persona registró otro número (o ninguno) en su cuenta, no
hay match. En cuanto registre y verifique ese teléfono, un re-import lo
detecta.
#### ¿Puedo transferirle a un contacto con has_cbpay: false?
No por transferencia interna (no hay cuenta a la cual abonar). Pero puedes
hacerle un payout fiat a su cuenta bancaria o un envío crypto a su wallet —
y esos destinos también quedan guardados en el contacto.
#### ¿Qué pasa si dos personas de mi org tienen el mismo número?
El envío por teléfono falla explícito con 422 recipient_ambiguous — nunca
adivinamos un destino de dinero. Usa to_account_id o to_email en ese caso.
#### ¿El import me puede servir para saber si un número cualquiera tiene CBPay?
El match es solo contra cuentas de tu mismo operador, con un cap de 1.000
contactos por request y bajo el rate limit global de la API. No expone
datos de la cuenta matcheada más allá del hecho de existir (necesario para
poder transferirle).


## Crypto: wallets, depósitos y retiros

*Crea wallets on-chain, deposita, transfiere y consulta movimientos*

Tus saldos stablecoin viven conectados a la blockchain. Combinaciones
soportadas:

| Red | Activo | Saldo que acredita |
|---|---|---|
| `tron` | `usdt` | USDT |
| `eth` | `usdt` | USDT |
| `eth` | `usdc` | USDC |

Cada depósito acredita el **saldo de su propio activo** (una wallet USDC
abona tu saldo USDC). `BTC` y `GOLD` son saldos sin riel on-chain: se
mueven solo por transferencias internas y abonos del operador.

```mermaid
flowchart LR
    subgraph entrada [Depositar]
        wallet["Tu wallet CBPay<br/>(dirección estable)"] --> confirmado["Confirmación<br/>on-chain"]
        confirmado --> abono["Abono automático<br/>− fee funding"]
    end
    abono --> saldo(("Saldo del activo<br/>(USDT o USDC)"))
    subgraph salida [Retirar]
        saldo --> retiro["POST /v1/crypto/withdrawals<br/>debita amount + fee"]
        retiro --> onchain{"Resultado<br/>on-chain"}
        onchain -->|"completed"| txid["tx_id = tu comprobante"]
        onchain -->|"failed"| refund["Reembolso automático<br/>completo"]
    end
```

Las wallets son **puertas de entrada**: puedes tener varias (empresas), pero
el saldo de la cuenta es uno solo.

| Tipo de cuenta | Wallets por red |
|---|---|
| Persona | **1** |
| Empresa | **Ilimitadas** (usa `label` para distinguirlas) |

### Crear una wallet

```bash Persona (1 por red)
curl -X POST https://api.qbank.cl/platform/v1/crypto/wallets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "chain": "tron" }'
```

```bash Empresa (con label, ilimitadas)
curl -X POST https://api.qbank.cl/platform/v1/crypto/wallets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "tron",
    "label": "Tesorería principal"
  }'
```

```bash Empresa, red Ethereum
curl -X POST https://api.qbank.cl/platform/v1/crypto/wallets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "eth",
    "label": "Cobros e-commerce"
  }'
```

```bash Wallet USDC (solo Ethereum)
curl -X POST https://api.qbank.cl/platform/v1/crypto/wallets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "eth",
    "asset": "usdc",
    "label": "Tesorería USDC"
  }'
```

`asset` es opcional y por defecto `usdt`. El límite de una wallet por red
para personas es por combinación red+activo: una persona puede tener su
wallet `eth`/`usdt` **y** su wallet `eth`/`usdc`.

Respuesta `201`:

```json
{
  "wallet_id": "b7e3…",
  "chain": "tron",
  "asset": "USDT",
  "address": "TQmZ…",
  "label": "Tesorería principal",
  "created_at": "2026-07-07T12:00:00Z",
  "creation_fee": "1.000000"
}
```

Si una persona intenta una segunda wallet en la misma red — `422`:

```json
{
  "error": "wallet_limit_reached",
  "message": "person accounts can hold one wallet per network"
}
```

- Cada creación tiene un **costo fijo** (`wallet_creation`) configurado por
  CBPay — puede diferenciarse para personas y empresas, e incluso por
  cuenta. Con comisión 0 (el default) es gratis. Si la creación falla, el
  cargo se reembolsa automáticamente.
- Una **persona** que ya tiene wallet en esa red recibe
  `422 wallet_limit_reached`; las **empresas** pueden crear tantas como
  necesiten (una por proveedor, por sucursal, por producto…). Todas las
  diferencias persona/empresa están en
  [personas y empresas](#personas-y-empresas).
- `label` es opcional y solo descriptivo.

### Ver mis wallets

```bash
curl https://api.qbank.cl/platform/v1/crypto/wallets \
  -H "Authorization: Bearer <token>"
```

```json
{
  "wallets": [
    {
      "wallet_id": "b7e3…",
      "chain": "tron",
      "asset": "USDT",
      "address": "TQmZ…",
      "label": "Tesorería principal",
      "created_at": "2026-07-07T12:00:00Z"
    },
    {
      "wallet_id": "a1c9…",
      "chain": "eth",
      "asset": "USDT",
      "address": "0x8f3B…",
      "label": "Cobros e-commerce",
      "created_at": "2026-07-07T12:05:00Z"
    }
  ]
}
```

### Depositar

Envía el activo de la wallet a su dirección, **por la red correcta**.
Cuando el depósito se confirma on-chain, el saldo de ese activo se acredita
automáticamente (neto de la comisión de `funding` si CBPay la configuró) y
se emite el webhook `crypto_deposit_credited`:

```json
{
  "account_id": "…",
  "chain": "tron",
  "asset": "USDT",
  "tx_id": "b1946ac9…",
  "amount": "499.000000",
  "fee": "1.000000"
}
```

> **Importante**
Envía **solo el activo de la wallet y por su red** (USDT a una wallet
USDT, USDC a una wallet USDC). Las direcciones son tuyas y estables:
puedes reutilizarlas para todos tus depósitos.
#### Tiempos de confirmación

| Red | Detección | Abono (confirmación de la red) |
|---|---|---|
| TRON | Casi inmediata | **~1 minuto** (19 confirmaciones) |
| Ethereum | Casi inmediata | **Algunos minutos** según congestión |

El abono siempre llega con el webhook y el `tx_id` para verificarlo en el
explorador de la red.

### Transferir (retiros on-chain)

Envía USDT o USDC desde su saldo a cualquier dirección externa (`asset`
opcional, default `USDT`; USDC solo por `eth`):

```bash USDT por TRON
curl -X POST https://api.qbank.cl/platform/v1/crypto/withdrawals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "tron",
    "to_address": "TVJ6…",
    "amount": "100.000000",
    "idempotency_key": "retiro-2026-07-07-b"
  }'
```

```bash USDC por Ethereum
curl -X POST https://api.qbank.cl/platform/v1/crypto/withdrawals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "eth",
    "asset": "USDC",
    "to_address": "0x8f3B…",
    "amount": "50.000000",
    "idempotency_key": "retiro-usdc-2026-07-09-a"
  }'
```

Respuesta `202` — se debita `amount + fee` y la transacción se transmite:

```json
{
  "withdrawal_id": "5e8c…",
  "chain": "tron",
  "asset": "USDT",
  "to_address": "TVJ6…",
  "amount": "100.000000",
  "fee": "1.000000",
  "total_debit": "101.000000",
  "status": "processing",
  "tx_id": "…"
}
```

> **Nota**
Cada retiro guarda la dirección como [contacto](#contactos)
automáticamente — nómbralo con `"contact_name"` en el body, o desactívalo
con `"save_contact": false`. Para repetir un envío, usa
`"to_contact_id"` en vez de `to_address` (se usa la dirección guardada del
contacto para esa `chain`).
El estado final llega por el webhook `crypto_withdrawal_status_changed`:
**`completed`** (el `tx_id` es tu comprobante) o **`failed`** (se reembolsa
el débito completo).

También puedes consultar el retiro en cualquier momento:

```bash
curl https://api.qbank.cl/platform/v1/crypto/withdrawals/5e8c… \
  -H "Authorization: Bearer <token>"
```

```json
{
  "withdrawal_id": "5e8c…",
  "chain": "tron",
  "asset": "USDT",
  "to_address": "TVJ6…",
  "amount": "100.000000",
  "fee": "1.000000",
  "total_debit": "101.000000",
  "status": "completed",
  "status_code": "confirmed",
  "status_message": "confirmed on-chain",
  "tx_id": "7d1f…"
}
```

> **Nota**
Para mover saldo a **otra cuenta CBPay** no uses la blockchain: las
[transferencias internas](#transferencias-internas) son instantáneas y
gratis.
### Movimientos

```bash
# Actividad on-chain: depósitos + retiros, con tx_id y filtros de fecha
curl "https://api.qbank.cl/platform/v1/crypto/transactions?from=2026-07-01&to=2026-07-08" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "page": 1,
  "page_size": 50,
  "deposits": [
    {
      "chain": "tron",
      "asset": "USDT",
      "tx_id": "b1946ac9…",
      "from_address": "TX9a…",
      "amount": "499.000000",
      "reference": "dep_8813…",
      "created_at": "2026-07-07T12:10:00Z"
    }
  ],
  "withdrawals": [
    {
      "withdrawal_id": "5e8c…",
      "chain": "tron",
      "asset": "USDT",
      "to_address": "TVJ6…",
      "amount": "100.000000",
      "fee": "1.000000",
      "total_debit": "101.000000",
      "status": "completed",
      "tx_id": "7d1f…",
      "created_at": "2026-07-07T15:00:00Z"
    }
  ]
}
```

```bash
# Saldo actual (available + held)
curl https://api.qbank.cl/platform/v1/balances \
  -H "Authorization: Bearer <token>"

# Historial contable completo (funding, retiros, comisiones de wallet…)
curl "https://api.qbank.cl/platform/v1/movements?type=funding&from=2026-07-01&to=2026-07-08" \
  -H "Authorization: Bearer <token>"
```

Cada depósito acredita el **saldo del activo de su wallet** (USDT o USDC);
las wallets son puertas de entrada, el saldo por moneda es uno solo.

### Errores

| HTTP | `error` | Causa |
|---|---|---|
| 400 | `invalid_chain` | Red no soportada (usa `tron` o `eth`) |
| 400 | `invalid_asset` | Combinación red/activo sin riel on-chain (soportadas: `tron`/`usdt`, `eth`/`usdt`, `eth`/`usdc` — `BTC` y `GOLD` no operan on-chain) |
| 400 | `to_address_required` | Falta la dirección destino del retiro |
| 402 | `insufficient_funds` | Saldo insuficiente en ese activo (para el retiro o la comisión de creación) |
| 422 | `wallet_limit_reached` | Una persona intentó crear una segunda wallet para la misma red+activo |
| 422 | (retiro con `status: failed`) | Rechazado al transmitir; débito reembolsado |
| 503 | `withdrawals_unavailable` | Retiros no habilitados aún para este corredor |


## Tarjetas: virtuales y físicas

*Emite tarjetas que gastan directo de cualquier saldo de la cuenta (USDT, USDC, BTC o GOLD), con límites por tarjeta*

Las tarjetas CBPay gastan **Just-In-Time del saldo central de la cuenta**:
no hay que prefondearlas ni moverles saldo. Cada tarjeta elige desde qué
saldo gasta (`spending_asset`: **USDT, USDC, BTC o GOLD**). USDT/USDC van
1:1 con el USD; BTC y GOLD se convierten **al precio del momento de cada
evento**. Cada compra se autoriza en tiempo real contra el saldo disponible
de ese asset y los límites propios de la tarjeta, y el débito queda de
inmediato en el historial de movimientos.

```mermaid
flowchart LR
    compra["Compra en comercio<br/>(POS / e-commerce / ATM)"] --> red["Red de tarjetas"]
    red --> jit{"Autorización JIT<br/>en tiempo real"}
    jit -->|"saldo y límites OK"| debito["Débito en el saldo elegido<br/>+ hold"]
    jit -->|"insuficiente / límite /<br/>congelada / sin precio"| rechazo["Compra rechazada<br/>(razón auditada)"]
    debito --> liquidacion{"Liquidación<br/>(1-2 días)"}
    liquidacion -->|"confirmada"| settle["Hold consumido<br/>(BTC/GOLD: re-cotizado al momento)"]
    liquidacion -->|"anulada"| refund["Fondos devueltos<br/>al mismo saldo"]
```

### Cuántas tarjetas puedes tener

| Tipo de cuenta | Virtuales | Físicas | ¿Para terceros? |
|---|---|---|---|
| Persona | **1** | **1** | No |
| Empresa | **Ilimitadas** | **Ilimitadas** | Sí: personas designadas (ej. empleados) |

Cada tarjeta gasta del **saldo central de la cuenta en el asset que tenga
configurado** (`spending_asset`, USDT por defecto). El control fino es por
límites de gasto de cada tarjeta (por transacción, diario, mensual), que
siempre se miden en **USD** y puedes cambiar en cualquier momento.

### Elegir el saldo de gasto (USDT, USDC, BTC o GOLD)

Define `spending_asset` al crear la tarjeta o cámbialo después con `PATCH`.
Solo afecta compras futuras: las autorizaciones en vuelo conservan el asset
con el que se debitaron (y su anulación devuelve ese mismo asset).

```bash
curl -X PATCH https://api.qbank.cl/platform/v1/cards/{card_id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "spending_asset": "BTC" }'
```

**USDT y USDC** valen 1 USD, así que la conversión es exacta 1:1 y sin
comisión de cambio: una compra de 25.00 USD debita 25.000000 del asset
elegido.

**BTC y GOLD** se convierten con el precio efectivo del momento de cada
evento (el mismo precio de settlement que ves en `GET /v1/rates`, bloque
`settlement`):

- **Autorización**: se reserva el equivalente de la compra en tu asset
  **más un pequeño colchón** (no es un cobro: cubre la variación del precio
  hasta la liquidación y se devuelve al capturar). Si el precio de
  ejecución no está disponible en ese momento, la compra se **declina**
  (`pricing_unavailable`) — nunca se convierte con un precio no confiable.
- **Liquidación (captura)**: el monto final se re-convierte al precio del
  momento de la captura; el sobrante del colchón vuelve a tu saldo (o se
  debita la diferencia si el precio se movió más que el colchón).
- **Anulación de una autorización**: se devuelve el monto EXACTO reservado,
  sin conversión.
- **Devoluciones y ajustes posteriores a la captura**: se re-convierten al
  precio del momento del evento. Entre la compra y la devolución el precio
  puede variar — recibes el equivalente en tu asset al precio de ese
  momento, no la cantidad original.
- Las compras BTC/GOLD comparten los **límites de assets volátiles** de tu
  cuenta (por operación y volumen 24 h, visibles en `GET /v1/settlement`).

| Error / rechazo | Dónde | Causa | Solución |
|---|---|---|---|
| `spending_asset_unavailable` | 400 en PATCH / rechazo de compra | El asset no existe o no está habilitado para compras | Usa `USDT`, `USDC`, `BTC` o `GOLD` |
| `settlement_asset_disabled` | 400 en PATCH | Tu operador deshabilitó ese asset | Consulta `GET /v1/settlement` (`enabled_assets`) |
| `pricing_unavailable` | Rechazo de compra (BTC/GOLD) | Precio de ejecución no disponible al autorizar | Reintenta la compra; si persiste, cambia a USDT/USDC |
| `settlement_limit_exceeded` | Rechazo de compra (BTC/GOLD) | La compra excede el límite por operación de assets volátiles | Compra menor o gasta desde USDT/USDC |
| `settlement_daily_limit_exceeded` | Rechazo de compra (BTC/GOLD) | Se alcanzó el volumen 24 h de assets volátiles de la cuenta | Espera o gasta desde USDT/USDC |

> **Nota**
Si el saldo del asset elegido no alcanza, la compra se rechaza con
`insufficient_funds` — no hay fallback automático a otro saldo.
> **Importante**
Con BTC/GOLD tu saldo queda expuesto a la variación del precio entre los
eventos de una compra (autorización, captura, devolución). Cada conversión
usa el precio efectivo del momento — CBPay nunca re-cotiza montos hacia
atrás ni te descuenta "por si acaso": el colchón de la autorización se
devuelve siempre al liquidar.
### Costos (configurados por tu operador, pueden ser 0)

| Servicio | Cuándo se cobra |
|---|---|
| `card_creation_virtual` | Al emitir una tarjeta virtual |
| `card_creation_physical` | Al emitir una tarjeta física |
| `card_monthly` | Mensualidad por tarjeta activa (si no hay saldo, la tarjeta se congela — sin deuda) |
| `card_cancellation` | Al cancelar una tarjeta |

Los montos exactos se consultan en `GET /v1/rates` (campo `fees`). Todo
cargo de emisión se **reembolsa automáticamente** si la emisión falla.

### Crear una tarjeta

El flujo depende de si tu cuenta es **persona** o **empresa** — elige tu
pestaña. La regla común: el **titular (cardholder) se verifica UNA sola vez
por cuenta**, en la primera emisión; las siguientes tarjetas lo reutilizan
sin pedir datos. La `idempotency_key` es obligatoria siempre (un retry con
la misma clave devuelve la tarjeta original y nunca cobra dos veces).

#### Cuenta persona

Una cuenta persona emite tarjetas **para sí misma** (máximo 1 virtual +
1 física).

**Tu primera tarjeta** crea y verifica tu titular en el emisor, así que
lleva tus datos completos y documentos de identidad por URL:

```bash
curl -X POST https://api.qbank.cl/platform/v1/cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "physical": false,
    "idempotency_key": "card-v-1",
    "cardholder": {
      "first_name": "Ana",
      "last_name": "Perez",
      "email": "ana@ejemplo.com",
      "phone": "+56912345678",
      "occupation": "52201",
      "salary_usd": 1800,
      "id_front_url": "https://files.example.com/kyc/ap-front.jpg",
      "id_back_url": "https://files.example.com/kyc/ap-back.jpg",
      "residence_proof_url": "https://files.example.com/kyc/ap-address.pdf",
      "address": {
        "line1": "Av. Providencia 123",
        "city": "Santiago",
        "region": "RM",
        "postal_code": "7500000",
        "country": "CL"
      }
    }
  }'
```

`occupation` es un **código del catálogo**
([ver abajo](#ocupacion-y-giro-codigos-de-catalogo)) y `salary_usd` va en
dólares enteros.

**Tu segunda tarjeta** (por ejemplo la física) ya no pide ningún dato —
tu titular quedó verificado:

```bash
curl -X POST https://api.qbank.cl/platform/v1/cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "physical": true, "idempotency_key": "card-f-1" }'
```

Si intentas una tercera del mismo tipo: `409 card_limit_reached` (cancela
la existente primero).

#### Cuenta empresa

Una cuenta empresa emite **tarjetas ilimitadas**, en dos modalidades:

**A. Para la empresa misma** (tarjetas corporativas). La primera emisión
crea el titular empresa con los datos societarios; las siguientes no piden
nada:

```bash Primera tarjeta (crea el titular empresa)
curl -X POST https://api.qbank.cl/platform/v1/cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "physical": false,
    "idempotency_key": "card-corp-1",
    "cardholder": {
      "kind_of_business": "J63",
      "legal_representation": "Carlos Soto, Gerente General",
      "email": "finanzas@andina.cl",
      "certificate_of_good_standing_url": "https://files.example.com/kyb/vigencia.pdf",
      "business_license_url": "https://files.example.com/kyb/patente.pdf",
      "register_shareholder_url": "https://files.example.com/kyb/socios.pdf",
      "id_shareholders_url": "https://files.example.com/kyb/ids-socios.pdf",
      "address_verification_shareholders_url": "https://files.example.com/kyb/domicilios.pdf",
      "address": {
        "line1": "Av. Apoquindo 4500",
        "city": "Santiago",
        "region": "RM",
        "postal_code": "7550000",
        "country": "CL"
      }
    }
  }'
```

```bash Siguientes tarjetas (sin datos, con límites)
curl -X POST https://api.qbank.cl/platform/v1/cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "physical": true,
    "idempotency_key": "card-f-ops-1",
    "limits": { "per_transaction": "500.00", "monthly": "5000.00" }
  }'
```

**B. Para una persona designada** (ej. un empleado): agrega
`cardholder.kind: "person"` con los datos completos de ESA persona — cada
designación es un titular nuevo, así que sus datos y documentos van
**siempre**, en cada tarjeta para una persona distinta:

```bash
curl -X POST https://api.qbank.cl/platform/v1/cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "physical": false,
    "idempotency_key": "card-emp-77",
    "limits": { "monthly": "1500.00" },
    "cardholder": {
      "kind": "person",
      "first_name": "Maria",
      "last_name": "Perez",
      "email": "maria@empresa.com",
      "occupation": "52201",
      "salary_usd": 1800,
      "id_front_url": "https://files.example.com/kyc/mp-front.jpg",
      "id_back_url": "https://files.example.com/kyc/mp-back.jpg",
      "residence_proof_url": "https://files.example.com/kyc/mp-address.pdf",
      "address": {
        "line1": "Av. Providencia 123",
        "city": "Santiago",
        "region": "RM",
        "postal_code": "7500000",
        "country": "CL"
      }
    }
  }'
```

El nombre impreso usa `first_name` + `last_name` (máximo 22 caracteres
combinados) y la respuesta llega con `cardholder_kind: "person"`.

Respuesta (misma forma en todos los casos):

```json
{
  "card_id": "3c2b1a09-8d7e-6f5a-4b3c-2d1e0f9a8b7c",
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "physical": false,
  "cardholder_kind": "account",
  "status": "active",
  "spending_asset": "USDT",
  "limits": { "monthly": "5000.000000" },
  "created_at": "2026-07-08T12:00:00Z",
  "updated_at": "2026-07-08T12:00:00Z",
  "creation_fee": "3.000000"
}
```

Puedes fijar el saldo de gasto desde el inicio agregando
`"spending_asset": "USDC"` al body de creación (USDT si no lo mandas).

> **Importante**
Los documentos **se validan de verdad** por el emisor: las URLs deben
apuntar a documentos legítimos y accesibles. Si faltan o son
insuficientes, la emisión falla (`422 core_rejected` o
`409 cardholder_kyc_pending`), **el fee se reembolsa automáticamente** y
puedes reintentar corrigiendo los datos.
> **Nota**
¿Persona o empresa? Las diferencias entre ambos tipos de cuenta en TODOS
los productos están resumidas en
[personas y empresas](#personas-y-empresas).
#### Ocupación y giro (códigos de catálogo)

Al designar una **persona**, `occupation` debe ser un **código** del catálogo
oficial (no texto libre); para una **empresa**, `kind_of_business` también.
Consulta y busca los códigos en:

```bash
# Ocupaciones (personas) — filtra con ?q=
curl "https://api.qbank.cl/platform/v1/cards/catalog/occupations?q=director" \
  -H "Authorization: Bearer <token>"

# Giros / actividad económica (empresas)
curl "https://api.qbank.cl/platform/v1/cards/catalog/business-activities?q=informát" \
  -H "Authorization: Bearer <token>"
```

Cada item trae `{ "code": "...", "label": "..." }`. Usa el `code` en
`occupation` / `kind_of_business`. Si mandas un valor fuera de catálogo, la
API responde `400 invalid_occupation` o `400 invalid_kind_of_business` antes
de llegar al emisor. El `salary_usd` va en **dólares** (entero).

### Tarjetas físicas: activación

Una tarjeta física nace en `pending_activation` y viaja **inactiva** por
seguridad. Cuando el titular la tiene en mano:

```bash
curl -X POST https://api.qbank.cl/platform/v1/cards/{card_id}/activate \
  -H "Authorization: Bearer <token>"
```

### Ver PAN y CVV (datos sensibles)

Solo la **cuenta dueña** puede revelarlos (nunca el org admin). La respuesta
es de una sola pasada: muéstrala al titular y descártala.

```bash
curl -X POST https://api.qbank.cl/platform/v1/cards/{card_id}/reveal \
  -H "Authorization: Bearer <token>"
```

```json
{
  "card_id": "3c2b1a09-8d7e-6f5a-4b3c-2d1e0f9a8b7c",
  "pan": "5339880000001234",
  "cvv": "123",
  "exp_date": "202907",
  "note": "sensitive data: display once, never store"
}
```

> **Importante**
**Nunca almacenes ni loguees el PAN/CVV.** CBPay tampoco lo persiste: la
respuesta viene directo del emisor (estándar PCI).
### Límites y congelar/descongelar

```bash Actualizar límites
curl -X PATCH https://api.qbank.cl/platform/v1/cards/{card_id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "limits": { "per_transaction": "200.00", "daily": "0" } }'
```

`"0"` elimina un límite. Para congelar (rechaza toda compra al instante):

```bash Congelar
curl -X PATCH https://api.qbank.cl/platform/v1/cards/{card_id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "frozen": true }'
```

### Transacciones y su ciclo de vida

```bash
curl "https://api.qbank.cl/platform/v1/cards/{card_id}/transactions?from=2026-07-01&to=2026-07-08&page=1&page_size=50" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "page": 1,
  "page_size": 50,
  "transactions": [
    {
      "transaction_id": "7a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9",
      "card_id": "3c2b1a09-8d7e-6f5a-4b3c-2d1e0f9a8b7c",
      "kind": "purchase",
      "merchant": "MERPAGO*SUPERMERCADO",
      "mcc": "5411",
      "amount_usd": "25.00",
      "amount_usdt": "25.000000",
      "spend_asset": "USDC",
      "spend_amount": "25.000000",
      "status": "settled",
      "decline_reason": "",
      "auth_number": "123456",
      "created_at": "2026-07-09T15:04:05Z",
      "updated_at": "2026-07-10T09:00:00Z"
    }
  ]
}
```

`spend_asset` / `spend_amount` indican desde qué saldo se debitó realmente
la compra y cuánto en ese asset (`amount_usd` / `amount_usdt` siguen siendo
el valor USD de referencia). En BTC/GOLD, `spend_amount` de una transacción
autorizada incluye el colchón de reserva; al liquidar queda el monto final.

| Estado | Significado |
|---|---|
| `authorized` | Compra aprobada en tiempo real: el monto salió del disponible del saldo elegido y quedó en hold |
| `settled` | Confirmada en la liquidación de la red (el hold se consume; BTC/GOLD re-cotizado al momento de la captura) |
| `reversed` | Anulada: los fondos volvieron al mismo saldo (monto exacto si no se liquidó; re-convertido al precio del momento si ya se había liquidado) |
| `declined` | Rechazada, con la razón: `insufficient_funds`, `card_limit_exceeded`, `card_frozen`, `account_blocked`, `spending_asset_unavailable`, `spending_asset_disabled`, `pricing_unavailable`, `settlement_limit_exceeded`, `settlement_daily_limit_exceeded` |

Si la liquidación llega por un monto distinto al autorizado (propinas,
conversión del comercio), el ajuste se aplica automáticamente: positivo
debita la diferencia, negativo la devuelve.

### Cancelar una tarjeta

Irreversible. Cobra `card_cancellation` si está configurado.

```bash
curl -X POST https://api.qbank.cl/platform/v1/cards/{card_id}/cancel \
  -H "Authorization: Bearer <token>"
```

### Webhooks

| Evento | Cuándo |
|---|---|
| `card_transaction` | Compra autorizada, anulada o ajustada |
| `card_status_changed` | La tarjeta cambió de estado (incluye congelamiento automático por mensualidad impaga) |

Suscríbete igual que al resto de eventos (ver [Webhooks](#webhooks)).

### Preguntas frecuentes

#### ¿Tengo que prefondear las tarjetas?
No. Las tarjetas no tienen saldo propio: cada compra se autoriza en tiempo
real contra el saldo de la cuenta (en el asset de gasto de la tarjeta). Si
hay saldo y la compra respeta los límites, se aprueba.
#### ¿Qué pasa si varias tarjetas de mi empresa compran a la vez?
Todas gastan de los saldos centrales de la cuenta. Cada autorización debita
de forma atómica: nunca se aprueba más que el saldo disponible del asset,
sin importar cuántas tarjetas operen en paralelo.
#### ¿En qué moneda se debita?
Las compras se procesan en USD y se debitan del saldo que la tarjeta tenga
configurado (`spending_asset`). USDT/USDC van 1:1 con el dólar, sin
comisión de conversión; BTC y GOLD se convierten con el precio efectivo del
momento de cada evento (el mismo del bloque `settlement` de
`GET /v1/rates`).
#### ¿Puedo tener tarjetas gastando de saldos distintos?
Sí: `spending_asset` es por tarjeta. Una empresa puede tener, por ejemplo,
tarjetas corporativas gastando USDT, las de empleados gastando USDC y una
personal gastando BTC. El cambio con `PATCH` aplica solo a compras futuras.
#### ¿Qué es el colchón que veo reservado en compras BTC/GOLD?
La liquidación de una compra llega 1-2 días después de la autorización, y
el precio de BTC/oro puede moverse entre medio. Por eso la autorización
reserva el equivalente de la compra más un pequeño porcentaje. No es un
cobro: al liquidar, la compra se re-convierte al precio de ese momento y
todo lo reservado de más vuelve a tu saldo automáticamente.
#### ¿Qué pasa si el precio de BTC/oro no está disponible cuando compro?
La compra se declina (`pricing_unavailable`) — CBPay nunca convierte tu
saldo con un precio no confiable. Es una condición transitoria (feed de
precios degradado): reintenta en unos minutos o cambia la tarjeta a
USDT/USDC. Los eventos que no se pueden rechazar (la liquidación de una
compra ya aprobada, una devolución) nunca se bloquean: se procesan con el
último precio conocido más un margen prudencial, auditado en el movimiento.
#### Me devolvieron una compra pagada con BTC, ¿por qué recibí una cantidad distinta?
Las devoluciones se convierten al precio del momento de la devolución, no
al de la compra: recibes el equivalente en tu asset del monto USD devuelto.
Si BTC subió desde la compra, recibes menos BTC (mismo valor USD); si bajó,
más. Tu saldo BTC/GOLD siempre está expuesto al precio — es la naturaleza
de gastar desde un asset volátil.
#### ¿Qué pasa si no hay saldo para la mensualidad?
La tarjeta se congela automáticamente (evento `card_status_changed` con
`reason: monthly_fee_unpaid`). No se genera deuda; al regularizar el saldo,
pide descongelarla con `PATCH { "frozen": false }`.
#### ¿Puedo emitir una tarjeta para alguien que no es de mi empresa?
Las cuentas empresa pueden emitir para cualquier persona designada pasando
sus datos y documentos de identidad. La tarjeta gasta siempre del saldo de la
cuenta empresa que la emitió.


## Banking

*Cuentas bancarias reales para tu cuenta: recibe, mantén y envía dinero por rieles bancarios internacionales*

Banking te da **cuentas bancarias reales** a nombre de tu perfil verificado:
recibes fondos por rieles internacionales (SEPA, SWIFT, ACH según la
moneda), mantienes saldo en moneda fiat y envías pagos a terceros. Es un
producto distinto de tu saldo USDT: **el dinero de banking vive en tus
cuentas bancarias**, no en el saldo CBPay.

| Concepto | Dónde vive | Se consulta con |
|---|---|---|
| Saldo USDT CBPay | Ledger CBPay | `GET /v1/balances` |
| Saldos bancarios | Tus cuentas bancarias | `GET /v1/banking/accounts/{id}/balance` |

> **Nota**
Las comisiones de banking (`banking_customer`, `banking_account`,
`banking_operation`) son fijas, se debitan de tu **saldo USDT** al ejecutar
cada operación y se **reembolsan automáticamente** si la operación falla.
Con comisión 0 (el default) el servicio es gratis. El campo `banking_fee`
de cada respuesta te muestra lo cobrado.
### El flujo completo

```mermaid
flowchart LR
    perfil["1. Crear perfil<br/>POST customer"] --> docs["2. Documentos<br/>+ submit"]
    docs --> revision{"Verificación"}
    revision -->|"approved"| cuentas["3. Abrir cuentas<br/>por moneda"]
    revision -->|"rejected"| corrige["Corregir datos<br/>y reenviar"]
    corrige --> docs
    cuentas --> recibir["Recibir fondos<br/>(IBAN / cuenta)"]
    cuentas --> benef["4. Registrar<br/>beneficiarios"]
    benef --> pagos["5. Enviar pagos<br/>prepare → operations"]
    pagos --> whOp["Webhook<br/>operation_status_changed"]
```

1. **Crea tu perfil bancario** (`POST /v1/banking/customer`) — una sola vez.
2. **Sube documentos** de verificación y **envíalo a revisión**.
3. Cuando quede `approved`, **abre cuentas** por moneda.
4. **Registra beneficiarios** (counterparties) para pagos a terceros.
5. **Envía pagos**: cotiza con `prepare` y ejecuta con `operations`.

Los cambios de estado te llegan por los webhooks
`banking_customer_status_changed` y `banking_operation_status_changed`
([webhooks](#webhooks)).

### 1. Crea tu perfil bancario

Una vez por cuenta. Si no envías `type`, `name` o `email`, se completan con
los datos de tu cuenta CBPay:

```bash
curl -X POST https://api.qbank.cl/platform/v1/banking/customer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD",
    "address": { "countryIso": "CL", "city": "Santiago" }
  }'
```

Respuesta `201`:

```json
{
  "customer_id": "9f2b…",
  "provider_id": "…",
  "status": "draft",
  "data": { "item": { "…": "…" } },
  "created_at": "2026-07-07T12:00:00Z",
  "banking_fee": "5.000000"
}
```

Si tu cuenta ya tiene perfil bancario — `409 banking_customer_exists`.
Consulta el estado en cualquier momento:

```bash
curl https://api.qbank.cl/platform/v1/banking/customer \
  -H "Authorization: Bearer <token>"
```

### 2. Documentos y verificación

Sube cada documento en base64 (gratis):

```bash
curl -X POST https://api.qbank.cl/platform/v1/banking/customer/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PASSPORT",
    "filename": "pasaporte.pdf",
    "attach": "<contenido en base64>"
  }'
```

Y envía el perfil a revisión (gratis):

```bash
curl -X POST https://api.qbank.cl/platform/v1/banking/customer/submit \
  -H "Authorization: Bearer <token>"
```

Estados del perfil: `draft` → `submitted` → `under_review` →
**`approved`** o `rejected`. El webhook
`banking_customer_status_changed` te avisa cada cambio:

```json
{
  "account_id": "…",
  "customer_id": "9f2b…",
  "kyc_status": "approved"
}
```

### 3. Abre cuentas bancarias

Con el perfil `approved`, crea una cuenta por moneda. Monedas disponibles:
**USD** (rieles ACH/Fedwire/SWIFT) y **EUR** (SEPA/SWIFT):

```bash Cuenta USD
curl -X POST https://api.qbank.cl/platform/v1/banking/accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "currency": "USD", "name": "Operativa USD" }'
```

```bash Cuenta EUR
curl -X POST https://api.qbank.cl/platform/v1/banking/accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "currency": "EUR", "name": "Operativa EUR" }'
```

Respuesta `201` — `data` incluye los datos para **recibir** (número de
cuenta/IBAN, routing, banco):

```json
{
  "account_id": "c4d1…",
  "provider_id": "…",
  "status": "active",
  "data": { "…": "…" },
  "banking_fee": "1.000000"
}
```

Lista tus cuentas y consulta saldo:

```bash
curl https://api.qbank.cl/platform/v1/banking/accounts \
  -H "Authorization: Bearer <token>"

curl https://api.qbank.cl/platform/v1/banking/accounts/c4d1…/balance \
  -H "Authorization: Bearer <token>"
```

### 4. Registra beneficiarios

Para pagar a terceros, primero registra al beneficiario con sus datos
bancarios (gratis; pasa por moderación antes de poder usarse):

```bash
curl -X POST https://api.qbank.cl/platform/v1/banking/counterparties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Proveedor ACME",
    "profile": {
      "name": "ACME LLC",
      "address": { "addressLine1": "1 Main St", "city": "New York", "stateIso": "NY", "countryIso": "US", "postalCode": "10001" },
      "additionalInfo": { "type": "CORPORATION" }
    },
    "accounts": [
      {
        "currencyCode": "USD",
        "bank": { "name": "Test Bank", "number": "011000138" },
        "fiat": {
          "number": "0532013000",
          "routingNumber": "011000138",
          "additionalInformation": { "type": "TYPE_FIAT_US", "accountType": "CHECKING", "supportedRails": ["ACH"] }
        }
      }
    ]
  }'
```

Lista los tuyos con `GET /v1/banking/counterparties` y agrega más cuentas a
un beneficiario existente con
`POST /v1/banking/counterparties/{id}/accounts`.

### 5. Envía pagos

Dos tipos de operación:

| `type` | Qué hace | `paymentType` |
|---|---|---|
| `TRANSFER` | Entre tus propias cuentas bancarias | `EMPTY` |
| `WITHDRAW` | A un beneficiario registrado | Según el rail (ej. `SEPA_CT`) |

Cotiza primero (gratis, no mueve dinero):

```bash
curl -X POST https://api.qbank.cl/platform/v1/banking/operations/prepare \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD",
    "type": "WITHDRAW",
    "paymentType": "SEPA_CT",
    "sourceRequisit": { "account": "c4d1…" },
    "destinationRequisit": { "beneficiar": "<cuenta del beneficiario>" },
    "amount": { "currencyCode": "USD", "units": "250", "nanos": 0 }
  }'
```

Ejecuta con clave de idempotencia (se cobra `banking_operation` aquí):

```bash WITHDRAW (a un beneficiario)
curl -X POST https://api.qbank.cl/platform/v1/banking/operations \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: pago-acme-0071" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD",
    "type": "WITHDRAW",
    "paymentType": "SEPA_CT",
    "sourceRequisit": { "account": "c4d1…" },
    "destinationRequisit": { "beneficiar": "<cuenta del beneficiario>" },
    "amount": { "currencyCode": "USD", "units": "250", "nanos": 0 },
    "comment": "Factura 8841"
  }'
```

```bash TRANSFER (entre tus cuentas)
curl -X POST https://api.qbank.cl/platform/v1/banking/operations \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: mov-interno-0012" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD",
    "type": "TRANSFER",
    "paymentType": "EMPTY",
    "sourceRequisit": { "account": "c4d1…" },
    "destinationRequisit": { "account": "<otra cuenta tuya>" },
    "amount": { "currencyCode": "USD", "units": "100", "nanos": 0 }
  }'
```

Respuesta `202`:

```json
{
  "operation_id": "7e8a…",
  "provider_id": "…",
  "status": "pending",
  "idempotency_key": "platform:…:pago-acme-0071",
  "data": { "…": "…" },
  "banking_fee": "2.000000"
}
```

- El estado final llega por el webhook `banking_operation_status_changed`
  (`completed` / `failed`); también puedes consultar
  `GET /v1/banking/operations/{id}`.
- Reintentos con la misma `Idempotency-Key` devuelven la operación original
  (`idempotency_hit: true`) **sin volver a cobrar** la comisión.

El historial completo, con filtros:

```bash
curl "https://api.qbank.cl/platform/v1/banking/operations?from=2026-07-01&to=2026-07-08&status=completed&type=WITHDRAW&page_size=50" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    {
      "id": "7e8a…",
      "type": "withdraw",
      "status": "completed"
    }
  ],
  "meta": { "page": 1, "page_size": 50, "retrieved": 1 }
}
```

### Estados de operación

| Estado | Significado |
|---|---|
| `pending` | Aceptada, esperando procesamiento |
| `processing` | En ejecución en el rail bancario |
| `completed` | El dinero llegó — final |
| `failed` | Falló; si hubo comisión de la operación, se reembolsó |
| `cancelled` | Cancelada antes de ejecutarse |

### Errores

| HTTP | `error` | Qué hacer |
|---|---|---|
| 400 | `idempotency_key_required` | Envía la clave en body o header |
| 402 | `insufficient_funds` | Saldo USDT insuficiente para la comisión de banking |
| 403 | `account_blocked` | La cuenta no está activa; contacta al equipo de CBPay |
| 409 | `banking_customer_exists` | Tu cuenta ya tiene perfil bancario (`GET /v1/banking/customer`) |
| 409 | `no_banking_customer` | Crea primero tu perfil (`POST /v1/banking/customer`) |
| 502 | `banking_request_failed` | Error del corredor bancario; la comisión se reembolsó — reintenta |


## Verificación KYC y KYB

*Verificación de identidad con wizard hosteado: formulario, documentos con OCR y prueba de vida en video — para tu cuenta y para tus clientes*

La **verificación de identidad** comprueba que una persona (KYC) o empresa
(KYB) es quien dice ser, con evidencia real: formulario completo, subida de
documentos validados por OCR y **prueba de vida en video**. Tiene dos caras:

1. **Tu propia verificación (onboarding)** — obligatoria: hasta aprobarla,
   tu cuenta solo puede **fondear** (payins, depósitos crypto, recibir
   transferencias) y consultar. Persona ⇒ KYC; empresa ⇒ KYB.
2. **Verificación de tus clientes (solo cuentas empresa)** — generas links
   hosteados o envías los datos por API para verificar a tus propios
   clientes finales, con una comisión fija por verificación.

```mermaid
flowchart LR
    crear["POST /v1/kyc/links o /v1/kyb/links<br/>(fee fijo)"] --> link["Link hosteado<br/>status: pending"]
    link -->|"tu cliente lo abre"| abierto["opened"]
    abierto -->|"formulario + documentos<br/>+ prueba de vida"| completado["completed<br/>(webhook link_completed)"]
    completado --> revision["Submission<br/>pending_review → in_review"]
    revision -->|"aprobada"| ok["approved (webhook)"]
    revision -->|"faltan datos"| cambios["changes_requested /<br/>more_info_required"]
    revision -->|"rechazada"| rechazo["rejected (webhook)"]
```

### Tu propia verificación (onboarding)

Al registrarte, tu cuenta nace sin verificar (`kyc_status: none`) y **solo
puede fondear y leer**. Cualquier acción de dinero saliente (payouts,
transferencias, retiros, banking, tarjetas) responde
`403 verification_required` hasta que apruebes.

### Pide tu link de verificación

```bash
curl -X POST https://api.qbank.cl/platform/v1/me/verification/link \
  -H "Authorization: Bearer <token>"
```

Respuesta `201` (si ya tienes un link vigente, se devuelve el mismo con
`200`):

```json
{
  "link_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "kind": "kyc",
  "url": "https://…/on/usd/individual/new?invite=abc123…",
  "status": "pending",
  "label": "Ana Pérez",
  "created_at": "2026-07-10T12:00:00Z",
  "updated_at": "2026-07-10T12:00:00Z"
}
```

El `kind` sale de tu tipo de cuenta: persona ⇒ `kyc`, empresa ⇒ `kyb`. El
onboarding **no tiene costo** para ti.
### Completa el wizard

Abre la `url`: el wizard hosteado te guía por el formulario, la subida de
documentos (identidad, comprobante de domicilio; societarios para
empresas) y — en KYC — la prueba de vida en video frente a la cámara.
### Espera la revisión

Consulta tu estado cuando quieras:

```bash
curl https://api.qbank.cl/platform/v1/me/verification \
  -H "Authorization: Bearer <token>"
```

```json
{
  "kyc_status": "pending",
  "required_kind": "kyc",
  "verified": false,
  "link": { "link_id": "a1b2c3d4-…", "kind": "kyc", "url": "https://…", "status": "completed" },
  "submission": { "submission_id": "f0e1d2c3-…", "kind": "kyc", "status": "in_review", "liveness_pending": false }
}
```

Cuando compliance aprueba, tu `kyc_status` pasa a `approved`
**automáticamente** y todos los servicios se desbloquean (recibirás el
webhook `kyc_verification_status_changed` con `self_onboarding: true`).
> **Nota**
Mientras esperas la aprobación puedes fondear con normalidad: payins en
todos los métodos, depósitos crypto y transferencias entrantes funcionan
desde el día uno. Si tu verificación es rechazada (`kyc_status: rejected`),
contacta a tu operador — puede pedirte reintentar con un link nuevo.
### Verificar a tus clientes (solo cuentas empresa)

Una cuenta **empresa** verificada puede verificar a sus propios clientes
finales. Cada verificación creada cobra la comisión fija configurada
(`kyc_verification` / `kyb_verification`; 0 = gratis), que se **reembolsa
automáticamente** si la creación falla. Las cuentas persona reciben
`403 company_account_required`.

#### Opción A — Links hosteados (recomendada)

Tu cliente completa TODO en el wizard de marca blanca: formulario,
documentos y prueba de vida. Tú solo generas el link y esperas el webhook.

```bash Link KYC (persona)
curl -X POST https://api.qbank.cl/platform/v1/kyc/links \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "external_customer_id": "cust_123",
    "label": "Ana Pérez",
    "expires_in_days": 14,
    "idempotency_key": "kyc-link-cust-123-1"
  }'
```

```bash Link KYB (empresa, con país)
curl -X POST https://api.qbank.cl/platform/v1/kyb/links \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "external_customer_id": "cust_456",
    "country": "cl",
    "label": "Comercial Andina SpA",
    "expires_in_days": 14,
    "idempotency_key": "kyb-link-cust-456-1"
  }'
```

- `external_customer_id` (obligatorio): TU referencia del cliente
  verificado — la recibes de vuelta en cada webhook y consulta. Los valores
  `self` o terminados en `:self` están reservados para el onboarding de la
  cuenta y se rechazan con `400 invalid_payload`.
- `idempotency_key` (obligatoria): un retry con la misma clave devuelve el
  link original y **nunca cobra dos veces**.
- `country` (solo KYB): `us`, `cl`, `ve`, `br`, `mx`, `co`, `pe`, `bo`,
  `py`, `ar` o `generic` (con `generic_country` ISO alpha-2, ej. `"ES"`).
  El KYC individual no lleva país.
- `expires_in_days` (opcional, 1–30): sin enviarlo, el link no vence.

Respuesta `201`:

```json
{
  "link_id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
  "kind": "kyb",
  "external_customer_id": "cust_456",
  "url": "https://…/on/cl/business/new?invite=abc123…",
  "status": "pending",
  "country": "cl",
  "label": "Comercial Andina SpA",
  "expires_at": 1721209600,
  "verification_fee": "2.000000",
  "created_at": "2026-07-10T12:00:00Z",
  "updated_at": "2026-07-10T12:00:00Z"
}
```

Consulta e historial (todo POST tiene su GET):

```bash
# Listado con filtros
curl "https://api.qbank.cl/platform/v1/kyb/links?from=2026-07-01&to=2026-07-10&status=completed&page=1&page_size=50" \
  -H "Authorization: Bearer <token>"

# Detalle (estado vivo del link)
curl https://api.qbank.cl/platform/v1/kyb/links/{link_id} \
  -H "Authorization: Bearer <token>"
```

| Estado del link | Significado |
|---|---|
| `pending` | Creado, tu cliente aún no lo abre |
| `opened` | Tu cliente abrió el wizard |
| `completed` | Formulario enviado — nace la submission (webhook `kyb_link_completed` / `kyc_link_completed`) |
| `expired` | Venció sin completarse |

#### Opción B — Datos por API

Si ya tienes los datos del cliente en tu sistema, créale la verificación
directo (sin wizard). La submission entra al mismo queue de revisión:

```bash
curl -X POST https://api.qbank.cl/platform/v1/kyc/submissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "external_customer_id": "cust_789",
    "idempotency_key": "kyc-sub-cust-789-1",
    "person": {
      "first_name": "Ana",
      "last_name": "Pérez",
      "email": "ana@ejemplo.com",
      "phone": "+56912345678",
      "nationality": "CHL",
      "date_of_birth": "1990-04-12",
      "tax_id": "12.345.678-5",
      "id_type": "id_card",
      "id_number": "12345678",
      "address": {
        "line1": "Av. Siempre Viva 123",
        "city": "Santiago",
        "state": "RM",
        "postal_code": "8320000",
        "country": "CHL"
      },
      "primary_purpose": "personal_or_living_expenses",
      "most_recent_occupation": "Engineer",
      "source_of_funds": "salary"
    }
  }'
```

Notas del modo datos:

- Países en **ISO alpha-3** (`CHL`, `USA`, `VEN`…); fechas `YYYY-MM-DD`;
  `id_type`: `passport | id_card | drivers_license`.
- KYB: body `{ external_customer_id, country?, business: {…}, ubos?,
  directors?, signers?, bank_info?, metadata? }` en
  `POST /v1/kyb/submissions`.
- **No se exige prueba de vida al crear**: la submission KYC queda con
  `liveness_pending: true` y la cierras con un [liveness
  link](#prueba-de-vida-liveness-link).
- Re-enviar con el mismo `external_customer_id` mientras la submission
  siga abierta (`pending_review`, `changes_requested`,
  `more_info_required`) **actualiza** la misma submission y no cobra de
  nuevo.

Respuesta `201`:

```json
{
  "submission_id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
  "kind": "kyc",
  "external_customer_id": "cust_789",
  "status": "pending_review",
  "liveness_pending": true,
  "verification_fee": "1.500000",
  "created_at": "2026-07-10T12:05:00Z",
  "updated_at": "2026-07-10T12:05:00Z"
}
```

Consulta e historial:

```bash
curl "https://api.qbank.cl/platform/v1/kyc/submissions?from=2026-07-01&to=2026-07-10&status=approved&page=1&page_size=50" \
  -H "Authorization: Bearer <token>"

curl https://api.qbank.cl/platform/v1/kyc/submissions/{submission_id} \
  -H "Authorization: Bearer <token>"
```

El detalle agrega lo que compliance pidió: `pending_documents`,
`rejection_reason`, `changes_requested_comments`; en KYC además
`liveness_pending` y `documents_received`; en KYB `aml_decision`.

| Estado de la submission | Significado |
|---|---|
| `pending_review` | Recibida, en cola de compliance |
| `in_review` | Compliance tomó el caso |
| `changes_requested` | Hay que corregir datos y re-enviar |
| `more_info_required` | Faltan documentos ([súbelos por API](#documentos-por-api)) |
| `escalated` | Caso escalado a revisión senior |
| `approved` / `approved_partial` | Aprobada (final) |
| `rejected` | Rechazada (final) |

#### Documentos por API

Los documentos son opcionales al crear (si faltan, compliance los pedirá
con `more_info_required`). Flujo de 3 pasos:

### Presign

```bash
curl -X POST https://api.qbank.cl/platform/v1/kyc/submissions/{submission_id}/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "identity",
    "filename": "cedula.jpg",
    "content_type": "image/jpeg",
    "file_size": 482133
  }'
```

```json
{ "upload_url": "https://storage…", "key": "public-api/…", "expires_in": 900 }
```

Categorías — KYC: `identity`, `proofOfResidence`; KYB: `legalPresence`,
`ownershipStructure`, `controlStructure`, `companyDetails`. Tipos:
`application/pdf`, `image/png`, `image/jpeg`; máximo 15 MB; la URL vence en
15 minutos.
### Upload

`PUT` del binario directo a `upload_url` con el mismo `Content-Type`.
### Confirm

```bash
curl -X POST https://api.qbank.cl/platform/v1/kyc/submissions/{submission_id}/documents/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "key": "public-api/…", "category": "identity", "filename": "cedula.jpg", "content_type": "image/jpeg" }'
```

```json
{ "status": "received", "ocr": "queued" }
```

Al confirmar se dispara la validación OCR; el resultado llega por el
webhook `kyc_document_validated` / `kyb_document_validated` y se consulta
con GET:

```bash
curl https://api.qbank.cl/platform/v1/kyc/submissions/{submission_id}/documents \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    { "category": "identity", "status": "completed", "outcome": "MATCH", "score": 0.97, "summary": "Document matches the submitted identity", "filename": "cedula.jpg" }
  ],
  "meta": { "retrieved": 1 }
}
```

`outcome`: `MATCH` (coincide), `REVIEW` (revisión manual), `NO_MATCH`.
#### Prueba de vida (liveness link)

Las submissions KYC creadas por datos nacen con `liveness_pending: true`
(la prueba de vida es un flujo de cámara en browser). Genera un link
mínimo hosteado para que tu cliente la complete:

```bash
curl -X POST https://api.qbank.cl/platform/v1/kyc/submissions/{submission_id}/liveness_link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "expires_in_days": 7 }'
```

```json
{ "url": "https://…/on/liveness/<token>", "status": "pending", "expires_at": 1751234567 }
```

- No cobra (el servicio se cobró al crear la submission). Si ya hay un
  link vigente, el POST devuelve el mismo; si la prueba ya fue superada,
  `400 liveness_already_completed`.
- `GET .../liveness_link` devuelve el último link y el estado del check
  (`{ "liveness": { "status", "outcome", "passed" } }`).
- Al pasar (outcome `PASS` o `REVIEW`): la submission limpia
  `liveness_pending` y llega el webhook `kyc_liveness_completed`.

### Webhooks

| Evento | Cuándo |
|---|---|
| `kyc_verification_status_changed` / `kyb_verification_status_changed` | La submission cambió de estado (todo el ciclo: recibida, en revisión, cambios pedidos, aprobada, rechazada…) |
| `kyc_link_completed` / `kyb_link_completed` | Tu cliente completó un link hosteado |
| `kyc_document_validated` / `kyb_document_validated` | Terminó el OCR de un documento subido por API |
| `kyc_liveness_completed` | La prueba de vida fue completada desde un liveness link |

Payload de ejemplo (`kyc_verification_status_changed`):

```json
{
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "kind": "kyc",
  "event": "approved",
  "submission_id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
  "external_customer_id": "cust_789",
  "status": "approved",
  "risk_band": "low",
  "decision": "approved"
}
```

Tu propio onboarding llega con `"self_onboarding": true` en vez de
`external_customer_id`. Suscríbete igual que al resto de eventos (ver
[Webhooks](#webhooks)).

### Costos (configurados por tu operador, pueden ser 0)

| Servicio | Cuándo se cobra |
|---|---|
| `kyc_verification` | Al crear un link o submission KYC de un tercero |
| `kyb_verification` | Al crear un link o submission KYB de un tercero |

El cargo sale de tu saldo de settlement predeterminado, se reembolsa si la
creación falla, y **tu propio onboarding nunca cobra**. Re-envíos de una
submission abierta y liveness links no cobran de nuevo.

### Errores

| HTTP | `error` | Causa | Solución |
|---|---|---|---|
| 400 | `idempotency_key_required` | POST de creación sin clave | Envía `idempotency_key` (body o header) |
| 400 | `invalid_payload` | Falta `external_customer_id` u otro campo requerido | Revisa el body |
| 400 | `liveness_already_completed` | La prueba de vida ya fue superada | Nada que hacer |
| 402 | `insufficient_funds` | Saldo insuficiente para la comisión | Fondea la cuenta y reintenta |
| 403 | `verification_required` | Tu cuenta aún no aprobó su propia verificación | Completa tu [onboarding](#tu-propia-verificacion-onboarding) |
| 403 | `company_account_required` | Una cuenta persona intentó verificar terceros | Solo cuentas empresa |
| 403 | `service_disabled` | El servicio `kyc` está deshabilitado para tu cuenta | Contacta a tu operador |
| 404 | `not_found` | El link/submission no existe o no es tuyo | Verifica el id |
| 409 | `already_verified` | Pediste link de onboarding con la cuenta ya aprobada | Nada que hacer |
| 503 | `verifications_unavailable` | Servicio temporalmente no disponible (la comisión se reembolsó) | Reintenta más tarde |

### Preguntas frecuentes

#### ¿Por qué no puedo hacer payouts recién registrado?
Toda cuenta debe aprobar su verificación de identidad antes de mover dinero
hacia afuera (es un requisito regulatorio). Mientras tanto puedes fondear
(payins, depósitos crypto, recibir transferencias) y explorar la API. Pide
tu link con `POST /v1/me/verification/link` y complétalo — la aprobación
desbloquea todo automáticamente.
#### ¿Qué diferencia hay entre links hosteados y datos por API?
Con links, tu cliente completa todo en el wizard (formulario + documentos +
prueba de vida) y tú no manejas datos sensibles. Con datos por API tú envías
los campos y subes documentos vía presign — útil si ya tienes tu propio
formulario — pero la prueba de vida igual requiere un liveness link (es un
flujo de cámara, no se puede hacer server-to-server).
#### ¿Cuándo se cobra la comisión y cuándo no?
Se cobra al CREAR un link o una submission de terceros (modo live). No
cobran: tu propio onboarding, los re-envíos de una submission abierta (mismo
external_customer_id), los liveness links, las consultas y los documentos.
Si la creación falla, la comisión se reembolsa sola.
#### ¿Por qué mi cuenta persona no puede crear links?
La verificación de terceros es una herramienta B2B para integradores
(cuentas empresa). Una cuenta persona solo necesita su propio onboarding,
que es gratis y va por /v1/me/verification.
#### Compliance pidió más documentos, ¿cómo los mando?
Recibirás `more_info_required` con `pending_documents` en el detalle de la
submission. Sube cada documento con el flujo presign → upload → confirm de
esta página; al confirmarse, la submission vuelve a la cola de revisión.
#### ¿Esto reemplaza al AML screening?
No: son productos complementarios. La verificación comprueba la identidad
con evidencia (documentos, video); el [AML screening](#aml-screening)
contrasta la identidad contra listas de sanciones/PEP/prensa adversa y
puede vigilarla de forma continua.


## AML screening

*Screening de personas y empresas contra listas de sanciones, PEP y prensa adversa, con rescreening y monitoreo continuo*

El **AML screening** contrasta la identidad de una persona o empresa contra
listas globales — sanciones, PEP, prensa adversa — y devuelve el resultado
del análisis con su nivel de riesgo. Es un producto de compliance puro:
**no** verifica la identidad con documentos ni prueba de vida (eso es la
[verificación KYC/KYB](#verificacion-kyc-y-kyb)); analiza si la identidad presenta
riesgo en listas.

```mermaid
flowchart LR
    envio["POST /v1/aml/screenings<br/>(cobra fee)"] --> resultado{"Resultado"}
    resultado -->|"no_match"| ok["Sin coincidencias"]
    resultado -->|"potential_match / has_hits"| review["Coincidencias + risk_level<br/>(revisar matches)"]
    ok -.->|"POST /v1/aml/rescreen<br/>(cambio de datos, política)"| envio
    ok -.->|"PATCH /v1/aml/monitoring<br/>(vigilancia continua)"| monitor["Alertas por webhook<br/>aml_screening_updated"]
```

> **Importante**
**Breaking change (v1.34)**: este producto vivía en `POST /v1/kyc`,
`/v1/kyc/rescreen` y `PATCH /v1/kyc/monitoring`. Esas rutas se **eliminaron**
y ahora son `POST /v1/aml/screenings`, `POST /v1/aml/rescreen` y
`PATCH /v1/aml/monitoring` (misma semántica y mismas comisiones). Las rutas
`/v1/kyc/...` ahora pertenecen a la
[verificación de identidad](#verificacion-kyc-y-kyb), que es otro producto.
> **Nota**
Si CBPay configuró una comisión de compliance, se debita **antes** de la
llamada (verás `compliance_fee` en la respuesta) y se **reembolsa
automáticamente** si el screening falla. Con comisión 0 el servicio es
gratuito para ti. Requiere tener tu propia
[verificación de identidad aprobada](#verificacion-kyc-y-kyb).
### Enviar el screening

Un solo endpoint para persona y empresa; el tipo se detecta del payload
(las demás diferencias entre ambos tipos de cuenta están en
[personas y empresas](#personas-y-empresas)):

```bash Persona
curl -X POST https://api.qbank.cl/platform/v1/aml/screenings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "person": {
        "full_name": "Ana Pérez Rojas",
        "date_of_birth": "1990-04-12",
        "personal_identification": [
          { "type": "national_id", "issuing_country": "CL", "number": "12.345.678-5" }
        ]
      },
      "email": "ana@ejemplo.com",
      "country": "CL"
    },
    "monitor": false
  }'
```

```bash Empresa
curl -X POST https://api.qbank.cl/platform/v1/aml/screenings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "company": {
        "legal_name": "Comercial Andina SpA",
        "tax_id": "76.543.210-8"
      },
      "email": "legal@andina.cl",
      "country": "CL"
    },
    "monitor": true
  }'
```

```bash Mínimo (autocompletado con tu cuenta)
curl -X POST https://api.qbank.cl/platform/v1/aml/screenings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "customer": {}, "monitor": false }'
```

Si omites `person`/`company`, se completa con los datos de tu cuenta (el
tipo persona/empresa se toma del tipo de la cuenta).

### Envía toda la identidad que tengas (recomendado)

El objeto `customer` acepta **muchos más campos, todos opcionales**, y se
reenvían íntegros al motor de screening: **mientras más datos de identidad
envíes, más preciso es el análisis** — la fecha de nacimiento, los países y
los documentos fuertes descartan homónimos y reducen falsos positivos.

| Campo (persona) | Qué es |
|---|---|
| `full_name` — o `first_name` / `middle_name` / `last_name` | Nombre completo o por partes |
| `date_of_birth` | `"YYYY-MM-DD"` u objeto `{ "year": 1990, "month": 4, "day": 12 }` |
| `nationality` / `nationalities` | Nacionalidad(es), ISO-3166 |
| `country_of_birth` | País de nacimiento |
| `residential_information[]` | Domicilios, cada uno con `country_of_residence` |
| `personal_identification[]` | Documentos fuertes: `{ "type", "issuing_country", "number" }` (cédula, pasaporte, RUT…) |
| `alias` / `aliases` | Otros nombres conocidos |

| Campo (empresa) | Qué es |
|---|---|
| `legal_name` | Razón social |
| `alias[]` | Nombres comerciales / de fantasía |
| `tax_id` / `registration_number` | Identificadores tributarios/mercantiles |
| `registration_authority_identification` | Número ante el registro mercantil |
| `place_of_registration` / `country_of_incorporation` | País de registro/constitución |
| `incorporation_date` | Fecha de constitución |
| `address[]` | Domicilios, cada uno con `country` |

> **Nota**
Una consulta con **exactamente los mismos datos de identidad** reutiliza el
screening anterior (no se cobra uno nuevo). Agregar o cambiar campos de
identidad (nombre, fecha, país, documento, alias) hace la búsqueda más
específica y ejecuta — y cobra — un screening nuevo. Los campos cosméticos
(email, teléfono, dirección textual) no cambian el matching.
Respuesta `201` — persona y empresa devuelven la misma forma; cambia
`compliance_service` (`compliance_person` vs `compliance_company`, cada uno
con su comisión):

```json Persona
{
  "customer_id": "cus_8f2e1a…",
  "status": "screened",
  "risk_level": "low",
  "screening_result": "no_match",
  "compliance_service": "compliance_person",
  "compliance_fee": "0.500000"
}
```

```json Empresa
{
  "customer_id": "cus_5b7c33…",
  "status": "screened",
  "risk_level": "medium",
  "screening_result": "potential_match",
  "compliance_service": "compliance_company",
  "compliance_fee": "1.000000"
}
```

### Rescreening

Re-ejecuta el análisis de la misma identidad (por ejemplo, ante un cambio de
datos o por política periódica). No lleva body — usa el `customer_id` de tu
screening anterior:

```bash
curl -X POST https://api.qbank.cl/platform/v1/aml/rescreen \
  -H "Authorization: Bearer <token>"
```

Respuesta `200` (cobra `compliance_rescreen`, si está configurada):

```json
{
  "customer_id": "cus_8f2e1a…",
  "status": "screened",
  "risk_level": "low",
  "screening_result": "no_match",
  "compliance_service": "compliance_rescreen",
  "compliance_fee": "0.250000"
}
```

Requiere haber enviado un screening antes; si no, `409 no_screening`.

### Monitoreo continuo

Activa (o desactiva) la vigilancia permanente de la identidad — cambios en
listas, PEP, prensa adversa. Las novedades llegan por el webhook
`aml_screening_updated`:

```bash Activar (cobra compliance_monitoring)
curl -X PATCH https://api.qbank.cl/platform/v1/aml/monitoring \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "enabled": true }'
```

```bash Desactivar (siempre gratis)
curl -X PATCH https://api.qbank.cl/platform/v1/aml/monitoring \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "enabled": false }'
```

Respuesta `200`:

```json
{
  "customer_id": "cus_8f2e1a…",
  "monitoring": true,
  "compliance_service": "compliance_monitoring",
  "compliance_fee": "0.100000"
}
```

Al desactivar, `compliance_fee` vuelve `"0.000000"` — desactivar es
siempre gratis.

### Webhook

| Evento | Cuándo |
|---|---|
| `aml_screening_updated` | El screening terminó, un caso cambió, el riesgo cambió o una transacción monitoreada fue revisada |

Payload de ejemplo:

```json
{
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "screening_event": "compliance_risk_changed",
  "customer_id": "cus_8f2e1a…",
  "data": { "risk_level": "high" }
}
```

Suscríbete igual que al resto de eventos (ver [Webhooks](#webhooks)).

### Errores

| HTTP | `error` | Causa | Solución |
|---|---|---|---|
| 402 | `insufficient_funds` | Saldo insuficiente para la comisión de compliance | Fondea la cuenta y reintenta |
| 403 | `verification_required` | Tu cuenta aún no aprobó su verificación de identidad | Completa tu [onboarding](#verificacion-kyc-y-kyb) |
| 403 | `service_disabled` | El servicio `aml` está deshabilitado para tu cuenta | Contacta a tu operador |
| 409 | `no_screening` | Rescreen/monitoreo sin un screening previo | Envía primero `POST /v1/aml/screenings` |
| 502 | `compliance_unavailable` | Servicio temporalmente no disponible (la comisión se reembolsó) | Reintenta más tarde |

### Preguntas frecuentes

#### ¿Cuál es la diferencia entre AML screening y la verificación KYC/KYB?
El screening contrasta una identidad contra listas (sanciones, PEP, prensa
adversa) — no pide documentos. La [verificación KYC/KYB](#verificacion-kyc-y-kyb)
comprueba que la persona/empresa es quien dice ser, con formulario,
documentos y prueba de vida en video. Se complementan: verifica la identidad
con KYC/KYB y vigila su riesgo con AML.
#### ¿Puedo screenear a mis propios clientes?
Sí: el objeto `customer` acepta cualquier identidad, no solo la de tu
cuenta. Cada screening cobra su comisión (persona o empresa según el
payload).
#### ¿El screening cambia el estado de verificación de mi cuenta?
No. Desde v1.34 el `kyc_status` de tu cuenta lo maneja exclusivamente la
verificación de identidad KYC/KYB (tu onboarding). El screening solo evalúa
riesgo en listas.


## Cartola (estado de cuenta)

*El estado de cuenta consolidado: JSON para tu web, PDF y Excel descargables, listos para tu contador*

La cartola consolida **todos** los movimientos de una cuenta en un período —
payouts, payins, depósitos y retiros crypto, transferencias internas y
cargos por servicio — en un solo documento auditable. Un mismo endpoint la
entrega en tres formatos:

| Formato | Para qué | Cómo pedirlo |
|---|---|---|
| `json` (default) | Mostrar la cartola en tu web/app | `format=json` |
| `pdf` | Documento formal con branding CBPay | `format=pdf` |
| `xlsx` | Excel con hojas por sección, filtros y celdas numéricas | `format=xlsx` |

```mermaid
flowchart LR
    ledger["Ledger inmutable<br/>(cada movimiento con balance_after)"] --> build["Armado de la cartola<br/>resumen + desgloses + detalle"]
    build --> json["JSON<br/>(vista web)"]
    build --> pdf["PDF con branding<br/>(descarga)"]
    build --> xlsx["Excel multi-hoja<br/>(descarga)"]
    build --> check{"Cuadratura:<br/>inicial + entradas − salidas<br/>= final"}
```

### Pedir la cartola

```bash
# JSON para tu front
curl "https://api.qbank.cl/platform/v1/reports/statement?from=2026-01-01&to=2026-07-07" \
  -H "Authorization: Bearer <token>"

# PDF descargable (branding CBPay)
curl -OJ "https://api.qbank.cl/platform/v1/reports/statement?from=2026-01-01&to=2026-07-07&format=pdf" \
  -H "Authorization: Bearer <token>"

# Excel descargable
curl -OJ "https://api.qbank.cl/platform/v1/reports/statement?from=2026-01-01&to=2026-07-07&format=xlsx" \
  -H "Authorization: Bearer <token>"
```

- `from` / `to`: fechas `YYYY-MM-DD` inclusive, en UTC. Rango máximo:
  400 días.
- `lang=es|en`: idioma del PDF/Excel (default `es`).
- Los archivos llegan con `Content-Disposition: attachment` y nombre
  `cartola_cbpay_<cuenta>_<from>_<to>.pdf/.xlsx`.

### Qué contiene

```json
{
  "account": { "account_id": "…", "display_name": "Empresa Ejemplo SpA", "type": "company" },
  "period": { "from": "2026-01-01", "to": "2026-07-07", "timezone": "UTC" },
  "generated_at": "2026-07-07T15:00:00Z",
  "summary": {
    "opening_balance": "0.000000",
    "total_in": "985633.540000",
    "total_out": "38099.870000",
    "net_change": "947533.670000",
    "closing_balance": "947533.670000",
    "balanced": true,
    "counts": { "payouts": 51, "payins": 12, "crypto_deposits": 18, "transfers": 4, "movements": 771 },
    "fees_by_service": { "payout": "15.300000", "funding": "897.550000" },
    "total_fees": "912.850000"
  },
  "breakdown": {
    "by_product": [ { "product": "payouts", "count": 51, "usdt_in": "0.000000", "usdt_out": "38099.870000", "fees": "15.300000" } ],
    "by_country": [ { "flow": "payouts", "country": "BO", "currency": "BOB", "count": 14, "local_amount": "28748.58", "usdt_amount": "2902.210000" } ],
    "by_currency": [ { "currency": "BOB", "payout_local": "28748.58", "payin_local": "700.00" } ],
    "by_month": [ { "month": "2026-01", "usdt_in": "985633.540000", "usdt_out": "35100.000000" } ]
  },
  "payouts": [ { "created_at": "…", "payout_id": "…", "country": "BO", "beneficiary": "Juan Quispe", "local_amount": "90.00", "fx_rate": "6.91", "usdt_amount": "13.024600", "fee": "0.300000", "total_debit": "13.324600", "status": "completed" } ],
  "payins": [ { "…": "…" } ],
  "assets": [
    {
      "asset": "GOLD",
      "opening_balance": "0.000000",
      "total_in": "12.500000",
      "total_out": "2.000000",
      "net_change": "10.500000",
      "closing_balance": "10.500000",
      "balanced": true,
      "movements": [ { "type": "adjustment", "amount": "12.500000", "balance_after": "12.500000", "created_at": "…" } ]
    }
  ],
  "crypto_deposits": [ { "chain": "tron", "asset": "USDT", "tx_id": "…", "usdt_gross": "100.000000", "fee": "1.000000", "usdt_credited": "99.000000", "balance_after": "99.000000" } ],
  "crypto_withdrawals": [ { "…": "…" } ],
  "transfers": [ { "direction": "sent", "counterparty": "Ana Pérez", "asset": "USDT", "amount": "25.000000" } ],
  "service_charges": [ { "type": "banking_fee", "service": "banking_customer", "amount": "-0.500000", "balance_after": "98.500000" } ],
  "movements": [ { "type": "funding", "amount": "99.000000", "balance_after": "99.000000", "created_at": "…" } ]
}
```

Secciones:

1. **`summary`** — saldo inicial, entradas, salidas, saldo final, comisiones
   por servicio y el flag `balanced` del **saldo USDT** (la moneda
   operativa).
2. **`assets`** — una sección conciliada por cada saldo no-USDT con
   actividad o saldo (USDC, BTC, GOLD): saldo inicial/final, entradas,
   salidas, su propio flag `balanced` y sus movimientos, en la precisión de
   cada moneda. Si solo operas USDT, viene vacía.
3. **`breakdown`** — por producto, por país (payouts y payins con monto
   local y USDT), por moneda fiat y por mes.
4. **Detalle por producto** — payouts (con beneficiario, tasa y débito),
   payins (por modalidad), crypto (con `tx_id` y su `asset`),
   transferencias (con contraparte y `asset`) y cargos por servicio (con
   reembolsos).
5. **`movements`** — el ledger crudo del saldo USDT: cada movimiento con su
   `balance_after`. Es la sección con la que un auditor cuadra todo (los
   movimientos de las otras monedas van dentro de su sección en `assets`).

### Cómo cuadrar la cartola (para tu contador)

La cartola cumple una identidad contable exacta, sin redondeos:

```
saldo_inicial + total_entradas − total_salidas = saldo_final
```

- `balanced: true` confirma que la identidad se cumple contra el ledger —
  tanto en el resumen USDT como en cada sección de `assets` (cada moneda
  cuadra por separado; nunca se suman montos de monedas distintas).
- Cada fila de `movements` trae el saldo resultante (`balance_after`):
  puedes seguir el saldo línea a línea desde el inicial hasta el final.
- El saldo final de la cartola de un período empalma con el inicial del
  período siguiente.
- Las comisiones nunca están escondidas en los montos: cada operación
  muestra bruto, comisión y neto por separado, y `fees_by_service` las
  totaliza.
- En el Excel, la hoja **Movimientos** tiene celdas numéricas reales:
  puedes sumar/pivotar sin limpiar nada.

### Para el administrador (org admin)

El equipo de CBPay puede generar la cartola de cualquiera de sus cuentas:

```bash
curl "https://api.qbank.cl/platform/v1/accounts/{accountID}/reports/statement?from=2026-01-01&to=2026-07-07&format=pdf" \
  -H "X-API-Key: <pk_org_admin>"
```

### Errores

| HTTP | `error` | Causa |
|---|---|---|
| 400 | `invalid_range` | Fechas faltantes/invalidas, `to` anterior a `from`, o rango mayor a 400 días |
| 400 | `invalid_format` | `format` distinto de `json`, `pdf`, `xlsx` |
| 404 | `not_found` | La cuenta no existe (solo org admin) |


# Integración


## Seguridad y 2FA (OTP)

*Códigos de un solo uso por SMS o WhatsApp para proteger login, payouts, retiros y más*

CBPay puede exigir un **código de verificación de un solo uso (OTP)** antes
de las acciones sensibles: iniciar sesión, crear un payout, retirar crypto,
revelar una tarjeta, emitir una API key… El código llega por **SMS o
WhatsApp** al teléfono de la cuenta, y tu operador decide **qué acciones lo
exigen y por qué canal** — por cuenta o para toda la organización.

> **Nota**
El OTP aplica **solo a sesiones de usuario** (login con JWT). Las **API keys
`pk_` están exentas**: son integraciones server-to-server y no hay un humano
con teléfono al otro lado. Si toda tu operación usa API keys, esta página no
cambia nada de tu integración.
### Cómo funciona

```mermaid
sequenceDiagram
    participant U as Usuario (sesión JWT)
    participant API as CBPay API
    U->>API: POST /v1/payouts (sin OTP)
    API-->>U: 403 otp_required {action, channel}
    U->>API: POST /v1/otp/challenges {action: "payout"}
    Note over U: Llega el código por SMS/WhatsApp
    API-->>U: 201 {challenge_id, expires_at}
    U->>API: POST /v1/otp/challenges/{id}/verify {code}
    API-->>U: 200 {otp_token}
    U->>API: POST /v1/payouts + header X-OTP-Token
    API-->>U: 201 payout creado
```

El `otp_token` es de **un solo uso**, está ligado a tu usuario y a la acción
para la que se emitió, y expira junto con el desafío (10 minutos desde el
envío del código).

### 1. Consulta tu política

`GET /v1/otp/settings` te dice si el OTP está activo y qué acciones lo
exigen:

```bash
curl https://api.qbank.cl/platform/v1/otp/settings \
  -H "Authorization: Bearer <token>"
```

```json
{
  "enabled": true,
  "phone": "********5678",
  "phone_verified": true,
  "actions": [
    { "action": "login", "required": true, "channel": "sms" },
    { "action": "payout", "required": true, "channel": "whatsapp" },
    { "action": "crypto_withdrawal", "required": true, "channel": "sms" },
    { "action": "transfer", "required": false, "channel": "sms" },
    { "action": "banking_operation", "required": false, "channel": "sms" },
    { "action": "card_reveal", "required": true, "channel": "sms" },
    { "action": "api_key_create", "required": true, "channel": "sms" },
    { "action": "member_add", "required": false, "channel": "sms" },
    { "action": "phone_change", "required": true, "channel": "sms" }
  ]
}
```

### 2. Pide el código

```bash
curl -X POST https://api.qbank.cl/platform/v1/otp/challenges \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "action": "payout" }'
```

Respuesta `201` — el código ya viaja al teléfono de la cuenta:

```json
{
  "challenge_id": "6f1c02aa-93a1-4f0e-a7d1-1f2e3c4b5a69",
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "action": "payout",
  "channel": "whatsapp",
  "phone": "********5678",
  "status": "pending",
  "created_at": "2026-07-08T21:00:00Z",
  "expires_at": "2026-07-08T21:10:00Z"
}
```

Si la cuenta no tiene teléfono: `409 phone_required` (cárgalo con
`PATCH /v1/me`). Hay límites de envío por hora — si te pasas,
`429 too_many_attempts`.

### 3. Verifica el código

```bash
curl -X POST https://api.qbank.cl/platform/v1/otp/challenges/6f1c02aa-93a1-4f0e-a7d1-1f2e3c4b5a69/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "code": "482913" }'
```

```json
{
  "challenge_id": "6f1c02aa-93a1-4f0e-a7d1-1f2e3c4b5a69",
  "action": "payout",
  "otp_token": "otp_Zk9uY2XIr1EYE0lq8xqlM3VayVZYX4aa11bb22cc33",
  "expires_at": "2026-07-08T21:10:00Z",
  "note": "single use: send it in the X-OTP-Token header of the protected action"
}
```

Código incorrecto → `401 invalid_code` (tienes 5 intentos por desafío).

### 4. Ejecuta la acción con el token

```bash
curl -X POST https://api.qbank.cl/platform/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "X-OTP-Token: otp_Zk9uY2XIr1EYE0lq8xqlM3VayVZYX4aa11bb22cc33" \
  -H "Content-Type: application/json" \
  -d '{ "country": "CL", "currency": "CLP", "method": "bank_transfer", "amount": "50000", "beneficiary": { "...": "..." }, "idempotency_key": "pay-991" }'
```

El token se consume al usarlo, incluso si la acción falla después (por
ejemplo por saldo insuficiente): para reintentar necesitas verificar un
desafío nuevo. Tu `idempotency_key` sigue siendo la protección contra
duplicados — el OTP no la reemplaza.

### Login en dos pasos

Si tu política exige OTP en `login`, `POST /v1/auth/login` deja de devolver
la sesión directamente:

```json
{
  "otp_required": true,
  "pending_token": "eyJhbGciOi…",
  "challenge_id": "8a2b…",
  "channel": "sms",
  "phone": "********5678",
  "expires_at": "2026-07-08T21:10:00Z",
  "note": "verify the code with POST /v1/auth/login/otp to receive the session token"
}
```

El `pending_token` **no sirve para llamar a la API**: solo se canjea, junto
con el código, por la sesión real:

```bash
curl -X POST https://api.qbank.cl/platform/v1/auth/login/otp \
  -H "Content-Type: application/json" \
  -d '{ "pending_token": "eyJhbGciOi…", "code": "482913" }'
```

```json
{
  "access_token": "eyJhbGciOi…",
  "expires_at": "2026-07-09T21:00:00Z",
  "account_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "role": "owner"
}
```

### El teléfono de la cuenta

- Formato **E.164** (`+56912345678`), se define en el registro, con
  `PATCH /v1/me` o por tu operador.
- `phone_verified` pasa a `true` la primera vez que verificas un desafío:
  demuestra que el titular tiene el teléfono en mano.
- **Cambiar el teléfono** (acción `phone_change`) valida el código contra el
  número **anterior** — así nadie puede redirigir tus códigos sin tener tu
  teléfono actual.
- Si el teléfono se enlaza por primera vez (o se cambia sin verificación),
  las acciones protegidas quedan bloqueadas por **24 horas**
  (`403 phone_binding_cooldown`): es la ventana anti-secuestro de sesión.
  El teléfono cargado por tu operador no tiene cooldown.

### Errores

| HTTP | `error` | Qué significa | Qué hacer |
|---|---|---|---|
| 403 | `otp_required` | La acción exige OTP y no enviaste `X-OTP-Token` | Crea y verifica un desafío, reintenta con el header |
| 403 | `otp_invalid` | Token inválido, expirado o ya usado | Verifica un desafío nuevo |
| 403 | `session_required` | Pediste un desafío con una API key | Los desafíos son solo para sesiones de usuario |
| 403 | `phone_binding_cooldown` | Teléfono enlazado hace menos de 24 h sin verificación | Espera el cooldown o pide a tu operador fijar el número |
| 401 | `invalid_code` | El código no coincide | Revisa el SMS/WhatsApp y reintenta (5 intentos) |
| 401 | `invalid_pending_token` | El token intermedio del login expiró | Vuelve a iniciar sesión |
| 409 | `phone_required` | La cuenta no tiene teléfono | `PATCH /v1/me` con `phone` E.164 |
| 409 | `otp_phone_missing` | El login exige OTP y no hay teléfono | Contacta a tu operador |
| 409 | `challenge_not_pending` | El desafío expiró o ya se usó | Crea uno nuevo |
| 429 | `too_many_attempts` | Límite de envíos/verificaciones | Espera unos minutos |
| 503 | `otp_unavailable` | El servicio de verificación no está disponible | Reintenta; la acción queda bloqueada (nunca se salta el OTP) |

### FAQ

#### ¿El OTP afecta mis integraciones server-to-server?
    No. Las API keys `pk_` están exentas por diseño: la automatización no
    pasa por OTP. Protege tus keys como corresponde — emitir una key nueva
    sí puede exigir OTP (acción `api_key_create`).
#### ¿Puedo elegir SMS o WhatsApp?
    El canal lo configura tu operador por acción (por cuenta o para toda la
    organización). Lo ves en `GET /v1/otp/settings`.
#### ¿Cuánto dura un código y cuántos intentos tengo?
    El código y el desafío duran 10 minutos. Tienes 5 verificaciones por
    desafío y un límite de envíos por hora. El `otp_token` resultante es de
    un solo uso.
#### ¿Puedo pedir el token una vez y usarlo en varias acciones?
    No: el token queda ligado a la acción exacta para la que pediste el
    desafío (un token de `payout` no sirve para `transfer`) y se consume al
    primer uso.
#### La acción falló después de consumir el token, ¿pago dos veces?
    No. El token consumido solo te obliga a verificar un desafío nuevo; la
    `idempotency_key` de la operación sigue garantizando que no haya
    duplicados.


## Webhooks

*Recibe eventos firmados en tiempo real*

Los webhooks te notifican los eventos de tu cuenta en un callback HTTPS
propio, firmados criptográficamente.

```mermaid
sequenceDiagram
    autonumber
    participant CB as CBPay
    participant App as Tu endpoint HTTPS
    CB->>App: POST firmado (X-Webhook-Signature, X-Webhook-Event-ID)
    alt Respondes 2xx a tiempo
        App-->>CB: 200 OK
        Note over CB: Entrega completa
    else Timeout o error
        App-->>CB: 5xx / timeout
        CB->>App: Reintento con backoff (hasta 5 intentos)
        Note over App: El mismo evento puede llegar 2 veces —<br/>deduplica por X-Webhook-Event-ID
    end
```

### Crear una suscripción

```bash
curl -X POST https://api.qbank.cl/platform/v1/webhooks/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payout_status_changed",
    "callback_url": "https://api.miapp.com/webhooks/cbpay",
    "secret": "un-secreto-de-al-menos-16-chars"
  }'
```

- `event_type`: uno de los eventos de la tabla siguiente, o `*` para todos.
- `callback_url`: **HTTPS obligatorio**; se rechazan localhost e IPs
  privadas — para desarrollo local usa un
  [túnel HTTPS](#ambiente-y-pruebas).
- `secret`: mínimo 16 caracteres; se usa para firmar cada entrega. Se
  almacena cifrado y no puede recuperarse.

La suscripción recibe los eventos de **tu cuenta**. Puedes listar las
suscripciones activas en cualquier momento:

```bash
curl https://api.qbank.cl/platform/v1/webhooks/subscriptions \
  -H "Authorization: Bearer <token>"
```

```json
{
  "page": 1,
  "page_size": 50,
  "subscriptions": [
    {
      "id": "5f3a…",
      "event_type": "payout_status_changed",
      "callback_url": "https://api.miapp.com/webhooks/cbpay",
      "status": "active",
      "created_at": "2026-07-01T12:00:00Z"
    }
  ]
}
```

### Eventos

| Evento | Cuándo se emite |
|---|---|
| `payin_credited` | Un cobro fiat fue recibido y abonado |
| `payout_status_changed` | Un payout cambió de estado |
| `transfer_received` | La cuenta recibió una transferencia interna |
| `crypto_deposit_credited` | Un depósito on-chain fue confirmado y abonado |
| `crypto_withdrawal_status_changed` | Un retiro on-chain cambió de estado |
| `banking_customer_status_changed` | Cambió la verificación de tu perfil bancario |
| `banking_operation_status_changed` | Un pago bancario cambió de estado |
| `card_transaction` | Una compra con tarjeta fue autorizada, anulada o ajustada |
| `card_status_changed` | Una tarjeta cambió de estado (incluye congelamiento automático) |
| `kyc_verification_status_changed` / `kyb_verification_status_changed` | Una verificación de identidad cambió de estado (incluye tu propio onboarding, con `self_onboarding: true`) |
| `kyc_link_completed` / `kyb_link_completed` | Un link de verificación hosteado fue completado |
| `kyc_document_validated` / `kyb_document_validated` | Terminó el OCR de un documento subido por API |
| `kyc_liveness_completed` | Una prueba de vida fue completada desde un liveness link |
| `aml_screening_updated` | Novedades del screening AML (resultado, casos, riesgo, transacción revisada) |

#### Payload de cada evento

```json payin_credited
{
  "payin_id": "9c2a…",
  "account_id": "ae8c…",
  "country": "BO",
  "currency": "BOB",
  "local_amount": "700.00",
  "fx_rate": "6.91",
  "usdt_credited": "100.302460",
  "fee": "1.000000"
}
```

```json payout_status_changed
{
  "payout_id": "0d4f…",
  "account_id": "ae8c…",
  "country": "MX",
  "currency": "MXN",
  "local_amount": "1500.00",
  "usdt_amount": "85.714286",
  "total_debit": "86.014286",
  "status": "completed",
  "status_code": ""
}
```

```json transfer_received
{
  "transfer_id": "77b1…",
  "from_account_id": "389d…",
  "to_account_id": "ae8c…",
  "asset": "USDT",
  "amount": "25.000000",
  "description": "Split de gastos",
  "created_at": "2026-07-06T20:10:00Z"
}
```

```json crypto_deposit_credited
{
  "account_id": "ae8c…",
  "chain": "tron",
  "asset": "USDT",
  "tx_id": "b1946ac9…",
  "amount": "499.000000",
  "fee": "1.000000"
}
```

```json crypto_withdrawal_status_changed
{
  "withdrawal_id": "5e8c…",
  "account_id": "ae8c…",
  "chain": "tron",
  "asset": "USDT",
  "tx_id": "7d3f01aa…",
  "status": "completed",
  "amount": "100.000000"
}
```

```json banking_customer_status_changed
{
  "account_id": "ae8c…",
  "customer_id": "9f2b…",
  "kyc_status": "approved"
}
```

```json banking_operation_status_changed
{
  "account_id": "ae8c…",
  "customer_id": "9f2b…",
  "operation_id": "7e8a…",
  "type": "withdraw",
  "status": "completed"
}
```

```json card_transaction
{
  "account_id": "ae8c…",
  "card_id": "3c2b…",
  "transaction_id": "5e4d…",
  "status": "authorized",
  "amount_usdt": "16.170000",
  "merchant": "AMZN Mktp"
}
```

```json card_status_changed
{
  "account_id": "ae8c…",
  "card_id": "3c2b…",
  "status": "frozen",
  "reason": "monthly_fee_unpaid"
}
```

```json kyc_verification_status_changed
{
  "account_id": "ae8c…",
  "kind": "kyc",
  "event": "approved",
  "submission_id": "c3d4…",
  "external_customer_id": "cust_789",
  "status": "approved",
  "risk_band": "low",
  "decision": "approved"
}
```

```json kyb_link_completed
{
  "account_id": "ae8c…",
  "kind": "kyb",
  "event": "link_completed",
  "link_id": "b2c3…",
  "submission_id": "d4e5…",
  "external_customer_id": "cust_456",
  "status": "completed"
}
```

```json kyc_document_validated
{
  "account_id": "ae8c…",
  "kind": "kyc",
  "submission_id": "c3d4…",
  "external_customer_id": "cust_789",
  "category": "identity",
  "outcome": "MATCH",
  "score": 0.97,
  "summary": "Document matches the submitted identity"
}
```

```json kyc_liveness_completed
{
  "account_id": "ae8c…",
  "kind": "kyc",
  "submission_id": "c3d4…",
  "external_customer_id": "cust_789",
  "outcome": "PASS",
  "passed": true
}
```

```json aml_screening_updated
{
  "account_id": "ae8c…",
  "screening_event": "compliance_risk_changed",
  "customer_id": "cus_8f2e…",
  "data": { "risk_level": "high" }
}
```

En `payout_status_changed` y `crypto_withdrawal_status_changed`, `status`
puede ser `completed` o `failed` (con `failed` el débito ya fue
reembolsado cuando recibes el evento).

### Formato de entrega

Cada entrega es un `POST` JSON con estos headers:

| Header | Contenido |
|---|---|
| `X-Webhook-Event` | Tipo de evento |
| `X-Webhook-Event-ID` | ID único del evento |
| `X-Webhook-Delivery-ID` | ID de esta entrega (cambia entre reintentos) |
| `X-Webhook-Timestamp` | Unix timestamp (segundos, UTC) |
| `X-Webhook-Signature` | Firma HMAC (ver abajo) |

### Verificar la firma

```
X-Webhook-Signature = hex( HMAC-SHA256( secret, timestamp + "." + body ) )
```

```javascript Node.js
const crypto = require("crypto");

function verifyWebhook(req, secret) {
  const ts = req.headers["x-webhook-timestamp"];
  const sig = req.headers["x-webhook-signature"];
  const expected = crypto
    .createHmac("sha256", secret)
    .update(ts + "." + req.rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

```python Python
import hashlib, hmac

def verify_webhook(headers, raw_body: bytes, secret: str) -> bool:
    ts = headers["X-Webhook-Timestamp"]
    sig = headers["X-Webhook-Signature"]
    expected = hmac.new(
        secret.encode(), f"{ts}.".encode() + raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(sig, expected)
```

> **Importante**
Calcula el HMAC sobre el **body crudo** (bytes tal como llegan), no sobre el
JSON re-serializado. Rechaza timestamps muy antiguos (> 5 minutos) para
prevenir replay.
### Reintentos e idempotencia

- Tu endpoint debe responder **2xx** dentro del timeout; cualquier otra
  respuesta se reintenta.
- Hasta **5 intentos** con backoff incremental:

| Intento | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Espera aprox. | inmediato | ~5s | ~20s | ~45s | ~80s |

- Usa `X-Webhook-Event-ID` para deduplicar: el mismo evento puede llegar más
  de una vez (entregas at-least-once).
- Si los 5 intentos fallan, el evento no se reenvía — recupera el estado
  con el `GET` del recurso (por eso ningún flujo debe depender SOLO del
  webhook).

### Buenas prácticas

- Responde `200` de inmediato y procesa en background.
- Registra el `X-Webhook-Delivery-ID` para trazabilidad.
- No dependas solo de webhooks para estados críticos: puedes consultar el
  objeto por API en cualquier momento (`GET /v1/payouts/{id}`, etc.).


## Errores

*Formato de error y catálogo completo de códigos*

Todos los errores comparten el mismo formato:

```json
{
  "error": "insufficient_funds",
  "message": "account balance is not enough for this operation"
}
```

- `error`: código estable en `snake_case` — úsalo en tu lógica.
- `message`: explicación legible — puede cambiar, no lo parsees.

### Códigos por categoría

#### Autenticación y permisos

| HTTP | `error` | Significado |
|---|---|---|
| 401 | `unauthorized` | Credencial ausente o inválida |
| 401 | `invalid_credentials` | Email o contraseña incorrectos (login) |
| 403 | `account_required` | El endpoint exige credencial de cuenta |
| 403 | `org_admin_required` | El endpoint exige credencial de administrador |
| 403 | `forbidden` | Nivel de credencial no permitido |
| 403 | `account_blocked` | La cuenta no está activa |
| 403 | `service_disabled` | El servicio no está habilitado para tu cuenta (consulta `GET /v1/services`) |
| 403 | `org_suspended` | El servicio está suspendido; contacta al equipo de CBPay |
| 403 | `company_only` | Función solo para cuentas empresa |

#### OTP / 2FA

Detalle y flujo completo en [seguridad y 2FA](#seguridad-y-2fa-otp).

| HTTP | `error` | Significado |
|---|---|---|
| 403 | `otp_required` | La acción exige OTP: verifica un desafío y reintenta con `X-OTP-Token` |
| 403 | `otp_invalid` | Token OTP inválido, expirado o ya usado |
| 403 | `session_required` | Los desafíos OTP requieren sesión de usuario, no API key |
| 403 | `phone_binding_cooldown` | Teléfono enlazado hace menos de 24 h sin verificación |
| 401 | `invalid_code` | El código no coincide |
| 401 | `invalid_pending_token` | El token intermedio del login expiró; vuelve a iniciar sesión |
| 400 | `invalid_action` / `invalid_channel` | Acción o canal fuera de catálogo |
| 409 | `phone_required` | La cuenta no tiene teléfono (`PATCH /v1/me`) |
| 409 | `otp_phone_missing` | El login exige OTP y la cuenta no tiene teléfono; contacta a tu operador |
| 409 | `challenge_not_pending` | El desafío expiró o ya se usó; crea uno nuevo |
| 429 | `too_many_attempts` | Límite de envíos o verificaciones; espera unos minutos |
| 503 | `otp_unavailable` | Servicio de verificación no disponible (la acción queda bloqueada, nunca se salta el OTP) |

#### Login social (OAuth)

Detalle y flujo completo en [login social](#login-social-google-apple-microsoft-meta).

| HTTP | `error` | Significado |
|---|---|---|
| 400 | `invalid_provider` | Proveedor fuera de `google/apple/microsoft/facebook` |
| 400 | `provider_not_configured` | Tu organización no tiene ese proveedor habilitado |
| 401 | `invalid_credential` | La credencial del proveedor es inválida, expiró o es de otra app |
| 409 | `email_conflict` | Ya existe una cuenta con ese email; entra con tu método actual y vincula el proveedor |
| 409 | `identity_taken` | Ese proveedor ya está vinculado a otra cuenta |
| 409 | `last_login_method` | No puedes desvincular tu único método de acceso |

#### Validación (400)

| `error` | Significado |
|---|---|
| `invalid_json` | Body no es JSON válido o tiene campos desconocidos |
| `invalid_type` | `type` debe ser `person` o `company` |
| `invalid_email` / `invalid_display_name` | Campo requerido inválido |
| `weak_password` | Contraseña menor a 8 caracteres |
| `invalid_role` | Rol de miembro inválido |
| `unknown_org` | Slug de organización incorrecto (usa `cbpay`) |
| `invalid_request` | Faltan `country`/`currency` |
| `idempotency_key_required` | Falta la clave de idempotencia |
| `beneficiary_required` | Falta el beneficiario del payout |
| `invalid_amount` | Monto no es un decimal positivo válido |
| `recipient_required` / `self_transfer` | Destino de transferencia inválido |
| `invalid_chain` / `invalid_asset` | Red o activo no soportado |
| `to_address_required` | Falta dirección destino del retiro |
| `invalid_payload` | Falta un campo requerido (ej. `enabled` en monitoreo AML, `external_customer_id` en verificaciones) |
| `liveness_already_completed` | La prueba de vida de esa verificación ya fue superada |
| `invalid_event_type` / `weak_secret` / `invalid_callback_url` | Suscripción de webhook inválida |
| `invalid_phone` | Teléfono no normalizable a E.164 (contactos y `to_phone`) |
| `batch_too_large` | Import de contactos con más de 1.000 entradas (pagina la subida) |
| `invalid_status` / `invalid_kyc_status` / `invalid_direction` / `reason_required` / `account_id_required` / `invalid_service` / `invalid_fee` | Validaciones de administración |

#### Dinero y estado (402 / 404 / 409 / 422)

| HTTP | `error` | Significado |
|---|---|---|
| 402 | `insufficient_funds` | Saldo disponible insuficiente |
| 404 | `not_found` | Recurso inexistente (o de otra cuenta) |
| 404 | `recipient_not_found` | Destino de transferencia inexistente |
| 409 | `duplicate` | El recurso ya existe |
| 403 | `verification_required` | Tu cuenta aún no aprobó su verificación de identidad (persona=KYC, empresa=KYB); hasta entonces solo puedes fondear — pide tu link en `POST /v1/me/verification/link` |
| 403 | `company_account_required` | La verificación de terceros (links/submissions KYC-KYB) es solo para cuentas empresa |
| 409 | `already_verified` | Pediste link de onboarding con la cuenta ya verificada |
| 409 | `no_screening` | Rescreen/monitoreo AML sin un screening previo |
| 409 | `no_banking_customer` | Operación banking sin perfil bancario creado (`POST /v1/banking/customer` primero) |
| 409 | `banking_customer_exists` | La cuenta ya tiene perfil bancario (es uno por cuenta) |
| 422 | `currency_not_supported` | Sin tasa FX para esa moneda |
| 422 | `core_rejected` | El procesador rechazó la operación |
| 422 | `recipient_unavailable` | La cuenta destino no puede recibir |
| 422 | `recipient_ambiguous` | Más de una cuenta comparte el teléfono de `to_phone` (usa `to_account_id` o `to_email`) |
| 422 | `contact_not_linked` | El contacto no tiene cuenta CBPay asociada para transferirle |
| 422 | `no_saved_destination` | El contacto no tiene destino guardado para ese corredor/chain |
| 422 | `wallet_limit_reached` | Una cuenta persona intentó crear una segunda wallet en la misma red |
| 409 | `card_limit_reached` | Una cuenta persona intentó crear una segunda tarjeta del mismo tipo |
| 409 | `card_cancelled` | La tarjeta ya está cancelada y no se puede modificar |
| 409 | `card_not_pending` | Solo tarjetas en `pending_activation` se pueden activar |
| 409 | `cardholder_kyc_pending` | El titular designado requiere documentos de identidad |
| 400 | `invalid_occupation` | `occupation` no es un código del catálogo (`GET /v1/cards/catalog/occupations`) |
| 400 | `invalid_kind_of_business` | `kind_of_business` no es un código del catálogo (`GET /v1/cards/catalog/business-activities`) |
| 400 | `invalid_settlement_asset` | `settlement_asset` no es USDT, USDC, BTC ni GOLD |
| 400 | `settlement_asset_disabled` | Tu organización tiene deshabilitado ese asset como origen de settlement |
| 422 | `settlement_limit_exceeded` | La operación supera el límite por operación de los assets volátiles (BTC/GOLD); usa USDT/USDC o divide la operación |
| 422 | `settlement_daily_limit_exceeded` | La cuenta superó su volumen de 24 h en assets volátiles (BTC/GOLD); usa USDT/USDC o reintenta más tarde |

#### Servicio (5xx)

| HTTP | `error` | Significado |
|---|---|---|
| 500 | `internal_error` | Error inesperado; reintenta con la misma clave de idempotencia |
| 502 | `rates_unavailable` | Tasas FX temporalmente no disponibles |
| 502 | `core_unavailable` | Procesador temporalmente no disponible |
| 502 | `compliance_unavailable` | Screening AML temporalmente no disponible |
| 503 | `verifications_unavailable` | Verificación de identidad temporalmente no disponible (la comisión se reembolsó) |
| 503 | `org_credential_missing` | Servicio en configuración; contacta al soporte de CBPay |
| 503 | `withdrawals_unavailable` | Retiros on-chain no habilitados para el corredor |
| 503 | `pricing_unavailable` | Precio de ejecución de BTC/GOLD no disponible o desactualizado; reintenta más tarde o liquida en USDT/USDC |

### Cómo manejarlos

- **4xx de validación**: corrige el request. No reintentes igual.
- **402**: fondea la cuenta y reintenta (clave de idempotencia nueva solo si
  la operación nunca se creó).
- **5xx / timeouts**: reintenta con **la misma** clave de idempotencia; la
  operación nunca se duplicará.


## Preguntas frecuentes

*Las dudas típicas al integrar, respondidas de una*

### Empezando

#### ¿Cuál es la URL base de la API?
`https://api.qbank.cl/platform` — todos los endpoints de esta
documentación cuelgan de ahí (por ejemplo
`https://api.qbank.cl/platform/v1/balances`).
#### ¿Hay un ambiente sandbox de pruebas?
No. La API opera directo en producción. Para probar tu integración usa
**montos pequeños reales**: deposita unos pocos USDT, haz un payout mínimo
y verifica el ciclo completo (débito → webhook → estado final). Si algo
falla, el débito se reembolsa automáticamente — no puedes "perder" saldo
por un error de datos.
#### ¿Cómo pongo saldo en mi cuenta para empezar?
Dos caminos: (1) **deposita USDT on-chain** — crea una wallet con
`POST /v1/crypto/wallets` y envía USDT a esa dirección (TRON o Ethereum);
(2) **cobra fiat** con un [payin](#payins) (QR, transferencia
anunciada, etc.). En ambos casos el saldo se acredita solo y te llega un
webhook.
#### ¿Necesito pasar KYC/KYB antes de operar?
Sí: toda cuenta debe aprobar su verificación de identidad (persona = KYC,
empresa = KYB) antes de mover dinero hacia afuera. Mientras tanto puedes
**fondear** (payins, depósitos crypto, transferencias entrantes) y leer;
las demás acciones responden `403 verification_required`. Pide tu link con
`POST /v1/me/verification/link` y completa el wizard —
[guía completa](#verificacion-kyc-y-kyb). Si algo te responde `403 account_blocked`,
contacta al equipo de CBPay.
#### ¿Por qué una operación me responde 403 service_disabled?
Ese servicio no está habilitado para tu cuenta (los servicios se activan por
cuenta según tu acuerdo comercial). Consulta `GET /v1/services` para ver el
mapa completo de lo que tienes habilitado — úsalo también para decidir qué
mostrar en tu UI — y contacta al equipo de CBPay si necesitas activar algo.
Las lecturas y el dinero en tránsito nunca se bloquean.
#### ¿Qué credencial uso: sesión JWT o API key?
Para procesos servidor-a-servidor usa siempre una **API key** (`pk_…`, no
expira). Las sesiones JWT (24 h) son para front-ends con usuarios que
inician sesión. Ambas van en `Authorization: Bearer <token>` (o
`X-API-Key`).
### Dinero y tasas

#### ¿En qué moneda está mi saldo?
Solo **USDT con 6 decimales**. Todas las operaciones fiat (payouts en CLP,
cobros en BOB…) se convierten a/desde USDT con las tasas de tu cuenta al
momento de ejecutar (`rate` para payouts, `payin_rate` para payins). Ver
[modelo de dinero](#modelo-de-dinero).
#### ¿Cómo sé cuánto me va a costar un payout antes de crearlo?
Consulta `GET /v1/rates` (devuelve **tu** tasa por país) y calcula:

```
usdt_amount ≈ monto_local / tasa       (redondeo hacia arriba, 6 decimales)
total_debit = usdt_amount + fee fijo   (tus fees vienen en la misma respuesta)
```

El objeto payout devuelve los valores exactos (`fx_rate`, `usdt_amount`,
`fee`, `total_debit`) calculados por el servidor.
#### ¿La tasa que veo en /v1/rates está garantizada?
No es una cotización congelada: el payout usa la tasa vigente **al momento
de crearlo** y el payin la vigente **al momento del abono**, que pueden
variar levemente respecto a la que consultaste. La tasa aplicada queda
registrada en el campo `fx_rate` de cada operación para auditoría.
#### ¿Hay montos mínimos o máximos?
La API no impone mínimos técnicos; con montos muy chicos la comisión fija
puede superar el monto (recibirás `invalid_amount` o un débito
antieconómico). Los máximos dependen de tu configuración con CBPay.
#### ¿Qué comisiones me aplican y dónde las veo?
Las define CBPay para tu cuenta: por servicio (payout, payin, funding,
retiro, KYC, creación de wallet), por país y con componente % y/o fijo.
`GET /v1/rates` devuelve tu lista efectiva en el campo `fees` (y los
porcentajes de FX ya vienen dentro de la tasa cotizada). Detalle en
[comisiones](#comisiones).
### Payouts

#### ¿Cuánto tarda un payout en llegar?
Depende del corredor: varios son **síncronos o casi inmediatos** (Yape,
Pago Móvil, QR Bolivia) y otros procesan en minutos vía el rail bancario
local (SPEI, transferencias). Diseña tu integración alrededor del webhook
`payout_status_changed`: no asumas tiempos fijos ni hagas polling.
#### ¿Qué pasa exactamente si un payout falla?
Se reembolsa **el débito completo** (monto + comisión) a tu saldo
`available`, automáticamente, y te llega el webhook con `status: failed` y
un `status_code` explicando la causa. Corrige los datos y reintenta con
una `idempotency_key` **nueva**.
#### ¿Puedo reintentar sin riesgo de pagar dos veces?
Sí — ese es el propósito de la `idempotency_key`: si repites la misma
clave, recibes el payout original (`idempotency_hit: true`) sin crear ni
debitar nada nuevo. Usa una clave distinta solo cuando realmente quieras
crear otro pago. Ver [idempotencia](#idempotencia).
#### ¿Cómo sé qué campos lleva el beneficiary de cada país?
En los [ejemplos por país](#payouts) hay una tabla de campos
y un ejemplo completo por país y método, y
`GET /v1/payouts/banks?country=XX` te da los códigos de banco vigentes
cuando aplican.
#### ¿Un QR escaneado se puede pagar dos veces?
No: cada `provider_reference` del scan admite un solo confirm. Reintentos
con la misma `idempotency_key` devuelven el payout original.
#### ¿Puedo cancelar o editar un payout en processing?
No. Cuando el payout está `processing` el rail bancario ya lo tiene; no
existe cancelación por API. Espera el estado final: si el rail lo rechaza,
el reembolso completo es automático. Verifica los datos del beneficiario
**antes** de crear (el `qr/scan` gratuito existe justamente para confirmar
el destinatario antes de pagar un QR).
#### ¿Hay montos mínimos, máximos o límites diarios?
La API no impone mínimos técnicos (con montos muy chicos la comisión fija
puede superar el monto). Los máximos y límites operacionales dependen de tu
acuerdo comercial y del corredor — si necesitas ampliar límites, contacta a
tu administrador CBPay indicando país, volumen esperado y ticket promedio.
### Payins y depósitos

#### ¿Cuándo se acredita mi saldo tras un cobro?
Cuando el proveedor confirma el pago: los QR y cobros activos suelen
acreditar en segundos; las transferencias bancarias cuando el depósito
llega y se matchea. Siempre recibes el webhook `payin_credited` con el
monto neto acreditado.
#### Mi cliente transfirió sin la referencia, ¿se perdió el dinero?
No. El depósito queda en estado `unassigned` y el equipo de CBPay lo
asigna manualmente a tu cuenta (al asignarse se acredita con tu tasa y
comisiones normales). Mientras tanto no aparece en tu saldo — si esperas
un depósito que no llega, avisa a tu administrador con el monto, moneda y
hora aproximada para acelerar la asignación. Para evitarlo, usa la
**cuenta CLABE dedicada** en México, la **página de pago** en Chile, o
insiste en que la referencia viaje en la descripción de la transferencia.
#### ¿Cuánto tarda en confirmarse un depósito crypto?
La detección es casi inmediata y el abono llega cuando la red confirma:
**TRON ~1 minuto** (19 confirmaciones), **Ethereum algunos minutos** según
congestión. El webhook `crypto_deposit_credited` cierra el ciclo con el
`tx_id` para que lo verifiques en el explorador.
#### ¿Cómo saco un estado de cuenta para mi contador?
Con la [cartola](#cartola-estado-de-cuenta): un endpoint que consolida todos los
movimientos del período (payouts, payins, crypto, transferencias y
comisiones) con cuadratura contable exacta. Pide `format=pdf` o
`format=xlsx` para descargar el documento con branding CBPay, o `json`
para mostrarla en tu web.
#### ¿El saldo de banking y mi saldo USDT son lo mismo?
No. El dinero de [banking](#banking) vive en **tus cuentas
bancarias reales** (USD u otras monedas habilitadas) y se consulta con
`GET /v1/banking/accounts/{id}/balance`. Tu saldo CBPay es USDT y solo se
toca para cobrar las comisiones fijas de banking (que se reembolsan si la
operación falla).
#### ¿Un depósito crypto y un payin son lo mismo?
No: un **payin** es un cobro fiat (moneda local → USDT); un **depósito
crypto** es USDT on-chain que llega a tu wallet (`funding`). Ambos terminan
en el mismo saldo USDT, con webhooks distintos (`payin_credited` vs
`crypto_deposit_credited`).
### Webhooks y errores

#### ¿Los webhooks son obligatorios?
No, pero sí muy recomendados: los estados finales llegan por webhook sin
que hagas polling. De todas formas puedes consultar cualquier objeto por
API (`GET /v1/payouts/{id}`, `GET /v1/payins/{id}`…) en cualquier momento.
#### ¿Cómo pruebo webhooks desde mi máquina (localhost)?
Las URLs locales se rechazan por seguridad. Usa un túnel HTTPS gratuito
(Cloudflare Tunnel o ngrok) y suscribe esa URL pública — receta paso a
paso en [ambiente y pruebas](#ambiente-y-pruebas).
#### ¿Cuál es la diferencia entre GET /v1/movements y la cartola?
Leen el mismo ledger: `movements` es la vista programática paginada (para
conciliación automática y tu UI); la cartola es el snapshot del período con
totales, desgloses y cuadratura garantizada (para cierres contables).
Nunca discrepan. Detalle en
[movimientos y conciliación](#movimientos-y-conciliacion).
#### ¿Por qué recibí el mismo webhook dos veces?
Las entregas son **at-least-once**: ante timeouts se reintenta (hasta 5
veces). Deduplica con el header `X-Webhook-Event-ID`, que es único por
evento.
#### ¿Qué hago con un error 5xx o core_unavailable?
Es transitorio: reintenta con backoff usando la **misma**
`idempotency_key` (así nunca duplicas). Si el problema persiste, contacta
al equipo de CBPay con el `payout_id`/`payin_id` y la hora.


# Recursos


## Postman

*Colección lista para importar y probar toda la API*

import { PostmanFreshness } from "/snippets/postman-freshness.jsx";

Descarga la colección oficial de Postman de CBPay, generada desde la misma
especificación OpenAPI de esta documentación: incluye todos los endpoints,
con un request por caso de uso (cada ejemplo nombrado del spec) y una
respuesta guardada por operación.

- **CBPay API — Colección Postman** — Descargar `cbpay-api.postman_collection.json` (v2.1)

{/* postman-meta:cbpay-api.postman_collection.json */}
> **Colección actualizada:** 2026-07-10 12:31 UTC · 140 requests · versión `7e0df0862104`

<PostmanFreshness iso="2026-07-10T12:31:00Z" lang="es" />
{/* /postman-meta */}

### Cómo usarla

### Importa la colección

En Postman: **Import** → arrastra el archivo descargado.
### Configura tus variables

La colección trae dos variables:

| Variable | Valor |
|---|---|
| `baseUrl` | `https://api.qbank.cl/platform` (ya configurada) |
| `token` | Tu JWT de sesión o API key `pk_...` |
### Prueba

Todas las requests heredan la autenticación Bearer con `{{token}}`.
Empieza por `GET /v1/me` para validar tu credencial y `GET /v1/balances`
para ver tu saldo.
> **Nota**
La colección se regenera con cada versión de la API — descárgala de nuevo
después de cada entrada del [changelog](#novedades) para tener los
últimos endpoints.


## Novedades

*Historial de cambios de la API y de esta documentación*

Todos los cambios de la API de CBPay y de esta documentación, del más
reciente al más antiguo. Los cambios que rompen compatibilidad se anuncian
con anticipación y quedan marcados como **Breaking**.

### v1.35 — 10 de julio de 2026

**Agregado — Contactos y envío por teléfono**

- **Libreta de contactos** (`/v1/contacts`): CRUD completo con búsqueda y
  favoritos. Cada envío (transferencia, payout, retiro crypto) **guarda su
  destino como contacto automáticamente** — deduplicado; opt-out con
  `"save_contact": false`.
- **Import de la agenda del celular** (`POST /v1/contacts/import`, hasta
  1.000 por request): normaliza los teléfonos a E.164 y te dice qué
  contactos **ya tienen CBPay** (`has_cbpay`, match solo dentro de tu
  operador).
- **Transferir por teléfono**: `POST /v1/transfers` acepta `to_phone`
  (solo cuentas con teléfono **verificado por OTP**; ambigüedad responde
  `422 recipient_ambiguous`) y `to_contact_id`.
- **Envío rápido a contactos**: `beneficiary_contact_id` en payouts (usa el
  beneficiario guardado del contacto) y `to_contact_id` en retiros crypto
  (usa su dirección guardada). Guía nueva:
  [Contactos](#contactos).

### v1.34 — 10 de julio de 2026

**Agregado — Verificación de identidad KYC/KYB (wizard hosteado, documentos con OCR y prueba de vida)**

- **Onboarding obligatorio**: toda cuenta nueva debe aprobar su verificación
  de identidad (persona ⇒ KYC, empresa ⇒ KYB) antes de operar. Hasta
  entonces solo puede **fondear** (payins, depósitos crypto, transferencias
  entrantes) y leer; el resto responde `403 verification_required`. Pide tu
  link con `POST /v1/me/verification/link` y consulta tu estado con
  `GET /v1/me/verification` — la aprobación actualiza tu `kyc_status`
  automáticamente. Las cuentas existentes quedaron aprobadas.
- **Verificación de terceros (solo cuentas empresa)**: genera links
  hosteados (`POST /v1/kyc/links`, `POST /v1/kyb/links`) o envía los datos
  por API (`POST /v1/{kyc,kyb}/submissions`), sube documentos con presign +
  OCR y cierra la prueba de vida con liveness links. Comisiones fijas
  nuevas `kyc_verification` / `kyb_verification` cobradas al crear (con
  `idempotency_key` obligatoria y reembolso automático si falla).
- 7 webhooks nuevos: `kyc/kyb_verification_status_changed`,
  `kyc/kyb_link_completed`, `kyc/kyb_document_validated`,
  `kyc_liveness_completed`. Guía completa en
  [Verificación KYC y KYB](#verificacion-kyc-y-kyb).

**Cambiado (BREAKING) — El screening pasa a AML**

- `POST /v1/kyc`, `POST /v1/kyc/rescreen` y `PATCH /v1/kyc/monitoring` se
  **eliminaron**: el screening contra listas ahora vive en
  `POST /v1/aml/screenings`, `POST /v1/aml/rescreen` y
  `PATCH /v1/aml/monitoring` (misma semántica y comisiones `compliance_*`).
  El error `no_kyc` pasa a `no_screening` y el screening ya no toca tu
  `kyc_status`. Nuevo webhook `aml_screening_updated` y nuevo service flag
  `aml` (el flag `kyc` ahora gatea la verificación de identidad). Guía:
  [AML screening](#aml-screening).

### v1.33 — 10 de julio de 2026

**Corregido — Catálogo de bancos sin `method` en países con varios métodos**

- `GET /v1/payouts/banks?country=VE` respondía `400` pidiendo `method`, y
  `?country=BO` respondía `400 payout_corridor_unsupported`. Ahora el
  catálogo **sin `method` devuelve la unión de los bancos de todos los
  métodos del país** (deduplicada por código), como promete esta
  documentación; con `method` se acota al canal específico (parámetro
  documentado en la referencia).

### v1.32 — 9 de julio de 2026

**Agregado — Compras con tarjeta desde BTC y GOLD (conversión al momento)**

- `spending_asset` ahora acepta también **BTC y GOLD**: las compras se
  convierten con el **precio efectivo del momento de cada evento** (el
  mismo del bloque `settlement` de `GET /v1/rates`).
- **Autorización**: se reserva el equivalente más un pequeño colchón (no es
  un cobro; se devuelve al liquidar). Si el precio de ejecución no está
  disponible, la compra se declina con `pricing_unavailable` — nunca se
  convierte con un precio no confiable.
- **Liquidación**: el monto final se re-cotiza al precio del momento de la
  captura y el sobrante del colchón vuelve solo. **Anulación** de una
  autorización: devolución del monto exacto, sin conversión.
  **Devoluciones/ajustes** posteriores: re-convertidos al precio del
  momento del evento (tu saldo asume la variación del precio).
- Las compras BTC/GOLD comparten los límites de assets volátiles de la
  cuenta con los payouts: por operación (`settlement_limit_exceeded`) y
  volumen 24 h (`settlement_daily_limit_exceeded`).

### v1.31 — 9 de julio de 2026

**Agregado — Elige desde qué saldo gastan tus tarjetas (USDT o USDC)**

- Cada tarjeta ahora tiene un **asset de gasto** (`spending_asset`): sus
  compras se debitan del saldo USDT o USDC de la cuenta, 1:1 con el USD y
  sin comisión de conversión. USDT por defecto (comportamiento idéntico al
  histórico).
- Defínelo al crear la tarjeta (`spending_asset` en `POST /v1/cards`) o
  cámbialo cuando quieras con `PATCH /v1/cards/{cardID}`. El cambio aplica
  solo a compras futuras: las autorizaciones en vuelo conservan (y
  devuelven a) el asset con el que debitaron.
- Las transacciones de tarjeta ahora exponen `spend_asset` y
  `spend_amount` (el saldo y monto realmente debitados); `amount_usd` /
  `amount_usdt` siguen siendo el valor USD de referencia. Los límites por
  tarjeta siguen midiéndose en USD.
- Errores nuevos: `400 spending_asset_unavailable` (BTC/GOLD no están
  disponibles para compras con tarjeta) y rechazos de autorización
  `spending_asset_disabled` si tu operador deshabilita el asset.

### v1.30 — 9 de julio de 2026

**Cambiado — Endurecimiento del settlement multi-asset**

- Los pagos desde BTC/GOLD ahora tienen, además del límite por operación,
  un **tope de volumen en 24 h móviles por cuenta** (`422
  settlement_daily_limit_exceeded`). Lo ves en `GET /v1/settlement` como
  `volatile_daily_limit_usdt`.
- Las comisiones de **tarjetas** (emisión, cancelación y mensualidad) ahora
  también se debitan desde tu saldo de settlement predeterminado, igual que
  el resto de los servicios. Las **compras** con tarjeta siguen liquidando
  en USDT.

### v1.29 — 9 de julio de 2026

**Agregado — Paga payouts y servicios desde cualquier saldo (settlement multi-asset)**

- Los payouts y las comisiones de servicios (KYC, creación de wallets,
  banking) ahora pueden debitarse desde **cualquiera de tus cuatro saldos**
  (USDT, USDC, BTC, GOLD). El pricing sigue cotizándose en USDT; el total
  se traduce al asset elegido con el precio efectivo de settlement del
  momento. Detalle en el
  [modelo de dinero](#modelo-de-dinero).
- Nuevo `GET/PUT /v1/settlement`: define el **saldo predeterminado** de tu
  cuenta (`default_settlement_asset`). Override puntual por operación con
  `settlement_asset` en `POST /v1/payouts` y en el confirm de QR.
- La respuesta del payout ahora registra `settlement_asset`,
  `settlement_amount` (el monto exacto debitado, que es también el que se
  reembolsa si falla — nunca se re-cotiza) y `settlement_rate`.
- `GET /v1/rates` suma un bloque `settlement` con el precio efectivo por
  asset habilitado, y `asset_prices` ahora trae `source`, `updated_at` y
  `settlement_grade` (si el precio está apto para ejecutar).
- Errores nuevos: `503 pricing_unavailable` (precio de ejecución de
  BTC/GOLD no disponible), `400 settlement_asset_disabled`,
  `400 invalid_settlement_asset` y `422 settlement_limit_exceeded`
  (límite por operación de los assets volátiles).

### v1.28 — 9 de julio de 2026

**Cambiado — Referencia corta en la transferencia anunciada**

- `POST /v1/payins` con `method: "bank_transfer"` ahora devuelve una
  `reference` **corta de 12 caracteres alfanuméricos** (ej.
  `CBW4N8R2T6P9`) en vez del UUID: los conceptos bancarios tienen límites
  duros (en Paraguay/SIPAP el máximo es 20 caracteres sin caracteres
  especiales) y el UUID no cabía.
- El match automático acepta la referencia nueva **y** sigue aceptando el
  UUID de los anuncios antiguos — los payins `pending` existentes no se
  ven afectados. El respaldo por monto+moneda no cambia.
- `GET /v1/payins` y el detalle muestran la referencia de anuncio en
  `reference` mientras el payin está `pending`.

### v1.27 — 9 de julio de 2026

**Agregado — Payins en Paraguay (transferencia anunciada)**

- Nuevo corredor de cobro `PY`/`PYG`/`bank_transfer`: anuncia el depósito
  con `POST /v1/payins`, tu pagador transfiere (SIPAP o transferencia
  interna del banco receptor) con la `reference` en el concepto, y el
  abono llega automático en USDT a tu `payin_rate`, como en todos los
  países. Guía en [payins](#payins).
- Los guaraníes no usan decimales: anuncia el **monto entero exacto**
  (ej. `"596000"`). El match de respaldo por monto+moneda aplica igual.
- El corredor aparece en `GET /v1/payins/methods` con `delivery: polling`.

### v1.26 — 9 de julio de 2026

**Agregado — Saldos virtuales multi-moneda (USDT, USDC, BTC, GOLD)**

- Cada cuenta ahora mantiene **cuatro saldos virtuales independientes**:
  `USDT` (la moneda operativa), `USDC`, `BTC` (8 decimales, satoshis) y
  `GOLD` (gramos de oro fino, 6 decimales, con respaldo en custodio).
  Nunca se mezclan ni se convierten automáticamente. Detalle en
  [modelo de dinero](#modelo-de-dinero).
- **`GET /v1/balances`** devuelve siempre los cuatro saldos (con ceros si
  no has operado esa moneda) y `GET /v1/movements` filtra por moneda con
  `?asset=`.
- **Transferencias internas multi-moneda**: `POST /v1/transfers` acepta
  `asset` (`USDT` default, `USDC`, `BTC`, `GOLD`) — siempre entre saldos de
  la **misma moneda**, sin conversión y sin comisión.
- **USDC on-chain**: crea wallets `eth`/`usdc`, deposita y retira USDC por
  Ethereum. Cada depósito acredita el saldo de su propio activo. Guía en
  [crypto](#crypto-wallets-depositos-y-retiros).
- **Precios de referencia**: `GET /v1/rates` incluye `asset_prices` con el
  precio USD referencial de cada moneda (BTC por unidad, GOLD por gramo) —
  solo para valorizar, sin conversión ni spread.
- **Cartola multi-moneda**: nueva sección `assets` con la conciliación
  independiente de cada saldo no-USDT (inicial/entradas/salidas/final y su
  flag `balanced`), también en el PDF y el Excel.
- Los payouts, payins, tarjetas y comisiones de servicios siguen operando
  **exclusivamente contra el saldo USDT**.

### v1.25 — 8 de julio de 2026

**Agregado — Login social (Google, Apple, Microsoft, Meta)**

- **Registro e inicio de sesión sin contraseña** con Google, Apple,
  Microsoft y Facebook por token exchange: tu front obtiene la credencial
  con el SDK del proveedor y la intercambias en `POST /v1/auth/oauth` por la
  sesión CBPay. Guía completa en [login social](#login-social-google-apple-microsoft-meta).
- **Endpoints nuevos**: `POST /v1/auth/oauth` (login + registro unificado),
  `GET /v1/auth/oauth/providers` (proveedores habilitados, público),
  `GET/POST /v1/me/identities` y `DELETE /v1/me/identities/{provider}`
  (vincular/desvincular proveedores desde la sesión).
- **Integra el 2FA**: si la cuenta exige OTP en login, el login social
  también devuelve `otp_required` + `pending_token`.
- **Multi-método**: una misma cuenta puede tener contraseña y varios
  proveedores; el auto-vínculo por email solo ocurre si el proveedor lo
  entrega verificado.
- Códigos de error nuevos en el [catálogo](#errores): `invalid_provider`,
  `provider_not_configured`, `invalid_credential`, `email_conflict`,
  `identity_taken`, `last_login_method`.

**Corregido**

- El sello de "Colección actualizada" en la página de Postman ahora muestra
  correctamente hace cuánto se actualizó (antes quedaba un indicador vacío).

### v1.24 — 8 de julio de 2026

**Agregado — OTP/2FA por SMS y WhatsApp**

- **Verificación en dos pasos para acciones sensibles**: tu operador puede
  exigir un código de un solo uso (por SMS o WhatsApp) antes de login,
  payouts, retiros crypto, transferencias, pagos bancarios, revelar una
  tarjeta, emitir API keys, agregar miembros o cambiar el teléfono. Guía
  completa en [seguridad y 2FA](#seguridad-y-2fa-otp).
- **Endpoints nuevos**: `POST /v1/otp/challenges` (envía el código),
  `POST /v1/otp/challenges/{id}/verify` (devuelve el `otp_token` de un solo
  uso para el header `X-OTP-Token`), `GET /v1/otp/challenges` (+ detalle) y
  `GET /v1/otp/settings` (tu política efectiva).
- **Login en dos pasos**: con OTP activo en `login`, `POST /v1/auth/login`
  devuelve `otp_required: true` + `pending_token`, y la sesión se emite en
  `POST /v1/auth/login/otp`.
- **Solo sesiones de usuario**: las API keys `pk_` quedan exentas — tus
  integraciones server-to-server no cambian.
- Códigos de error nuevos en el [catálogo](#errores): `otp_required`,
  `otp_invalid`, `phone_required`, `phone_binding_cooldown`,
  `too_many_attempts` y más.

### v1.23 — 8 de julio de 2026

**Documentación — persona vs empresa y guías unificadas**

- **Nueva página [personas y empresas](#personas-y-empresas)**:
  TODAS las diferencias entre los dos tipos de cuenta (wallets, tarjetas,
  miembros, KYC/KYB) en una sola tabla, con los errores que delata cada
  límite.
- **Guía de tarjetas reorganizada por tipo de cuenta**: pestañas
  "Cuenta persona" y "Cuenta empresa", cada una con su flujo completo
  (primera tarjeta, siguientes, y para empresas la emisión corporativa y
  para empleados) — ya no hay que armar el flujo leyendo notas sueltas.
- **Ejemplos por país de vuelta en sus guías**: los requests/responses por
  corredor de payouts y payins viven otra vez DENTRO de la guía de cada
  producto (una sola página por producto, sin saltar a una referencia
  aparte). Las URLs antiguas redirigen.
- **Postman con frescura en vivo**: la página Postman ahora muestra hace
  cuánto se actualizó la colección (segundos/minutos/días), además de la
  fecha y la versión.
- El [MD compilado](https://docs.cbpayapp.com) incluye ahora la referencia
  completa de endpoints y la versión de la documentación.

### v1.22 — 8 de julio de 2026

**Documentación — rediseño completo del sitio**

- **Navegación nueva**: Comenzar → Conceptos → Flujos de integración →
  Productos → Integración → Recursos, con icono por página y breadcrumbs.
- **Páginas nuevas**: [ambiente y pruebas](#ambiente-y-pruebas) (túnel
  para webhooks en local + checklist de go-live),
  [servicios habilitados](#servicios-habilitados),
  [estados y ciclo de vida](#estados-y-ciclo-de-vida) (incluye el catálogo de
  `status_code` de payouts fallidos),
  [movimientos y conciliación](#movimientos-y-conciliacion) y
  [flujos de integración](#flujos-de-integracion) con diagramas end-to-end.
- **Payouts y payins divididos**: guía general + referencia por país con el
  request y response real de cada corredor.
- **Guías ampliadas**: quickstart cierra el ciclo con webhooks; perfil
  (`PATCH /v1/me`) y miembros con roles; tabla completa de endpoints con
  idempotencia; schedule de reintentos de webhooks; tiempos de confirmación
  on-chain; cuentas banking en EUR; errores de banking en el catálogo; FAQ
  con límites, cancelaciones y conciliación.
- **Tarjetas: cuándo se envía el `cardholder`, aclarado.** La guía y el
  spec ahora explican que la **primera emisión** de una cuenta crea y
  verifica al titular (datos completos + documentos obligatorios) y que
  las tarjetas **siguientes** lo reutilizan sin pedir datos — antes el
  ejemplo mínimo daba a entender que nunca se pedían.

### v1.21 — 8 de julio de 2026

**Agregado**

- **`payin_rate` en `GET /v1/rates`**: cada país ahora entrega tus dos
  tasas — `rate` para payouts (dispersiones) y `payin_rate` para payins
  (cobros/depósitos fiat). Cotizado = acreditado, siempre.

**Cambiado**

- **Pricing de payins igual que payouts**: el pricing FX de un payin vive
  en tu `payin_rate` (la conversión del abono se hace exactamente a esa
  tasa) y la comisión de payin pasa a ser un **fijo por operación** — sin
  porcentajes aparte. El campo `fx_rate` de cada payin registra la tasa
  aplicada. Ver [comisiones](#comisiones) y la
  [guía de payins](#payins).
- La conversión de abonos redondea hacia abajo al micro-USDT (los débitos
  siguen redondeando hacia arriba), con diferencia máxima de 1 micro-USDT.

**Documentación**

- **KYC/KYB: referencia completa de campos de identidad.** El objeto
  `customer` siempre aceptó muchos más campos opcionales de los que
  mostraban los ejemplos (fecha de nacimiento, nacionalidades, documentos
  con país emisor, alias, domicilios, datos registrales de empresa…) y
  enviarlos hace el screening más preciso. La
  [guía de KYC](#verificacion-kyc-y-kyb) ahora documenta todos los campos, con
  ejemplos de identidad completa y la regla de deduplicación.

### v1.20 — 8 de julio de 2026

**Agregado**

- **Catálogo de tarjetas**: `GET /v1/cards/catalog/occupations` y
  `GET /v1/cards/catalog/business-activities` (buscables con `?q=`) para
  poblar selectores. Al designar una persona, `occupation` debe ser un
  **código** del catálogo; para empresa, `kind_of_business` también. Un valor
  fuera de catálogo se rechaza con `400 invalid_occupation` /
  `400 invalid_kind_of_business` antes de tocar el emisor. Ver la
  [guía de tarjetas](#tarjetas-virtuales-y-fisicas).

### v1.19 — 8 de julio de 2026

**Agregado**

- **`GET /v1/services`**: mapa efectivo de los servicios habilitados para tu
  cuenta (`payouts`, `payins`, `transfers`, `crypto`, `banking`, `kyc`,
  `cards`) — úsalo para decidir qué mostrar en tu UI. Los servicios se
  habilitan por cuenta según tu acuerdo comercial; si uno está apagado, sus
  acciones responden el nuevo error `403 service_disabled` (las lecturas y
  el dinero en tránsito nunca se bloquean).

### v1.18 — 8 de julio de 2026

**Agregado**

- **Tarjetas virtuales y físicas** que gastan directo del saldo USDT de la
  cuenta, sin prefondeo: cada compra se autoriza en tiempo real contra el
  saldo disponible y los límites de la tarjeta. Personas: 1 virtual + 1
  física; empresas: ilimitadas, propias o para personas designadas (ej.
  empleados). Nuevos endpoints `POST/GET /v1/cards`,
  `GET/PATCH /v1/cards/{id}` (límites y congelar/descongelar),
  `POST /v1/cards/{id}/activate|cancel|reveal` y
  `GET /v1/cards/{id}/transactions`. Ver la
  [guía de tarjetas](#tarjetas-virtuales-y-fisicas).
- **Nuevos servicios facturables** (fijos, configurables, pueden ser 0):
  `card_creation_virtual`, `card_creation_physical`, `card_monthly` (si no
  hay saldo, la tarjeta se congela — sin deuda) y `card_cancellation`.
- **Nuevos webhooks** `card_transaction` (autorizada/anulada/ajustada) y
  `card_status_changed` (cambios de estado, incluido el congelamiento
  automático).
- **Nuevos tipos de movimiento** en el ledger: `card_debit`, `card_refund`,
  `card_fee`, `card_fee_refund`.

### v1.17 — 7 de julio de 2026

**Agregado**

- **Chile: página de pago hosted (`method: "fintoc"`)** en
  `POST /v1/payins`. La respuesta trae una `payment_url` que el pagador
  abre para transferir desde **cualquier banco o billetera chilena** (Banco
  Estado, Santander, Mach, Tenpo, Mercado Pago, entre otros); el
  depósito se detecta, valida y acredita automáticamente en USDT con el
  webhook `payin_credited` de siempre. Soporta `idempotency_key` opcional:
  un reintento devuelve el mismo payin y la misma URL sin abrir otra sesión
  de pago. Ver la [guía de payins](#payins).

### v1.16 — 7 de julio de 2026

**Agregado**

- **Filtros de fecha `from`/`to` en todos los listados**: `/v1/movements`,
  `/v1/payouts`, `/v1/payins` y `/v1/crypto/transactions` ahora aceptan
  `from`/`to` (YYYY-MM-DD, UTC, inclusive), además de la paginación de
  siempre (`page`, `page_size` hasta 200). Fechas inválidas devuelven
  `400 invalid_range`.
- **Consulta de transferencias**: `GET /v1/transfers` (lista con
  paginación y fechas) y `GET /v1/transfers/{id}` — antes solo se podían
  crear.
- **Listar suscripciones de webhook**: `GET /v1/webhooks/subscriptions`.
- **Idempotencia en cobros activos**: `POST /v1/payins/collect` ahora exige
  `idempotency_key` (ejecuta un cargo real; un reintento nunca vuelve a
  cobrar al pagador). Igual refuerzo en creación de wallet (no dobla el fee
  en reintentos) y en ajustes de administración.
- Paginación uniforme agregada a `members`, `crypto/wallets`,
  `deposit-accounts` y (admin) `orgs`.

- **Cartola / estado de cuenta** (`GET /v1/reports/statement`): consolida
  todos los movimientos del período — payouts, payins, crypto,
  transferencias y comisiones — en un solo documento auditable con
  cuadratura contable exacta (`saldo inicial + entradas − salidas = saldo
  final`, verificada contra el ledger). Tres formatos con el mismo
  endpoint: **JSON** para tu web, **PDF** con branding CBPay y **Excel**
  multi-hoja con celdas numéricas, filtros y hoja de movimientos para
  auditores (`format=json|pdf|xlsx`, `lang=es|en`). El org admin puede
  generar la cartola de cualquiera de sus cuentas. Ver la
  [guía](#cartola-estado-de-cuenta).

### v1.15 — 7 de julio de 2026

**Mejorado**

- **Diagramas de flujo visuales en toda la documentación**: mapa del
  dinero en la introducción (todo lo que entra y sale del saldo USDT),
  ciclo de vida del payout con débito/hold/reembolso, flujo QR en dos
  pasos, las 4 modalidades de payin convergiendo al abono, depósito y
  retiro crypto, ciclo completo de banking, estados del KYC, entrega y
  reintentos de webhooks, y la regla de decisión de idempotencia
  ("¿con qué clave reintento?").

### v1.14 — 7 de julio de 2026

**Cambiado**

- **Nueva URL base: `https://api.qbank.cl/platform`** (antes
  `exchange.qbank.cl/platform`). El dominio anterior sigue funcionando
  como alias, así que ninguna integración existente se rompe — pero usa
  `api.qbank.cl` para todo lo nuevo. Toda la documentación, el spec y el
  Postman ya apuntan a la URL nueva.

### v1.13 — 7 de julio de 2026

**Agregado**

- **Banking**: cuentas bancarias reales para tu cuenta — recibe, mantén y
  envía dinero por rieles bancarios internacionales (SEPA, SWIFT, ACH
  según la moneda). 14 endpoints nuevos bajo `/v1/banking/*`:
  - Perfil bancario: crear, consultar, subir documentos y enviar a
    verificación.
  - Cuentas: abrir por moneda, listar y consultar saldo en vivo.
  - Beneficiarios: registrar, listar y agregar cuentas destino.
  - Pagos: cotizar (`prepare`, gratis) y ejecutar `TRANSFER`/`WITHDRAW`
    con idempotencia.
- Webhooks nuevos: `banking_customer_status_changed` y
  `banking_operation_status_changed`.
- Comisiones nuevas (fijas, configurables, reembolsables si la operación
  falla): `banking_customer`, `banking_account`, `banking_operation` — el
  campo `banking_fee` de cada respuesta muestra lo cobrado.
- Guía completa de [Banking](#banking) con el flujo end-to-end y
  ejemplos de cada operación.

### v1.12 — 7 de julio de 2026

**Mejorado**

- **API Reference completamente en español**: títulos, descripciones,
  campos y grupos del sidebar ahora están traducidos cuando navegas la
  documentación en español (antes solo la interfaz cambiaba de idioma).
- Guía de payouts reordenada: PIX de Brasil vive ahora solo en
  "Ejemplos por país" (se eliminó la sección duplicada); el QR quedó como
  única sección de flujo aparte por ser un flujo distinto (scan +
  confirm).
- Webhooks: payload de ejemplo de **cada uno de los 5 eventos**.
- Quickstart: registro con ejemplos de persona **y** empresa.
- **Colección Postman ampliada a 53 requests**: los endpoints con varios
  casos de uso ahora traen un request por caso (un payout por país y
  método, payins por modalidad, KYC persona/empresa, etc.), cada uno con
  su body listo para enviar.
- **Guía de payins reestructurada por país**, igual que payouts: matriz de
  corredores con la modalidad de cada país y pestañas Chile / Perú /
  México / Venezuela / Bolivia / Brasil con sus ejemplos completos.
- **Nueva página de [preguntas frecuentes](#preguntas-frecuentes)**: sandbox, fondeo
  inicial, costos previos al payout, garantía de tasa, tiempos de llegada,
  reintentos seguros, depósitos sin referencia y más — las dudas del
  primer día respondidas en la misma docu.
- Quickstart abre con la tabla de **datos clave** (URL base, header de
  auth, slug, formato de montos, ambiente) y el ejemplo de respuesta de
  `GET /v1/rates` con la fórmula para estimar costos.
- Payouts: respuesta de ejemplo de los catálogos de métodos y bancos, y
  tabla de estados con el efecto en tu saldo. Payins: respuesta de ejemplo
  del catálogo con el significado de `delivery`.

### v1.11 — 7 de julio de 2026

**Mejorado**

- **Ejemplos completos por caso de uso en toda la documentación**:
  - Payouts: ejemplo de cada país y método con su `beneficiary` real y la
    respuesta (Chile, Perú CCI + Yape, México CLABE + tarjeta, Venezuela
    Pago Móvil + transferencia, Bolivia ACH, Brasil PIX, Paraguay).
  - Payins: QR de Bolivia y Brasil lado a lado, cobro activo `c2p` y
    `debito_inmediato` con la respuesta del OTP, cuenta de depósito
    dedicada.
  - KYC/KYB: requests de persona, empresa y mínimo autocompletado, con las
    respuestas de screening, rescreening y monitoreo (activar/desactivar).
  - Transferencias: por email, por `account_id`, empresa→persona (nómina) y
    replay idempotente.
  - Crypto: creación de wallet persona vs empresa, y el error
    `wallet_limit_reached`.
  - API Reference: ejemplos nombrados seleccionables en cada endpoint (10
    corredores en payouts, 3 modos en payins, persona/empresa en KYC…).

### v1.10 — 7 de julio de 2026

**Agregado**

- **Brasil (BRL) con PIX** documentado en payouts y payins:
  - Payout `pix` por llave (CPF/CNPJ, teléfono, email o llave aleatoria
    `evp`) vía `POST /v1/payouts`.
  - Payout a QR PIX (estático o "copia e cola") vía el flujo
    `qr/scan` + `qr/confirm` con `country: "BR"`.
  - Payin con QR PIX dinámico vía `POST /v1/payins` (`method: "qr"`,
    `country: "BR"`), con imagen del QR y código "copia e cola".
  - Payin por transferencia anunciada (`method: "bank_transfer"`).

La habilitación del corredor es gradual; el catálogo
(`GET /v1/payouts/methods`, `GET /v1/payins/methods`) refleja la
disponibilidad en cada momento.

### v1.9 — 7 de julio de 2026

**Agregado**

- **Todos los métodos de cobro (payins) disponibles por API**:
  - `POST /v1/payins` ahora acepta `method`: `qr` (cargo QR, como antes) o
    `bank_transfer` (anuncias un depósito entrante y recibes la referencia
    que debe incluir la transferencia para acreditarse sola).
  - `POST /v1/payins/collect` — cobro activo (pull) al pagador en los
    corredores que lo soportan (ej. Venezuela `c2p` / `debito_inmediato`),
    con acreditación síncrona; `POST /v1/payins/collect/otp` para el OTP
    previo cuando el método lo requiere.
  - `POST /v1/payins/deposit-accounts` — cuenta de depósito dedicada fija
    (ej. CLABE en México) vinculada a tu cuenta: todo lo que llega se
    acredita automáticamente. `GET /v1/payins/deposit-accounts` para
    listarlas.
- Matriz completa de corredores y métodos de payout en la guía (Chile,
  Perú con `yape`, México SPEI, Venezuela con `pago_movil`, Bolivia con
  `qr`, Paraguay).
- Venezuela (VES) se sumó a las tasas de `GET /v1/rates`.

### v1.8 — 7 de julio de 2026

**Agregado**

- **Payout QR Bolivia**: paga a cualquier QR de cobro boliviano en dos
  pasos — `POST /v1/payouts/qr/scan` (gratis, devuelve los datos del
  destinatario) y `POST /v1/payouts/qr/confirm` (se cobra igual que un
  payout: tu tasa + fijo, con resultado final síncrono y reembolso
  automático si falla).
- Bolivia (BOB) se sumó a las tasas de `GET /v1/rates`.

### v1.7 — 7 de julio de 2026

**Agregado**

- Nueva página **[Postman](#postman)**: colección oficial descargable
  con los 25 endpoints, cuerpos de ejemplo y autenticación preconfigurada.
  Se regenera con cada versión de la API.

**Cambiado**

- La página de Comisiones y los ejemplos de payout reflejan el modelo de
  pricing vigente: los payouts se cobran **a tu tasa + fijo por operación**
  (sin porcentaje aparte). Si dispersas el equivalente a 100 USDT, se
  debitan 100 USDT más el fijo configurado.

### v1.6 — 7 de julio de 2026

**Mejorado**

- `GET /v1/rates` ahora entrega **el tipo de cambio propio de tu cuenta**
  por país: la misma tasa con la que se ejecutan tus operaciones
  (`monto_local / rate = USDT`), sin diferencias entre lo cotizado y lo
  cobrado.

### v1.5 — 7 de julio de 2026

**Eliminado (Breaking)**

- Se eliminó definitivamente `GET /v1/crypto/deposit-address` (el alias que
  quedó deprecado en v1.4). Usa `POST /v1/crypto/wallets` para crear
  wallets y `GET /v1/crypto/wallets` para consultarlas.

### v1.4 — 7 de julio de 2026

**Agregado**

- **Wallets múltiples para empresas**: las cuentas empresa ahora pueden
  crear wallets **ilimitadas por red** (las personas mantienen 1 por red).
- Nuevos endpoints: `POST /v1/crypto/wallets` (crear wallet, con `label`
  opcional para distinguirlas) y `GET /v1/crypto/wallets` (listar mis
  wallets). Cada creación cobra la comisión fija `wallet_creation` si está
  configurada.
- Nuevo error `422 wallet_limit_reached` cuando una persona intenta crear
  una segunda wallet en la misma red.
- Las respuestas de wallet ahora incluyen `wallet_id` y `label`.

**Cambiado**

- La guía de Crypto se reorganizó en: **crear wallet, ver mis wallets,
  depositar, transferir y movimientos**.
- `GET /v1/crypto/deposit-address` queda como alias legacy (deprecado):
  usa los endpoints de wallets.

**Corregido**

- Pulido de redacción y traducciones en ambos idiomas; la tabla de
  movimientos ahora incluye los tipos `wallet_creation_fee` y
  `wallet_creation_refund`.

### v1.3 — 7 de julio de 2026

**Mejorado**

- API Reference de nivel profesional: los 25 endpoints ahora incluyen
  ejemplos de request y de respuesta para **todos los casos** (éxito,
  replay de idempotencia, y cada error posible con su cuerpo real), listos
  para probar desde el playground de la documentación.
- Los 5 webhooks ahora están documentados dentro de la propia API Reference
  (sección Webhooks del estándar OpenAPI), con esquema y payload de ejemplo
  de cada evento.
- Catálogos de métodos y bancos documentados con las formas de respuesta
  reales del sistema.
- Endpoint `GET /healthz` documentado (estado del servicio).
- La guía de Crypto agrega **"Saldo y actividad de tu wallet"**: cómo ver el
  saldo, la actividad on-chain con `tx_id` y el historial contable.
- Redacción en voz de marca: toda la documentación habla como **CBPay**
  (antes usaba términos genéricos como "tu operador" o "la organización").
- La verificación de identidad ahora se nombra **KYC/KYB** en toda la
  documentación (KYC para personas, KYB para empresas).
- Transferencias internas: documentado explícitamente que funcionan entre
  **cualquier combinación** de cuentas (persona↔persona, persona↔empresa,
  empresa↔empresa) y son **siempre sin comisión**.

### v1.2 — 7 de julio de 2026

**Agregado**

- Nuevo servicio de comisión `wallet_creation`: la primera creación de una
  dirección de depósito en cada red puede tener un cargo fijo configurado
  por CBPay (0 = gratis, valor por defecto). La respuesta de
  `GET /v1/crypto/deposit-address` ahora incluye `creation_fee`, y el
  historial de movimientos incorpora los tipos `wallet_creation_fee` y
  `wallet_creation_refund`. Consultar una dirección existente sigue siendo
  siempre gratis; si la creación falla, el cargo se reembolsa
  automáticamente.
- Nueva página **Novedades** (esta página) con el historial de versiones de
  la API y la documentación.

**Cambiado**

- La guía de Crypto ahora tiene una sección explícita **"Crear tu wallet"**
  que explica la creación por red (201 primera vez con `creation_fee`, 200
  gratis después), y la API Reference renombra el endpoint a "Create or get
  my wallet (deposit address)".

### v1.1 — 6 de julio de 2026

**Agregado**

- Comisiones de compliance por operación: `compliance_person`,
  `compliance_company`, `compliance_rescreen` y `compliance_monitoring`
  (cargo fijo por llamada; 0 = gratis). Las respuestas de KYC ahora incluyen
  `compliance_service` y `compliance_fee`.
- Endpoints `POST /v1/kyc/rescreen` y `PATCH /v1/kyc/monitoring`
  (desactivar monitoreo es gratis). Requieren un KYC previo (`409 no_kyc`).

**Cambiado**

- Identidad visual oficial de CBPay aplicada a toda la documentación.
- La documentación de administración se movió a un portal interno de CBPay;
  este sitio contiene solo la API de cuentas.

### v1.0 — 6 de julio de 2026

**Lanzamiento inicial**

- Documentación pública de la API de CBPay, bilingüe (español e inglés):
  autenticación (sesiones JWT y API keys `pk_`), modelo de dinero USDT,
  comisiones, idempotencia, payouts fiat multi-país, payins, transferencias
  internas, crypto (fondeo y retiros on-chain), KYC, webhooks firmados y
  catálogo completo de errores.
- API Reference interactiva generada desde OpenAPI 3.1.


# Referencia completa de endpoints

Todos los endpoints de la API, agrupados por producto. El detalle de
cada uno (parámetros, cuerpos, respuestas y ejemplos por caso de uso)
está en la API Reference interactiva y en la colección Postman.


## Autenticación

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/v1/auth/register` | Registrar una cuenta |
| `POST` | `/v1/auth/login` | Iniciar sesión |
| `POST` | `/v1/auth/login/otp` | Completar el login en dos pasos |


## Login social

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/v1/auth/oauth` | Iniciar sesión o registrarse con un proveedor social |
| `GET` | `/v1/auth/oauth/providers` | Listar proveedores sociales habilitados |
| `GET` | `/v1/me/identities` | Listar mis proveedores vinculados |
| `POST` | `/v1/me/identities` | Vincular un proveedor a mi cuenta |
| `DELETE` | `/v1/me/identities/{provider}` | Desvincular un proveedor |


## Cuenta

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/me` | Obtener mi cuenta |
| `PATCH` | `/v1/me` | Actualizar mi perfil |
| `GET` | `/v1/members` | Listar miembros |
| `POST` | `/v1/members` | Agregar un miembro |
| `POST` | `/v1/api-keys` | Crear una llave de API |


## Saldos

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/balances` | Obtener saldos |
| `GET` | `/v1/movements` | Listar movimientos |
| `GET` | `/v1/rates` | Obtener mis tasas de cambio y comisiones |
| `GET` | `/v1/reports/statement` | Cartola / estado de cuenta (JSON, PDF o Excel) |


## Payouts

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/payouts` | Listar payouts |
| `POST` | `/v1/payouts` | Crear un payout |
| `GET` | `/v1/payouts/{payoutID}` | Obtener un payout |
| `GET` | `/v1/payouts/methods` | Listar métodos de payout |
| `GET` | `/v1/payouts/banks` | Listar bancos de destino |
| `POST` | `/v1/payouts/qr/scan` | Escanear un QR de payout (Bolivia, Brasil) |
| `POST` | `/v1/payouts/qr/confirm` | Confirmar un payout por QR (Bolivia, Brasil) |


## Payins

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/payins` | Listar payins |
| `POST` | `/v1/payins` | Crear un payin (cobro de recarga) |
| `GET` | `/v1/payins/{payinID}` | Obtener un payin |
| `GET` | `/v1/payins/methods` | Listar métodos de payin |
| `POST` | `/v1/payins/collect` | Cobro activo (pull) |
| `POST` | `/v1/payins/collect/otp` | Solicitar un OTP de cobro |
| `GET` | `/v1/payins/deposit-accounts` | Listar mis cuentas de depósito |
| `POST` | `/v1/payins/deposit-accounts` | Crear una cuenta de depósito dedicada |


## Transferencias

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/transfers` | Listar transferencias |
| `POST` | `/v1/transfers` | Crear una transferencia interna |
| `GET` | `/v1/transfers/{transferID}` | Consultar una transferencia |


## Crypto

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/v1/crypto/withdrawals` | Crear un retiro on-chain |
| `GET` | `/v1/crypto/withdrawals/{withdrawalID}` | Obtener un retiro |
| `GET` | `/v1/crypto/transactions` | Listar actividad on-chain |
| `GET` | `/v1/crypto/wallets` | Listar mis wallets |
| `POST` | `/v1/crypto/wallets` | Crear una wallet |


## AML screening

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/v1/aml/screenings` | Enviar un screening AML |
| `POST` | `/v1/aml/rescreen` | Reejecutar verificación KYC/KYB |
| `PATCH` | `/v1/aml/monitoring` | Habilitar o deshabilitar el monitoreo |


## KYC / KYB

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/v1/me/verification/link` | Pedir mi link de verificación (onboarding) |
| `GET` | `/v1/me/verification` | Mi estado de verificación (onboarding) |
| `GET` | `/v1/kyc/links` | Listar links KYC |
| `POST` | `/v1/kyc/links` | Crear un link KYC para un cliente |
| `GET` | `/v1/kyc/links/{linkID}` | Consultar un link KYC |
| `GET` | `/v1/kyb/links` | Listar links KYB |
| `POST` | `/v1/kyb/links` | Crear un link KYB para un cliente |
| `GET` | `/v1/kyb/links/{linkID}` | Consultar un link KYB |
| `GET` | `/v1/kyc/submissions` | Listar submissions KYC |
| `POST` | `/v1/kyc/submissions` | Crear una submission KYC con datos por API |
| `GET` | `/v1/kyc/submissions/{submissionID}` | Consultar una submission KYC |
| `GET` | `/v1/kyb/submissions` | Listar submissions KYB |
| `POST` | `/v1/kyb/submissions` | Crear una submission KYB con datos por API |
| `GET` | `/v1/kyb/submissions/{submissionID}` | Consultar una submission KYB |
| `GET` | `/v1/kyc/submissions/{submissionID}/documents` | Resultados OCR de documentos KYC |
| `POST` | `/v1/kyc/submissions/{submissionID}/documents` | Presign de un documento KYC |
| `POST` | `/v1/kyc/submissions/{submissionID}/documents/confirm` | Confirmar un documento KYC subido |
| `GET` | `/v1/kyb/submissions/{submissionID}/documents` | Resultados OCR de documentos KYB |
| `POST` | `/v1/kyb/submissions/{submissionID}/documents` | Presign de un documento KYB |
| `POST` | `/v1/kyb/submissions/{submissionID}/documents/confirm` | Confirmar un documento KYB subido |
| `GET` | `/v1/kyc/submissions/{submissionID}/liveness_link` | Consultar el liveness link y su estado |
| `POST` | `/v1/kyc/submissions/{submissionID}/liveness_link` | Crear un liveness link |


## Contacts

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/contacts` | Listar contactos |
| `POST` | `/v1/contacts` | Crear un contacto |
| `POST` | `/v1/contacts/import` | Importar la agenda del celular |
| `GET` | `/v1/contacts/{contactID}` | Consultar un contacto |
| `PATCH` | `/v1/contacts/{contactID}` | Editar un contacto |
| `DELETE` | `/v1/contacts/{contactID}` | Borrar un contacto |
| `POST` | `/v1/contacts/{contactID}/destinations` | Agregar un destino a un contacto |
| `DELETE` | `/v1/contacts/{contactID}/destinations/{destinationID}` | Borrar un destino guardado |


## Webhooks

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/webhooks/subscriptions` | Listar suscripciones de webhook |
| `POST` | `/v1/webhooks/subscriptions` | Crear una suscripción de webhook |


## Estado

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/healthz` | Salud del servicio |


## Banking

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/banking/customer` | Consultar mi perfil bancario |
| `POST` | `/v1/banking/customer` | Crear mi perfil bancario |
| `POST` | `/v1/banking/customer/documents` | Subir un documento de verificación |
| `POST` | `/v1/banking/customer/submit` | Enviar mi perfil a revisión |
| `GET` | `/v1/banking/accounts` | Listar mis cuentas bancarias |
| `POST` | `/v1/banking/accounts` | Abrir una cuenta bancaria |
| `GET` | `/v1/banking/accounts/{bankAccountID}/balance` | Consultar el saldo de una cuenta bancaria |
| `GET` | `/v1/banking/counterparties` | Listar mis beneficiarios |
| `POST` | `/v1/banking/counterparties` | Registrar un beneficiario |
| `POST` | `/v1/banking/counterparties/{counterpartyID}/accounts` | Agregar una cuenta a un beneficiario |
| `POST` | `/v1/banking/operations/prepare` | Cotizar un pago bancario |
| `GET` | `/v1/banking/operations` | Listar mis pagos bancarios |
| `POST` | `/v1/banking/operations` | Enviar un pago bancario |
| `GET` | `/v1/banking/operations/{operationID}` | Consultar un pago bancario |


## Cards

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/cards` | Listar tarjetas |
| `POST` | `/v1/cards` | Crear una tarjeta |
| `GET` | `/v1/cards/{cardID}` | Consultar una tarjeta |
| `PATCH` | `/v1/cards/{cardID}` | Actualizar límites, asset de gasto o congelar/descongelar |
| `POST` | `/v1/cards/{cardID}/activate` | Activar una tarjeta física |
| `POST` | `/v1/cards/{cardID}/cancel` | Cancelar una tarjeta |
| `POST` | `/v1/cards/{cardID}/reveal` | Revelar PAN y CVV |
| `GET` | `/v1/cards/{cardID}/transactions` | Listar transacciones de la tarjeta |
| `GET` | `/v1/cards/catalog/occupations` | Catálogo de ocupaciones |
| `GET` | `/v1/cards/catalog/business-activities` | Catálogo de giros |


## Seguridad (OTP)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/otp/settings` | Mi política OTP |
| `GET` | `/v1/otp/challenges` | Listar mis desafíos OTP |
| `POST` | `/v1/otp/challenges` | Pedir un código OTP |
| `GET` | `/v1/otp/challenges/{challengeID}` | Consultar un desafío OTP |
| `POST` | `/v1/otp/challenges/{challengeID}/verify` | Verificar el código |


## Account

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/v1/services` | Servicios habilitados |
| `GET` | `/v1/settlement` | Obtener mi configuración de settlement |
| `PUT` | `/v1/settlement` | Definir mi asset de settlement predeterminado |
