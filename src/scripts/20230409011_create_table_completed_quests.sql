IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[completed_quests]'))
BEGIN

CREATE TABLE completed_quests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY (user_id) REFERENCES users(id),
	quest_id INT FOREIGN KEY (quest_id) REFERENCES quests(id)
);
ALTER TABLE completed_quests
ADD publication_date DATETIME DEFAULT GETDATE();

END