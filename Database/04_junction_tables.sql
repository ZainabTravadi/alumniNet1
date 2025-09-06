-- Step 4: Create Junction and Reply Tables

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