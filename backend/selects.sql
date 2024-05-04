SELECT id, username, profile_picture, profile_video FROM users ORDER BY id;
102 | ManNowMe                 | backend\imageUploaded\file-1713643938698.JPEG |
103 | Admin for ManNowMe       | backend\imageUploaded\file-WOMAN.png          |
SELECT user_id, title FROM user_submissions ORDER BY id;
user_id |           title
---------+---------------------------
      61 | Mission Targets
      61 | Welcome to Weider!
      61 | PPP case 21 floor 7 Emily
     102 | Welcome ManNowMe!

SELECT submission_id, participating_user_id FROM submission_members ORDER BY id;
 submission_id | participating_user_id
---------------+-----------------------
            84 |                    61
            86 |                    61
            86 |                    98
            86 |                    90
            84 |                    54
            84 |                    84
            87 |                    61
            87 |                    84
            87 |                    54
            88 |                   102
            88 |                   103
(11 rows)

CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    user_one_id INTEGER NOT NULL REFERENCES users(id),
    user_two_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_order CHECK (user_one_id < user_two_id),
    CONSTRAINT chk_users_not_equal CHECK (user_one_id <> user_two_id)
);
SELECT user_one_id, user_two_id FROM connections ORDER BY user_one_id;
SELECT id, username, profile_picture, profile_video, email, sexual_orientation, hobbies, floats_my_boat, sex FROM users ORDER BY username
SELECT id, username FROM users ORDER BY username
SELECT users.id, users.username FROM users, connections WHERE users.id=connections.user_one_id AND users.id=61 ORDER BY username;
SELECT users.id, users.username FROM users, connections WHERE users.id=connections.user_two_id AND users.id=61 ORDER BY username;
SELECT id, username FROM users, connections WHERE users.id=connections.user_two_id ORDER BY username


SELECT users.id, users.username FROM users, users u2, connections WHERE users.id=connections.user_one_id AND connections.user_one_id=61 ORDER BY username;
SELECT user_one_id, user_two_id FROM connections WHERE user_one_id = 61 ORDER BY user_one_id;
SELECT users.username, connections.user_one_id, connections.user_two_id FROM connections, users WHERE connections.user_one_id = 61 AND connections.user_two_id =users.id ORDER BY user_one_id;


(SELECT users.id, users.username, users.profile_picture, users.profile_video, users.email, users.sexual_orientation, users.hobbies, users.floats_my_boat, users.sex, NULL as connection_id FROM users WHERE id = 61) UNION (SELECT U2.id, U2.username, NULL as profile_picture, NULL as profile_video, U2.email, U2.sexual_orientation, U2.hobbies, U2.floats_my_boat, U2.sex, connections.id as connection_id FROM users U1 JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id WHERE U1.id = 61 AND U2.id != 61 ORDER BY username);
(SELECT users.id, users.username as connection_id FROM users WHERE id = 61) UNION (SELECT U2.id, U2.username FROM users U1 JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id WHERE U1.id = 61 AND U2.id != 61 ORDER BY username);


(SELECT users.id, users.username, users.profile_picture, users.profile_video, users.email, users.sexual_orientation, users.hobbies, users.floats_my_boat, users.sex, NULL as connection_id FROM users WHERE id = 61) UNION (SELECT U2.id, U2.username, NULL as profile_picture, NULL as profile_video, U2.email, U2.sexual_orientation, U2.hobbies, U2.floats_my_boat, U2.sex, connections.id as connection_id FROM users U1 JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id WHERE U1.id = 61 AND U2.id != 61 ORDER BY username);
