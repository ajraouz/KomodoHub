from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS  # Import CORS
import sqlite3
import logging
import webbrowser

app = Flask(__name__, template_folder='Web Pages', static_folder='Web Pages')

CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.DEBUG)

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

        username = request.form.get('username')
        name = request.form.get('name')
        password = request.form.get('password')
        user_type = request.form.get('user_type')
        access_code = request.form.get('access_code') if user_type in ['student', 'teacher'] else None

        logging.debug(f"Received Data: {username}, {name}, {user_type}, {access_code}")

        if not username or not name or not password or not user_type:
            logging.error("Missing required fields.")
            return jsonify({"error": "Missing required fields"}), 400

        conn = sqlite3.connect('KH_Database.db')
        cursor = conn.cursor()

        if user_type == "student":
            sql = "INSERT INTO Student (Username, FullName, Password, Accesscode, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?, ?, ?)"
            cursor.execute(sql, (username, name, password, access_code, 0, 0, None))
        elif user_type == "teacher":
            sql = "INSERT INTO Teacher (Username, FullName, Password, Accesscode, Email) VALUES (?, ?, ?, ?, ?)"
            cursor.execute(sql, (username, name, password, access_code, None))
        elif user_type == "member":
            sql = "INSERT INTO Member (Username, FullName, Password) VALUES (?, ?, ?)"
            cursor.execute(sql, (username, name, password))
        else:
            logging.error("Invalid user type.")
            return jsonify({"error": "Invalid user type"}), 400

        conn.commit()
        conn.close()

        logging.info("User registered successfully.")
        return jsonify({"message": "Registered successfully!"}), 200

    except Exception as e:
        logging.exception("An error occurred while registering.")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5000/")
    app.run(debug=True, port=5000)
