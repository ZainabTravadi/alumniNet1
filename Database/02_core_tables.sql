CREATE DATABASE IF NOT EXISTS AlumniNet;
USE AlumniNet;

-- Step 2: Drop old tables if they exist
DROP DATABASE AlumniNet;
CREATE DATABASE AlumniNet;
USE AlumniNet;

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
INSERT INTO Users (username, password_hash, email, user_type, is_active, last_login)
VALUES
('tejas123', 'hashedpassword1', 'tejas@example.com', 'Alumni', TRUE, NOW()),
('admin01', 'hashedpassword2', 'admin@example.com', 'Admin', TRUE, NOW()),
('anita_alumni', 'hashedpassword3', 'anita@example.com', 'Alumni', TRUE, NOW()),
('rohan1998', 'hashedpassword4', 'rohan@gmail.com', 'Alumni', TRUE, NOW()),
('sneha_k', 'hashedpassword5', 'sneha@gmail.com', 'Alumni', TRUE, NOW()),
('akash_dev', 'hashedpassword6', 'akash@gmail.com', 'Alumni', TRUE, NOW()),
('meena12', 'hashedpassword7', 'meena@gmail.com', 'Alumni', TRUE, NOW()),
('rahulp', 'hashedpassword8', 'rahulp@gmail.com', 'Alumni', TRUE, NOW()),
('priyanka_star', 'hashedpassword9', 'priyanka@gmail.com', 'Alumni', TRUE, NOW()),
('arjun_cse', 'hashedpassword10', 'arjun@gmail.com', 'Alumni', TRUE, NOW()),
('shweta_ds', 'hashedpassword11', 'shweta@gmail.com', 'Alumni', TRUE, NOW()),
('manoj_it', 'hashedpassword12', 'manoj@gmail.com', 'Alumni', TRUE, NOW()),
('neha_design', 'hashedpassword13', 'neha@gmail.com', 'Alumni', TRUE, NOW()),
('vishal_mech', 'hashedpassword14', 'vishal@gmail.com', 'Alumni', TRUE, NOW()),
('kiran_ai', 'hashedpassword15', 'kiran@gmail.com', 'Alumni', TRUE, NOW()),
('sonali_bio', 'hashedpassword16', 'sonali@gmail.com', 'Alumni', TRUE, NOW()),
('deepak123', 'hashedpassword17', 'deepak@gmail.com', 'Alumni', TRUE, NOW()),
('ravi_1999', 'hashedpassword18', 'ravi@gmail.com', 'Alumni', TRUE, NOW()),
('pallavi24', 'hashedpassword19', 'pallavi@gmail.com', 'Alumni', TRUE, NOW()),
('gaurav_cloud', 'hashedpassword20', 'gaurav@gmail.com', 'Alumni', TRUE, NOW()),
('mukesh_dev', 'hashedpassword21', 'mukesh@gmail.com', 'Alumni', TRUE, NOW()),
('tanvi_arts', 'hashedpassword22', 'tanvi@gmail.com', 'Alumni', TRUE, NOW()),
('yash_2020', 'hashedpassword23', 'yash@gmail.com', 'Alumni', TRUE, NOW()),
('divya_hr', 'hashedpassword24', 'divya@gmail.com', 'Alumni', TRUE, NOW()),
('saurabh_ml', 'hashedpassword25', 'saurabh@gmail.com', 'Alumni', TRUE, NOW()),
('komal_it', 'hashedpassword26', 'komal@gmail.com', 'Alumni', TRUE, NOW()),
('omkar_cloud', 'hashedpassword27', 'omkar@gmail.com', 'Alumni', TRUE, NOW()),
('radhika_ds', 'hashedpassword28', 'radhika@gmail.com', 'Alumni', TRUE, NOW()),
('vivek_java', 'hashedpassword29', 'vivek@gmail.com', 'Alumni', TRUE, NOW()),
('swati_ai', 'hashedpassword30', 'swati@gmail.com', 'Alumni', TRUE, NOW());
SELECT * FROM Users;

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
INSERT INTO Alumni (user_id, full_name, graduation_year, department, company, location)
VALUES
(1, 'Tejas Navale', 2023, 'Computer Science', 'Infosys', 'Pune'),
(3, 'Anita Sharma', 2022, 'Electronics', 'TCS', 'Mumbai'),
(4, 'Rohan Patil', 2019, 'Mechanical', 'Mahindra Auto', 'Nashik'),
(5, 'Sneha Kulkarni', 2021, 'Computer Science', 'Capgemini', 'Bengaluru'),
(6, 'Akash Verma', 2020, 'Information Technology', 'Wipro', 'Hyderabad'),
(7, 'Meena Iyer', 2018, 'Civil Engineering', 'L&T Constructions', 'Chennai'),
(8, 'Rahul Pandey', 2022, 'Electrical', 'Siemens', 'Delhi'),
(9, 'Priyanka Deshmukh', 2023, 'Computer Science', 'Google', 'Hyderabad'),
(10, 'Arjun Chavan', 2019, 'Computer Science', 'Amazon', 'Pune'),
(11, 'Shweta Joshi', 2020, 'Data Science', 'Microsoft', 'Bengaluru'),
(12, 'Manoj Nair', 2021, 'Information Technology', 'Accenture', 'Pune'),
(13, 'Neha Agarwal', 2017, 'Design Engineering', 'Adobe', 'Noida'),
(14, 'Vishal Pawar', 2019, 'Mechanical', 'Tata Motors', 'Pune'),
(15, 'Kiran Patwardhan', 2023, 'Artificial Intelligence', 'Nvidia', 'Bengaluru'),
(16, 'Sonali Gupta', 2020, 'Biotechnology', 'Serum Institute', 'Pune'),
(17, 'Deepak Rao', 2022, 'Computer Science', 'IBM', 'Hyderabad'),
(18, 'Ravi Kumar', 2018, 'Electronics', 'Intel', 'Bengaluru'),
(19, 'Pallavi Singh', 2021, 'Computer Science', 'Deloitte', 'Mumbai'),
(20, 'Gaurav Shinde', 2023, 'Cloud Computing', 'AWS', 'Bengaluru');

