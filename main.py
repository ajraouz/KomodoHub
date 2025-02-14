import sqlite3
from flask import Flask, request

app = Flask(__name__)

# API Route to Handle Registration
@app.route('/Web%20Pages/RegisterPage.html', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    name = data.get('name')
    password = data.get('password')  # Consider hashing this
    user_type = data.get('user_type')
    access_code = data.get('access_code') if user_type in ['student', 'teacher'] else None  # Access code only for students & teachers

    print(f"Received: {name}, {username}, {user_type}, {access_code}")

    try:
        conn = sqlite3.connect('KH_Database.db')
        cursor = conn.cursor()

        # Insert into the correct table
        if user_type == "student":
            sql = "INSERT INTO Student (Username, FullName, Password, Accesscode, TotalPoints, TotalPosts, Avatar) VALUES (?, ?, ?, ?, ?, ?, ?)"
            cursor.execute(sql, (username, name, password, access_code, None, None, None))
        elif user_type == "teacher":
            sql = "INSERT INTO Teacher (Username, FullName, Password, Accesscode, Email) VALUES (?, ?, ?, ?, ?)"
            cursor.execute(sql, (username, name, password, access_code, None))
        elif user_type == "member":
            sql = "INSERT INTO Member (Username, FullName, Password) VALUES (?, ?, ?)"
            cursor.execute(sql, (username, name, password))  # No access code for members
        else:
            return "Invalid user type!", 400  # Prevent errors if user_type is incorrect

        conn.commit()
        conn.close()

        return "Registered successfully!", 200

    except Exception as e:
        # Print the error to the Flask console
        print(f"Error: {e}")
        return f"An error occurred while registering: {e}", 500

if __name__ == '__main__':
    app.run(debug=True)