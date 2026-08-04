---
title: "Novedades"
description: "Historial de cambios de la API y de esta documentación"
slug: es/changelog
lang: es
source_url: https://docs.cbpayapp.com/es/changelog
---
Todos los cambios de la API de CBPay y de esta documentación, del más
reciente al más antiguo. Los cambios que rompen compatibilidad se anuncian
con anticipación y quedan marcados como **Breaking**.

## v2.29 · 2 versiones - 4 de agosto de 2026

### v2.29

**Agregado**

- **Comisión por compra con tarjeta**: las transacciones de tarjeta ahora
  pueden llevar una comisión transaccional (porcentaje + fijo) configurada
  por cuenta a través de dos servicios nuevos — `card_purchase_virtual` y
  `card_purchase_physical`. La comisión se **estima en la autorización**
  (incluida en la retención del saldo), se **recalcula en la liquidación**
  con la configuración vigente en ese momento, y se **devuelve prorrateada**
  en reversas y ajustes parciales o totales. Las transacciones de tarjeta
  ahora exponen `fee_asset`, `fee_amount` y `fee_refunded_amount` (se
  omiten cuando no hay comisión configurada — las cuentas sin
  configuración no ven cambios), el comprobante de compra muestra la línea
  de comisión, y el ledger registra los movimientos como `card_fee` /
  `card_fee_refund`. Detalles en
  [tarjetas](https://docs.cbpayapp.com/es/guias/tarjetas#comisión-por-compra-ciclo-de-vida).

### v2.28

**Agregado**

- **Tarjetas guardadas con verificación del pagador en la página de pago**:
  toda página de pago con tarjeta (la `payment_url` de un payin `card` y la
  opción tarjeta del checkout universal) ahora pide el **correo del pagador
  como primer campo** y, si ese correo tiene tarjetas guardadas contigo, le
  envía un **código de verificación** antes de mostrarlas — la lista jamás
  se revela sin verificar. Con **"Recordar este dispositivo"** (marcado por
  defecto) el pagador no repite el código por **30 días** en ese navegador.
  Al elegir una tarjeta paga con 3-D Secure sin re-digitarla. Detalle en
  [tarjetas guardadas](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions#el-pagador-descubre-sus-tarjetas-en-la-página-de-pago).

**Cambiado**

- **El checkout universal ya no pide el correo del pagador**: la opción
  tarjeta materializa y redirige directo a la página de pago, donde vive el
  discovery de tarjetas guardadas. El endpoint público
  `GET /pay/{token}/saved-cards` fue **eliminado** (responde 404) — la
  lista de tarjetas ya no sale de ninguna superficie sin verificación.
  **Sin cambios de contrato**: `POST /v1/payins` (`card` y `checkout`)
  sigue igual, y `stored_card_id` server-to-server no exige código (ya
  conoces a tu cliente).

## v2.27 · 2 versiones - 3 de agosto de 2026

### v2.27

**Agregado**

- **Desactivar y reactivar suscripciones de webhook**: nuevo
  `PATCH /v1/webhooks/subscriptions/{subscriptionID}` con
  `{ "status": "active" | "disabled" }` — una suscripción `disabled` deja de
  recibir eventos nuevos sin borrarse (las entregas ya encoladas siguen
  saliendo) y puedes reactivarla cuando quieras. Idempotente: repetir el
  estado vigente es un no-op `200`. Ver la
  [guía de webhooks](https://docs.cbpayapp.com/es/webhooks#desactivar-y-reactivar-una-suscripción).

### v2.26

**Corregido**

- **Estado de verificación protegido ante eventos tardíos de intentos
  anteriores**: cuando una cuenta reintenta su verificación de identidad
  (por ejemplo, tras un rechazo), un evento de estado tardío de un intento
  anterior ya no puede cambiar el estado de verificación de la cuenta ni
  disparar el correo de decisión — solo el intento más reciente lo decide.
  Cada intento conserva su historial completo en el panel de
  administración.

## v2.25 · 3 versiones - 2 de agosto de 2026

### v2.25

**Cambiado**

- **Códigos de error de administración documentados**: se agregaron los
  códigos `global_treasury_access_disabled` e `invalid_value` al
  [catálogo de errores](https://docs.cbpayapp.com/es/errores). Provienen de superficies de
  administración de organización (el panel CBPay Admin), no de la API a
  nivel cuenta — ver la nueva sección "Panel de administración de
  organización".

### v2.24

**Agregado**

- **Instrucciones de depósito para transferencias anunciadas**
  ([guía de payins](https://docs.cbpayapp.com/es/guias/payins)): crear un payin con
  `method: "bank_transfer"` en los corredores soportados ahora devuelve
  un bloque `deposit_instructions` con la cuenta de destino exacta —
  `bank_name`, `account_number`, `account_type`, `holder_name`,
  `holder_tax_id`, `holder_email`, `reference_required`, un `qr_payload`
  para copiar (texto multilínea con la cuenta, el titular y tu
  referencia/monto) y un `qr_png_base64` brandeado. El mismo bloque se
  repite en el detalle y el listado del payin. El nuevo
  `GET /v1/payins/deposit-instructions?country=&currency=&method=`
  permite previsualizar la cuenta de destino antes de crear el payin.
  Revisa el FAQ de la guía para entender por qué el QR bancario es para
  copiar, no para autocompletar.

### v2.23

**Agregado**

- **Emails automáticos de decisión de verificación KYC/KYB** (onboarding
  propio): al quedar tu verificación en aprobada, rechazada o con cambios
  requeridos, recibes un correo brandeado con la organización avisando el
  resultado. No aplica a verificaciones de un tercero (por ejemplo, tu
  empresa verificando a un cliente o proveedor) — ahí sigue el webhook
  `kyc_status_changed`/`kyb_status_changed` que ya integraste. El correo no
  incluye el motivo detallado de un rechazo por razones de seguridad y
  privacidad.

## v2.22 · 1 versión - 1 de agosto de 2026

### v2.22

**Cambiado**

- **La prueba de vida ahora admite varias sesiones por sujeto**
  ([verificación de identidad](https://docs.cbpayapp.com/es/guias/kyc)): el array `liveness[]` del
  informe de verificación puede traer más de una entrada por persona — el
  check de onboarding `gate` más una o más recapturas de evidencia
  `media_recapture` posteriores. Cada sesión ahora trae su propio
  `session_id` y `purpose` (`gate` o `media_recapture`). En un KYB,
  `parties[].liveness` (singular) se conserva por compatibilidad y siempre
  apunta a la sesión `gate` de esa parte, mientras el nuevo
  `parties[].liveness_sessions[]` trae todas las sesiones de esa parte. La
  metadata de media sigue sin URLs (`has_selfie`, `has_video`,
  `frame_gestures`, hashes) — sin cambio de contrato ahí.

## v2.21 · 1 versión - 30 de julio de 2026

### v2.21

**Cambiado**

- **Informe de verificación con portada navegable**
  ([verificación de identidad](https://docs.cbpayapp.com/es/guias/kyc)): el PDF abre con un índice de
  tarjetas **clicables** (icono, título y número de página) que saltan a su
  sección. Cada sección lleva su icono y su barra de acento, con el mismo
  lenguaje visual del informe AML.
- **Enlaces clicables**: los medios adversos del anexo AML llevan un chip
  “ver fuente” y la URL de verificación pública del cierre es clicable. Por
  seguridad, **solo se embeben enlaces `http` y `https`** — cualquier otro
  esquema se descarta y el texto queda sin enlace.
- **Fotos con su proporción real**: las fotos del documento y de la prueba de
  vida se muestran sin deformarse, con su leyenda debajo.
- **Sin páginas en blanco ni títulos huérfanos**: cada encabezado de sección
  reserva el alto de su primer bloque, así que nunca queda solo al pie de una
  página.
- El estado agregado de medios adversos se lee **“Review”** (antes “In
  review”) en la versión en inglés.

## v2.20 · 2 versiones - 28 de julio de 2026

### v2.20

**Agregado**

- **Evidencia visual en el informe de verificación**
  ([verificación de identidad](https://docs.cbpayapp.com/es/guias/kyc)): cuando el proveedor publica
  media de liveness (selfie / frames) o fotos del documento de identidad, el
  **PDF embebe las fotos** best-effort. Si no hay media o el enlace expiró,
  la sección de fotos se omite. El JSON del informe solo declara metadata
  (`has_selfie`, gestos, `has_video`, hashes) — **jamás URLs firmadas**.
- **Anexo AML completo al cierre del PDF**: si hubo screening, el informe
  reutiliza el mismo cierre del informe AML (atribución, estadísticas de
  cobertura, bloques de fuentes y aviso legal). Sin screening queda el
  disclaimer genérico.

### v2.19

**Agregado**

- **Informe de verificación completo, sin datos descartados**
  ([verificación de identidad](https://docs.cbpayapp.com/es/guias/kyc)): el informe KYC/KYB pasó de
  resumen a expediente. Además de lo que ya traía, el JSON y el PDF ahora
  incluyen el **perfil económico declarado** (origen de fondos, propósito de
  la relación, volúmenes e ingresos esperados, cadenas esperadas), las
  **declaraciones de riesgo** (servicios monetarios, fondos de terceros,
  actividades de alto riesgo, países prohibidos), la **cuenta bancaria
  enmascarada en origen** (el número completo jamás entra al informe), la
  identidad de empresa extendida (constitución, jurisdicción, industria
  ISIC, sitio web, países de operación, dirección registrada) y el
  **residual del expediente**: todo campo verificado que no calce en una
  sección estructurada sale igual en el bloque de campos.
- **Partes relacionadas con su propio screening AML (KYB)**: cada UBO,
  persona de control y firmante del expediente sale como una entrada de
  `parties[]` con su identidad, su participación, los documentos y la prueba
  de vida que le corresponden y **su propio screening AML con monitoreo
  continuo activado**. Sin costo: es diligencia, no un producto facturable.
  El par `(source, index)` es la identidad estable de la parte, así que su
  screening es siempre el mismo por más veces que descargues el informe. Si
  una parte todavía no tiene screening al descargar, el informe sale con
  `"partial": ["party_aml_unavailable"]` y el faltante se ejecuta en
  segundo plano.
- **Screening AML con el detalle de cada coincidencia**: la sección AML del
  informe completo (terceros y lectura admin) trae ahora indicadores,
  alias, listas de sanciones con fuente y vigencia, cargos PEP, vínculos
  RCA y medios adversos — el mismo nivel de detalle del informe AML. En el
  informe de tu propio onboarding la sección sigue **agregada**
  (`clear` / `under_review`, sin coincidencias), y lo mismo aplica al
  screening de tus partes relacionadas.
- **Validación documental en el detalle de documentos**: cada documento del
  informe expone `validated_at` y, cuando corresponde, el motivo de rechazo,
  junto a categoría, archivo, estado, outcome y score.

## v2.18 · 3 versiones - 27 de julio de 2026

### v2.18

**Corregido**

- **Montos siempre en decimal plano** ([payins](https://docs.cbpayapp.com/es/guias/payins)): el campo
  `local_amount` de los payins (y el `amount` de los eventos de cobro) se
  devuelve siempre como texto decimal — por ejemplo `"5000000"` —, nunca en
  notación científica. En depósitos de montos altos en monedas sin decimales
  (CLP, PYG, COP) un abono podía quedar registrado como `"5e+06"`: el monto
  era ilegible para tu integración y el abono no lograba emparejarse con su
  transferencia anunciada, quedando sin acreditar. La corrección aplica
  también a los registros históricos: al consultarlos por la API se leen ya
  normalizados, sin que se altere ningún dato contable.

### v2.17

**Agregado**

- **Informe de verificación KYC/KYB descargable**
  ([verificación de identidad](https://docs.cbpayapp.com/es/guias/kyc)): cada submission de KYC/KYB
  tiene ahora su informe de verificación generado por la plataforma, en
  `?format=pdf|json` y `?lang=en|es|zh`. Terceros: `GET
  /v1/kyc/submissions/{submissionID}/verification-report` y `GET
  /v1/kyb/submissions/{submissionID}/verification-report` (cuenta empresa,
  informe completo: identidad verificada, ciclo de vida, documentos + OCR,
  liveness y screening AML con matches). Onboarding propio: `GET
  /v1/me/verification/report` (misma estructura con la sección AML
  agregada). Sin costo — es lectura de la verificación ya pagada.
- **Código de verificación pública del informe**: el PDF imprime un código
  HMAC + QR y cualquiera puede validar el documento en `GET
  /verify/reports/{code}` (JSON o página HTML, sin datos personales: solo
  tipo, estado vigente de la decisión, fecha y organización emisora).
- **Códigos de error nuevos**: `invalid_format` (400, `format` distinto de
  `pdf`/`json`) y `verification_not_found` (404, la cuenta aún no envió
  ninguna verificación); `invalid_language` aplica también a este informe.

### v2.16

**Corregido**

- **Los cobros QR se acreditan siempre solos** ([payins](https://docs.cbpayapp.com/es/guias/payins)):
  un QR pagado podía quedar `pending` mientras el dinero entraba como
  depósito sin asignar, porque la transferencia del banco no trae la
  referencia del cobro y la conciliación por monto está reservada a las
  transferencias anunciadas. Ahora el abono que liquida un cobro (QR, link
  de checkout o tarjeta) viaja con el vínculo al cobro pagado y se rutea
  uno a uno a su payin — sin heurística. El payin acreditado lo declara con
  `match_method: charge_link`, la señal de conciliación más fuerte de todas.
- **Enum documentado de `match_method`**: la referencia listaba
  `single_candidate` y `dedicated_instrument`, que no existen en la API. Los
  valores reales son `amount_single_candidate` y `dedicated_clabe`; se
  agregaron `charge_link` y `manual_assign` (un admin ruteó el depósito a
  mano) al spec.
## v2.15 · 1 versión - 26 de julio de 2026

### v2.15

**Corregido**

- **Las transferencias anunciadas ya respetan la idempotencia**
  ([payins](https://docs.cbpayapp.com/es/guias/payins)): `POST /v1/payins` con
  `method: "bank_transfer"` aceptaba `idempotency_key` y la ignoraba, así que
  un reintento (timeout, doble clic) abría un segundo anuncio. Dos anuncios
  vivos con el mismo monto son justo el caso que la conciliación se niega a
  resolver, por lo que el abono real quedaba `unassigned`. Ahora un reintento
  con la misma clave — campo del body o header `Idempotency-Key` — devuelve
  el anuncio original (misma `reference`, HTTP `200` con
  `idempotency_hit: true`). Un POST sin clave reutiliza un anuncio vivo
  idéntico (misma cuenta, moneda, monto y pagador) en vez de duplicarlo. Para
  cobrar dos pagos reales del mismo monto al mismo pagador, manda una clave
  distinta en cada anuncio. Reutilizar una clave que ya usaste con OTRO
  método de payin (QR, checkout, tarjeta) responde ahora
  `409 idempotency_conflict` en vez de devolver un objeto que no
  corresponde.
## v2.14 · 6 versiones - 25 de julio de 2026

### v2.14

**Agregado**

- **Identificación del pagador en transferencias anunciadas**
  ([payins](https://docs.cbpayapp.com/es/guias/payins)): `POST /v1/payins` con
  `method: "bank_transfer"` acepta los opcionales `payer_name`,
  `payer_document` y `payer_account`. Si no mandas `payer_document` y la cuenta
  es una persona verificada, se usa por defecto el documento del titular, así
  un depósito que llega sin referencia igual se reconoce por el ordenante que
  reporta el banco. La respuesta indica qué identidad quedó en juego con
  `payer_source` (`declared`, `account_identity` o `none`).
- **Auditoría del match en el payin**: `GET /v1/payins/{id}` expone
  `match_method` (`reference`, `payer_document`, `payer_account`,
  `payer_name`, `single_candidate`…) y el bloque `payer` que reportó el riel,
  para que veas exactamente por qué el depósito cayó en esa cuenta.

**Cambiado**

- **Las transferencias anunciadas ya no matchean "la más antigua" por monto**:
  si dos o más anuncios pendientes comparten monto y moneda y nada identifica
  al pagador, el depósito queda `unassigned` en vez de acreditarse a la cuenta
  equivocada (fail-closed). El match solo por monto sobrevive cuando hay
  exactamente UN candidato. Documentado en la sección nueva
  [Cómo se concilia una transferencia anunciada](https://docs.cbpayapp.com/es/guias/payins).

### v2.13

**Agregado**

- **Cuota del handshake del stream de eventos** ([errores](https://docs.cbpayapp.com/es/errores)): abrir
  `GET /v1/events` demasiadas veces seguidas ahora responde
  `429 rate_limited`. Es un limite distinto de `too_many_streams`:
  `rate_limited` cuenta *intentos* de conexion por IP (600 por hora, de sobra
  para reconexiones), mientras `too_many_streams` limita cuantos streams
  mantienes *abiertos* a la vez (5 por cuenta). Los dos se reintentan igual:
  esperas y reconectas con tu `Last-Event-ID`, no se pierde nada.

### v2.12

**Agregado**

- **Stream de eventos en tiempo real** ([guía](https://docs.cbpayapp.com/es/eventos-tiempo-real)):
  `GET /v1/events` abre una conexión Server-Sent Events con todo lo que pasa
  en tu cuenta — los mismos eventos de los webhooks, entregados al navegador
  sin esperar un polling. Reconectas con el header `Last-Event-ID` y el
  servidor replaya lo que te perdiste, filtras con `?types=` y pides el estado
  actual absoluto con `?snapshot=true`.
- **Historial de eventos consultable**: `GET /v1/events/history` (con
  `from`/`to`, paginación y filtro por tipo) y `GET /v1/events/{eventID}` leen
  el mismo log que alimenta el stream, con retención de 90 días.
- **Tres eventos nuevos** ([webhooks](https://docs.cbpayapp.com/es/webhooks)): `balance_adjusted` (un
  administrador acreditó o debitó tu saldo), `account_status_changed` (tu
  cuenta fue suspendida o reactivada) y `member_security_event` (inicios de
  sesión, cambios de contraseña o 2FA, sesiones revocadas). Llegan por webhook
  y por el stream.
- **Códigos de error nuevos** ([errores](https://docs.cbpayapp.com/es/errores)): `too_many_streams`,
  `stream_unavailable` y `streaming_unsupported`.

### v2.11

**Agregado**

- **Devoluciones de cobros con tarjeta**
  ([guía](https://docs.cbpayapp.com/es/guias/devoluciones)): `POST /v1/payins/{payinID}/refunds`
  devuelve un cobro con tarjeta completo o parcial y descuenta el monto de tu
  saldo en el momento. La devolución exige clave de idempotencia (el reintento
  con la misma clave nunca devuelve dos veces) y código OTP cuando la pides
  con tu sesión. `GET /v1/payin-refunds` lista tus devoluciones con filtros
  por cuenta, estado, tipo y rango de fechas, `GET /v1/payin-refunds/{id}`
  trae el detalle y `GET /v1/payin-refunds/{id}/receipt` genera el
  comprobante PDF con código verificable.
- **Estado de devolución en el cobro**: los payins devueltos exponen
  `refund_status` (`partial` o `full`), `refunded_amount` (USDT acumulado
  descontado) y `refunded_local` (monto acumulado devuelto al tarjetahabiente).
- **Webhook `payin_refunded`** ([webhooks](https://docs.cbpayapp.com/es/webhooks)): notifica cada
  devolución, anulación y contracargo con su tipo, estado, montos y el saldo
  resultante.

**Cambiado**

- **La comisión y el margen de tasa no se reembolsan**: al devolver un cobro
  se descuenta el bruto acreditado; lo que cobramos por procesar el pago se
  mantiene. Un contracargo notificado por el emisor se aplica automático y
  puede dejar tu saldo en negativo hasta que lo fondees.
- **Códigos de error nuevos** ([errores](https://docs.cbpayapp.com/es/errores)):
  `payin_not_refundable`, `refund_not_supported`, `refund_exceeds_payin` e
  `invalid_amount`.

### v2.10

**Cambiado**

- **Página pública de estado del servicio rediseñada**
  ([guía](https://docs.cbpayapp.com/es/estado-del-servicio)): la página que entrega
  `status_page_url` ahora muestra bandera por país, ícono por método de
  pago, una barra de disponibilidad día a día de los últimos 90 días, una
  tarjeta de resumen con el estado general y el uptime promedio, y una línea
  de tiempo de incidentes con los motivos redactados en lenguaje claro. Toma
  el logo, los colores y el sitio web de tu organización, sigue sin
  JavaScript ni recursos externos (se puede embeber o compartir con tus
  clientes) y el JSON de `/v1/status/{token}` no cambia.

### v2.09

**Agregado**

- **Tarjetas internacionales en dólares** ([guía](https://docs.cbpayapp.com/es/guias/payins)):
  `POST /v1/payins` con `country: "US"`, `currency: "USD"` y
  `method: "card"` devuelve una `payment_url` de checkout hosted con 3-D
  Secure y la marca de tu organización para cobrar con tarjetas Visa,
  Mastercard, American Express, Discover y Diners emitidas en cualquier
  país. El contrato es el mismo que el de la página de tarjeta de Bolivia
  (`customer` opcional, `success_url`/`failure_url`, `expires_at`, intentos
  limitados y retry idempotente que devuelve la misma URL) y el guardado de
  tarjeta también: `save_card` + `payer_reference` guardan la tarjeta con el
  consentimiento del pagador para
  [cobros posteriores y suscripciones](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions).
  El 3-D Secure se ejecuta dentro de la página (si el emisor pide desafío,
  el pagador lo completa ahí mismo) y los datos de la tarjeta se ingresan en
  campos seguros del procesador: nunca pasan por tu integración. El corredor
  se habilita por cuenta — `GET /v1/payins/methods` es la fuente de verdad
  de lo que puedes cobrar hoy.

## v2.08 · 6 versiones - 24 de julio de 2026

### v2.08

**Agregado**

- **Estado del servicio en tiempo real** ([guía](https://docs.cbpayapp.com/es/estado-del-servicio)):
  cada método de `GET /v1/payouts/methods` y `GET /v1/payins/methods` ahora
  trae el campo aditivo `availability` (`operational` / `degraded` /
  `down`), el nuevo webhook broadcast `corridor_status_changed` notifica
  cada transición de disponibilidad, y cada organización tiene una página
  de status pública con su marca (HTML + JSON en `/status/{orgToken}` y
  `/v1/status/{orgToken}`) con uptime de 90 días e historial de
  incidentes. La URL de la página se expone en `GET /v1/branding` como
  `status_page_url`.

### v2.07

**Agregado**

- **Docs Knowledge Pack para IA/MCP**: esta documentación ahora se publica
  también como un paquete estructurado y versionado en
  [`/mcp-pack/manifest.json`](https://docs.cbpayapp.com/mcp-pack/manifest.json)
  (specs OpenAPI en 3 idiomas, guías por página en Markdown puro, catálogo
  de errores y webhooks, guía de pruebas con los valores mágicos del
  simulador, recetas end-to-end y chunks listos para RAG). Es la fuente
  oficial que alimenta el [servidor MCP](https://docs.cbpayapp.com/es/mcp) de la documentación.

**Eliminado**

- **Markdown compilado `CBPAY_DOCUMENTACION.md` retirado**: el documento
  único en español queda obsoleto — su reemplazo es el Docs Knowledge Pack
  (trilingüe, con specs completos) y el servidor MCP.

### v2.06

**Agregado**

- **FAQ ancla en todas las guías de producto**: payouts, payins, checkout,
  transferencias, crypto, banking, tarjetas, cartola, QR payout y tarjetas
  guardadas + suscripciones cierran ahora con preguntas frecuentes y el
  link directo al [catálogo de errores](https://docs.cbpayapp.com/es/errores).
- **Catálogo de errores y webhooks completado**: se documentaron códigos de
  error y eventos de webhook que existían en la API pero faltaban en las
  páginas de referencia. Sin cambio de contratos.

### v2.05

**Cambiado**

- **Overhaul de docs, fase 5 (solo referencia de API, sin cambio de
  código)**: la referencia de API agrupa las operaciones bajo tres tags
  nuevos — **Checkout** (páginas públicas `/pay/{token}` y cotizaciones),
  **Tarjetas guardadas** (`/v1/stored-cards` y consultas de tarjetas
  guardadas) y **Suscripciones** (`/v1/subscriptions`). Estas operaciones
  vivían apiladas bajo el tag genérico **Payins**; ningún path ni
  contrato cambió.

### v2.04

**Agregado**

- **Guías propias por producto**, extraídas de los monolitos de
  payins/payouts: [Checkout](https://docs.cbpayapp.com/es/guias/checkout),
  [Tarjetas guardadas y suscripciones](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions)
  y [Payout QR](https://docs.cbpayapp.com/es/guias/qr-payout). Las secciones originales conservan sus
  encabezados y enlazan a las guías nuevas, así los anchors históricos
  siguen resolviendo.
- **Flujos end-to-end nuevos** en [Flujos de integración](https://docs.cbpayapp.com/es/flujos):
  checkout, tarjetas guardadas y suscripciones, cobros QR POS y swaps de
  saldos, cada uno con su diagrama de secuencia.

**Cambiado**

- **Navegación de Productos reorganizada por familia**: Cobrar (money in),
  Pagar (money out), Saldos y cuenta, Identidad y compliance, y
  Experiencia — en vez de una lista plana de 17 páginas.
- [Perfil y seguridad](https://docs.cbpayapp.com/es/guias/perfil) y
  [Seguridad y 2FA (OTP)](https://docs.cbpayapp.com/es/seguridad-2fa) ahora se cruzan y declaran sus
  roles: la guía de perfil es la casa de los factores 2FA del usuario; la
  página OTP cubre el flujo de desafíos por acción.

### v2.03

**Agregado**

- **Ambiente de pruebas visible en todo el sitio**: cada guía de producto
  ahora abre con las URLs base de test y live (snippet compartido), y el
  [FAQ](https://docs.cbpayapp.com/es/faq), el [inicio rápido](https://docs.cbpayapp.com/es/inicio-rapido) y la
  [introducción](https://docs.cbpayapp.com/es/introduccion) describen correctamente el ambiente de
  pruebas (`https://cryptobank.qbank.cl/platform`, keys `pk_test_`) —
  copias anteriores decían, erróneamente, que no había sandbox. Detalle
  completo en [Entorno y pruebas](https://docs.cbpayapp.com/es/entorno-y-pruebas).

**Cambiado**

- **Catálogo de productos de la introducción completado**: checkout,
  tarjetas y suscripciones, QR POS, swaps, wallets segregadas, Bitcoin y
  analytics ahora aparecen con sus guías.

**Corregido**

- Descripciones del spec anteriores a los saldos multi-activo:
  descripciones de tags realineadas (Swaps, AML screening, Cards) y
  redacciones antiguas como "se acredita al saldo USDT" corregidas a la
  semántica de settlement asset (`default_payin_asset`,
  `settlement_asset`).

## v2.02 · 6 versiones - 23 de julio de 2026

### v2.02

**Cambiado**

- **La auto-conversión al `default_payin_asset` ejecuta al precio real,
  sin spread de swap** ([modelo de dinero](https://docs.cbpayapp.com/es/conceptos/modelo-de-dinero)):
  el payin ya pagó su comisión y su tasa al acreditar, así que la
  conversión automática al saldo configurado no cobra un costo adicional
  — no existe doble conversión. Siguen aplicando los límites por
  operación/24 h de los assets volátiles (BTC/GOLD). Los swaps manuales
  (`POST /v1/swaps`) mantienen su spread normal.

### v2.01

**Agregado**

- **Código de error `reserved_idempotency_key` (400)** en `POST /v1/swaps`
  ([errores](https://docs.cbpayapp.com/es/errores)): las claves de idempotencia con prefijo
  `payin-convert:` o `checkout-swap:` están reservadas para las
  auto-conversiones del sistema (saldo predeterminado de payins y
  checkout) y se rechazan. Usa cualquier otra clave para tus swaps.

### v2.00

**Agregado**

- **Saldo predeterminado para payins (`default_payin_asset`)**
  ([modelo de dinero](https://docs.cbpayapp.com/es/conceptos/modelo-de-dinero)): configura en qué
  saldo quieres quedarte con tus cobros. `PUT /v1/settlement` acepta
  ahora `default_payin_asset` (USDT, USDC, BTC o GOLD) y `GET
  /v1/settlement` lo expone. El payin sigue acreditando en USDT
  (pricing y comisiones intactos) y el neto se auto-convierte a tu
  asset con el motor de swaps (mismo spread y límites de un swap). Si
  la conversión falla queda `conversion_status: pending_retry` y se
  reintenta automático. `GET /v1/payins`, el detalle y el webhook
  `payin_credited` exponen `settlement_asset` y `conversion_status`
  cuando hay conversión.

**Cambiado**

- Un link de checkout creado **sin** `settlement_asset` ahora usa el
  `default_payin_asset` de la cuenta (antes siempre USDT).

### v1.99

**Agregado**

- **Comisión propia para cobros con tarjeta (`payin_card`)**
  ([comisiones](https://docs.cbpayapp.com/es/conceptos/comisiones)): los cobros acreditados con
  tarjeta (payin directo `method: card`, links de checkout pagados con
  tarjeta y cobros recurrentes con tarjeta guardada) pueden llevar una
  comisión porcentual propia, configurable **por moneda** (ej. un % para
  BOB y otro para USD). Si tu cuenta no tiene `payin_card` configurado,
  sigue aplicando la comisión `payin` de siempre — nada cambia sin
  configuración explícita. Consulta tus comisiones vigentes en
  `GET /v1/fees` (las filas ahora incluyen el campo `currency`).

### v1.98

**Agregado**

- **`GET /v1/banking/accounts/{bankAccountID}`** ([guía banking](https://docs.cbpayapp.com/es/guias/banking)):
  detalle en vivo de una cuenta bancaria — nombre, moneda, estado y los
  requisitos para recibir fondos (rieles wire y locales) bajo `data`.
  Úsalo para mostrar las instrucciones de depósito de una cuenta
  específica sin recorrer el listado.

**Cambiado**

- **Listado de cuentas bancarias**: la API ahora expone solo las cuentas
  habilitadas para tu operación según la configuración del corredor. Las
  cuentas no habilitadas dejan de aparecer en `GET /v1/banking/accounts`
  y sus consultas por id responden `404`.

### v1.97

**Corregido**

- **Página de cobro — tarjeta guardada por defecto**: con tarjetas
  guardadas para el correo ingresado, el botón principal ahora paga con
  la tarjeta guardada (el texto cambia a "Pagar con VISA ···· 1234") en
  vez de iniciar un pago con tarjeta nueva. Usar una tarjeta distinta
  queda como acción explícita ("Usar otra tarjeta"). Antes, presionar el
  botón principal con la tarjeta listada llevaba a la página de pago
  pidiendo todos los datos de nuevo.

## v1.96 · 3 versiones - 22 de julio de 2026

### v1.96

**Agregado**

- **Nuevo corredor: Argentina** 🇦🇷 ([guía payouts](https://docs.cbpayapp.com/es/guias/payouts) · [guía payins](https://docs.cbpayapp.com/es/guias/payins)):
  - **Payouts** en **ARS** y **USD** por `bank_transfer` a cualquier **CBU o CVU** de 22 dígitos (cuentas bancarias y billeteras virtuales; USD solo CBU→CBU). Beneficiario con `name`, `tax_id` (CUIT/CUIL) y `account_number` — sin `bank_code`.
  - **Payins** en **ARS** con **cuenta CVU dedicada** por cuenta (`POST /v1/payins/deposit-accounts` con `country: "AR"`): toda transferencia entrante se acredita automáticamente, sin referencias. Las CVU son receive-only: los intentos de débito directo se rechazan automáticamente.
  - Disponible ya en el **ambiente de pruebas** (staging) con el simulador; la activación en producción se anunciará al completarse la certificación bancaria — el catálogo (`GET /v1/payouts/methods` y `GET /v1/payins/methods`) es siempre la fuente de verdad.

### v1.95

**Agregado**

- **Facturación en archivo con la tarjeta guardada** ([guía payins](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions)): los datos de facturación que el pagador ingresa al guardar su tarjeta (nombre, dirección, ciudad, correo, teléfono) quedan guardados junto con la credencial. Al pagar de nuevo con esa tarjeta la página segura los aplica automáticamente — el pagador no re-tipea nada — y muestra solo un **resumen enmascarado** (nombre, correo parcial y ciudad) con un enlace "usar otros datos" por si quiere cambiarlos. Los datos completos jamás bajan al navegador: el servidor los aplica al autorizar.

**Cambiado**

- **Correo del titular obligatorio con tarjeta guardada**: en la página pública del checkout, usar una tarjeta guardada ahora exige presentar el mismo correo del titular con el que se guardó — si no calza, responde `404` (protección anti-enumeración de datos personales).

### v1.94

**Corregido**

- **Página de checkout — pago con tarjeta en 1 clic** ([guía payins](https://docs.cbpayapp.com/es/guias/checkout)): al continuar con tarjeta, la página pública ahora redirige directo a la página segura de pago — se eliminó el botón intermedio que exigía un segundo clic. Elegir una tarjeta guardada de la lista inicia el pago de inmediato.
- **Tarjeta guardada en el checkout**: elegir una tarjeta guardada ahora llega siempre a la página segura con la credencial aplicada (muestra marca y últimos 4 dígitos, sin pedir el número de nuevo). Antes, la re-validación del correo podía descartar la selección en silencio y la página pedía todos los datos otra vez. Además, cambiar la elección en el mismo link (guardada ↔ tarjeta nueva) regenera la sesión de pago correcta en vez de reusar la anterior.

## v1.93 · 3 versiones - 21 de julio de 2026

### v1.93

**Corregido**

- **Webhooks de banking para terceros** ([webhooks](https://docs.cbpayapp.com/es/webhooks), [guía banking](https://docs.cbpayapp.com/es/guias/banking)): el webhook `banking_customer_status_changed` ahora también se emite cuando cambia la verificación de un **tercero** registrado por tu cuenta (antes solo llegaba el del perfil propio). El payload agrega `customer_kind` (`self` | `third_party`) y, para terceros, `third_party_id` (el mismo id de `GET /v1/banking/third-parties/{id}`).

### v1.92

**Corregido**

- **Monto de los cobros checkout en el historial de payins** ([guía payins](https://docs.cbpayapp.com/es/guias/checkout)): `GET /v1/payins` y `GET /v1/payins/{payin_id}` ahora incluyen siempre la denominación de los payins de checkout y QR POS — `settlement_asset` + `asset_amount` (y `conversion_status` cuando aplica) — en todo estado, incluidos pendiente y vencido. Antes el monto solo aparecía al acreditarse y las filas pendientes salían sin monto. Además, un cobro liquidado en crypto o vía la app CBPay expone su `usdt_credited` aunque no lleve `fx_rate`. Los exports CSV/XLSX agregan las columnas `settlement_asset` y `asset_amount`.

### v1.91

**Agregado**

- **Suscripciones (cobros recurrentes agendados)** ([guía payins](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions#suscripciones-cobros-recurrentes-agendados)): la plataforma lleva el calendario de los cobros sobre una tarjeta guardada. `POST /v1/subscriptions` (`interval` daily/weekly/monthly/yearly, `start_at` opcional para trial, `idempotency_key` obligatoria) cobra el primer período al crear y dispara los siguientes solos. Recurso completo `GET /v1/subscriptions` (+`/{id}`, filtros status/stored_card_id/payer_reference) y ciclo de vida `POST .../pause` · `/resume` · `/cancel`. Dunning ante declines (reintento diario ×3 ⇒ `past_due`), sin catch-up al reanudar, y cancelación automática al revocar la tarjeta. Cada cobro exitoso acredita como payin de tarjeta (`payin_credited` con `subscription_id`). Webhook nuevo `subscription_status_changed`.

## v1.90 - 20 de julio de 2026

**Agregado**

- **Tarjetas guardadas y cobros recurrentes** ([guía payins](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions)): el método `card` ahora soporta credencial almacenada (mandato COF de las marcas). `POST /v1/payins` acepta `save_card` (checkbox de consentimiento en la página hosted), `payer_reference` (tu ID del cliente) y `stored_card_id` (pagar con una tarjeta guardada sin re-digitar el número; el 3-D Secure corre igual). Recurso nuevo `GET /v1/stored-cards` (+`/{id}`, `DELETE` para revocar) y **cobros iniciados por el comercio** sin el pagador presente: `POST /v1/stored-cards/{id}/charges` (`recurring` para suscripciones; `idempotency_key` obligatoria — un retry jamás cobra dos veces). El número de tarjeta jamás existe en la plataforma: solo display (marca, últimos 4, expiración). Webhooks nuevos `card_stored` y `stored_card_revoked`; error nuevo `422 stored_card_revoked` ([errores](https://docs.cbpayapp.com/es/errores)).

## v1.89 · 2 versiones - 18 de julio de 2026

### v1.89

**Agregado**

- **Controles de cumplimiento en pagos salientes** ([guía payouts](https://docs.cbpayapp.com/es/guias/payouts), [errores](https://docs.cbpayapp.com/es/errores)): los payouts, los retiros crypto con nombre de beneficiario y los cobros collect ahora pasan por controles de cumplimiento adicionales **antes de mover fondos**. Errores documentados: `403 compliance_hold` (la operación fue retenida y NO se creó — sin débito; por política no se informa la razón exacta, contacta a soporte con el timestamp) y `503 compliance_check_unavailable` (la verificación no se pudo evaluar; la operación NO se creó — reintenta con la **misma** `idempotency_key`).

### v1.88

**Corregido**

- **Shapes de persona del screening AML** ([guía](https://docs.cbpayapp.com/es/guias/aml)): el motor
  de screening exige `date_of_birth` como objeto `{year, month, day}` (el
  string `"YYYY-MM-DD"` responde `422`), `nationality` como **array** de
  códigos ISO-3166 y `personal_identification[]` como
  `{ "issuing_country", "number" }` sin campo `type`. Guía y ejemplos del
  spec actualizados con los shapes verificados en vivo.

## v1.87 · 4 versiones - 17 de julio de 2026

### v1.87

**Agregado**

- **QR Crypto POS — cobros QR crypto con monto para procesadores** ([guía](https://docs.cbpayapp.com/es/guias/qr-pos)):
  las cuentas empresa con POS físicos registran a sus comercios como
  merchants verificados (KYB/KYC de terceros aprobado) y generan cobros
  crypto (USDT, USDC, BTC) con dirección exclusiva y QR por venta.
  Detección temprana del pago para el POS (`confirming` en segundos),
  crédito con conversión automática al settlement asset, atribución por
  merchant en cobros/webhooks, resumen de conciliación
  (`GET /v1/pos/summary`) con comisión informativa por merchant y neto a
  repartir, y devoluciones por el riel de retiro crypto con tope duro
  (jamás más de lo recibido). Rutas nuevas bajo `/v1/pos/*` (tag QR Crypto POS
  del API Reference); pagos parciales acumulan y los pagos tardíos a un
  cobro expirado se acreditan igual.

### v1.86

**Corregido**

- **QR crypto de Bitcoin**: el QR del checkout ahora lleva la dirección
  bech32 cruda (igual que TRON/ETH). Las apps de exchanges como Binance
  rechazaban el URI BIP-21 (`bitcoin:…?amount=…`) como "invalid QR"; el
  monto exacto sigue visible al lado con botón copiar.
- **Página de cobro**: favicon white-label (símbolo de la org) y el texto
  del panel ya no parte palabras a mitad ("momento" → "moment"/"o") —
  el `word-break` agresivo quedó solo en las direcciones monospace.

### v1.85

**Agregado**

- **CLABE dedicada por link de cobro (México)**: materializar
  `bank_transfer` MX en un link de cobro universal ahora emite (o toma de
  un pool reciclable) una CLABE **exclusiva de ese link**. El pagador
  transfiere el monto exacto **sin poner referencia**: el abono se detecta
  y rutea al link automáticamente por la cuenta de destino. El payload de
  la materialización lleva `destination` con `dedicated: true`; si la
  cuenta dedicada no puede emitirse, degrada al camino clásico (cuenta del
  comercio + `reference` obligatoria en la glosa). Las CLABEs se reciclan
  con período de enfriamiento al resolverse el link (pagado o expirado).

### v1.84

**Agregado**

- **Cobros pull en el link de cobro universal (Venezuela)**: la página del
  checkout ahora ofrece los métodos que cobran directo en la cuenta del
  pagador (`c2p` y `debito_inmediato` en VE). El pagador completa banco,
  documento, teléfono o cuenta y la clave OTP en la misma página; el monto
  siempre es el congelado en la cotización. Endpoints públicos nuevos:
  `POST /pay/{token}/collect/otp` (solicita la clave cuando el rail la
  envía a demanda) y `POST /pay/{token}/collect` (ejecuta el cobro; si el
  rail confirma síncrono el link queda pagado en la misma llamada). En el
  catálogo de `GET /pay/{token}/quote` estos métodos llegan con
  `collect: true`.
- **Fiat multi-moneda por país**: cada país del quote lista sus corredores
  en `options[]` — una fila por método+moneda (ej. Bolivia con QR en BOB
  **y** en USD) con su `local_amount` en `country_quote`. Materializar un
  método ofrecido en varias monedas exige `&currency=YYY` (el error
  `400 currency_required` ahora aplica a cualquier método, no solo
  tarjetas).
- **Cuenta de destino en transferencias bancarias**: cuando el corredor
  usa una cuenta de depósito dedicada (la CLABE en México), la
  materialización de `bank_transfer` incluye `destination` (tipo, número
  de cuenta y beneficiario) además de la referencia — el pagador ya sabe
  adónde transferir sin salir de la página.

**Cambiado**

- **Banderas SVG en la página de pago**: las banderas de países y monedas
  ahora son imágenes SVG (se ven igual en Windows, macOS y móviles; antes
  algunos sistemas mostraban el código del país en texto). En la pestaña
  Tarjeta, la bandera se deriva de la **moneda del cargo** (USD → bandera
  de Estados Unidos, aunque el adquirente sea de otro país).

**Corregido**

- La página del checkout ya no responde `429 too_many_attempts` por el
  solo hecho de estar abierta: los límites de tráfico de lectura,
  materialización, OTP y cobro ahora son independientes entre sí.

## v1.83 · 10 versiones - 16 de julio de 2026

### v1.83

**Agregado**

- **Pestaña Tarjeta en el link de cobro universal**: el pago con tarjeta
  sale de la pestaña Fiat y ahora tiene su propia pestaña, listada **por
  moneda de cargo** (hoy BOB y USD; monedas de adquirentes futuros
  aparecen solas). `GET /pay/{token}/quote` responde el catálogo nuevo
  `cards[]` (país, moneda y `local_amount` por opción) y `countries[]`
  deja de listar `card` entre los métodos. Materializar una tarjeta
  exige la moneda: `POST /pay/{token}/methods/card?country=XX&currency=YYY`
  — sin ella responde el error nuevo `400 currency_required`. Cada
  moneda es una materialización independiente con su propia página de
  pago hosted.

**Cambiado**

- **Página de pago con identidad visual reforzada**: logos de los assets
  (USDT, USDC, BTC, GOLD) junto al monto y en los grupos crypto,
  banderas por país en el selector Fiat y en las filas de tarjeta,
  íconos por método, y un **timer de expiración prominente** (pill con
  reloj; bajo 1 hora muestra cuenta regresiva y bajo 10 minutos cambia a
  rojo).

**Corregido**

- La página del checkout ya no se desplaza sola hacia el panel activo
  cada pocos segundos: el refresco automático re-renderiza solo cuando
  cambia la data y nunca mueve el scroll (solo la selección manual de un
  método lleva la vista al detalle).

### v1.82

**Cambiado**

- **Página de pago del checkout universal rediseñada**: las opciones ahora
  se organizan en tres pestañas — **CBPay** (QR + alias del comercio, con
  botón de copiar), **Crypto** (monedas agrupadas por red; las redes
  nuevas aparecen solas al habilitarse) y **Fiat** (selector de país +
  métodos con el monto local cotizado). Botones de copiar en alias,
  direcciones, montos y referencias. Sin cambios de API: la URL, el
  contrato de creación y los endpoints públicos (`/state`, `/quote`,
  `/methods/{method}`) son los mismos.

### v1.81

**Corregido**

- **Payout QR — validación antes de crear el payout**: un
  `POST /v1/payouts/qr/scan` con un QR ilegible o dinámico ahora responde
  `400 invalid_qr_payload` con el motivo concreto (antes devolvía un `502`
  genérico). En el confirm de Brasil, un monto que no coincide con un QR
  PIX de monto fijo responde `422` con el payout `failed` y el **reembolso
  ya aplicado** — y el QR queda intacto para reintentarlo con el monto
  correcto y una clave nueva.
- **QR PIX estático reutilizable**: el guard "un QR = un pago" ya no aplica
  a los QR PIX estáticos de Brasil (se pagan muchas veces por diseño); la
  protección por pago es tu `idempotency_key`, que en Brasil es
  obligatoria en cada confirm.

### v1.80

**Agregado**

- **Payout por QR PIX en Brasil (BR/BRL)**: el flujo de dos pasos
  `POST /v1/payouts/qr/scan` → `POST /v1/payouts/qr/confirm` ahora acepta
  QR PIX **estáticos** de Brasil (incluido el código "copia e cola") —
  envía `country: "BR"` y `currency: "BRL"`. El scan decodifica el BR Code
  localmente (sin costo) y devuelve nombre del comercio, llave PIX y monto;
  el confirm paga por PIX con el mismo pricing de un payout normal.
  `amount` es siempre obligatorio: los QR de monto fijo exigen coincidencia
  exacta (un mismatch responde `422` con el payout `failed` y reembolso
  automático — el QR **no** se inutiliza). Un QR PIX estático es
  **reutilizable**: cada pago lleva su propia `idempotency_key`. Los QR
  dinámicos o corruptos responden `400 invalid_qr_payload` — usa el método
  `pix` con la llave del beneficiario.
  Disponible en el ambiente de pruebas con QRs de ejemplo y valores mágicos
  (montos `.99` fallan) — ver
  [Entorno y pruebas](https://docs.cbpayapp.com/es/entorno-y-pruebas#qrs-pix-de-ejemplo). Detalle en
  la [guía de payouts](https://docs.cbpayapp.com/es/guias/qr-payout).

### v1.79

**Cambiado**

- **Link de cobro universal v2 — multi-país + liquidación en el saldo
  elegido** (**Breaking** sobre el shape v1 de ayer): el cobro ahora se
  denomina en cualquiera de tus 4 saldos virtuales con
  `settlement_asset` (`USDT` default, `USDC`, `BTC`, `GOLD`) y `amount`
  EN ese asset ("50" USDT, "0.001" BTC, "2" g de oro); enviar `currency`
  responde `400` (los links v1 existentes siguen operando). El pagador ve
  **todos los países con corredor de payin vivo** (elige país → métodos con
  el monto local cotizado y congelado al materializar), las 4 opciones
  crypto con **QR escaneable** (`qr_payload` + `qr_png_base64`; BIP-21 en
  BTC, dirección cruda en tokens TRON/ETH — legible por Trust Wallet,
  MetaMask, Binance y wallets externas), y el **QR + alias CBPay del
  comercio** para pagar al instante desde la app (deeplink
  `cbpay:pay?to=…&checkout=…`; `POST /v1/transfers` acepta
  `checkout_token` y valida el due server-side). Todo pago se
  **auto-convierte** al `settlement_asset` al acreditar (mismo asset no
  convierte); `conversion_status` visible en `/state`. Endpoint público
  nuevo `GET {checkout_url}/quote` con el catálogo de países, dues crypto
  y dues CBPay. Errores nuevos `country_required`, `country_unavailable`,
  `settlement_asset_disabled` y `checkout_amount_mismatch`. Detalle en la
  [guía de payins](https://docs.cbpayapp.com/es/guias/checkout).

### v1.78

**Agregado**

- **Detalle del rechazo en cobros activos fallidos**: cuando un cobro
  activo (`collect`, C2P o débito inmediato) queda `failed`, el payin ahora
  incluye un objeto `failure` con el origen del rechazo (`provider` = el
  banco del pagador, `core` = la validación previa al cobro), el código y
  el mensaje concretos — visible en la respuesta síncrona del `POST`, en
  `GET /v1/payins/{id}` y en el webhook. Antes solo se veía el estado
  `failed` genérico. Detalle en la
  [guía de payins](https://docs.cbpayapp.com/es/guias/payins).

### v1.77

**Agregado**

- **Link de cobro universal (`checkout`)**: `POST /v1/payins` acepta
  `method: "checkout"` y devuelve `checkout_url` — una página pública
  brandeada donde el pagador elige cómo pagar: QR, tarjeta, transferencia
  bancaria o **crypto** (USDT en TRON, USDT/USDC en Ethereum y BTC) con una
  dirección de depósito exclusiva de ese cobro y acumulación de pagos
  parciales. Un link = un cobro: el primer método que completa el pago
  gana. Estado consultable sin auth en `GET {checkout_url}/state`; el
  `payin_credited` de un pago crypto agrega `settled_via` y
  `crypto_amount`. Soporta `success_url`, `failure_url`, `expires_in`
  (10 minutos a 7 días) e idempotencia (el retry devuelve el mismo link).
  Errores nuevos `already_paid`, `checkout_expired` y
  `method_unavailable`. Detalle en la
  [guía de payins](https://docs.cbpayapp.com/es/guias/checkout).

### v1.76

**Cambiado**

- **Filtro de autenticación previo a la captura en pagos con tarjeta**: los
  cargos con tarjeta solo se envían al procesador cuando la verificación
  3-D Secure terminó con autenticación exitosa o intentada y con los datos
  de autenticación completos; un intento sin autenticación real se rechaza
  antes de mover fondos y el pagador puede reintentar. La página de pago
  además extendió la recolección de datos del dispositivo (~11 s) para
  mejorar la tasa de aprobación de los bancos emisores. En el ambiente de
  test, el monto terminado en `.44` simula un intento rechazado por este
  filtro (tabla completa en
  [Ambiente de pruebas](https://docs.cbpayapp.com/es/entorno-y-pruebas)).

### v1.75

**Agregado**

- **Pago con tarjeta (`card`) en payins**: `POST /v1/payins` acepta
  `method: "card"` (Bolivia, BOB o USD) y devuelve `payment_url` — una
  página de pago alojada con el branding de tu organización donde el
  pagador ingresa su tarjeta en campos seguros y pasa la verificación
  3-D Secure de su banco. Campos opcionales `customer`, `success_url`,
  `failure_url` y `expires_at`. El pago confirmado llega por el webhook
  `payin_received` y acredita el saldo como cualquier payin; si nadie paga,
  `payin_expired` cierra el cobro. Detalle en la
  [guía de payins](https://docs.cbpayapp.com/es/guias/payins).

### v1.74

**Agregado**

- **`account_id` en swaps y address screenings**: las respuestas de
  `POST/GET /v1/swaps` y `POST/GET /v1/screenings/addresses` ahora incluyen
  `account_id` (la cuenta dueña de la operación). Para integraciones de una
  sola cuenta es informativo; en vistas administrativas permite atribuir
  cada registro.

## v1.73 · 5 versiones - 15 de julio de 2026

### v1.73

**Agregado**

- **Bitcoin on-chain (`btc`/`btc`)**: cuarta red soportada del producto
  crypto. Toda cuenta nace ahora con **cuatro wallets de depósito**
  (se suma la de Bitcoin, dirección bech32 `bc1q…`); los depósitos BTC
  acreditan el saldo BTC (confirmación ~30 min, 3 bloques) y los retiros
  on-chain aceptan `chain: "btc"` (destinos bech32, taproot y legacy;
  el fee de red lo cubre la operación, el destinatario recibe el monto
  exacto). Las [wallets segregadas](https://docs.cbpayapp.com/es/guias/wallets-segregadas) también
  soportan el par `btc`/`btc` (sin gas: el fee sale del saldo de la
  wallet). Travel Rule aplica igual que en las demás redes, valorando el
  monto a USD. Detalle en la [guía crypto](https://docs.cbpayapp.com/es/guias/crypto).

### v1.72

**Cambiado**

- **El login en dos pasos también respeta el cooldown del teléfono**: con
  2FA de login por SMS/WhatsApp y un número recién enlazado sin verificar,
  el código del login se emite por un factor más fuerte (app autenticadora,
  luego email de login) en vez del teléfono — el `channel` efectivo llega
  en la respuesta del login. Sin factor alternativo el login responde
  `403 phone_binding_cooldown` hasta que venza el cooldown. El código
  jamás viaja a un número enlazado desde la propia sesión. Detalle en la
  [guía de seguridad y 2FA](https://docs.cbpayapp.com/es/seguridad-2fa).

### v1.71

**Cambiado**

- **Desafíos OTP con teléfono en cooldown caen a un factor más fuerte**:
  con el número recién enlazado (cooldown de 24 h), `POST /v1/otp/challenges`
  ya no bloquea si tienes la app autenticadora enrolada o tu email
  verificado — el desafío se emite automáticamente por ese canal (jerarquía
  totp > email) y la respuesta indica el canal efectivo. El
  `403 phone_binding_cooldown` queda solo para cuentas sin factor
  alternativo. Antes, el cooldown bloqueaba toda relajación del 2FA
  (incluso desactivar el canal email) aunque tuvieras factores más fuertes
  disponibles. Detalle en la [guía de seguridad y 2FA](https://docs.cbpayapp.com/es/seguridad-2fa).

### v1.70

**Agregado**

- **Identidad verificada como fuente de verdad del perfil**: al aprobarse
  tu onboarding KYC/KYB, `display_name` (persona = nombre + apellido;
  empresa = razón social), `tax_id` y `country` se rellenan
  automáticamente desde la identidad verificada. Documentado en la
  [guía de KYC](https://docs.cbpayapp.com/es/guias/kyc) y la [guía de perfil](https://docs.cbpayapp.com/es/guias/perfil).

**Cambiado**

- **`PATCH /v1/me` bloquea los campos de identidad tras verificar**: con
  `kyc_status: approved`, cambiar `display_name`, `tax_id` o `country`
  responde `409 identity_locked` (código nuevo en la página de
  [errores](https://docs.cbpayapp.com/es/errores)). `phone` sigue editable con su propio flujo de
  verificación.

### v1.69

**Agregado**

- **Informe PDF del screening AML**:
  `GET /v1/aml/screenings/{screeningID}/report` descarga cada screening de
  tu historial como informe PDF ejecutivo con tu branding — portada con la
  decisión y su semáforo de riesgo, indicadores (sanciones, watchlists,
  PEP, prensa adversa...), coincidencias consolidadas, alias, glosario y
  sección final de respaldo con las fuentes internacionales consultadas.
  Trilingüe vía `lang=en|es|zh` (default inglés). Lectura pura, sin
  comisión. Sección nueva en la [guía AML](https://docs.cbpayapp.com/es/guias/aml#informe-pdf-del-screening).
- **Nuevo código de error `invalid_language`** (HTTP 400): el `lang` del
  informe PDF no es `en`, `es` ni `zh`. Documentado en la página de
  [errores](https://docs.cbpayapp.com/es/errores).

**Corregido**

- **Campos de empresa en el AML screening**: los ejemplos y el spec
  documentaban `tax_id`/`registration_number`/`country_of_incorporation`
  como campos planos de `customer.company`, pero el motor de screening los
  rechaza con `422`. El identificador va en
  `registration_authority_identification`, el país en
  `place_of_registration` y `incorporation_date` es un objeto
  `{year, month, day}`. Guía y spec corregidos (verificado en producción).

## v1.68 · 7 versiones - 14 de julio de 2026

### v1.68

**Agregado**

- **Nuevo corredor: Ecuador (USD)** con cuatro métodos de payout —
  `bank_transfer` (transferencia bancaria), `deuna` (billetera DeUna),
  `cash_pickup` (retiro en ventanilla sin cuenta) y `cnb` (corresponsal no
  bancario). El beneficiario acepta nombres estructurados
  (`given_name`/`first_surname`/...) o el split automático desde `name`, y
  un bloque opcional de remitente (`sender_name` o sus campos
  estructurados). Ejemplos por método en la
  [guía de payouts](https://docs.cbpayapp.com/es/guias/payouts) y en el spec.
- **Nuevo código de error `channel_unavailable`** (HTTP 503): el canal de
  pago del corredor no está disponible temporalmente. Reintenta más tarde
  con la misma `idempotency_key`. Documentado en la página de
  [errores](https://docs.cbpayapp.com/es/errores).

### v1.67

**Agregado**

- **Las cuentas de test nacen pobladas**: toda cuenta nueva del ambiente de
  test nace con ~6 meses de historia demo realista de todos los productos
  (payouts, payins, transfers, crypto, swaps, tarjetas, banking,
  contactos...), con saldos de juego, cartola conciliada y analytics listos
  para explorar. Aplica a todo camino de creación (registro, login social,
  creación por admin y el switch test/live del dashboard).

**Cambiado**

- **Ambientes 100% independientes**: los datos de test ya no se refrescan
  desde un snapshot de producción — nada se copia entre ambientes. Guía de
  [entornos y pruebas](https://docs.cbpayapp.com/es/entorno-y-pruebas) actualizada.

### v1.66

**Agregado**

- **Servidor MCP oficial** en `https://mcp.cbpayapp.com`: conecta tu editor o
  asistente de IA (Cursor, VS Code, Claude, ChatGPT y cualquier cliente MCP)
  a esta documentación — búsqueda, endpoints con ejemplos reales y catálogo
  de errores, sin salir del editor. Solo lectura, sin autenticación. Página
  nueva [Servidor MCP](https://docs.cbpayapp.com/es/mcp) con instalación de un click e instrucciones
  por cliente.

### v1.65

**Cambiado**

- **Ambiente de test**: las cuentas nuevas ahora nacen con
  `kyc_status: approved` — puedes probar todos los productos de inmediato,
  sin pasar por el onboarding. Aplica a todo camino de creación (registro,
  login social, creación por admin y el switch test/live del dashboard);
  las cuentas de test existentes fueron aprobadas retroactivamente. En
  **live** nada cambia: las cuentas nacen sin verificar y el KYC/KYB sigue
  siendo obligatorio antes de que salga dinero. Para probar el flujo de
  verificación en test, usa las verificaciones KYC/KYB de terceros.

### v1.64

**Cambiado**

- `PUT /v1/otp/preferences`: activar el 2FA de la acción `login` por canal
  telefónico (`sms`/`whatsapp`) ahora exige el teléfono de la cuenta ya
  **verificado** (completa cualquier desafío OTP por SMS/WhatsApp antes).
  Si el número no está verificado, la API responde
  `409 phone_verification_required`. Este candado evita que un número mal
  escrito te deje fuera de tu cuenta al activar el 2FA de login.

### v1.63

**Corregido**

- `POST /v1/me/passkeys/register/begin` y `DELETE /v1/me/passkeys/{passkeyID}`
  ahora aceptan un request sin body, tal como lo documenta el spec (body
  opcional). Antes respondían `400 invalid_json`. La contraseña actual
  sigue siendo obligatoria para las cuentas que tienen contraseña
  (`403 invalid_password` si falta o es incorrecta); las cuentas que solo
  usan login social pasan con su sesión.

### v1.62

**Corregido**

- `POST /v1/me/totp/enroll` ahora acepta un request sin body, tal como lo
  documenta el spec (body opcional). Antes respondía `400 invalid_json`.
  La contraseña actual sigue siendo obligatoria para las cuentas que
  tienen contraseña (`403 invalid_password` si falta o es incorrecta);
  las cuentas que solo usan login social pasan con su sesión.
- `PUT /v1/otp/preferences` con canal `email` o `totp` respondía un error
  500; corregido — los cuatro canales (`sms`, `whatsapp`, `email`,
  `totp`) se guardan correctamente.

**Cambiado**

- Cartola PDF: los estados de las operaciones ahora aparecen coloreados
  (verde completado, ámbar pendiente, rojo fallido) para lectura rápida.

## v1.61 · 6 versiones - 13 de julio de 2026

### v1.61

**Agregado — Exportación CSV / Excel en los listados**

- Los listados de `movements`, `payouts`, `payins` y `transfers` aceptan
  ahora el parámetro `format=csv` o `format=xlsx` para descargar las
  filas como archivo listo para contabilidad (hasta 10.000 filas por
  descarga; los filtros `from`/`to`, `status` y demás aplican igual).

```bash
curl -o movimientos.xlsx "https://api.qbank.cl/platform/v1/movements?from=2026-07-01&to=2026-07-13&format=xlsx" \
  -H "Authorization: Bearer pk_…"
```

- Sin `format` la respuesta sigue siendo el JSON paginado de siempre —
  no hay cambios de compatibilidad.

### v1.60

**Breaking — Las wallets segregadas se mueven a `/v1/segregated-wallets`**

- Todas las rutas de wallets segregadas se renombran de `/v1/wallets*` a
  `/v1/segregated-wallets*`. Mismos métodos, parámetros, shapes de
  respuesta, comisiones y webhooks — solo cambia el prefijo del path. **No
  hay alias de compatibilidad**: las rutas viejas `/v1/wallets*` ahora
  responden `404`.
- Mapeo (las 15 rutas siguen el mismo patrón):

| Antes | Ahora |
|---|---|
| `POST/GET /v1/wallets` | `POST/GET /v1/segregated-wallets` |
| `POST /v1/wallets/import` | `POST /v1/segregated-wallets/import` |
| `GET /v1/wallets/{id}` (+ `/balance`, `/deposits`, `/transactions`) | `GET /v1/segregated-wallets/{id}` (+ mismas subrutas) |
| `POST/GET /v1/wallets/{id}/sends` (+ `/{sendID}`, `/receipt`) | `POST/GET /v1/segregated-wallets/{id}/sends` (+ mismas subrutas) |
| `GET /v1/wallets/{id}/deposits/{depositID}/receipt` | `GET /v1/segregated-wallets/{id}/deposits/{depositID}/receipt` |
| `POST /v1/wallets/{id}/export` · `GET/POST .../auto-forward` | `POST /v1/segregated-wallets/{id}/export` · `GET/POST .../auto-forward` |

- El `receipt_url` de respuestas, webhooks y emails de comprobantes de
  envíos/depósitos de wallets ahora apunta al path nuevo.
- Por qué: el prefijo genérico `/v1/wallets` se confundía constantemente
  con las **wallets de depósito** del producto [crypto](https://docs.cbpayapp.com/es/guias/crypto).
  Esas no cambian y siguen viviendo en `/v1/crypto/wallets`.

**Agregado — Discriminador `type` en toda respuesta de wallet**

- Las wallets de depósito (`/v1/crypto/wallets`) ahora incluyen
  `type: "deposit"` y `receive_only: true`.
- Las wallets segregadas incluyen `type: "segregated"`.
- Úsalo para distinguir los dos productos de forma defensiva — nunca solo
  por la ruta.

### v1.59

**Agregado — Webhook `payin_expired`: cierre automático de cobros no pagados**

- Cuando un cobro activo (QR o checkout hosteado) vence o falla sin recibir
  el pago, el payin ahora pasa automáticamente de `pending` a `expired`
  (o `failed`) — antes podía quedar pendiente indefinidamente.
- Nuevo evento de webhook **`payin_expired`** con el `payin_id`, el estado
  final, el corredor y la referencia, para que cierres el cobro en tu
  sistema sin polling. Suscribible en `POST /v1/webhooks/subscriptions`.
- No se mueve dinero en ningún caso: para reintentar el cobro se crea un
  payin nuevo.

### v1.58

**Cambiado — Comprobantes, cartola y emails con diseño renovado**

- Todos los comprobantes PDF (`GET .../receipt`) estrenan un diseño de nivel
  bancario: encabezado con logo y N° de comprobante, icono del producto,
  monto destacado, detalle en dos columnas, franja "Documento verificable"
  con QR y pie institucional. El símbolo de la marca aparece como marca de
  agua sutil; las operaciones no completadas conservan la marca de agua de
  estado.
- La cartola PDF (`GET /v1/reports/statement?format=pdf`) suma tarjetas de
  resumen con iconos, sello de cuadratura verificada e iconos por sección;
  el Excel mantiene su estructura.
- Los emails (comprobantes, códigos de verificación y avisos de seguridad)
  comparten ahora una plantilla brandeada con encabezado y pie
  institucionales de tu organización.
- En los comprobantes de envíos fiat el banco del beneficiario se muestra
  SIEMPRE por nombre: si la operación se creó con el `bank_code` del
  catálogo, se resuelve automáticamente al nombre del banco.
- Sin cambios de API: mismas rutas, mismos shapes. Solo cambia el diseño de
  los documentos y correos.

### v1.57

**Agregado — Refresh tokens para sesiones de usuario**

- Todo login (contraseña, OTP, social, passkey, handoff y registro) ahora
  devuelve, junto al `access_token` de 24 horas, un **`refresh_token`**
  (`rt_…`) de un solo uso para renovar la sesión sin re-login:
  `POST /v1/auth/refresh` entrega un par nuevo y rota el token (30 días por
  rotación, tope absoluto de 90 días desde el login original). Detalle y
  reglas de seguridad en
  [Autenticación → Renovación de sesión](https://docs.cbpayapp.com/es/autenticacion#renovacion-de-sesion-refresh-tokens).
- **Rotación estricta y detección de robo**: canjear revoca el access token
  anterior del dispositivo; presentar un refresh token ya canjeado revoca la
  cadena completa y registra el evento `refresh_token_reuse` en
  `GET /v1/me/security/events`. Cerrar sesión, revocar sesiones o cambiar la
  contraseña también invalida los refresh tokens.
- Código de error nuevo: `401 invalid_refresh_token`. Las API keys `pk_` no
  cambian: no expiran ni usan refresh.

### v1.56

**Agregado — Ambiente de test (sandbox) con dinero simulado**

- Nuevo ambiente de **test** en `https://cryptobank.qbank.cl/platform`:
  la misma API, con todos los corredores atendidos por un simulador propio
  determinista — siempre disponible, sin depender de terceros. Las
  operaciones completan solas en segundos y los **valores mágicos**
  (montos `.99`/`.77`, beneficiario `REJECT`, OTP `000000`, etc.) fuerzan
  cada resultado alternativo. Guía completa en
  [Ambientes y pruebas](https://docs.cbpayapp.com/es/entorno-y-pruebas).
- **API keys por ambiente**: test emite y acepta solo keys `pk_test_`;
  live solo `pk_`. Una key del otro ambiente devuelve `401` — imposible
  cruzar ambientes por error.
- Toda respuesta lleva el header **`CBPay-Environment`** (`test` | `live`)
  y `GET /healthz` expone `livemode`.
- **Switch test/live de un click**: `POST /v1/auth/environment-handoff`
  (live) emite un token de un solo uso (60s) que se canjea en
  `POST /v1/auth/handoff` (test) por una sesión del ambiente de test, con
  auto-provisión de la cuenta espejo si no existe.

## v1.55 · 9 versiones - 12 de julio de 2026

### v1.55

**Agregado — Historial auditable de screenings AML**

- `GET /v1/aml/screenings` y `GET /v1/aml/screenings/{screeningID}` listan y
  consultan cada screening AML (persona, empresa y rescreen) guardado localmente
  para auditoría — sujeto, riesgo, comisión y resultado completo.
- `POST /v1/aml/screenings` y `POST /v1/aml/rescreen` ahora exigen
  `idempotency_key` (las operaciones cobran comisión). Repetir con la misma clave
  devuelve el registro original con `idempotency_hit: true` sin cobrar dos veces.
- `PATCH /v1/aml/monitoring` guarda cada activación/desactivación en el mismo
  historial (`kind: monitoring`); `idempotency_key` es obligatoria cuando el
  estado cambia (habilitar cobra comisión).

### v1.54

**Agregado — Travel Rule en retiros on-chain (FATF R.16)**

- Los retiros crypto sobre el umbral configurado (default 1.000 USD)
  ahora exigen declarar el beneficiario antes de mover fondos:
  `wallet_type: "self_hosted"` + `beneficiary_name` para wallets propias,
  o `travel_address` + `beneficiary_name` para destinos en otra
  institución (el intercambio de datos ocurre en línea y la dirección de
  pago la entrega la institución receptora). Bajo el umbral nada cambia.
- La respuesta del retiro incluye `travel_rule_status`
  (`not_required` / `self_hosted_attested` / `approved`).
- Códigos de error nuevos: `travel_rule_required`,
  `travel_rule_beneficiary_required`, `travel_rule_address_mismatch`,
  `travel_rule_rejected`, `travel_rule_pending`,
  `travel_rule_incomplete_approval`, `travel_rule_unavailable`. Detalle en
  la [guía crypto](https://docs.cbpayapp.com/es/guias/crypto) y la
  [página de errores](https://docs.cbpayapp.com/es/errores).

### v1.53

**Agregado — Series banking en el historial de saldos**

- `GET /v1/balances/history` ahora incluye en `assets` las series diarias
  de las cuentas banking (`BANK_USD`, `BANK_EUR`), cada una en su propia
  moneda (2 decimales), listas para graficarlas como un filtro más junto a
  USDT/USDC/BTC/GOLD. Siguen fuera del agregado `total_usd`, que cubre
  solo los saldos operativos. Guía de
  [analytics](https://docs.cbpayapp.com/es/guias/analytics) actualizada.

### v1.52

**Agregado — Filtro por país en envíos y depósitos**

- `GET /v1/payouts` y `GET /v1/payins` aceptan el filtro `country`
  (ISO 3166-1 alfa-2, ej. `?country=MX`), combinable con `status`,
  `from`/`to` y la paginación. Guías de [payouts](https://docs.cbpayapp.com/es/guias/payouts) y
  [payins](https://docs.cbpayapp.com/es/guias/payins) actualizadas.
- El bloque `fees` de `GET /v1/rates` ahora devuelve la configuración
  de comisiones **efectiva** (defaults de la organización resueltos
  contra los overrides de la cuenta). Antes una cuenta sin overrides
  veía `fees: []` aunque sus operaciones tuvieran costo; usa este
  bloque para cotizar la comisión exacta antes de crear la operación.

### v1.51

**Cambiado — Límites de wallets por tipo de cuenta**

- **Wallets de depósito**: toda cuenta — persona y empresa — mantiene
  exactamente **una wallet de depósito por par** soportado (`tron`/`usdt`,
  `eth`/`usdt`, `eth`/`usdc`), creadas gratis al registrarse. `POST
  /v1/crypto/wallets` queda solo para restaurar un par faltante; con el par
  ya creado responde `422 wallet_limit_reached` para cualquier tipo de
  cuenta (antes las empresas podían crear más).
- **Wallets segregadas**: ahora también disponibles para cuentas persona,
  con límite de **1 por par** red/activo (la segunda responde `422
  wallet_limit_reached`). Las empresas siguen sin límite. El error `403
  company_required` ya no aplica a wallets segregadas.
- Guías de [crypto](https://docs.cbpayapp.com/es/guias/crypto) y [wallets
  segregadas](https://docs.cbpayapp.com/es/guias/wallets-segregadas), página de [personas y
  empresas](https://docs.cbpayapp.com/es/conceptos/personas-y-empresas) y
  [errores](https://docs.cbpayapp.com/es/errores) actualizadas.

### v1.50

**Agregado — Monitoreo transaccional continuo (controles de cumplimiento)**

- La plataforma ahora monitorea todas las operaciones en tiempo real con
  controles de cumplimiento de estándar bancario. Para la gran mayoría de
  los clientes esto es invisible: no cambia ningún flujo ni agrega latencia
  perceptible.
- Códigos de error nuevos documentados en [errores](https://docs.cbpayapp.com/es/errores): `403
  compliance_hold` (operación retenida por cumplimiento), `403
  geo_restricted` (jurisdicción no soportada) y `503
  compliance_check_unavailable` (verificación temporalmente no disponible —
  la operación no salió; reintenta con la misma clave de idempotencia).

### v1.49

**Agregado — Documentación en 3 idiomas (inglés por defecto)**

- Esta documentación ahora está disponible completa en **inglés** (idioma
  por defecto), **español** y **chino simplificado**. Cambia de idioma con
  el selector en la parte superior del sitio.
- La API Reference también existe en los tres idiomas (mismos endpoints y
  ejemplos; solo cambian las descripciones).
- La colección Postman y la guía compilada en Markdown se mantienen al día
  desde cualquier idioma del sitio.

### v1.48

**Agregado — Screening de wallets (riesgo AML de direcciones blockchain)**

- Producto nuevo: `POST /v1/screenings/addresses` evalúa cualquier dirección
  blockchain contra inteligencia on-chain global — sanciones, exposición a
  fondos ilícitos — y devuelve un nivel de riesgo `Low`/`Medium`/`High`/
  `Severe` con la evidencia completa. Comisión fija por scan
  (`address_screening`, con reembolso automático si falla) e idempotencia
  obligatoria. Historial con `GET /v1/screenings/addresses` (+`/{id}`).
- **Protección automática gratis**: los retiros on-chain evalúan el destino
  antes de firmar (riesgo severo ⇒ rechazo con reembolso completo) y los
  depósitos entrantes evalúan al remitente antes de acreditar (severo ⇒
  retenido en revisión de compliance; alto ⇒ se acredita con alerta).
- Webhooks nuevos: `crypto_deposit_held` y `crypto_deposit_alert`.
- Guía nueva: [Screening de wallets](https://docs.cbpayapp.com/es/guias/screenings).

### v1.47

**Agregado — Assets públicos por CDN (avatares, branding, QR de cobro)**

- **Avatares por CDN**: `avatar_url` (en `PUT /v1/me/avatar`, `GET /v1/resolve`
  y contactos) ahora es una **URL pública absoluta** que carga sin
  autenticación cuando la imagen está publicada en el CDN;
  `GET /v1/avatars/{accountID}` responde con un `302` hacia esa URL (los
  avatares legados se siguen sirviendo directo).
- **Branding con URLs**: `GET /v1/branding` suma `logo_url` y `symbol_url` —
  URLs públicas de CDN de los logos, para tematizar el front sin decodificar
  base64 (los campos `*_png_base64` se mantienen).
- **QR de payins**: los cobros QR (`POST /v1/payins`, método `qr`) exponen
  `qr_image_url`, el PNG del QR publicado en el CDN, además del base64
  `qr_image` de siempre. Ideal para mostrarlo con un `` directo.

Nada se rompe: todos los campos existentes se conservan; las URLs son
aditivas. Guías: [Perfil](https://docs.cbpayapp.com/es/guias/perfil) y [Payins](https://docs.cbpayapp.com/es/guias/payins).

## v1.46 · 7 versiones - 11 de julio de 2026

### v1.46

**Agregado — Catálogos de compliance**

- Nuevo `GET /v1/aml/catalogs`: todos los catálogos para construir
  formularios de compliance y verificación (géneros, formas jurídicas por
  país, fuentes de ingreso/patrimonio, estándares de industria, países y
  subdivisiones ISO-3166). Antes esta data no estaba disponible en la API.

**Cambiado**

- El bloque `asset_prices` de `GET /v1/rates` y `GET /v1/rates/history` ya
  no incluye el campo interno `source`; usa `settlement_grade` y
  `updated_at` para saber si un precio es ejecutable y qué tan fresco está.

Guía: [AML screening](https://docs.cbpayapp.com/es/guias/aml).

### v1.45

**Agregado — Toda cuenta nace con sus wallets de depósito**

- Al crear una cuenta (persona o empresa) se aprovisionan automáticamente y
  **sin costo** sus tres wallets de depósito crypto: `tron`/`usdt`,
  `eth`/`usdt` y `eth`/`usdc`. Apenas registrada, `GET /v1/crypto/wallets`
  ya devuelve las tres direcciones (la provisión corre en segundo plano;
  si consultas en el mismo segundo puede tardar unos instantes).
- `POST /v1/crypto/wallets` queda para wallets **adicionales** (empresas);
  las personas ya tienen ocupado el cupo de cada combinación desde el
  registro. Las cuentas creadas antes de este cambio fueron completadas con
  las wallets que les faltaban.

**Cambiado**

- El registro público de cuentas ahora tiene límite de velocidad por IP
  (`429 too_many_attempts`).

Guía: [crypto](https://docs.cbpayapp.com/es/guias/crypto).

### v1.44

**Agregado — Trazabilidad total: banking en la cartola, comisiones desglosadas y custodia de wallets**

- **Cartola más completa**: nuevas secciones `card_transactions` (compras
  con tarjeta), `swaps` (conversiones de saldo) y `banking_operations`
  (operaciones bancarias). Si usas Banking, tus cuentas bancarias cuadran
  como saldos espejo `BANK_USD`/`BANK_EUR` en la sección `assets`.
- **Comisiones desglosadas**: payouts, payins y retiros crypto ahora
  separan la comisión en `fee_percent` y `fee_fixed` (suman exacto el
  `fee`); los cargos standalone llevan `fee_model: "fixed"` y se etiquetan
  **Fixed Com** en el PDF/Excel.
- **Comprobantes nuevos**: `GET /v1/banking/operations/{id}/receipt`,
  `GET /v1/wallets/{walletID}/sends/{sendID}/receipt` y
  `GET /v1/wallets/{walletID}/deposits/{depositID}/receipt`. El webhook
  `banking_operation_status_changed` ahora incluye `receipt_url`.
- **Custodia de wallets segregadas**: campo `custody` (`cbpay` | `client`)
  en cada wallet; la plataforma sincroniza la actividad on-chain completa y
  emite los webhooks `wallet_external_movement` (movimiento firmado por
  fuera, esperable en custodia `client`) y
  `wallet_key_compromise_suspected` (alarma crítica).
- **Analytics**: `sections.banking.volume` (dinero movido por tus cuentas
  bancarias, que también suma al `gross_volume`),
  `sections.verifications.fees_by_kind` (gasto KYC vs KYB por separado),
  `sections.adjustments` y `deposits.wallet_fees_usd`.
- **Contabilidad garantizada por wallet** (custodia `cbpay`): cuadratura de
  vida completa en la cartola y `funding_sources` (atribución FIFO
  depósito→envío) en el detalle de cada envío. Los saldos espejo `BANK_*`
  también aparecen en `GET /v1/balances` con `custody: "banking"`.

Guías: [cartola](https://docs.cbpayapp.com/es/guias/cartola), [banking](https://docs.cbpayapp.com/es/guias/banking),
[wallets segregadas](https://docs.cbpayapp.com/es/guias/wallets-segregadas),
[comprobantes](https://docs.cbpayapp.com/es/guias/comprobantes) y [analytics](https://docs.cbpayapp.com/es/guias/analytics).

### v1.43

**Agregado — Series históricas para tu dashboard**

- **`GET /v1/rates/history`**: la evolución de las tasas de cambio de tu
  cuenta (punta payout y payin por punto), con granularidad `day` u `hour`,
  y `change_pct` con signo por moneda — listo para el gráfico de tasas con
  su badge "+3.4% / −3.0%". Incluye las series de referencia USD de BTC y
  GOLD.
- **`GET /v1/balances/history`**: la evolución diaria de tus saldos — una
  serie por asset con el saldo de cierre de cada día (sin huecos), la serie
  agregada en USD valorizada al precio histórico de cada día, las
  entradas/salidas del período y el snapshot actual — todo lo necesario
  para la tarjeta de saldo con gráfico.
- El historial de tasas nace con un backfill de ~90 días de tasas diarias y
  se registra continuamente hacia adelante.

Ejemplos completos en [analytics](https://docs.cbpayapp.com/es/guias/analytics).

### v1.42

**Agregado — Comprobantes PDF con verificación de autenticidad**

- Todo producto transaccional tiene su **comprobante PDF brandeado**:
  `GET .../receipt` en payouts, payins, transferencias, retiros y depósitos
  crypto (`deposit_id` nuevo en `GET /v1/crypto/transactions`), swaps y
  compras con tarjeta. Idiomas `?lang=es|en`.
- **`receipt_url`** en toda respuesta de esos productos y en los webhooks de
  estados finales: el front nunca construye la URL a mano.
- **Verificación pública de autenticidad**: cada PDF lleva un código firmado
  con QR que abre `GET /verify/receipts/{code}` (sin credenciales) — JSON
  para APIs y página web brandeada para navegadores, siempre con el estado y
  monto **reales y vigentes**, sin datos personales del beneficiario.
- Los comprobantes de operaciones **no completadas** llevan marca de agua
  diagonal ("EN PROCESO" / "FALLIDA"): un PDF en tránsito jamás pasa por
  prueba de pago.
- **Email automático** con el PDF adjunto al llegar la operación a estado
  final, con opt-out por cuenta (`PATCH /v1/me` con `receipt_emails: false`).

**Agregado — Branding**

- `GET /v1/branding`: el branding efectivo de la plataforma (logo, colores,
  nombre) para que el front white-label se auto-tematice desde la API.

**Cambiado**

- La [cartola](https://docs.cbpayapp.com/es/guias/cartola) PDF ahora sale con el **logo real** de la
  marca y tipografía Inter (antes wordmark tipográfico), y el Excel incluye
  el logo en la hoja resumen.

Guía completa en [comprobantes](https://docs.cbpayapp.com/es/guias/comprobantes).

### v1.41

**Agregado — Wallets segregadas (solo cuentas empresa)**

- Wallets on-chain con **saldo propio** (fuera del ledger): crear
  (`POST /v1/wallets`), listar y ver detalle, **importar** una wallet externa
  con su llave (`POST /v1/wallets/import`), **exportar** la llave privada
  (`POST /v1/wallets/{id}/export`, custodia compartida) y **enviar** crypto
  directo desde la wallet (`POST /v1/wallets/{id}/sends`).
- Consulta on-chain en vivo: `GET .../balance` (incluye gas), `.../deposits`
  y `.../transactions`; **auto-forward** configurable (`GET`/`POST
  .../auto-forward`).
- El **gas** de los envíos corre por el cliente: sin gas el envío responde
  `422 insufficient_gas`. Import y export exigen sesión de usuario con 2FA.
- Fees nuevos: `wallet_import`, `wallet_export`, `wallet_send`.
- Webhooks nuevos: `wallet_deposit_received`, `wallet_send_status_changed`,
  `wallet_key_exported`. Service flag nuevo: `wallets`.
- La [cartola](https://docs.cbpayapp.com/es/guias/cartola) y el [dashboard](https://docs.cbpayapp.com/es/guias/analytics)
  incluyen una sección de wallets segregadas.

Guía completa en [wallets segregadas](https://docs.cbpayapp.com/es/guias/wallets-segregadas).

### v1.40

**Agregado — Perfil, credenciales y seguridad de la cuenta**

- **Contraseña**: cambio self-service (`POST /v1/me/password`, revoca las
  demás sesiones) y recuperación por código
  (`POST /v1/auth/password/forgot` → `POST /v1/auth/password/reset`) al email
  o al teléfono verificado. Forgot siempre responde 200 (no revela si la
  cuenta existe).
- **Email de login**: cambio verificado (`POST /v1/me/email/change` →
  `confirm` con el código enviado al email **nuevo**) y verificación del
  actual (`POST /v1/me/email/verify`).
- **Alias permanente** (`PUT /v1/me/alias`) y **QR de perfil**
  (`GET /v1/me/qr`): identifican tu cuenta para **recibir** transferencias.
  Las transferencias aceptan `to_alias` y `to_qr_token`; `GET /v1/resolve`
  muestra una vista previa del destinatario antes de enviar.
- **Foto de perfil**: `PUT`/`DELETE /v1/me/avatar` y `GET /v1/avatars/{id}`.
- **2FA self-service** (`GET`/`PUT /v1/otp/preferences`): activa y elige el
  canal por acción — ahora también **email** y **app autenticadora (TOTP)**
  además de SMS/WhatsApp. Puedes endurecer libremente; relajar exige
  verificación.
- **App autenticadora (TOTP)**: `POST /v1/me/totp/enroll` (QR) →
  `confirm` (entrega 10 códigos de respaldo de un solo uso), `DELETE`, y
  `POST /v1/me/totp/recovery-codes` para regenerarlos.
- **Passkeys (WebAuthn)**: inicio de sesión sin contraseña con la biometría
  del dispositivo (Face ID, Touch ID, Windows Hello, llaves). Registro
  (`/v1/me/passkeys/register/begin|finish`), gestión (`GET`, `DELETE`) y
  login (`/v1/auth/passkey/login/begin|finish`).
- **Sesiones y actividad**: `GET /v1/me/sessions` + revocar una o todas, y
  `GET /v1/me/security/events` (historial de seguridad de la cuenta).
- Avisos por email ante eventos sensibles (cambio de contraseña o email,
  alta/baja de un factor).

## v1.39 · 7 versiones - 10 de julio de 2026

### v1.39

**Agregado — Identidad verificada reutilizable (KYC/KYB unificado)**

- La verificación KYC/KYB aprobada de un cliente pasa a ser su **identidad
  única** dentro de CBPay: sus datos y documentos se reutilizan en los
  demás productos sin volver a tipearlos ni re-subirlos. Guía:
  [identidad reutilizable](https://docs.cbpayapp.com/es/guias/kyc#una-sola-verificacion-para-todo-identidad-reutilizable).
- **Tarjetas**: la primera emisión de tu cuenta completa la identidad y los
  documentos del titular **desde tu verificación aprobada** — solo envías
  `occupation` y `salary_usd`. Los campos explícitos siguen ganando.
- **Informe de compliance (KYB)**: `GET /v1/kyb/submissions/{id}/report`
  descarga el informe de compliance firmado (PDF) de la verificación.

**Cambiado — Breaking**

- **`POST /v1/banking/third-parties`** ahora exige `verification_id` de una
  verificación **aprobada** del tercero. El `type` sale del kind (KYC ⇒
  INDIVIDUAL, KYB ⇒ COMPANY), la identidad se completa sola y los
  documentos ya validados se re-entregan al proveedor bancario
  (`documents_synced`). Los terceros existentes siguen operando.
- **`POST /v1/cards`** para personas designadas (cuentas empresa) ahora
  exige `cardholder.verification_id` del KYC **aprobado** de esa persona;
  su identidad y documentos salen de la verificación.
- Errores nuevos: `422 verification_required`,
  `422 verification_not_approved`, `422 verification_kind_mismatch`,
  `422 verification_invalid`.

### v1.38

**Agregado — Resumen de cuenta (analytics) + usuarios banking de terceros**

- **`GET /v1/analytics/summary`**: en una sola llamada, todas las series y
  estadísticas de tu cuenta para armar tu dashboard — volumen bruto
  (in/out), transacciones y usuarios nuevos por período (día/semana/mes,
  con comparativa vs el período anterior), vista global por país, y una
  sección por CADA servicio (payouts, payins, depósitos, retiros,
  transferencias, swaps, tarjetas, banking, KYC/KYB, AML, contactos) con
  sus dimensiones (país, moneda, método, estado, chain, comercio). Además
  `spending` (lo que consumiste en fees por servicio) y `balances`
  valorizados en USD. Guía nueva: [Resumen de tu cuenta](https://docs.cbpayapp.com/es/guias/analytics).
- **Usuarios banking de terceros (solo empresas)**: `POST/GET
  /v1/banking/third-parties` (+documentos, submit, cuentas, saldo) para dar
  de alta a tus clientes finales como usuarios banking separados, con su
  identidad/KYC y cuentas a su nombre. Aislados por cuenta.
- **Límite nuevo**: las cuentas persona pueden tener máximo 1 cuenta
  bancaria (`409 banking_account_limit`).

### v1.37

**Cambiado — Tasas de Bolivia y Venezuela**

- Las tasas USD→BOB y USD→VES de `GET /v1/rates` ahora reflejan el mercado
  con el que realmente operamos tus pagos (antes se publicaba una tasa de
  referencia que no correspondía al valor aplicado).
- Si en algún momento una de esas tasas no está disponible, el país no
  aparece en `GET /v1/rates` y las operaciones en esa moneda responden
  `422 currency_not_supported` hasta que vuelva — nunca cotizamos con una
  tasa incorrecta. Te recomendamos consultar `GET /v1/rates` (o suscribirte
  al webhook de tasas) antes de cotizar pagos en `BOB` o `VES`.

### v1.36

**Agregado — Swaps: conversión entre tus saldos**

- Nuevo producto `swaps`: convierte entre `USDT`, `USDC`, `BTC` y `GOLD`
  al instante y sin que la plata salga de tu cuenta — cualquier par,
  incluido `BTC` ↔ `GOLD` directo. `POST /v1/swaps` (síncrono, con
  `idempotency_key`), `GET /v1/swaps/quote` (cotización indicativa gratis)
  y `GET /v1/swaps` (+`/{id}`) para el historial.
- La tasa cotizada es la tasa de ejecución de tu cuenta: cotizado =
  recibido, sin comisiones aparte. Precios de BTC/GOLD en vivo (si el
  precio no está fresco, el swap se rechaza con `503 pricing_unavailable`).
- Las conversiones que tocan BTC/GOLD comparten los límites por operación
  y de volumen 24 h con payouts y compras con tarjeta
  (`GET /v1/settlement`). Guía nueva: [Swaps](https://docs.cbpayapp.com/es/guias/swaps).

### v1.35

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
  [Contactos](https://docs.cbpayapp.com/es/guias/contactos).

### v1.34

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
  [Verificación KYC y KYB](https://docs.cbpayapp.com/es/guias/kyc).

**Cambiado (BREAKING) — El screening pasa a AML**

- `POST /v1/kyc`, `POST /v1/kyc/rescreen` y `PATCH /v1/kyc/monitoring` se
  **eliminaron**: el screening contra listas ahora vive en
  `POST /v1/aml/screenings`, `POST /v1/aml/rescreen` y
  `PATCH /v1/aml/monitoring` (misma semántica y comisiones `compliance_*`).
  El error `no_kyc` pasa a `no_screening` y el screening ya no toca tu
  `kyc_status`. Nuevo webhook `aml_screening_updated` y nuevo service flag
  `aml` (el flag `kyc` ahora gatea la verificación de identidad). Guía:
  [AML screening](https://docs.cbpayapp.com/es/guias/aml).

### v1.33

**Corregido — Catálogo de bancos sin `method` en países con varios métodos**

- `GET /v1/payouts/banks?country=VE` respondía `400` pidiendo `method`, y
  `?country=BO` respondía `400 payout_corridor_unsupported`. Ahora el
  catálogo **sin `method` devuelve la unión de los bancos de todos los
  métodos del país** (deduplicada por código), como promete esta
  documentación; con `method` se acota al canal específico (parámetro
  documentado en la referencia).

## v1.32 · 7 versiones - 9 de julio de 2026

### v1.32

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

### v1.31

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

### v1.30

**Cambiado — Endurecimiento del settlement multi-asset**

- Los pagos desde BTC/GOLD ahora tienen, además del límite por operación,
  un **tope de volumen en 24 h móviles por cuenta** (`422
  settlement_daily_limit_exceeded`). Lo ves en `GET /v1/settlement` como
  `volatile_daily_limit_usdt`.
- Las comisiones de **tarjetas** (emisión, cancelación y mensualidad) ahora
  también se debitan desde tu saldo de settlement predeterminado, igual que
  el resto de los servicios. Las **compras** con tarjeta siguen liquidando
  en USDT.

### v1.29

**Agregado — Paga payouts y servicios desde cualquier saldo (settlement multi-asset)**

- Los payouts y las comisiones de servicios (KYC, creación de wallets,
  banking) ahora pueden debitarse desde **cualquiera de tus cuatro saldos**
  (USDT, USDC, BTC, GOLD). El pricing sigue cotizándose en USDT; el total
  se traduce al asset elegido con el precio efectivo de settlement del
  momento. Detalle en el
  [modelo de dinero](https://docs.cbpayapp.com/es/conceptos/modelo-de-dinero#elige-desde-que-saldo-pagas).
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

### v1.28

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

### v1.27

**Agregado — Payins en Paraguay (transferencia anunciada)**

- Nuevo corredor de cobro `PY`/`PYG`/`bank_transfer`: anuncia el depósito
  con `POST /v1/payins`, tu pagador transfiere (SIPAP o transferencia
  interna del banco receptor) con la `reference` en el concepto, y el
  abono llega automático en USDT a tu `payin_rate`, como en todos los
  países. Guía en [payins](https://docs.cbpayapp.com/es/guias/payins).
- Los guaraníes no usan decimales: anuncia el **monto entero exacto**
  (ej. `"596000"`). El match de respaldo por monto+moneda aplica igual.
- El corredor aparece en `GET /v1/payins/methods` con `delivery: polling`.

### v1.26

**Agregado — Saldos virtuales multi-moneda (USDT, USDC, BTC, GOLD)**

- Cada cuenta ahora mantiene **cuatro saldos virtuales independientes**:
  `USDT` (la moneda operativa), `USDC`, `BTC` (8 decimales, satoshis) y
  `GOLD` (gramos de oro fino, 6 decimales, con respaldo en custodio).
  Nunca se mezclan ni se convierten automáticamente. Detalle en
  [modelo de dinero](https://docs.cbpayapp.com/es/conceptos/modelo-de-dinero).
- **`GET /v1/balances`** devuelve siempre los cuatro saldos (con ceros si
  no has operado esa moneda) y `GET /v1/movements` filtra por moneda con
  `?asset=`.
- **Transferencias internas multi-moneda**: `POST /v1/transfers` acepta
  `asset` (`USDT` default, `USDC`, `BTC`, `GOLD`) — siempre entre saldos de
  la **misma moneda**, sin conversión y sin comisión.
- **USDC on-chain**: crea wallets `eth`/`usdc`, deposita y retira USDC por
  Ethereum. Cada depósito acredita el saldo de su propio activo. Guía en
  [crypto](https://docs.cbpayapp.com/es/guias/crypto).
- **Precios de referencia**: `GET /v1/rates` incluye `asset_prices` con el
  precio USD referencial de cada moneda (BTC por unidad, GOLD por gramo) —
  solo para valorizar, sin conversión ni spread.
- **Cartola multi-moneda**: nueva sección `assets` con la conciliación
  independiente de cada saldo no-USDT (inicial/entradas/salidas/final y su
  flag `balanced`), también en el PDF y el Excel.
- Los payouts, payins, tarjetas y comisiones de servicios siguen operando
  **exclusivamente contra el saldo USDT**.

## v1.25 · 8 versiones - 8 de julio de 2026

### v1.25

**Agregado — Login social (Google, Apple, Microsoft, Meta)**

- **Registro e inicio de sesión sin contraseña** con Google, Apple,
  Microsoft y Facebook por token exchange: tu front obtiene la credencial
  con el SDK del proveedor y la intercambias en `POST /v1/auth/oauth` por la
  sesión CBPay. Guía completa en [login social](https://docs.cbpayapp.com/es/guias/login-social).
- **Endpoints nuevos**: `POST /v1/auth/oauth` (login + registro unificado),
  `GET /v1/auth/oauth/providers` (proveedores habilitados, público),
  `GET/POST /v1/me/identities` y `DELETE /v1/me/identities/{provider}`
  (vincular/desvincular proveedores desde la sesión).
- **Integra el 2FA**: si la cuenta exige OTP en login, el login social
  también devuelve `otp_required` + `pending_token`.
- **Multi-método**: una misma cuenta puede tener contraseña y varios
  proveedores; el auto-vínculo por email solo ocurre si el proveedor lo
  entrega verificado.
- Códigos de error nuevos en el [catálogo](https://docs.cbpayapp.com/es/errores): `invalid_provider`,
  `provider_not_configured`, `invalid_credential`, `email_conflict`,
  `identity_taken`, `last_login_method`.

**Corregido**

- El sello de "Colección actualizada" en la página de Postman ahora muestra
  correctamente hace cuánto se actualizó (antes quedaba un indicador vacío).

### v1.24

**Agregado — OTP/2FA por SMS y WhatsApp**

- **Verificación en dos pasos para acciones sensibles**: tu operador puede
  exigir un código de un solo uso (por SMS o WhatsApp) antes de login,
  payouts, retiros crypto, transferencias, pagos bancarios, revelar una
  tarjeta, emitir API keys, agregar miembros o cambiar el teléfono. Guía
  completa en [seguridad y 2FA](https://docs.cbpayapp.com/es/seguridad-2fa).
- **Endpoints nuevos**: `POST /v1/otp/challenges` (envía el código),
  `POST /v1/otp/challenges/{id}/verify` (devuelve el `otp_token` de un solo
  uso para el header `X-OTP-Token`), `GET /v1/otp/challenges` (+ detalle) y
  `GET /v1/otp/settings` (tu política efectiva).
- **Login en dos pasos**: con OTP activo en `login`, `POST /v1/auth/login`
  devuelve `otp_required: true` + `pending_token`, y la sesión se emite en
  `POST /v1/auth/login/otp`.
- **Solo sesiones de usuario**: las API keys `pk_` quedan exentas — tus
  integraciones server-to-server no cambian.
- Códigos de error nuevos en el [catálogo](https://docs.cbpayapp.com/es/errores): `otp_required`,
  `otp_invalid`, `phone_required`, `phone_binding_cooldown`,
  `too_many_attempts` y más.

### v1.23

**Documentación — persona vs empresa y guías unificadas**

- **Nueva página [personas y empresas](https://docs.cbpayapp.com/es/conceptos/personas-y-empresas)**:
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

### v1.22

**Documentación — rediseño completo del sitio**

- **Navegación nueva**: Comenzar → Conceptos → Flujos de integración →
  Productos → Integración → Recursos, con icono por página y breadcrumbs.
- **Páginas nuevas**: [ambiente y pruebas](https://docs.cbpayapp.com/es/entorno-y-pruebas) (túnel
  para webhooks en local + checklist de go-live),
  [servicios habilitados](https://docs.cbpayapp.com/es/conceptos/servicios),
  [estados y ciclo de vida](https://docs.cbpayapp.com/es/conceptos/estados) (incluye el catálogo de
  `status_code` de payouts fallidos),
  [movimientos y conciliación](https://docs.cbpayapp.com/es/conceptos/movimientos-y-conciliacion) y
  [flujos de integración](https://docs.cbpayapp.com/es/flujos) con diagramas end-to-end.
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

### v1.21

**Agregado**

- **`payin_rate` en `GET /v1/rates`**: cada país ahora entrega tus dos
  tasas — `rate` para payouts (dispersiones) y `payin_rate` para payins
  (cobros/depósitos fiat). Cotizado = acreditado, siempre.

**Cambiado**

- **Pricing de payins igual que payouts**: el pricing FX de un payin vive
  en tu `payin_rate` (la conversión del abono se hace exactamente a esa
  tasa) y la comisión de payin pasa a ser un **fijo por operación** — sin
  porcentajes aparte. El campo `fx_rate` de cada payin registra la tasa
  aplicada. Ver [comisiones](https://docs.cbpayapp.com/es/conceptos/comisiones) y la
  [guía de payins](https://docs.cbpayapp.com/es/guias/payins).
- La conversión de abonos redondea hacia abajo al micro-USDT (los débitos
  siguen redondeando hacia arriba), con diferencia máxima de 1 micro-USDT.

**Documentación**

- **KYC/KYB: referencia completa de campos de identidad.** El objeto
  `customer` siempre aceptó muchos más campos opcionales de los que
  mostraban los ejemplos (fecha de nacimiento, nacionalidades, documentos
  con país emisor, alias, domicilios, datos registrales de empresa…) y
  enviarlos hace el screening más preciso. La
  [guía de KYC](https://docs.cbpayapp.com/es/guias/kyc) ahora documenta todos los campos, con
  ejemplos de identidad completa y la regla de deduplicación.

### v1.20

**Agregado**

- **Catálogo de tarjetas**: `GET /v1/cards/catalog/occupations` y
  `GET /v1/cards/catalog/business-activities` (buscables con `?q=`) para
  poblar selectores. Al designar una persona, `occupation` debe ser un
  **código** del catálogo; para empresa, `kind_of_business` también. Un valor
  fuera de catálogo se rechaza con `400 invalid_occupation` /
  `400 invalid_kind_of_business` antes de tocar el emisor. Ver la
  [guía de tarjetas](https://docs.cbpayapp.com/es/guias/tarjetas).

### v1.19

**Agregado**

- **`GET /v1/services`**: mapa efectivo de los servicios habilitados para tu
  cuenta (`payouts`, `payins`, `transfers`, `crypto`, `banking`, `kyc`,
  `cards`) — úsalo para decidir qué mostrar en tu UI. Los servicios se
  habilitan por cuenta según tu acuerdo comercial; si uno está apagado, sus
  acciones responden el nuevo error `403 service_disabled` (las lecturas y
  el dinero en tránsito nunca se bloquean).

### v1.18

**Agregado**

- **Tarjetas virtuales y físicas** que gastan directo del saldo USDT de la
  cuenta, sin prefondeo: cada compra se autoriza en tiempo real contra el
  saldo disponible y los límites de la tarjeta. Personas: 1 virtual + 1
  física; empresas: ilimitadas, propias o para personas designadas (ej.
  empleados). Nuevos endpoints `POST/GET /v1/cards`,
  `GET/PATCH /v1/cards/{id}` (límites y congelar/descongelar),
  `POST /v1/cards/{id}/activate|cancel|reveal` y
  `GET /v1/cards/{id}/transactions`. Ver la
  [guía de tarjetas](https://docs.cbpayapp.com/es/guias/tarjetas).
- **Nuevos servicios facturables** (fijos, configurables, pueden ser 0):
  `card_creation_virtual`, `card_creation_physical`, `card_monthly` (si no
  hay saldo, la tarjeta se congela — sin deuda) y `card_cancellation`.
- **Nuevos webhooks** `card_transaction` (autorizada/anulada/ajustada) y
  `card_status_changed` (cambios de estado, incluido el congelamiento
  automático).
- **Nuevos tipos de movimiento** en el ledger: `card_debit`, `card_refund`,
  `card_fee`, `card_fee_refund`.

## v1.17 · 16 versiones - 7 de julio de 2026

### v1.17

**Agregado**

- **Chile: página de pago hosted (`method: "fintoc"`)** en
  `POST /v1/payins`. La respuesta trae una `payment_url` que el pagador
  abre para transferir desde **cualquier banco o billetera chilena** (Banco
  Estado, Santander, Mach, Tenpo, Mercado Pago, entre otros); el
  depósito se detecta, valida y acredita automáticamente en USDT con el
  webhook `payin_credited` de siempre. Soporta `idempotency_key` opcional:
  un reintento devuelve el mismo payin y la misma URL sin abrir otra sesión
  de pago. Ver la [guía de payins](https://docs.cbpayapp.com/es/guias/payins).

### v1.16

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
  [guía](https://docs.cbpayapp.com/es/guias/cartola).

### v1.15

**Mejorado**

- **Diagramas de flujo visuales en toda la documentación**: mapa del
  dinero en la introducción (todo lo que entra y sale del saldo USDT),
  ciclo de vida del payout con débito/hold/reembolso, flujo QR en dos
  pasos, las 4 modalidades de payin convergiendo al abono, depósito y
  retiro crypto, ciclo completo de banking, estados del KYC, entrega y
  reintentos de webhooks, y la regla de decisión de idempotencia
  ("¿con qué clave reintento?").

### v1.14

**Cambiado**

- **Nueva URL base: `https://api.qbank.cl/platform`** (antes
  `exchange.qbank.cl/platform`). El dominio anterior sigue funcionando
  como alias, así que ninguna integración existente se rompe — pero usa
  `api.qbank.cl` para todo lo nuevo. Toda la documentación, el spec y el
  Postman ya apuntan a la URL nueva.

### v1.13

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
- Guía completa de [Banking](https://docs.cbpayapp.com/es/guias/banking) con el flujo end-to-end y
  ejemplos de cada operación.

### v1.12

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
- **Nueva página de [preguntas frecuentes](https://docs.cbpayapp.com/es/faq)**: sandbox, fondeo
  inicial, costos previos al payout, garantía de tasa, tiempos de llegada,
  reintentos seguros, depósitos sin referencia y más — las dudas del
  primer día respondidas en la misma docu.
- Quickstart abre con la tabla de **datos clave** (URL base, header de
  auth, slug, formato de montos, ambiente) y el ejemplo de respuesta de
  `GET /v1/rates` con la fórmula para estimar costos.
- Payouts: respuesta de ejemplo de los catálogos de métodos y bancos, y
  tabla de estados con el efecto en tu saldo. Payins: respuesta de ejemplo
  del catálogo con el significado de `delivery`.

### v1.11

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

### v1.10

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

### v1.9

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

### v1.8

**Agregado**

- **Payout QR Bolivia**: paga a cualquier QR de cobro boliviano en dos
  pasos — `POST /v1/payouts/qr/scan` (gratis, devuelve los datos del
  destinatario) y `POST /v1/payouts/qr/confirm` (se cobra igual que un
  payout: tu tasa + fijo, con resultado final síncrono y reembolso
  automático si falla).
- Bolivia (BOB) se sumó a las tasas de `GET /v1/rates`.

### v1.7

**Agregado**

- Nueva página **[Postman](https://docs.cbpayapp.com/es/postman)**: colección oficial descargable
  con los 25 endpoints, cuerpos de ejemplo y autenticación preconfigurada.
  Se regenera con cada versión de la API.

**Cambiado**

- La página de Comisiones y los ejemplos de payout reflejan el modelo de
  pricing vigente: los payouts se cobran **a tu tasa + fijo por operación**
  (sin porcentaje aparte). Si dispersas el equivalente a 100 USDT, se
  debitan 100 USDT más el fijo configurado.

### v1.6

**Mejorado**

- `GET /v1/rates` ahora entrega **el tipo de cambio propio de tu cuenta**
  por país: la misma tasa con la que se ejecutan tus operaciones
  (`monto_local / rate = USDT`), sin diferencias entre lo cotizado y lo
  cobrado.

### v1.5

**Eliminado (Breaking)**

- Se eliminó definitivamente `GET /v1/crypto/deposit-address` (el alias que
  quedó deprecado en v1.4). Usa `POST /v1/crypto/wallets` para crear
  wallets y `GET /v1/crypto/wallets` para consultarlas.

### v1.4

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

### v1.3

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

### v1.2

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

## v1.1 · 2 versiones - 6 de julio de 2026

### v1.1

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

### v1.0

**Lanzamiento inicial**

- Documentación pública de la API de CBPay, bilingüe (español e inglés):
  autenticación (sesiones JWT y API keys `pk_`), modelo de dinero USDT,
  comisiones, idempotencia, payouts fiat multi-país, payins, transferencias
  internas, crypto (fondeo y retiros on-chain), KYC, webhooks firmados y
  catálogo completo de errores.
- API Reference interactiva generada desde OpenAPI 3.1.
