-- KEYSTONE Flyway baseline / init.
-- This migration is intentionally broad: it creates the full schema needed for the
-- app to start from an empty PostgreSQL database (spec "clean checkout" requirement).

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

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(30),
    company_name VARCHAR(150),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    notes VARCHAR(2000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS technicians (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(30),
    specialization VARCHAR(120),
    availability_status VARCHAR(30) NOT NULL,
    current_location VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_technicians_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS work_orders (
    id BIGSERIAL PRIMARY KEY,
    work_order_number VARCHAR(40) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(4000),
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    technician_id BIGINT,
    scheduled_date DATE,
    estimated_duration INTEGER,
    location VARCHAR(255),
    notes VARCHAR(4000),
    sla_due_at TIMESTAMP,
    last_sla_alert_status VARCHAR(20),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT fk_work_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_work_orders_site FOREIGN KEY (site_id) REFERENCES sites(id),
    CONSTRAINT fk_work_orders_technician FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

CREATE TABLE IF NOT EXISTS schedules (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL,
    notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_schedules_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_schedules_technician FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

CREATE TABLE IF NOT EXISTS work_order_attachments (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    uploaded_by_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_wo_attachments_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_wo_attachments_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    category VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    supplier VARCHAR(150),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reference VARCHAR(120),
    notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_inventory_transactions_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

CREATE TABLE IF NOT EXISTS work_order_parts (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_work_order_parts_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_work_order_parts_inventory_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

CREATE TABLE IF NOT EXISTS work_order_time_logs (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    minutes NUMERIC(8,2) NOT NULL,
    notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_work_order_time_logs_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_work_order_time_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50),
    link VARCHAR(255),
    read_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invoicing tables are included in schema for completeness, but their endpoints are
-- disabled as out-of-scope per the KEYSTONE spec.
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    work_order_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    labor_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    parts_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_invoices_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    line_type VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    CONSTRAINT fk_invoice_lines_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

