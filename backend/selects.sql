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
SELECT posting_user_id, LEFT(text_content, 10) AS text_content_short, uploaded_path FROM submission_dialog ORDER BY submission_id;

