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
        access_code = request.form.get('access_code') if user_type in ['student', 'teacher'] else None

        if not username or not name or not password or not user_type:
            return jsonify({"error": "Missing required fields"}), 400

        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect('KH_Database.db', timeout=10)  # Increased timeout to avoid lock
        cursor = conn.cursor()

        cursor.execute("INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)", 
                       (username, hashed_password, user_type))
        user_id = cursor.lastrowid

        if user_type == "student":
            cursor.execute("INSERT INTO students (user_id, FullName, AccessCode, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?, ?)", 
                           (user_id, name, access_code, 0, 0, None))
        elif user_type == "teacher":
            cursor.execute("INSERT INTO teachers (user_id, FullName, AccessCode, Email) VALUES (?, ?, ?, ?)", 
                           (user_id, name, access_code, None))

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

        conn = sqlite3.connect('KH_Database.db')
        cursor = conn.cursor()

        # Insert the member into the database
        cursor.execute("INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)", 
                       (username, hashed_password, "member"))
        user_id = cursor.lastrowid

        cursor.execute("INSERT INTO members (user_id, FullName) VALUES (?, ?)", 
                       (user_id, name))

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
            logging.error("Missing username, password, or user type.")
            return jsonify({"error": "Missing username, password, or user type"}), 400

        conn = sqlite3.connect('KH_Database.db')
        cursor = conn.cursor()

        # Query the database for the user and their user type
        cursor.execute("SELECT user_id, password, user_type FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            logging.error("User not found.")
            return jsonify({"error": "Invalid username or password"}), 401

        user_id, hashed_password, db_user_type = user

        # Check if the selected user type matches the database user type
        if db_user_type.lower() != user_type.lower():
            logging.error("Incorrect user type selection.")
            return jsonify({"error": "Invalid user type selection"}), 401

        # Verify the password
        if not check_password_hash(hashed_password, password):
            logging.error("Incorrect password.")
            return jsonify({"error": "Invalid username or password"}), 401

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
        
if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5001/")
    app.run(debug=False, port=5001)

# if __name__ == '__main__':
#     webbrowser.open("http://192.168.1.189:5001/")
#     app.run(host='0.0.0.0', debug=False, port=5001)