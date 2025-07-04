
# AutoPulse Database Schema (`autopulse_db`)

The AutoPulse backend uses **PostgreSQL** with FastAPI, SQLAlchemy, and Alembic. The following sections define each table, its columns, types, constraints, and indexes. Tenant-scoped tables include an `organization_id` foreign key for multi-tenancy. We follow SQLAlchemy naming conventions (CamelCase models, snake_case tables) and PEP8 style.

## Organization

Stores tenant organizations (auto service centers). Fields include basic info and metadata:

- **id**: `UUID` (PK, default `uuid_generate_v4()`, NOT NULL, unique)  
- **name**: `VARCHAR(255)`, NOT NULL, unique  
- **email**: `VARCHAR(255)`, NOT NULL, unique  
- **phone_sales**, **phone_support**, **phone_service**: `VARCHAR(20)`  
- **description**: `TEXT`  
- **location**: `TEXT`  
- **call_concurrency_limit**: `INTEGER`, NOT NULL, default 1  
- **service_types**: `VARCHAR(255)[]` or JSON  
- **focus_areas**: `VARCHAR(255)[]` or JSON  
- **hipaa_compliant**: `BOOLEAN`, NOT NULL, default FALSE  
- **pci_compliant**: `BOOLEAN`, NOT NULL, default FALSE  
- **plan_id**: `INTEGER`, FK → `plan.id`  
- **credit_balance**: `NUMERIC(12,2)`, NOT NULL, default 0.00  
- **created_at**, **updated_at**: `TIMESTAMP WITH TIME ZONE`, default `NOW()`

### Indexes & Relationships
- Primary key on `id`
- Unique on `name`, `email`
- Relationships: Users, Campaigns, ServiceRecords, Calls, KPIs, Bookings, Inquiries, etc.

## User

- **id**: `BIGINT` (PK, auto-increment)  
- **name**: `VARCHAR(100)`, NOT NULL  
- **email**: `VARCHAR(150)`, NOT NULL, unique  
- **password_hash**: `TEXT`, NOT NULL  
- **role**: `VARCHAR(20)`; Enum: `SuperAdmin`, `Admin`, `Manager`  
- **organization_id**: `UUID`, FK → `organization.id`, NOT NULL  
- **is_active**: `BOOLEAN`, default TRUE  
- **created_at**, **updated_at**: `TIMESTAMP WITH TIME ZONE`, default `NOW()`

### Indexes & Relationships
- One Organization → Many Users

## Role

(If used instead of Enum)
- **id**: `INT`, PK  
- **name**: `VARCHAR(20)`, unique  
- **description**: `TEXT`  
- **created_at**: `TIMESTAMP`

## Campaign

- **id**: `BIGINT`, PK  
- **name**: `VARCHAR(150)`, NOT NULL  
- **description**: `TEXT`  
- **organization_id**: `UUID`, FK  
- **status**: `VARCHAR(20)`  
- **created_by**, **modified_by**: `BIGINT`, FK → `user.id`  
- **created_at**, **updated_at**

## ServiceRecord

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **campaign_id**: `BIGINT`, FK  
- **customer_name**: `VARCHAR(100)`  
- **customer_phone**: `VARCHAR(20)`  
- **vehicle_info**: `VARCHAR(100)`  
- **service_type**: `VARCHAR(50)`  
- **status**: `VARCHAR(20)`, default `'Scheduled'`  
- **appointment_date**: `TIMESTAMP`  
- **feedback**: `TEXT`  
- **rating**: `SMALLINT`  
- **created_by**, **modified_by**: `BIGINT`, FK  
- **created_at**, **updated_at**

## Call

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **service_record_id**: `BIGINT`, FK  
- **agent_id**: `BIGINT`, FK  
- **customer_number**: `VARCHAR(20)`  
- **direction**: `VARCHAR(10)`, default `'outbound'`  
- **start_time**, **end_time**: `TIMESTAMP`  
- **duration_sec**: `INTEGER`  
- **status**: `VARCHAR(20)`  
- **recording_url**: `TEXT`  
- **created_at**, **updated_at**

## Transcript

- **id**: `BIGINT`, PK  
- **call_id**: `BIGINT`, FK  
- **role**: `VARCHAR(20)`, Enum: `User`, `Assistant`, `Tool`  
- **content**: `TEXT`  
- **timestamp**: `TIMESTAMP`

## AudioFile

- **id**: `BIGINT`, PK  
- **call_id**: `BIGINT`, FK, UNIQUE  
- **file_path**: `TEXT`  
- **file_format**: `VARCHAR(10)`  
- **duration_sec**: `INTEGER`  
- **file_size_bytes**: `BIGINT`  
- **created_at**

## KPI

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **name**: `VARCHAR(100)`  
- **type**: `VARCHAR(20)`, Enum: `Core`, `Custom`  
- **description**: `TEXT`  
- **target_value**: `NUMERIC(12,2)`  
- **created_at**, **updated_at**

## Booking

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **campaign_id**: `BIGINT`, FK  
- **scheduled_time**: `TIMESTAMP`  
- **status**: `VARCHAR(20)`  
- **created_by**, **modified_by**: `BIGINT`, FK  
- **created_at**, **updated_at**

## Inquiry

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **customer_name**: `VARCHAR(100)`  
- **email**, **phone**: `VARCHAR(150)`  
- **message**: `TEXT`  
- **status**: `VARCHAR(20)`  
- **created_at**, **updated_at**

## Tag

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **name**: `VARCHAR(50)`  
- **created_by**: `BIGINT`, FK  
- **created_at**

## ScheduleConfig

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **campaign_id**: `BIGINT`, FK  
- **config_json**: `JSONB`  
- **created_at**, **updated_at**

## PaymentHistory

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **plan_id**: `INT`, FK  
- **user_id**: `BIGINT`, FK  
- **amount**: `NUMERIC(12,2)`  
- **payment_date**: `TIMESTAMP`  
- **method**, **status**: `VARCHAR(50)`  
- **created_at**, **updated_at**

## Plan

- **id**: `INT`, PK  
- **name**: `VARCHAR(100)`  
- **price**: `NUMERIC(12,2)`  
- **description**: `TEXT`  
- **credit_limit**: `NUMERIC(12,2)`  
- **created_at**, **updated_at**

## DMSIntegration

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **name**: `VARCHAR(100)`  
- **type**: `VARCHAR(50)`  
- **config**: `JSONB`  
- **is_active**: `BOOLEAN`  
- **created_at**, **updated_at**

## Setting

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **key**: `VARCHAR(100)`  
- **value**: `TEXT`  
- **created_at**, **updated_at**

## AuditLog

- **id**: `BIGINT`, PK  
- **organization_id**: `UUID`, FK  
- **user_id**: `BIGINT`, FK  
- **entity**: `VARCHAR(50)`  
- **entity_id**: `UUID` or `BIGINT`  
- **action**: `VARCHAR(10)`  
- **timestamp**: `TIMESTAMP`  
- **old_value**, **new_value**: `JSONB`

---

## ERD-Style Relationship Summary

- Organization 1 → N Users, Campaigns, ServiceRecords, Calls, KPIs, Bookings, etc.
- User 1 → N Bookings, AuditLogs, Payments
- Campaign 1 → N ServiceRecords, Bookings
- ServiceRecord 1 → N Calls
- Call 1 → N Transcripts, 1 AudioFile
- Plan 1 → N Organizations, Payments

---

## Alembic + SQLAlchemy Notes

- Use naming conventions for constraints
- Use `__tablename__` in models
- Define `relationship()` for FK fields
- Auto-generate migrations using Alembic
