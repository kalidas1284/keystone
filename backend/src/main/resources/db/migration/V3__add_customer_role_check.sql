-- Legacy databases created via ddl-auto may restrict roles without CUSTOMER.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER'));
