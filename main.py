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
app.secret_key = "your_secret_key"
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
        access_code = request.form.get('access_code') if user_type in ['student', 'teacher'] else None

        if not username or not name or not password or not user_type:
            return jsonify({"error": "Missing required fields"}), 400

        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect('KH_Database.db', timeout=10)  # Increased timeout to avoid lock
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
            cursor.execute("INSERT INTO students (user_id, FullName, AccessCode, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?, ?)", 
                           (user_id, name, access_code, 0, 0, avatar_data))
        elif user_type == "teacher":
            cursor.execute("INSERT INTO teachers (user_id, FullName, AccessCode, Avatar) VALUES (?, ?, ?, ?)", 
                           (user_id, name, access_code, avatar_data))
        elif user_type == "principal":
            cursor.execute("INSERT INTO school (user_id, FullName, Avatar) VALUES (?, ?, ?)", 
                           (user_id, name, avatar_data))
        elif user_type == "admin":
            cursor.execute("INSERT INTO admin (user_id, FullName, Avatar) VALUES (?, ?, ?)", 
                           (user_id, name, avatar_data))

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

@app.route('/articles', methods=['GET'])
def get_articles():
    conn = sqlite3.connect("KH_Database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT ID, Owner, Title, Image, Content, Date, Time FROM School_Post")

    articles = []
    for row in cursor.fetchall():
        article_id, member, title, image, content, date, time = row
        image_base64 = f"data:image/png;base64,{base64.b64encode(image).decode('utf-8')}" if image else None
        articles.append({
            "id": article_id,
            "member": member,
            "title": title,
            "image": image_base64,
            "content": content,
            "date": date,
            "time": time,
            "member_type": "Teacher"
        })

    conn.close()
    return jsonify(articles)

@app.route('/community_articles', methods=['GET'])
def get_community_articles():
    conn = sqlite3.connect("KH_Database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT ID, Owner, Title, Image, Content, Date, Time FROM Community_Post")

    articles = []
    for row in cursor.fetchall():
        article_id, member, title, image, content, date, time = row
        image_base64 = f"data:image/png;base64,{base64.b64encode(image).decode('utf-8')}" if image else None
        articles.append({
            "id": article_id,
            "member": member,
            "title": title,
            "image": image_base64,
            "content": content,
            "date": date,
            "time": time,
            "member_type": "Member"
        })

    conn.close()
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
        cursor.execute("INSERT INTO Community_Post (Owner, Title, Image, Content, Date, Time) VALUES (?, ?, ?, ?, ?, ?)", (owner, title, image_blob, content, date, time))

        conn.commit()
        conn.close()

        return jsonify({"message": "Community post uploaded successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        cursor.execute("SELECT FullName, Avatar FROM students WHERE user_id = ?", (user_id,))
    elif user_type == "teacher":
        cursor.execute("SELECT FullName, Avatar FROM teachers WHERE user_id = ?", (user_id,))
    elif user_type == "member":
        cursor.execute("SELECT FullName, Avatar FROM members WHERE user_id = ?", (user_id,))
    else:
        conn.close()
        return jsonify({"error": "Unknown user type"}), 400

    profile_data = cursor.fetchone()
    conn.close()

    if not profile_data:
        return jsonify({"error": "Profile data not found"}), 404

    return jsonify({
        "username": user[1],
        "name": profile_data[0],
        "role": user[2],
        "avatar": profile_data[1]  # Default avatar
    })

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
    else:
        conn.close()
        return jsonify({"error": "Avatar updates not supported for this user type"}), 400

    conn.commit()
    conn.close()

    return jsonify({"success": "Avatar updated successfully!"})

if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5001/")
    app.run(debug=False, port=5001)

# if __name__ == '__main__':
#     webbrowser.open("http://192.168.1.189:5001/")
#     app.run(host='0.0.0.0', debug=False, port=5001)