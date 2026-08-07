---
title: "Transaction reviews"
description: "Query and respond to transactional firewall reviews on your money operations"
slug: en/guides/transaction-reviews
lang: en
source_url: https://docs.cbpayapp.com/en/guides/transaction-reviews
---
When your organization has the **transactional firewall** enabled, some money operations (payouts, crypto withdrawals, payins or banking transfers) may be **held for manual review** before they execute. This guide shows you how to query those reviews and respond when information is requested.

> **Note**
Integration testing? In the test environment (`https://cryptobank.qbank.cl/platform`, `pk_test_` keys) the firewall behaves exactly like production once your org enables it. Details in [Environments and testing](https://docs.cbpayapp.com/en/environment-testing).
## What you'll see

When one of your operations is held:

1. **Its status changes to `in_review`** — the operation does not execute yet. The `POST` that created it responds **`202 Accepted`** with a `review_id`.
2. **You receive a webhook** `txn_review_status_changed` with the new status.
3. **If information is requested**, you receive an email with the reason and a link to upload documents.

> **Note**
**This is normal.** The transactional firewall is a control layer your organization enabled to meet compliance policies. Most reviews resolve within minutes or hours.
## List your reviews

List your operations that are or were under review:

```bash
curl "https://api.qbank.cl/platform/v1/me/txn-reviews?from=2026-07-01&to=2026-08-06" \
  -H "Authorization: Bearer pk_..."
```

Response:

```json
{
  "reviews": [
    {
      "id": "7a3f2b1c-0000-4000-8000-000000000001",
      "kind": "payout",
      "resource_id": "8b4c3d2e-1111-4111-8111-111111111111",
      "status": "info_requested",
      "amount_label": "1500.00",
      "asset": "USD",
      "country": "MX",
      "method": "spei",
      "counterparty": "Juan Pérez",
      "info_request": {
        "message": "Please upload the invoice that justifies this payment",
        "requested_at": "2026-08-06T15:20:00Z"
      },
      "created_at": "2026-08-06T14:32:00Z",
      "updated_at": "2026-08-06T15:20:00Z"
    }
  ],
  "page": 1,
  "page_size": 50,
  "total": 1
}
```

### Filters

- `?status=` — `in_review`, `info_requested`, `released`, `rejected` or `all` (empty = open: `in_review` + `info_requested`). Any other value ⇒ `400 invalid_status`.
- `?from=` / `?to=` — date range (`YYYY-MM-DD`, UTC, both inclusive). Invalid date ⇒ `400 invalid_range`.
- `?page=` / `?page_size=` — pagination (default 50, max 200).

## Review detail

```bash
curl https://api.qbank.cl/platform/v1/me/txn-reviews/7a3f2b1c-0000-4000-8000-000000000001 \
  -H "Authorization: Bearer pk_..."
```

Response:

```json
{
  "review": {
    "id": "7a3f2b1c-0000-4000-8000-000000000001",
    "kind": "payout",
    "resource_id": "8b4c3d2e-1111-4111-8111-111111111111",
    "status": "info_requested",
    "amount_label": "1500.00",
    "asset": "USD",
    "country": "MX",
    "method": "spei",
    "counterparty": "Juan Pérez",
    "info_request": {
      "message": "Please upload the invoice that justifies this payment",
      "requested_at": "2026-08-06T15:20:00Z"
    },
    "files": [
      {
        "id": "f1e2d3c4-0000-4000-8000-0000000000aa",
        "review_id": "7a3f2b1c-0000-4000-8000-000000000001",
        "file_name": "invoice-221.pdf",
        "content_type": "application/pdf",
        "size_bytes": 482110,
        "uploaded_by": "account",
        "created_at": "2026-08-06T15:40:00Z"
      }
    ],
    "created_at": "2026-08-06T14:32:00Z",
    "updated_at": "2026-08-06T15:40:00Z"
  }
}
```

A review belonging to another account answers `404 not_found` (never `403`, so existence is not leaked). When the review was rejected, the detail includes `decision_note` (the same text as the rejection email) and `decided_at`.

> **Important**
**The internal reason is never exposed.** For security and to avoid compromising compliance investigations, the end-user view only shows the status and the information request message — never the internal hold reason or team notes.
## Review statuses

| Status | Meaning | What to do |
|---|---|---|
| `in_review` | The operation is being reviewed by the compliance team | Wait — no action needed |
| `info_requested` | You were asked for additional information | Upload the requested documents as soon as possible |
| `released` | The review approved the operation | The operation already executed (or is on its way) |
| `rejected` | The review rejected the operation | The operation was cancelled; any held funds were returned to your balance |

## Upload documents when asked

If your review is in `info_requested`, upload the supporting files. The body is the **raw file binary**, the filename travels in the `name` query param and the type in the `Content-Type` header:

```bash
curl -X POST "https://api.qbank.cl/platform/v1/me/txn-reviews/7a3f2b1c-0000-4000-8000-000000000001/files?name=invoice-221.pdf" \
  -H "Authorization: Bearer pk_..." \
  -H "Content-Type: application/pdf" \
  --data-binary "@invoice-221.pdf"
```

`201` response — uploading a file moves the review **back to `in_review`** so the team re-evaluates it:

```json
{
  "file": {
    "id": "f1e2d3c4-0000-4000-8000-0000000000aa",
    "review_id": "7a3f2b1c-0000-4000-8000-000000000001",
    "file_name": "invoice-221.pdf",
    "content_type": "application/pdf",
    "size_bytes": 482110,
    "uploaded_by": "account",
    "created_at": "2026-08-06T15:40:00Z"
  },
  "status": "in_review"
}
```

**Limits:**
- Allowed types: PDF, PNG, JPEG, WEBP, TXT, CSV, DOC(X), XLS(X) — validated by the `Content-Type` header.
- Max size: **50 MB** per file.
- Max **20 files** per review.

## Download your own files

```bash
curl "https://api.qbank.cl/platform/v1/me/txn-reviews/7a3f2b1c-0000-4000-8000-000000000001/files/f1e2d3c4-0000-4000-8000-0000000000aa" \
  -H "Authorization: Bearer pk_..." \
  -o invoice-221.pdf
```

Returns the raw binary with its original `Content-Type` (files from other accounts answer `404 not_found`).

## Webhook `txn_review_status_changed`

Whenever the status of one of your reviews changes, you receive this webhook:

```json
{
  "event": "txn_review_status_changed",
  "account_id": "ae8cf540-1234-5678-9abc-def012345678",
  "review_id": "7a3f2b1c-0000-4000-8000-000000000001",
  "kind": "payout",
  "resource_id": "8b4c3d2e-1111-4111-8111-111111111111",
  "status": "released",
  "previous_status": "in_review",
  "amount": "1500.00",
  "asset": "USD",
  "timestamp": "2026-08-06T16:30:00Z"
}
```

> **Note**
The webhook payload is **neutral** by design: it carries the status and the operation summary, but never the internal review reason or compliance notes.
## Own errors

| HTTP | Code | Solution |
|---|---|---|
| 400 | `invalid_status` | The `status` filter must be `in_review`, `info_requested`, `released`, `rejected` or `all` |
| 400 | `invalid_range` | Check the `YYYY-MM-DD` format of `from`/`to` |
| 400 | `invalid_name` | Send the filename in the `name` query param (max 200 chars, no path separators) |
| 400 | `empty_file` | The file body arrived empty |
| 404 | `not_found` | The review (or file) does not exist or does not belong to your account |
| 409 | `not_awaiting_info` | The review is not in `info_requested` — you can only upload files when information was requested |
| 413 | `file_too_large` | The file exceeds 50 MB |
| 415 | `unsupported_file_type` | Use PDF, PNG, JPEG, WEBP, TXT, CSV, DOC(X) or XLS(X) with its `Content-Type` |
| 422 | `file_limit_reached` | The review already has 20 files |
| 503 | `storage_unavailable` | Storage is unavailable; retry in a few seconds |

Full catalog in [Errors](https://docs.cbpayapp.com/en/errors).

## Frequently asked questions

#### Why was my operation held?
Your organization enabled the transactional firewall, a control layer that holds certain operations for manual review before executing them. The exact criteria depend on your organization's compliance policy.
#### How long does a review take?
Most reviews resolve within minutes or hours. If your review stays unanswered for over 24 hours, your organization receives an automatic alert.
#### What happens if my operation is rejected?
The operation is cancelled. If funds were held (for example, in a payout), they are automatically returned to your available balance. You receive an email with the rejection reason.
#### Can I cancel an operation under review?
Not directly. If you need to cancel it, contact your organization's compliance team — they can reject it from their panel.
#### Why can't I see the hold reason?
For security and to avoid compromising compliance investigations, the internal reason is never exposed to the end user. You will only see the information request message when documents are asked of you.
