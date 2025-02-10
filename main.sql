/* No need to run anything, the tables are already created in KH_Database.db */
/* I keep this file just as a backup */

CREATE TABLE Student(  
    Username CHAR(20) NOT NULL PRIMARY KEY,
    FullName CHAR(50) NOT NULL,
    Password CHAR(50) NOT NULL,
    AccessCode INTEGER NOT NULL,
    TotalPoints INTEGER,
    TotalPosts INTEGER,
    Avatar BLOB
);

CREATE TABLE Teacher(  
    Username CHAR(20) NOT NULL PRIMARY KEY,
    FullName CHAR(50) NOT NULL,
    Password CHAR(50) NOT NULL,
    AccessCode INTEGER NOT NULL,
    Email VARCHAR(255)
);

CREATE TABLE Member(  
    Username CHAR(20) NOT NULL PRIMARY KEY,
    FullName CHAR(50) NOT NULL,
    Password CHAR(50) NOT NULL
);

CREATE TABLE Community_Post(  
    ID INTEGER NOT NULL PRIMARY KEY,
    Owner CHAR(50) NOT NULL,
    Title CHAR(50) NOT NULL,
    Image BLOB,
    Content NVARCHAR,
    Date DATE,
    Time TIME
);

CREATE TABLE School_Post(  
    ID INTEGER NOT NULL PRIMARY KEY,
    Owner CHAR(50) NOT NULL,
    Title CHAR(50) NOT NULL,
    Image BLOB,
    Content NVARCHAR,
    Date DATE,
    Time TIME
);

CREATE TABLE Animal(  
    Name CHAR(50) NOT NULL PRIMARY KEY,
    Environment CHAR(50) NOT NULL,
    HowManyLeft INTEGER NOT NULL,
    ReasonForDanger VARCHAR(255),
    Solutions VARCHAR(255)
);

SELECT Student.Username
FROM Student
INNER JOIN School_Post ON Student.Username = School_Post.Owner

SELECT Member.Username
FROM Member
INNER JOIN Community_Post ON Member.Username = Community_Post.Owner

