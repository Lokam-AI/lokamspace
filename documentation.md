# LokamSpace – Call Status & Analysis Changes (2025-08)

This document records the recent changes across backend and frontend related to call status handling, end-of-call processing, prompt management, and testing guidance.

## Overview
- Ensure voicemail, customer-busy, and no-answer routes to status "Missed".
- Ensure exceptions during end-of-call processing mark the call as "Failed".
- Prevent premature overwrite to "Completed" from status-update events when VAPI sends `status: "ended"`.
- Frontend properly renders "Missed" distinctly from "Completed" and "Failed".
- Prompts metadata and structure improvements for `openai_service.py` consumers.


## Backend Changes

### File: `server/app/services/webhook_service.py`

#### 1) Status-update handler: skip `ended`
- Problem: VAPI sometimes emits a `status-update` event with `status = "ended"` before the `end-of-call-report` arrives. Mapping `ended → Completed` here would overwrite the final status and mask reasons like voicemail/busy.
- Fix: Skip updating when `status == "ended"`. The `end-of-call-report` owns the final status decision.

```python
# inside process_status_update(...)
status = data.get("status")
if not status:
    return {"status": "error", "message": "No status found in webhook data"}

# NEW: avoid overwriting final status
if status.lower() == "ended":
    logger.info("Skipping 'ended' status-update to allow end-of-call-report to set final status")
    return {"status": "success", "message": "Skipped 'ended' status update", "call_id": call_id}

status_mapping = {
    "queued": "Ready",
    "ringing": "Ringing",
    "in-progress": "In Progress",
    "failed": "Failed",
    "no-answer": "Missed",
    "busy": "Missed",
}
our_status = status_mapping.get(status.lower(), call.status or "In Progress")
call.status = our_status
await db.commit()
```

#### 2) End-of-call report: map `endedReason` → final status
- Behavior: Map voicemail, customer-busy, and customer-did-not-answer to "Missed"; otherwise "Completed".
- Also persists timestamps, cost, durations, recording URL, and triggers after-call analysis.

```python
# inside process_call_report(...)
ended_reason_val = (call.ended_reason or "").lower()
if "voicemail" in ended_reason_val:
    call.status = "Missed"
elif "customer-busy" in ended_reason_val:
    call.status = "Missed"
elif "customer-did-not-answer" in ended_reason_val:
    call.status = "Missed"
else:
    call.status = "Completed"
```

#### 3) Robust exception handling → mark as "Failed"
- If any exception occurs during `process_call_report` (e.g., while saving transcripts or triggering analysis), we re-fetch the call and set `status = "Failed"`, then commit.

```python
# inside process_call_report(...)
except Exception as e:
    await db.rollback()
    # attempt to safely mark the call as Failed
    extracted_id = None
    # ...extract call_id from payload if needed...
    if extracted_id:
        result = await db.execute(select(Call).where(Call.id == extracted_id))
        call_to_fail = result.scalar_one_or_none()
        if call_to_fail:
            call_to_fail.status = "Failed"
            await db.commit()
```


## Frontend Changes

### File: `client/src/components/calls/DemoCallTab.tsx`

#### 1) Status badge styling now distinguishes "Missed"
- Previously, the Demo Calls table had no explicit branch for `missed` and could style it inconsistently.
- Now, we render:
  - "Completed" → `default`
  - "Failed" → `destructive`
  - "Missed" → `outline`
  - "In Progress"/"Ringing"/"Ready" → `secondary`

```ts
const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "default";
    case "in progress":
    case "ringing":
      return "secondary";
    case "ready":
      return "secondary";
    case "failed":
      return "destructive";
    case "missed":
      return "outline";
    default:
      return "secondary";
  }
};
```


## Prompt Configuration Changes (earlier task, recorded here for completeness)

### File: `server/config/prompts.json`
- Added `cost: float` and `total_tokens: int` to every prompt entry. `total_tokens` reflects a conservative upper bound.
- Duplicated the original Prompt 1 as new Prompt 5.
- Trimmed the few-shot examples in Prompt 1 to retain the best 5; later refined Prompt 1 for strict JSON output rules and conciseness to target 10/10 quality.
- Maintained compatibility with `OpenAIService` prompt loading and selection logic.


