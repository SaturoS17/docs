---
title: "Errores"
description: "Formato de error y catálogo completo de códigos"
slug: es/errores
lang: es
source_url: https://docs.cbpayapp.com/es/errores
---
Todos los errores comparten el mismo formato:

```json
{
  "error": "insufficient_funds",
  "message": "account balance is not enough for this operation"
}
```

- `error`: código estable en `snake_case` — úsalo en tu lógica.
- `message`: explicación legible — puede cambiar, no lo parsees.

## Códigos por categoría

### Autenticación y permisos

| HTTP | `error` | Significado |
|---|---|---|
| 401 | `unauthorized` | Credencial ausente o inválida |
| 401 | `invalid_credentials` | Email o contraseña incorrectos (login) |
| 401 | `invalid_refresh_token` | Refresh token inválido, expirado, ya usado o revocado — vuelve al login |
| 403 | `account_required` | El endpoint exige credencial de cuenta |
| 403 | `org_admin_required` | El endpoint exige credencial de administrador |
| 403 | `forbidden` | Nivel de credencial no permitido |
| 403 | `account_blocked` | La cuenta no está activa |
| 403 | `service_disabled` | El servicio no está habilitado para tu cuenta (consulta `GET /v1/services`) |
| 403 | `org_suspended` | El servicio está suspendido; contacta al equipo de CBPay |
| 403 | `company_only` | Función solo para cuentas empresa |
| 403 | `company_required` | Función solo para cuentas empresa (ej. [banking para terceros](https://docs.cbpayapp.com/es/guias/banking)) |
| 403 | `human_session_required` | La operación maneja llave privada (import/export de wallet segregada) y exige sesión de usuario con 2FA — las API keys no se permiten |
| 403 | `member_disabled` | El usuario está bloqueado para iniciar sesión; contacta al administrador de tu organización |
| 403 | `passkey_rejected` | La verificación de la passkey falló; reintenta o entra con contraseña |
| 403 | `owner_required` | Solo el miembro owner de la cuenta puede ejecutar esa acción |

### OTP / 2FA

Detalle y flujo completo en [seguridad y 2FA](https://docs.cbpayapp.com/es/seguridad-2fa).

| HTTP | `error` | Significado |
|---|---|---|
| 403 | `otp_required` | La acción exige OTP: verifica un desafío y reintenta con `X-OTP-Token` |
| 403 | `otp_invalid` | Token OTP inválido, expirado o ya usado |
| 403 | `session_required` | Los desafíos OTP requieren sesión de usuario, no API key |
| 403 | `phone_binding_cooldown` | Teléfono enlazado hace menos de 24 h sin verificación y sin factor alternativo (app autenticadora o email verificado) |
| 409 | `phone_verification_required` | Verifica tu teléfono (desafío OTP) antes de activar el 2FA de login por SMS/WhatsApp |
| 401 | `invalid_code` | El código no coincide |
| 401 | `invalid_pending_token` | El token intermedio del login expiró; vuelve a iniciar sesión |
| 400 | `invalid_action` / `invalid_channel` | Acción o canal fuera de catálogo |
| 409 | `phone_required` | La cuenta no tiene teléfono (`PATCH /v1/me`) |
| 409 | `otp_phone_missing` | El login exige OTP y la cuenta no tiene teléfono; contacta a tu operador |
| 409 | `challenge_not_pending` | El desafío expiró o ya se usó; crea uno nuevo |
| 429 | `too_many_attempts` | Límite de envíos o verificaciones; espera unos minutos |
| 503 | `otp_unavailable` | Servicio de verificación no disponible (la acción queda bloqueada, nunca se salta el OTP) |
| 409 | `otp_disabled_for_org` | Tu organización no tiene habilitado el 2FA por acción; contacta a tu operador |
| 409 | `totp_not_started` | No hay enrolamiento TOTP en curso; parte con `POST /v1/me/totp/enroll` |

### Login social (OAuth)

Detalle y flujo completo en [login social](https://docs.cbpayapp.com/es/guias/login-social).

| HTTP | `error` | Significado |
|---|---|---|
| 400 | `invalid_provider` | Proveedor fuera de `google/apple/microsoft/facebook` |
| 400 | `provider_not_configured` | Tu organización no tiene ese proveedor habilitado |
| 401 | `invalid_credential` | La credencial del proveedor es inválida, expiró o es de otra app |
| 409 | `email_conflict` | Ya existe una cuenta con ese email; entra con tu método actual y vincula el proveedor |
| 409 | `identity_taken` | Ese proveedor ya está vinculado a otra cuenta |
| 409 | `last_login_method` | No puedes desvincular tu único método de acceso |

### Validación (400)

| `error` | Significado |
|---|---|
| `invalid_json` | Body no es JSON válido o tiene campos desconocidos |
| `invalid_settings` | Los settings de la organización no son un objeto JSON válido o no pudieron normalizarse; corrige el payload y reintenta |
| `invalid_type` | `type` debe ser `person` o `company` |
| `invalid_email` / `invalid_display_name` | Campo requerido inválido |
| `weak_password` | Contraseña menor a 8 caracteres |
| `invalid_role` | Rol de miembro inválido |
| `unknown_org` | Slug de organización incorrecto (usa `cbpay`) |
| `invalid_request` | Faltan `country`/`currency` |
| `idempotency_key_required` | Falta la clave de idempotencia |
| `reserved_idempotency_key` | La clave usa un prefijo reservado del sistema (`payin-convert:` o `checkout-swap:`, propios de las auto-conversiones) — usa otra clave |
| `beneficiary_required` | Falta el beneficiario del payout |
| `invalid_amount` | Monto no es un decimal positivo válido |
| `recipient_required` / `self_transfer` | Destino de transferencia inválido |
| `invalid_chain` / `invalid_asset` | Red o activo no soportado |
| `to_address_required` | Falta dirección destino del retiro |
| `invalid_payload` | Falta un campo requerido (ej. `enabled` en monitoreo AML, `external_customer_id` en verificaciones) |
| `invalid_qr_payload` | QR de payout ilegible o no soportado (BR Code corrupto, checksum inválido o QR PIX dinámico); el `message` explica la razón exacta |
| `liveness_already_completed` | La prueba de vida de esa verificación ya fue superada |
| `invalid_event_type` / `weak_secret` / `invalid_callback_url` | Suscripción de webhook inválida |
| `invalid_phone` | Teléfono no normalizable a E.164 (contactos y `to_phone`) |
| `invalid_language` | `lang` del informe PDF no es `en`, `es` ni `zh` (informe AML) |
| `batch_too_large` | Import de contactos con más de 1.000 entradas (pagina la subida) |
| `invalid_alias` | El alias debe tener 4–20 caracteres (a-z, 0-9, punto, guion bajo, guion), empezar/terminar alfanumérico y no ser palabra reservada |
| `invalid_body` | No se pudo leer el body del request (subidas binarias, webhooks) |
| `invalid_image` | El body del avatar está vacío o no es una imagen soportada (PNG/JPEG/WebP, máx 512 KB) |
| `invalid_interval` | El `interval` de la suscripción debe ser `daily`, `weekly`, `monthly` o `yearly` |
| `query_required` | `GET /v1/resolve` necesita `alias=` o `qr=` |
| `same_email` | El nuevo email de login es el actual; usa `POST /v1/me/email/verify` para verificarlo |
| `invalid_status` / `invalid_kyc_status` / `invalid_direction` / `reason_required` / `account_id_required` / `invalid_service` / `invalid_fee` | Validaciones de administración |

### Dinero y estado (402 / 404 / 409 / 422)

| HTTP | `error` | Significado |
|---|---|---|
| 402 | `insufficient_funds` | Saldo disponible insuficiente |
| 404 | `not_found` | Recurso inexistente (o de otra cuenta) |
| 404 | `recipient_not_found` | Destino de transferencia inexistente |
| 409 | `duplicate` | El recurso ya existe |
| 403 | `verification_required` | Tu cuenta aún no aprobó su verificación de identidad (persona=KYC, empresa=KYB); hasta entonces solo puedes fondear — pide tu link en `POST /v1/me/verification/link` |
| 422 | `verification_required` | La operación exige el `verification_id` de una verificación aprobada del tercero (alta banking de terceros, tarjeta designada) |
| 422 | `verification_not_approved` | La verificación referenciada aún no está aprobada |
| 422 | `verification_kind_mismatch` | El kind de la verificación no calza con el producto (KYC ⇒ persona/INDIVIDUAL, KYB ⇒ empresa/COMPANY) |
| 422 | `verification_invalid` | Referenciaste una verificación de onboarding propio donde se exige la de un tercero |
| 403 | `company_account_required` | La verificación de terceros (links/submissions KYC-KYB) es solo para cuentas empresa |
| 409 | `already_verified` | Pediste link de onboarding con la cuenta ya verificada |
| 409 | `identity_locked` | Con la verificación aprobada, `display_name`, `tax_id` y `country` vienen de la identidad verificada y no se cambian por `PATCH /v1/me`; contacta al soporte |
| 409 | `no_screening` | Rescreen/monitoreo AML sin un screening previo |
| 409 | `no_banking_customer` | Operación banking sin perfil bancario creado (`POST /v1/banking/customer` primero) |
| 409 | `banking_customer_exists` | La cuenta ya tiene perfil bancario (es uno por cuenta) |
| 422 | `currency_not_supported` | Sin tasa FX para esa moneda |
| 422 | `core_rejected` | El procesador rechazó la operación |
| 422 | `recipient_unavailable` | La cuenta destino no puede recibir |
| 422 | `recipient_ambiguous` | Más de una cuenta comparte el teléfono de `to_phone` (usa `to_account_id` o `to_email`) |
| 422 | `contact_not_linked` | El contacto no tiene cuenta CBPay asociada para transferirle |
| 422 | `no_saved_destination` | El contacto no tiene destino guardado para ese corredor/chain |
| 422 | `wallet_limit_reached` | La cuenta ya tiene su wallet de esa combinación red+activo (depósito: todas las cuentas; [segregadas](https://docs.cbpayapp.com/es/guias/wallets-segregadas): personas) |
| 422 | `insufficient_gas` | La [wallet segregada](https://docs.cbpayapp.com/es/guias/wallets-segregadas) no tiene gas nativo (TRX/ETH) para el fee de red; fondea la dirección y reintenta |
| 409 | `idempotency_conflict` | Otra creación/envío de wallet con la misma clave sigue en curso; reintenta con la misma clave |
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
| 400 | `invalid_pair` | Swap con la misma moneda de origen y destino |
| 400 | `amount_too_small` | El monto del swap no alcanza la unidad mínima de la moneda destino |
| 400 | `swap_asset_disabled` | Una de las monedas del swap está deshabilitada para tu organización |
| 409 | `already_paid` | El [link de cobro universal](https://docs.cbpayapp.com/es/guias/checkout) ya se pagó por otro método |
| 410 | `checkout_expired` | El link de cobro universal venció sin pago |
| 422 | `method_unavailable` | El método elegido en el link de cobro no está disponible para ese link o país |
| 400 | `country_required` | Materialización fiat del link de cobro sin `?country=XX` |
| 400 | `currency_required` | El país ofrece el método del link de cobro en varias monedas; falta `?currency=YYY` |
| 422 | `country_unavailable` | Ese país no tiene métodos de pago disponibles en el link de cobro |
| 422 | `collect_otp_failed` | El rail rechazó el envío de la clave OTP del cobro pull del link |
| 422 | `collect_rejected` | El rail rechazó el cobro pull del link (OTP inválida o datos incorrectos); el link sigue pendiente |
| 422 | `settlement_asset_disabled` | El `settlement_asset` del link de cobro está deshabilitado para tu organización |
| 422 | `checkout_amount_mismatch` | La transferencia CBPay no cubre el monto vigente del link de cobro; el mensaje trae el monto actualizado |
| 422 | `stored_card_revoked` | La [tarjeta guardada](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions) está revocada; no acepta más cobros |
| 422 | `verification_required` | [QR Crypto POS](https://docs.cbpayapp.com/es/guias/qr-pos): registra al merchant con el `verification_id` de su KYC/KYB de terceros aprobado |
| 422 | `merchant_disabled` | El merchant [QR Crypto POS](https://docs.cbpayapp.com/es/guias/qr-pos) está deshabilitado; reactívalo antes de generar cobros |
| 422 | `nothing_received` | El cobro [QR Crypto POS](https://docs.cbpayapp.com/es/guias/qr-pos) no ha recibido ningún pago on-chain: no hay nada que devolver |
| 422 | `refund_exceeds_received` | La devolución supera lo recibido menos lo ya devuelto del cobro [QR Crypto POS](https://docs.cbpayapp.com/es/guias/qr-pos) |
| 400 | `to_address_required` | La devolución [QR Crypto POS](https://docs.cbpayapp.com/es/guias/qr-pos) (y el retiro crypto) exige la dirección destino explícita |
| 422 | `deposit_account_limit_reached` | Las cuentas tienen una cuenta de depósito por corredor (creada automáticamente con la cuenta); no se puede cambiar ni eliminar |
| 422 | `export_rejected` | El procesador rechazó el export de la llave de la wallet segregada |
| 422 | `stored_card_corridor_mismatch` | La [tarjeta guardada](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions) pertenece a otro corredor país/moneda distinto del cobro |
| 409 | `subscription_state` | La [suscripción](https://docs.cbpayapp.com/es/guias/stored-cards-subscriptions) no está en un estado que permita esa acción (ej. pausar un plan cancelado) |
| 409 | `email_required` | El login no tiene un email real; configura uno con `POST /v1/me/email/change` |
| 422 | `payin_not_refundable` | El cobro no está acreditado o no tiene credencial del procesador; no se puede [devolver](https://docs.cbpayapp.com/es/guias/devoluciones) |
| 422 | `refund_not_supported` | Ese rail no admite [devoluciones](https://docs.cbpayapp.com/es/guias/devoluciones) (QR, transferencia anunciada, cuenta dedicada, collect). Los cobros POS se devuelven por el riel crypto |
| 422 | `refund_exceeds_payin` | La [devolución](https://docs.cbpayapp.com/es/guias/devoluciones) supera lo que queda por devolver del cobro; tu saldo no se tocó |
| 400 | `invalid_amount` | El `amount` de la [devolución](https://docs.cbpayapp.com/es/guias/devoluciones) debe ser un decimal positivo en la moneda del cobro |

### Cumplimiento (403 / 503)

| HTTP | `error` | Significado |
|---|---|---|
| 403 | `compliance_hold` | La operación fue retenida por los controles de cumplimiento de la plataforma. No es un error de tu request: contacta a soporte con el timestamp — por política no se informa la razón exacta |
| 403 | `geo_restricted` | El servicio o la operación no están disponibles para la jurisdicción de origen o de la contraparte |
| 503 | `compliance_check_unavailable` | La verificación de cumplimiento no se pudo evaluar; la operación NO salió — reintenta con la **misma** clave de idempotencia |
| 422 | `travel_rule_required` | Retiro on-chain sobre el umbral Travel Rule sin datos del beneficiario — agrega `travel_address` o `wallet_type: "self_hosted"` + `beneficiary_name` ([guía crypto](https://docs.cbpayapp.com/es/guias/crypto)) |
| 422 | `travel_rule_beneficiary_required` | Falta `beneficiary_name` en un retiro sujeto a Travel Rule |
| 422 | `travel_rule_address_mismatch` | Tu `to_address` no coincide con la dirección de pago aprobada por la institución receptora — omítela o usa la del intercambio |
| 422 | `travel_rule_rejected` | La institución receptora rechazó la transferencia; verifica los datos del beneficiario |
| 422 | `travel_rule_pending` | La institución receptora aún no resuelve el intercambio; reintenta con la **misma** clave de idempotencia |
| 422 | `travel_rule_incomplete_approval` | La institución receptora aprobó sin entregar dirección de pago; contacta a soporte |
| 503 | `travel_rule_unavailable` | Intercambio Travel Rule temporalmente no disponible; reintenta con la **misma** clave de idempotencia |

### Servicio (5xx)

| HTTP | `error` | Significado |
|---|---|---|
| 500 | `internal_error` | Error inesperado; reintenta con la misma clave de idempotencia |
| 500 | `fee_config_invalid` | La configuración de comisiones de la cuenta es inválida; contacta al soporte (la operación no se ejecutó) |
| 502 | `rates_unavailable` | Tasas FX temporalmente no disponibles |
| 502 | `core_unavailable` | Procesador temporalmente no disponible |
| 502 | `core_invalid_response` | El procesador devolvió una respuesta inesperada; reintenta con la **misma** clave de idempotencia |
| 502 | `compliance_unavailable` | Screening AML temporalmente no disponible |
| 503 | `verifications_unavailable` | Verificación de identidad temporalmente no disponible (la comisión se reembolsó) |
| 503 | `org_credential_missing` | Servicio en configuración; contacta al soporte de CBPay |
| 503 | `withdrawals_unavailable` | Retiros on-chain no habilitados para el corredor |
| 503 | `pricing_unavailable` | Precio de ejecución de BTC/GOLD no disponible o desactualizado; reintenta más tarde o liquida en USDT/USDC |
| 503 | `channel_unavailable` | El canal de payout está temporalmente no disponible; reintenta más tarde con la **misma** clave de idempotencia |
| 503 | `export_unavailable` | El export de llaves privadas de wallets segregadas no está habilitado en este entorno |

## Cómo manejarlos

- **4xx de validación**: corrige el request. No reintentes igual.
- **402**: fondea la cuenta y reintenta (clave de idempotencia nueva solo si
  la operación nunca se creó).
- **5xx / timeouts**: reintenta con **la misma** clave de idempotencia; la
  operación nunca se duplicará.
