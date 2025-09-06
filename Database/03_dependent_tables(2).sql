-- Step 3: Create Tables That Reference Alumni/Events

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