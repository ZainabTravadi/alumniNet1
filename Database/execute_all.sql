-- AlumniNet Database - Complete Setup Script
-- Execute in this exact order to avoid foreign key constraint errors

-- Step 1: Create Database
CREATE DATABASE AlumniNet;
USE AlumniNet;

-- Step 2: Core Tables (No Dependencies)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    user_type ENUM('Alumni', 'Admin') DEFAULT 'Alumni',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE Alumni (
    alumni_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    graduation_year INT NOT NULL,
    department VARCHAR(100),
    company VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Tables Referencing Alumni/Events
CREATE TABLE Donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    alumni_id INT,
    amount DECIMAL(10,2) NOT NULL,
    purpose VARCHAR(200),
    donation_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (alumni_id) REFERENCES Alumni(alumni_id) ON DELETE SET NULL
);

CREATE TABLE Discussions (
    discussion_id INT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(200) NOT NULL,
    content TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Alumni(alumni_id) ON DELETE SET NULL
);

-- Step 4: Junction and Reply Tables
CREATE TABLE Event_Attendees (
    event_id INT,
    alumni_id INT,
    PRIMARY KEY (event_id, alumni_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (alumni_id) REFERENCES Alumni(alumni_id) ON DELETE CASCADE
);

CREATE TABLE Discussion_Replies (
    reply_id INT AUTO_INCREMENT PRIMARY KEY,
    discussion_id INT,
    alumni_id INT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES Discussions(discussion_id) ON DELETE CASCADE,
    FOREIGN KEY (alumni_id) REFERENCES Alumni(alumni_id) ON DELETE SET NULL
);

-- Step 5: Advanced Features
CREATE TABLE Mentorship (
    mentorship_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT,
    mentee_id INT,
    start_date DATE,
    status ENUM('Active','Completed','Pending') DEFAULT 'Pending',
    FOREIGN KEY (mentor_id) REFERENCES Alumni(alumni_id),
    FOREIGN KEY (mentee_id) REFERENCES Alumni(alumni_id)
);