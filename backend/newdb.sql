
/*re-runnable
-- Create a new database
CREATE DATABASE interactwithme2;

-- Connect to the new database
\connect interactwithme2
*/
-- Create a new database
CREATE DATABASE interactwithme2;

-- Create a new user and grant privileges (if needed)
CREATE USER interactone WITH ENCRYPTED PASSWORD 'one_password';
GRANT ALL PRIVILEGES ON DATABASE interactwithme2 TO interactone;

-- Create a new database
CREATE DATABASE interactwithme2;

-- Connect to the new database
\c interactwithme2

-- Create a new user and grant privileges (if needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'interactone') THEN
        CREATE USER interactone WITH ENCRYPTED PASSWORD 'one_password';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE interactwithme2 TO interactone;

-- Create ENUM types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sex_type') THEN
        CREATE TYPE sex_type AS ENUM ('Male', 'Female', 'Other');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_request_status') THEN
        CREATE TYPE connection_request_status AS ENUM ('pending', 'accepted', 'declined');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'floats_my_boaty_type') THEN
        CREATE TYPE floats_my_boaty_type AS ENUM ('Take orders or give them', 'Nourish or be nourished', 'Other (Not Listed)');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hobby_type') THEN
        CREATE TYPE hobby_type AS ENUM ('Arts', 'Collecting', 'Cooking', 'Crafting', 'Dance', 'Education', 'Fitness', 'Gaming', 'Gardening', 'Meditation', 'Music', 'Other', 'Photography', 'Reading', 'Sports', 'Technology', 'The Unknown', 'Travel', 'Volunteering', 'Writing');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sexual_orientation_type') THEN
        CREATE TYPE sexual_orientation_type AS ENUM ('Heterosexual', 'Homosexual', 'Lesbian', 'Undisclosed');
    END IF;
END
$$;

-- Create users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
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
    END IF;
END
$$;

-- Grant all privileges on the new table to interactone
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO interactone;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO interactone;