## Rationale
- Webhook event order is not guaranteed. Status updates can arrive before the end-of-call summary. Skipping `ended` in the status-update path prevents prematurely setting "Completed" when the true reason (voicemail/busy/no-answer) should result in "Missed".
- Clear frontend styling reduces confusion for ops and QA.


## End-to-End Flow (high level)

- `POST /api/v1/webhooks/vapi-webhook` → routes to `WebhookService`.
- `status-update` events: update transient states (queued/ringing/in-progress/busy/no-answer/failed); skip `ended`.
- `end-of-call-report`: persist recording, timings, cost; set final `status` using `endedReason`; store transcripts; trigger `CallAnalysisService` which invokes `OpenAIService` and persists analysis.
- Client (`DemoCallTab`) fetches `GET /api/v1/calls/demo` and renders statuses via badges.


## QA / Repro Steps

Prereqs:
- Activate venv and run the server.

```bash
# from repo root
source venv/bin/activate  # ensure the venv exists and is up-to-date
export ENVIRONMENT=dev
export DB_HOST=localhost  # project uses DB_HOST
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

1) Busy/Voicemail → Missed
- Simulate end-of-call-report with `endedReason` indicating customer busy:
```bash
curl -X POST http://localhost:8000/api/v1/webhooks/vapi-webhook \
  -H 'Content-Type: application/json' \
  -H 'x-vapi-secret: <SECRET>' \
  -d '{
    "type": "end-of-call-report",
    "call": { "assistantOverrides": { "variableValues": { "call_id": "<CALL_ID>" } } },
    "endedReason": "customer-busy",
    "artifact": { "messages": [] }
  }'
```
- Verify via API used by the UI:
```bash
curl -H 'Authorization: Bearer <TOKEN>' http://localhost:8000/api/v1/calls/demo | jq 'map(select(.id==<CALL_ID>)) | .[0].status'
```
- Expect: `"missed"` on the client (rendered as Missed with outline badge).

2) Status-update ordering protection
- Send a `status-update` with `status: "ended"` prior to the EoCR:
```bash
curl -X POST http://localhost:8000/api/v1/webhooks/vapi-webhook \
  -H 'Content-Type: application/json' \
  -H 'x-vapi-secret: <SECRET>' \
  -d '{
    "type": "status-update",
    "status": "ended",
    "call": { "assistantOverrides": { "variableValues": { "call_id": "<CALL_ID>" } } }
  }'
```
- Check server logs: `Skipping 'ended' status-update...`.
- Then send the EoCR as above; final status should reflect voicemail/busy/no-answer mapping.

3) Exception path → Failed
- Send malformed `artifact.messages` to trigger an exception:
```bash
curl -X POST http://localhost:8000/api/v1/webhooks/vapi-webhook \
  -H 'Content-Type: application/json' \
  -H 'x-vapi-secret: <SECRET>' \
  -d '{
    "type": "end-of-call-report",
    "call": { "assistantOverrides": { "variableValues": { "call_id": "<CALL_ID>" } } },
    "endedReason": "any",
    "artifact": { "messages": "not-a-list" }
  }'
```
- Expect the call to be marked `Failed` in DB and via `/calls/demo`.


## Known Status Mappings

- Status-update events:
  - queued → Ready
  - ringing → Ringing
  - in-progress → In Progress
  - busy → Missed
  - no-answer → Missed
  - failed → Failed
  - ended → SKIPPED (final decided by end-of-call-report)

- End-of-call-report `endedReason`:
  - contains `voicemail` → Missed
  - contains `customer-busy` → Missed
  - contains `customer-did-not-answer` → Missed
  - otherwise → Completed


## Troubleshooting
- If UI still shows "Completed" for busy/voicemail cases:
  1. Inspect `/calls/demo` response in the browser Network tab to confirm backend status.
  2. If API shows `missed`, verify `DemoCallTab` lowercases `status` and uses `getStatusBadgeVariant` above.
  3. Confirm that no legacy component is rendering mock data (`CallsTable.tsx` uses sample entries).


## Change Log
- 2025-08-09
  - Backend: Skip `ended` in `process_status_update`; preserve final status from `end-of-call-report`.
  - Backend: Ensure `voicemail`/`customer-busy`/`customer-did-not-answer` map to `Missed` in `process_call_report`.
  - Backend: Robust exception path to mark `Failed`.
  - Frontend: `DemoCallTab` renders `missed` as outline badge; other statuses styled consistently.
  - Documentation: This `documentation.md` created for future reference. 