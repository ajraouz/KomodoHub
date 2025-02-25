from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS  # Import CORS
import sqlite3
import logging
import webbrowser
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
    try:
        logging.debug("Received registration request.")

        # Get form data
        username = request.form.get('username')
        name = request.form.get('name')
        password = request.form.get('password')
        user_type = request.form.get('user_type')
        access_code = request.form.get('access_code') if user_type in ['student', 'teacher'] else None

        logging.debug(f"Received Data: {username}, {name}, {user_type}, {access_code}")

        # Validate required fields
        if not username or not name or not password or not user_type:
            logging.error("Missing required fields.")
            return jsonify({"error": "Missing required fields"}), 400

        # Hash password for security
        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect('KH_Database.db')
        cursor = conn.cursor()

        # Insert into users table
        cursor.execute("INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)", 
                       (username, hashed_password, user_type))

        # Get the newly inserted user_id
        user_id = cursor.lastrowid

        # Insert into the respective table based on user_type
        if user_type == "student":
            cursor.execute("INSERT INTO students (user_id, FullName, AccessCode, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?, ?)", 
                           (user_id, name, access_code, 0, 0, None))
        elif user_type == "teacher":
            cursor.execute("INSERT INTO teachers (user_id, FullName, AccessCode, Email) VALUES (?, ?, ?, ?)", 
                           (user_id, name, access_code, None))
        elif user_type == "member":
            return jsonify({"error": "Members must complete payment first."}), 400
        else:
            logging.error("Invalid user type.")
            return jsonify({"error": "Invalid user type"}), 400

        # Commit changes and close connection
        conn.commit()
        conn.close()

        logging.info("User registered successfully.")
        return jsonify({"message": "Registered successfully!"}), 200

    except Exception as e:
        logging.exception("An error occurred while registering.")
        return jsonify({"error": str(e)}), 500

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

if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5001/")
    app.run(debug=True, port=5001)
