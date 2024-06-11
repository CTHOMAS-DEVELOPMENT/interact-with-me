-- Note: Adjust 'interactwithme_admin' with your actual database user for the application
CREATE USER interactwithme_admin WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE interactwithmetest TO interactwithme_admin;

-- Grant complete access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO interactwithme_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO interactwithme_admin;
GRANT USAGE ON SCHEMA public TO interactwithme_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO interactwithme_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO interactwithme_admin;

-- Create ENUM types
CREATE TYPE sex_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE connection_request_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE floats_my_boaty_type AS ENUM ('Take orders or give them', 'Show off or draw attention', 'Nourish or be nourished', 'Experiment with clothes', 'Play with feet', 'Clever or not', 'Love your objects', 'More than two', 'Act as someone else', 'Other (Not Listed)');
CREATE TYPE hobby_type AS ENUM ('Arts', 'Collecting', 'Cooking', 'Crafting', 'Dance', 'Education', 'Fitness', 'Gaming', 'Gardening', 'Meditation', 'Music', 'Other', 'Photography', 'Reading', 'Sports', 'Technology', 'The Unknown', 'Travel', 'Volunteering', 'Writing');
CREATE TYPE sexual_orientation_type AS ENUM ('Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Pansexual', 'Queer', 'Lesbian', 'Gay', 'Straight', 'Demisexual', 'Polysexual', 'Omnisexual', 'Questioning', 'Undisclosed');

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

-- Seed data profile_picture='backend\imageUploaded\file-admin.JPEG'
-- newAdmin user was id 153 in development system -Hardcode Welcome_newAdmin.zip
-- Replace "posting_user_id": 153, accordingly
INSERT INTO users (username, email, password, profile_picture) VALUES ('Admin', 'admin@system.com', '113ab75cb112227be7e3056bc1723e67c0110c93','backend\imageUploaded\file-admin.JPEG');

-- Add to TABLES
ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES users(id);
ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_requested_id_fkey FOREIGN KEY (requested_id) REFERENCES users(id);
ALTER TABLE connections ADD CONSTRAINT connections_user_one_id_fkey FOREIGN KEY (user_one_id) REFERENCES users(id);
ALTER TABLE connections ADD CONSTRAINT connections_user_two_id_fkey FOREIGN KEY (user_two_id) REFERENCES users(id);
ALTER TABLE submission_members ADD CONSTRAINT submission_members_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES user_submissions(id);
ALTER TABLE user_submissions ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE submission_dialog ADD CONSTRAINT submission_dialog_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES user_submissions(id);
ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_requested_id_fkey FOREIGN KEY (requested_id) REFERENCES users(id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);


SELECT id, submission_id, posting_user_id, substring(text_content FROM 1 FOR 12) AS text_content FROM submission_dialog ORDER BY id desc;

SELECT id, username FROM users ORDER BY id desc;


SELECT id, user_one_id, user_two_id FROM connections ORDER BY id desc

SELECT us.id AS submission_id, us.title, us.user_id, u.username FROM submission_members sm, user_submissions us, users u WHERE sm.submission_id = us.id AND us.user_id = u.id AND sm.participating_user_id = 170;

SELECT id, submission_id, participating_user_id FROM submission_members ORDER BY id desc

SELECT id, user_id, title FROM user_submissions ORDER BY id desc;