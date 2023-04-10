CREATE or ALTER PROCEDURE [dbo].[usp_insert_quest] 
            @qt_user_id INT,
    @qt_topic VARCHAR(50)
AS
BEGIN
    INSERT INTO Quests (user_id, topic) VALUES (@qt_user_id, @qt_topic);
	SELECT SCOPE_IDENTITY() AS id;
END