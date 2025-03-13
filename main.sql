/* No need to run anything, the tables are already created in KH_Database.db */
/* I keep this file just as a backup */

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY, -- Auto-increments automatically in SQLite
    username TEXT UNIQUE NOT NULL, 
    password TEXT NOT NULL, 
    user_type TEXT CHECK(user_type IN ('student', 'teacher', 'member', 'principal', 'admin')) NOT NULL
);

CREATE TABLE students (
    user_id INTEGER PRIMARY KEY, 
    FullName TEXT NOT NULL, 
    TotalPoints INTEGER DEFAULT 0, 
    TotalPosts INTEGER DEFAULT 0, 
    Avatar BLOB,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE teachers (
    user_id INTEGER PRIMARY KEY, 
    FullName TEXT NOT NULL, 
    TotalPoints INTEGER DEFAULT 0, 
    TotalPosts INTEGER DEFAULT 0, 
    Avatar BLOB,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE members (
    user_id INTEGER PRIMARY KEY, 
    FullName TEXT NOT NULL,
    TotalPoints INTEGER DEFAULT 0, 
    TotalPosts INTEGER DEFAULT 0, 
    Avatar BLOB, 
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE school (
    user_id INTEGER PRIMARY KEY, 
    FullName TEXT NOT NULL,
    TotalPoints INTEGER DEFAULT 0, 
    TotalPosts INTEGER DEFAULT 0, 
    Avatar BLOB, 
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE admin (
    user_id INTEGER PRIMARY KEY, 
    FullName TEXT NOT NULL,
    TotalPoints INTEGER DEFAULT 0, 
    TotalPosts INTEGER DEFAULT 0, 
    Avatar BLOB,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE Animal(  
    Name CHAR(50) NOT NULL PRIMARY KEY,
    Environment CHAR(50) NOT NULL,
    HowManyLeft INTEGER NOT NULL,
    ReasonForDanger VARCHAR(255),
    Description VARCHAR(255)
);

CREATE TABLE Community_Post(  
    ID INTEGER PRIMARY KEY,
    Owner TEXT NOT NULL,
    Title TEXT NOT NULL,
    Image BLOB,
    Content TEXT,
    Date TEXT,  -- Stores DATE as TEXT in format 'YYYY-MM-DD'
    Time TEXT,  -- Stores TIME as TEXT in format 'HH:MM:SS'
    FOREIGN KEY (Owner) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE School_Post(  
    ID INTEGER PRIMARY KEY,
    Owner TEXT NOT NULL,
    Title TEXT NOT NULL,
    Image BLOB,
    Content TEXT,
    Date TEXT,
    Time TEXT,
    FOREIGN KEY (Owner) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE AccessCode(  
    UserType TEXT CHECK(UserType IN ('student', 'teacher')) PRIMARY KEY,
    Code INTEGER NOT NULL
);