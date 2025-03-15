from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS  # Import CORS
import sqlite3
import logging
import webbrowser
import base64
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='Web Pages', static_folder='Web Pages')
CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.DEBUG)


@app.route('/')
def serve_homepage():
    return send_from_directory('Web Pages', 'Homepage.html')

@app.route('/')
def serve_html_index():
    return send_from_directory('Web Pages', 'RegisterPage.html')

@app.route('/Web Pages/LoginRegister.css')
def serve_css_style():
    return send_from_directory('Web Pages', 'LoginRegister.css')

@app.route('/register', methods=['POST'])
def register():
    conn = None  # Define the connection outside try
    try:
        logging.debug("Received registration request.")

        username = request.form.get('username')
        name = request.form.get('name')
        password = request.form.get('password')
        user_type = request.form.get('user_type')

        if not username or not name or not password or not user_type:
            return jsonify({"error": "Missing required fields"}), 400

        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect('KH_Database.db', timeout=30)  # Increased timeout to avoid lock
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"error": "Username already exists. Please choose a different one."}), 400

        cursor.execute("INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)", 
                       (username, hashed_password, user_type))
        user_id = cursor.lastrowid

        # Load the default avatar image
        with open('Web Pages/Images/default.png', 'rb'):
            avatar_data = 'Images/default.png'

        if user_type == "student":
            cursor.execute("INSERT INTO students (user_id, FullName, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?)", 
                           (user_id, name, 0, 0, avatar_data))
        elif user_type == "teacher":
            cursor.execute("INSERT INTO teachers (user_id, FullName, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?)", 
                           (user_id, name, 0, 0, avatar_data))
        elif user_type == "principal":
            cursor.execute("INSERT INTO school (user_id, FullName, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?)", 
                           (user_id, name, 0, 0, avatar_data))
        elif user_type == "admin":
            cursor.execute("INSERT INTO admin (user_id, FullName, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?)", 
                           (user_id, name, 0, 0, avatar_data))

        conn.commit()
        logging.info("User registered successfully.")
        return jsonify({"message": "Registered successfully!"}), 200

    except sqlite3.OperationalError as e:
        logging.exception("Database error occurred.")
        return jsonify({"error": "Database is locked. Try again later."}), 500

    except Exception as e:
        logging.exception("An error occurred while registering.")
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()  # Ensuring the connection is always closed

@app.route('/validate-access', methods=['POST'])
def validate_access():
    data = request.json
    user_type = data.get("userType")
    access_code = data.get("accessCode")

    conn = sqlite3.connect('KH_Database.db', timeout=30)
    cursor = conn.cursor()

    # Query to check if the access code is valid
    cursor.execute("SELECT * FROM AccessCode WHERE userType = ? AND Code = ?",
                   (user_type, access_code))
    result = cursor.fetchone()
    
    conn.close()

    if result:
        return jsonify({"success": True, "message": "Access code valid"}), 200
    else:
        return jsonify({"success": False, "message": "Invalid access code"}), 400

