-- Drop backup tables if they exist
DROP TABLE IF EXISTS users_old;
DROP TABLE IF EXISTS user_submissions_old;
DROP TABLE IF EXISTS submission_members_old;
DROP TABLE IF EXISTS submission_dialog_old;
DROP TABLE IF EXISTS connection_requests_old;
DROP TABLE IF EXISTS connections_old;

-- Create backup tables and insert data
CREATE TABLE users_old AS TABLE users WITH NO DATA;
INSERT INTO users_old SELECT * FROM users;

CREATE TABLE user_submissions_old AS TABLE user_submissions WITH NO DATA;
INSERT INTO user_submissions_old SELECT * FROM user_submissions;

CREATE TABLE submission_members_old AS TABLE submission_members WITH NO DATA;
INSERT INTO submission_members_old SELECT * FROM submission_members;

CREATE TABLE submission_dialog_old AS TABLE submission_dialog WITH NO DATA;
INSERT INTO submission_dialog_old SELECT * FROM submission_dialog;

CREATE TABLE connection_requests_old AS TABLE connection_requests WITH NO DATA;
INSERT INTO connection_requests_old SELECT * FROM connection_requests;

CREATE TABLE connections_old AS TABLE connections WITH NO DATA;
INSERT INTO connections_old SELECT * FROM connections;

-- Drop existing tables
DROP TABLE IF EXISTS submission_dialog;
DROP TABLE IF EXISTS submission_members;
DROP TABLE IF EXISTS user_submissions;
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS connection_requests;
DROP TABLE IF EXISTS users;

-- Create ENUM types if they do not exist
DO $$ BEGIN
    CREATE TYPE sex_type AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connection_request_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE floats_my_boaty_type AS ENUM ('Take orders or give them', 'Show off or draw attention', 'Nourish or be nourished', 'Experiment with clothes', 'Play with feet', 'Clever or not', 'Love your objects', 'More than two', 'Act as someone else', 'Other (Not Listed)');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hobby_type AS ENUM ('Arts', 'Collecting', 'Cooking', 'Crafting', 'Dance', 'Education', 'Fitness', 'Gaming', 'Gardening', 'Meditation', 'Music', 'Other', 'Photography', 'Reading', 'Sports', 'Technology', 'The Unknown', 'Travel', 'Volunteering', 'Writing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sexual_orientation_type AS ENUM ('Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Pansexual', 'Queer', 'Lesbian', 'Gay', 'Straight', 'Demisexual', 'Polysexual', 'Omnisexual', 'Questioning', 'Undisclosed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username CHARACTER VARYING(50) NOT NULL UNIQUE,
    email CHARACTER VARYING(100) NOT NULL UNIQUE,
    password CHARACTER VARYING(255) NOT NULL,
    profile_picture CHARACTER VARYING(255),
    profile_video CHARACTER VARYING(255),
    token CHARACTER VARYING(255),
    sexual_orientation sexual_orientation_type DEFAULT 'Undisclosed',
    hobbies hobby_type DEFAULT 'Other',
    floats_my_boat floats_my_boaty_type DEFAULT 'Other (Not Listed)',
    sex sex_type DEFAULT 'Other',
    about_you text
);

-- Create user_submissions table
CREATE TABLE user_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    lastuser_addition TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create submission_members table
CREATE TABLE submission_members (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES user_submissions(id),
    participating_user_id INTEGER NOT NULL
);

-- Create submission_dialog table
CREATE TABLE submission_dialog (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES user_submissions(id),
    posting_user_id INTEGER NOT NULL,
    text_content TEXT,
    uploaded_path CHARACTER VARYING(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create connection_requests table
CREATE TABLE connection_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id),
    requested_id INTEGER NOT NULL REFERENCES users(id),
    status connection_request_status DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_not_equal CHECK (requester_id <> requested_id),
    CONSTRAINT unique_requester_requested_combination UNIQUE (requester_id, requested_id)
);

-- Create connections table
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    user_one_id INTEGER NOT NULL REFERENCES users(id),
    user_two_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_order CHECK (user_one_id < user_two_id),
    CONSTRAINT chk_users_not_equal CHECK (user_one_id <> user_two_id)
);

-- Seed data profile_picture='backend\\imageUploaded\\file-admin.JPEG'
-- newAdmin user was id 153 in development system -Hardcode Welcome_newAdmin.zip
-- Replace "posting_user_id": 153, accordingly
INSERT INTO users (username, email, password, profile_picture) VALUES ('Admin', 'admin@system.com', '113ab75cb112227be7e3056bc1723e67c0110c93','backend\\imageUploaded\\file-admin.JPEG');

-- Drop existing constraints if they exist
DO $$ BEGIN
    ALTER TABLE connection_requests DROP CONSTRAINT IF EXISTS connection_requests_requester_id_fkey;
    ALTER TABLE connection_requests DROP CONSTRAINT IF EXISTS connection_requests_requested_id_fkey;
    ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_user_one_id_fkey;
    ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_user_two_id_fkey;
    ALTER TABLE submission_members DROP CONSTRAINT IF EXISTS submission_members_submission_id_fkey;
    ALTER TABLE submission_dialog DROP CONSTRAINT IF EXISTS submission_dialog_submission_id_fkey;
END $$;

-- Add constraints
ALTER TABLE connection_requests
    ADD CONSTRAINT connection_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT connection_requests_requested_id_fkey FOREIGN KEY (requested_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE connections
    ADD CONSTRAINT connections_user_one_id_fkey FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT connections_user_two_id_fkey FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE submission_members
    ADD CONSTRAINT submission_members_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES user_submissions(id) ON DELETE CASCADE;

ALTER TABLE user_submissions
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE submission_dialog
    ADD CONSTRAINT submission_dialog_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES user_submissions(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

-- Create user and grant privileges
DO $$ BEGIN
    CREATE ROLE interactwithme_admin WITH LOGIN PASSWORD 'your_secure_password';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

GRANT ALL PRIVILEGES ON DATABASE interactwithmetest TO interactwithme_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO interactwithme_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO interactwithme_admin;
GRANT USAGE ON SCHEMA public TO interactwithme_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO interactwithme_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO interactwithme_admin;

-- Grant specific privileges to interactwithme_admin on newly created tables
GRANT ALL PRIVILEGES ON TABLE users TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE user_submissions TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE submission_members TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE submission_dialog TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE connection_requests TO interactwithme_admin;
GRANT ALL PRIVILEGES ON TABLE connections TO interactwithme_admin;

ALTER ROLE interactwithme_admin WITH INHERIT;