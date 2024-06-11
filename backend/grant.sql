-- Attempt an insert operation directly
-- Ensure interactwithme_admin has necessary attributes
DO $$ BEGIN
    CREATE ROLE interactwithme_admin WITH LOGIN PASSWORD 'your_secure_password';
EXCEPTION
    WHEN duplicate_object THEN
        ALTER ROLE interactwithme_admin WITH LOGIN PASSWORD 'your_secure_password';
END $$;

-- Grant all necessary privileges
GRANT ALL PRIVILEGES ON DATABASE interactwithmetest TO interactwithme_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO interactwithme_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO interactwithme_admin;
GRANT USAGE ON SCHEMA public TO interactwithme_admin;

-- Explicitly grant all privileges on specific tables
GRANT ALL PRIVILEGES ON TABLE users TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE user_submissions TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE submission_members TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE submission_dialog TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE connection_requests TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE connections TO interactwithme_admin;

-- Ensure role has necessary attributes
ALTER ROLE interactwithme_admin WITH INHERIT CREATEDB CREATEROLE SUPERUSER;
