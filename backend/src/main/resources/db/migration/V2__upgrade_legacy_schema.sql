-- Upgrade databases that were baselined before the full V1 schema existed.
-- Uses portable SQL only (H2 test DB + PostgreSQL production).

CREATE TABLE IF NOT EXISTS sites (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS work_order_status_history (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30),
    changed_by_user_id BIGINT NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    note VARCHAR(4000)
);

ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS site_id BIGINT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS last_sla_alert_status VARCHAR(20);
ALTER TABLE work_order_time_logs ADD COLUMN IF NOT EXISTS minutes NUMERIC(8,2);

-- Ensure customers with work orders have at least one site for backfill.
INSERT INTO sites (customer_id, name, location, notes, created_at, updated_at)
SELECT c.id,
       COALESCE(NULLIF(TRIM(c.company_name), ''), c.name) || ' - Main Site',
       COALESCE(NULLIF(TRIM(c.address), ''), 'Main location'),
       'Auto-created during schema upgrade',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM customers c
WHERE EXISTS (SELECT 1 FROM work_orders wo WHERE wo.customer_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM sites s WHERE s.customer_id = c.id);

UPDATE work_orders wo
SET site_id = (
    SELECT s.id
    FROM sites s
    WHERE s.customer_id = wo.customer_id
    ORDER BY s.id
    LIMIT 1
)
WHERE wo.site_id IS NULL;
