IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hot_takes]'))
BEGIN
CREATE TABLE hot_takes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    content VARCHAR(MAX),
    publication_date DATETIME DEFAULT GETDATE(),
    user_id INT FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE hot_takes 
ADD topic VARCHAR(50);

END