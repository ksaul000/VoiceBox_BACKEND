IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Quests]'))
BEGIN

CREATE TABLE Quests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    topic VARCHAR(50),
    publication_date DATETIME DEFAULT GETDATE()
);

END