@app.route('/complete_payment_registration', methods=['POST'])
def complete_payment_registration():
    try:
        logging.debug("Received post-payment registration request.")

        # Get the form data (which was stored before the payment)
        data = request.get_json()
        username = data['username']
        name = data['name']
        password = data['password']

        # Hash the password for security
        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect('KH_Database.db', timeout=10)
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"error": "Username already exists. Please choose a different one."}), 400

        # Insert the member into the database
        cursor.execute("INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)", 
                       (username, hashed_password, "member"))
        user_id = cursor.lastrowid

        # Load the default avatar image
        with open('Web Pages/Images/default.png', 'rb'):
            avatar_data = 'Images/default.png'

        cursor.execute("INSERT INTO members (user_id, FullName, Avatar) VALUES (?, ?, ?)", 
                       (user_id, name, avatar_data))

        # Commit changes and close connection
        conn.commit()
        conn.close()

        logging.info("Member registered successfully after payment.")
        return jsonify({"message": "Registration completed successfully!"}), 200

    except Exception as e:
        logging.exception("An error occurred during post-payment registration.")
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        logging.debug("Received login request.")

        username = request.form.get('username')
        password = request.form.get('password')
        user_type = request.form.get('user_type')  # User type from dropdown

        logging.debug(f"Login attempt for username: {username}, user type: {user_type}")

        if not username or not password or not user_type:
            logging.error("Missing required fields.")
            return jsonify({"error": "Missing required fields"}), 400

        conn = sqlite3.connect('KH_Database.db', timeout=10)
        cursor = conn.cursor()

        # Query the database for the user and their user type
        cursor.execute("SELECT user_id, password, user_type FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            logging.error("User not found.")
            return jsonify({"error": "Username does not exist"}), 401

        user_id, hashed_password, db_user_type = user

        # Check if the selected user type matches the database user type
        if db_user_type.lower() != user_type.lower():
            logging.error("Incorrect user type selection.")
            return jsonify({"error": "Invalid user type selection"}), 401

        # Verify the password
        if not check_password_hash(hashed_password, password):
            logging.error("Incorrect password.")
            return jsonify({"error": "Invalid password"}), 400

        logging.info(f"User {username} logged in successfully as {user_type}.")
        return jsonify({
            "message": "Login successful!",
            "user_type": db_user_type,
            "username": username
        }), 200

    except Exception as e:
        logging.exception("An error occurred during login.")
        return jsonify({"error": str(e)}), 500
# Shayan's work starts here

@app.route('/articles', methods=['GET'])
def get_articles():
    conn = sqlite3.connect("KH_Database.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sp.ID, 
            COALESCE(s.FullName, t.FullName, m.FullName, sch.FullName, a.FullName, u.username) AS name,
            sp.Title, 
            sp.Image, 
            sp.Content, 
            sp.Date, 
            sp.Time, 
            u.user_id, 
            u.user_type AS userType, 
            COALESCE(
                s.Avatar, 
                t.Avatar, 
                m.Avatar, 
                sch.Avatar, 
                a.Avatar, 
                'Images/default.png'
            ) AS Avatar
        FROM School_Post sp
        JOIN users u ON sp.Owner = u.username
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN teachers t ON u.user_id = t.user_id
        LEFT JOIN members m ON u.user_id = m.user_id
        LEFT JOIN school sch ON u.user_id = sch.user_id
        LEFT JOIN admin a ON u.user_id = a.user_id
    """)


    articles = []
    for row in cursor.fetchall():
        (article_id, username, title, image, content, date, time, user_id, user_type, avatar) = row  

        if image:
            try:
                image_base64 = f"data:image/png;base64,{base64.b64encode(image).decode('utf-8')}"
            except Exception as e:
                print(f"Error encoding image: {e}")
                image_base64 = None
        else:
            image_base64 = None

        print(f"DEBUG: Fetching article - Owner: {username}, userType: {user_type}, Title: {title}")

        articles.append({
            "id": article_id,
            "username": username,
            "user_id": user_id,
            "title": title,
            "image": image_base64,
            "content": content,
            "date": date,
            "time": time,
            "userType": user_type if user_type else "Unknown",  
            "profile_image": avatar if avatar else "Images/default.png"
        })

    conn.close()
    
    print(f"DEBUG: Total Articles Fetched: {len(articles)}") 
    return jsonify(articles)

@app.route('/community_articles', methods=['GET'])
def get_community_articles():
    conn = sqlite3.connect("KH_Database.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sp.ID, 
            COALESCE(s.FullName, t.FullName, m.FullName, sch.FullName, a.FullName, u.username) AS name,
            sp.Title, 
            sp.Image, 
            sp.Content, 
            sp.Date, 
            sp.Time, 
            u.user_id, 
            u.user_type AS userType, 
            COALESCE(
                s.Avatar, 
                t.Avatar, 
                m.Avatar, 
                sch.Avatar, 
                a.Avatar, 
                'Images/default.png'
            ) AS Avatar
        FROM Community_Post sp
        JOIN users u ON sp.Owner = u.username
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN teachers t ON u.user_id = t.user_id
        LEFT JOIN members m ON u.user_id = m.user_id
        LEFT JOIN school sch ON u.user_id = sch.user_id
        LEFT JOIN admin a ON u.user_id = a.user_id
    """)
    articles = []
    for row in cursor.fetchall():
        (article_id, name, title, image, content, date, time, user_id, userType, avatar) = row  

        if image:
            try:
                image_base64 = f"data:image/png;base64,{base64.b64encode(image).decode('utf-8')}"
            except Exception as e:
                print(f"Error encoding image: {e}")
                image_base64 = None
        else:
            image_base64 = None

        articles.append({
            "id": article_id,
            "username": name,
            "user_id": user_id,
            "title": title,
            "image": image_base64,
            "content": content,
            "date": date,
            "time": time,
            "userType": userType if userType else "Unknown",  
            "profile_image": avatar if avatar else "Images/default.png"
        })
    conn.close()
    print(f"DEBUG: Total Community Articles Fetched: {len(articles)}")
    return jsonify(articles)


@app.route('/post', methods=['POST'])
def post_article():
    try:
        title = request.form.get('title')
        content = request.form.get('content')
        owner = request.form.get('owner')
        date = datetime.now().strftime("%Y-%m-%d")
        time = datetime.now().strftime("%H:%M:%S")

        image = request.files.get('image')
        image_blob = image.read() if image else None  

        if not title.strip() or not content.strip() or not owner.strip():
            return jsonify({"error": "Fields cannot be empty or blank"}), 400

        conn = sqlite3.connect("KH_Database.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO School_Post (Owner, Title, Image, Content, Date, Time) VALUES (?, ?, ?, ?, ?, ?)", (owner, title, image_blob, content, date, time))

        conn.commit()
        conn.close()

        return jsonify({"message": "Post uploaded successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/post_community', methods=['POST'])
def post_community_article():
    try:
        title = request.form.get('title')
        content = request.form.get('content')
        owner = request.form.get('owner')
        date = datetime.now().strftime("%Y-%m-%d")
        time = datetime.now().strftime("%H:%M:%S")

        image = request.files.get('image')
        image_blob = image.read() if image else None  

        if not title.strip() or not content.strip() or not owner.strip():
            return jsonify({"error": "Fields cannot be empty or blank"}), 400

        conn = sqlite3.connect("KH_Database.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Community_Post (Owner, Title, Image, Content, Date, Time) VALUES (?, ?, ?, ?, ?, ?)", 
                       (owner, title, image_blob, content, date, time))

        conn.commit()
        conn.close()

        return jsonify({"message": "Community post uploaded successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

import logging
@app.route('/delete_post', methods=['POST'])
def delete_post():
    try:
        data = request.get_json()
        post_id = data.get("id")
        username = data.get("owner")  # The user requesting the deletion

        if not post_id or not username:
            return jsonify({"error": "Invalid request data"}), 400

        conn = sqlite3.connect("KH_Database.db")
        cursor = conn.cursor()

        # Get post owner and the post's userType (aliased correctly)
        cursor.execute("""
            SELECT sp.Owner, u.user_type AS userType 
            FROM School_Post sp
            JOIN users u ON sp.Owner = u.username
            WHERE sp.ID = ?
        """, (post_id,))
        
        post = cursor.fetchone()
        if not post:
            conn.close()
            return jsonify({"error": "Post not found"}), 404

        post_owner, post_userType = post

        # Fetch the requesting user's userType using the correct column
        cursor.execute("SELECT user_type AS userType FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({"error": "User not found"}), 404

        userType = user[0]

        # Debug log to trace deletion attempt
        print(f"DEBUG: Deletion Request by {username} ({userType}) on Post by {post_owner} ({post_userType})")

        if userType == "principal":
            cursor.execute("SELECT user_id FROM school WHERE user_id = (SELECT user_id FROM users WHERE username = ?)", (username,))
            school_data = cursor.fetchone()

            if school_data and (username == post_owner or post_owner in ["school", username]):
                authorized = True
            else:
                authorized = False
        else:
            # Role-Based Deletion Authorization
            authorized = (
                userType == "admin" or  
                (userType == "principal" and (username == post_owner or post_userType in ["teacher", "student"])) or  
                (userType == "teacher" and (username == post_owner or post_userType in ["student"])) or  
                (userType in ["student", "member"] and username == post_owner) 
            )

        if not authorized:
            conn.close()
            return jsonify({"error": "Unauthorized to delete this post"}), 403

        # Delete the post if authorized
        cursor.execute("DELETE FROM School_Post WHERE ID = ?", (post_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": "Post deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/delete_community_post', methods=['POST'])
def delete_community_post():
    try:
        data = request.get_json()
        post_id = data.get("id")
        username = data.get("owner")  # The user requesting the deletion

        if not post_id or not username:
            return jsonify({"error": "Invalid request data"}), 400

        conn = sqlite3.connect("KH_Database.db")
        cursor = conn.cursor()

        # Get community post owner and userType
        cursor.execute("""
            SELECT sp.Owner, u.user_type AS userType 
            FROM Community_Post sp
            JOIN users u ON sp.Owner = u.username
            WHERE sp.ID = ?
        """, (post_id,))
        
        post = cursor.fetchone()
        if not post:
            conn.close()
            return jsonify({"error": "Post not found"}), 404

        post_owner, post_userType = post

        # Fetch the requesting user's userType
        cursor.execute("SELECT user_type AS userType FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "User not found"}), 404

        userType = user[0]

        print(f"DEBUG: Community Deletion Request by {username} ({userType}) on Post by {post_owner} ({post_userType})")

        if userType == "principal":
            cursor.execute("SELECT user_id FROM school WHERE user_id = (SELECT user_id FROM users WHERE username = ?)", (username,))
            school_data = cursor.fetchone()
            # Adjust the condition to check for "community" as needed
            if school_data and (username == post_owner or post_owner in ["community", username]):
                authorized = True
            else:
                authorized = False
        else:
            authorized = (
                userType == "admin" or  
                (userType == "principal" and (username == post_owner or post_userType in ["teacher", "student"])) or  
                (userType == "teacher" and (username == post_owner or post_userType in ["student"])) or  
                (userType in ["student", "member"] and username == post_owner) 
            )

        if not authorized:
            conn.close()
            return jsonify({"error": "Unauthorized to delete this post"}), 403

        cursor.execute("DELETE FROM Community_Post WHERE ID = ?", (post_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": "Community post deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Shayan's work ends here


##### Alvisha's work start here ##### 

@app.route('/get_user_details', methods=['POST'])
def get_user_details():
    
    username = request.form.get('username')  # Fetch from session

    if not username:
        return jsonify({"error": "User not logged in"}), 401

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # Fetch user basic details
    cursor.execute("SELECT user_id, username, user_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    user_id = user[0]
    user_type = user[2]

    # Fetch FullName & Avatar from the correct table
    if user_type == "student":
        cursor.execute("SELECT FullName, Avatar, TotalPosts, TotalPoints FROM students WHERE user_id = ?", (user_id,))
        profile_data = cursor.fetchone()
    elif user_type == "teacher":
        cursor.execute("SELECT FullName, Avatar, TotalPosts, TotalPoints FROM teachers WHERE user_id = ?", (user_id,))
        profile_data = cursor.fetchone()
    elif user_type == "member":
        cursor.execute("SELECT FullName, Avatar, TotalPosts, TotalPoints FROM members WHERE user_id = ?", (user_id,))
        profile_data = cursor.fetchone()
    elif user_type == "admin":
        cursor.execute("SELECT FullName, Avatar, TotalPosts, TotalPoints FROM admin WHERE user_id = ?", (user_id,))
        profile_data = cursor.fetchone()
        
        # Count regular members
        cursor.execute("SELECT COUNT(*) FROM members")
        total_members = cursor.fetchone()[0]

        # Count school staff (teachers + principals)
        cursor.execute("SELECT COUNT(*) FROM teachers")
        total_teachers = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM school")
        total_principals = cursor.fetchone()[0]
        total_staff = total_teachers + total_principals

        # Count students
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]
        
    elif user_type == "principal":
        # Fetch principal details from the school table.
        cursor.execute("SELECT FullName, Avatar, COALESCE(TotalPosts, 0), COALESCE(TotalPoints, 0) FROM school WHERE user_id = ?",
            (user_id,)
        )
        profile_data = cursor.fetchone()
        
        # Additionally, count the number of teachers and students for dynamic contributions.
        cursor.execute("SELECT COUNT(*) FROM teachers")
        teachers_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM students")
        students_count = cursor.fetchone()[0]

    else:
        conn.close()
        return jsonify({"error": "Unknown user type"}), 400

    conn.close()

    if not profile_data:
        return jsonify({"error": "Profile data not found"}), 404

    response_data = {
        "username": user[1],
        "name": profile_data[0],
        "role": user[2],
        "avatar": profile_data[1],  # Default avatar
        "posts": profile_data[2],
        "points": profile_data[3]
    }
    
    if username == "AdminUser#404":
        response_data["members"] = total_members
        response_data["staff"] = total_staff
        response_data["students"] = total_students
        
    elif user_type== "principal":
        response_data["teachers"] = teachers_count
        response_data["students"] = students_count
        
    return jsonify(response_data)

@app.route('/update_avatar', methods=['POST'])
def update_avatar():
    username = request.form.get('username')  # Fetch from session
    avatar = request.form.get("avatar")

    if not username:
        return jsonify({"error": "User not logged in"}), 401

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # Fetch user_id and type
    cursor.execute("SELECT user_id, user_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    user_id = user[0]
    user_type = user[1]

    # Update avatar in the correct table
    if user_type == "student":
        cursor.execute("UPDATE students SET Avatar = ? WHERE user_id = ?", (avatar, user_id))
    elif user_type == "teacher":
        cursor.execute("UPDATE teachers SET Avatar = ? WHERE user_id = ?", (avatar, user_id))
    elif user_type == "member":
        cursor.execute("UPDATE members SET Avatar = ? WHERE user_id = ?", (avatar, user_id))
    elif user_type == "admin":
        cursor.execute("UPDATE admin SET Avatar = ? WHERE user_id = ?", (avatar, user_id))
    elif user_type == "principal":
        cursor.execute("UPDATE school SET Avatar = ? WHERE user_id = ?", (avatar, user_id))
    else:
        conn.close()
        return jsonify({"error": "Avatar updates not supported for this user type"}), 400

    conn.commit()
    conn.close()

    return jsonify({"success": "Avatar updated successfully!"})

@app.route('/update_password', methods=['POST'])
def update_password():
    # Get username and new password from the form data
    username = request.form.get('username')
    new_password = request.form.get('newPassword')
    
    if not username or not new_password:
        return jsonify({"error": "Username or new password not provided."}), 400

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # Verify that the user exists in the users table
    cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found."}), 404

    user_id = user[0]

    # Hash the new password before storing it
    hashed_password = generate_password_hash(new_password)

    # Update the password in the users table
    cursor.execute("UPDATE users SET password = ? WHERE user_id = ?", (hashed_password, user_id))
    conn.commit()
    conn.close()

    return jsonify({"success": "Password updated successfully!"})

@app.route('/delete_account', methods=['POST'])
def delete_account():
    username = request.form.get('username')
    
    if not username:
        return jsonify({"error": "Username not provided."}), 400

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # Fetch user_id and user_type from the users table
    cursor.execute("SELECT user_id, user_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found."}), 404

    user_id, user_type = user

    # Delete record from the specialized table if applicable
    if user_type == "student":
        cursor.execute("DELETE FROM students WHERE user_id = ?", (user_id,))
    elif user_type == "teacher":
        cursor.execute("DELETE FROM teachers WHERE user_id = ?", (user_id,))
    elif user_type == "member":
        cursor.execute("DELETE FROM members WHERE user_id = ?", (user_id,))
    elif user_type == "admin":
        cursor.execute("DELETE FROM admin WHERE user_id = ?", (user_id,))
    elif user_type == "principal":
        cursor.execute("DELETE FROM school WHERE user_id = ?", (user_id,))

    # Finally, delete from the users table
    cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))

    conn.commit()
    conn.close()

    return jsonify({"success": "Account deleted successfully!"})

@app.route('/update_teacher_access_code', methods=['POST'])
def update_teacher_access_code():
    username = request.form.get('username')
    if not username:
        return jsonify({"error": "User not logged in."}), 401

    # Get the new teacher access code from the form data
    new_access_code = request.form.get('newTeacherAccessCode')
    if not new_access_code:
        return jsonify({"error": "New teacher access code not provided."}), 400

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # Fetch user_id and user_type for the logged in user
    cursor.execute("SELECT user_id, user_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found."}), 404

    user_id, user_type = user

    # Verify that the logged in user is a principal
    if user_type != "principal":
        conn.close()
        return jsonify({"error": "Unauthorized, only principals can update teacher access code."}), 401

    # Update the teacher access code in the AccessCode table for UserType "teacher"
    cursor.execute("UPDATE AccessCode SET Code = ? WHERE UserType = ?", (new_access_code, "teacher"))
    conn.commit()
    conn.close()

    return jsonify({"success": "Teacher access code updated successfully!"})

@app.route('/update_student_access_code', methods=['POST'])
def update_student_access_code():
    username = request.form.get('username')
    if not username:
        return jsonify({"error": "User not logged in."}), 401

    # Get the new student access code from the form data
    new_access_code = request.form.get('newStudentAccessCode')
    if not new_access_code:
        return jsonify({"error": "New student access code not provided."}), 400

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # Fetch user_id and user_type for the logged in user
    cursor.execute("SELECT user_id, user_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found."}), 404

    user_id, user_type = user

    # Verify that the logged in user is a teacher
    if user_type != "teacher":
        conn.close()
        return jsonify({"error": "Unauthorized, only teachers can update student access code."}), 401

    # Update the student access code in the AccessCode table for UserType "student"
    cursor.execute("UPDATE AccessCode SET Code = ? WHERE UserType = ?", (new_access_code, "student"))
    conn.commit()
    conn.close()

    return jsonify({"success": "Student access code updated successfully!"})

@app.route('/api/getUserProfile', methods=['GET'])
def getUserProfile():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    conn = sqlite3.connect('KH_Database.db')
    cursor = conn.cursor()

    # First, fetch basic user details
    cursor.execute("SELECT username, user_type FROM users WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    username, user_type = user

    # For admin, fetch profile data and additional counts
    if user_type == "admin":
        cursor.execute("SELECT FullName, Avatar, TotalPosts, TotalPoints FROM admin WHERE user_id = ?", (user_id,))
        profile_data = cursor.fetchone()
        if not profile_data:
            conn.close()
            return jsonify({"error": "Profile data not found"}), 404

        # Count regular members
        cursor.execute("SELECT COUNT(*) FROM members")
        total_members = cursor.fetchone()[0]

        # Count school staff (teachers + principals)
        cursor.execute("SELECT COUNT(*) FROM teachers")
        total_teachers = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM school")
        total_principals = cursor.fetchone()[0]
        total_staff = total_teachers + total_principals

        # Count students
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]

    else:
        profile_query = {
            "student": "SELECT FullName, Avatar, TotalPosts, TotalPoints FROM students WHERE user_id = ?",
            "teacher": "SELECT FullName, Avatar, TotalPosts, TotalPoints FROM teachers WHERE user_id = ?",
            "member": "SELECT FullName, Avatar, TotalPosts, TotalPoints FROM members WHERE user_id = ?",
            "principal": "SELECT FullName, Avatar, TotalPosts, TotalPoints FROM school WHERE user_id = ?"
        }
        query = profile_query.get(user_type, "")
        cursor.execute(query, (user_id,))
        profile_data = cursor.fetchone()
        if not profile_data:
            conn.close()
            return jsonify({"error": "Profile data not found"}), 404

    conn.close()

    # Build the basic response data
    response_data = {
        "username": username,
        "name": profile_data[0],
        "role": user_type,
        "avatar": profile_data[1] if profile_data[1] else "Images/default.png",
        "posts": profile_data[2],
        "points": profile_data[3]
    }

    # Append extra admin-related fields if the user is an admin
    if user_type == "admin":
        response_data["members"] = total_members
        response_data["staff"] = total_staff
        response_data["students"] = total_students

    return jsonify(response_data)

@app.route('/api/getSchoolProfile', methods=['GET'])
def get_school_profile():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        conn = sqlite3.connect('KH_Database.db')
        cursor = conn.cursor()

        # First, fetch basic user details (like in getUserProfile)
        cursor.execute("SELECT username, user_type FROM users WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "User not found"}), 404
        username, user_type = user

        # Ensure that the provided user_id corresponds to a school (principal)
        if user_type != "principal":
            conn.close()
            return jsonify({"error": "Not a school profile"}), 400

        # Now, fetch the school profile data
        cursor.execute("SELECT FullName, Avatar, TotalPosts, TotalPoints FROM school WHERE user_id = ?", (user_id,))
        profile_data = cursor.fetchone()
        if not profile_data:
            conn.close()
            return jsonify({"error": "School not found"}), 404

        # Unpack the profile data correctly
        name, avatar, posts, points = profile_data

        # Retrieve additional contributions for public view:
        # Count teachers associated with the school
        cursor.execute("SELECT COUNT(*) FROM teachers")
        teachers_count = cursor.fetchone()[0]

        # Count students associated with the school
        cursor.execute("SELECT COUNT(*) FROM students")
        students_count = cursor.fetchone()[0]

        conn.close()

        response_data = {
            "username": username,
            "name": name,
            "role": user_type,
            "avatar": avatar if avatar else "Images/schoolprof.jpg",
            "posts": posts,
            "points": points,
            "teachers": teachers_count,
            "students": students_count
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


##### Alvisha's work end here ##### 

# Riya's work starts here

@app.route('/update_score', methods=['POST'])
def update_score():
    try:
        username = request.form.get('username')
        score = request.form.get('score')
        logging.debug(f"Received score update request: username={username}, score={score}")
        
        if not username or score is None:
            return jsonify({"error": "Missing parameters"}), 400
        try:
            score = int(score)
        except ValueError:
            return jsonify({"error": "Invalid score value"}), 400

        conn = sqlite3.connect('KH_Database.db', timeout=30)
        cursor = conn.cursor()
        
        # Retrieve the user's id and type
        cursor.execute("SELECT user_id, user_type FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "User not found"}), 404

        user_id, user_type = user

        # Determine the correct table to update based on user type
        if user_type == "student":
            table = "students"
        elif user_type == "teacher":
            table = "teachers"
        elif user_type == "member":
            table = "members"
        elif user_type == "admin":
            table = "admin"
        elif user_type == "principal":
            table = "school"
        else:
            conn.close()
            return jsonify({"error": "User type not supported for score updates"}), 400

        # Update the TotalPoints by adding the new score to the existing score
        cursor.execute(f"UPDATE {table} SET TotalPoints = TotalPoints + ? WHERE user_id = ?", (score, user_id))
        conn.commit()
        conn.close()

        return jsonify({"message": "Score updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Riya's work ends here



if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5001/")
    app.run(debug=False, port=5001)

# if __name__ == '__main__':
#     webbrowser.open("http://192.168.1.189:5001/")
#     app.run(host='0.0.0.0', debug=False, port=5001)