SELECT * FROM Alumni;


CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Events (title, event_date, location, description)
VALUES
('Alumni Meet 2025', '2025-12-15', 'Pune University', 'Annual alumni gathering and networking event.'),
('Career Guidance Webinar', '2025-10-20', 'Online', 'Session for students on career growth.'),
('Tech Summit 2025', '2025-11-05', 'Bengaluru', 'Discussion on latest trends in technology.'),
('Startup Pitch Day', '2025-09-25', 'Mumbai', 'Platform for alumni entrepreneurs to showcase ideas.'),
('Women in Tech Meetup', '2025-11-18', 'Hyderabad', 'Networking event for women alumni in technology.'),
('AI & Data Science Conference', '2025-12-01', 'Delhi', 'Exploring AI and Data Science in industries.'),
('Mechanical Engineers Reunion', '2025-10-30', 'Nashik', 'Meetup of all mechanical alumni.'),
('Civil Engineering Alumni Meet', '2025-12-20', 'Chennai', 'Gathering of civil engineering graduates.'),
('Cloud Computing Workshop', '2025-11-12', 'Pune', 'Hands-on workshop on cloud services.'),
('Sports & Cultural Festival', '2025-12-28', 'Pune University', 'Annual alumni sports and cultural event.'),
('Green Energy Seminar', '2025-10-10', 'Bengaluru', 'Discussion on renewable energy and innovation.'),
('Overseas Alumni Virtual Meetup', '2025-09-15', 'Online', 'Virtual session with alumni living abroad.'),
('Hackathon 2025', '2025-11-22', 'Hyderabad', '48-hour coding challenge for alumni and students.'),
('Leadership Summit', '2025-12-05', 'Delhi', 'Talks by top alumni leaders across industries.'),
('Entrepreneurship Workshop', '2025-09-28', 'Mumbai', 'Training for students by successful alumni entrepreneurs.'),
('Blockchain Seminar', '2025-11-10', 'Bengaluru', 'Exploring blockchain use-cases and startups.'),
('Healthcare Innovations Meet', '2025-10-18', 'Pune', 'Discussion on healthcare tech with biotech alumni.'),
('Design Thinking Workshop', '2025-09-30', 'Noida', 'Creative problem-solving session for alumni.'),
('IT Services Networking Event', '2025-12-08', 'Pune', 'Collaboration and hiring session for IT alumni.'),
('Graduation Celebration 2025', '2025-11-25', 'University Ground', 'Celebration for graduating batch with alumni.');

SELECT * FROM Events;