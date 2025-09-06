-- Step 5: Create Advanced Feature Table

CREATE TABLE Mentorship (
    mentorship_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT,
    mentee_id INT,
    start_date DATE,
    status ENUM('Active','Completed','Pending') DEFAULT 'Pending',
    FOREIGN KEY (mentor_id) REFERENCES Alumni(alumni_id),
    FOREIGN KEY (mentee_id) REFERENCES Alumni(alumni_id)
);