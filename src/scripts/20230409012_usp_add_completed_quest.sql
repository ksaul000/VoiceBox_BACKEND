CREATE or ALTER PROCEDURE [dbo].[usp_add_completed_quest] 
    @user_id INT,
    @topic VARCHAR(50)
AS
BEGIN
    DECLARE @quest_id INT
	select @quest_id=id from quests where topic=@topic
	INSERT INTO completed_quests (user_id, quest_id) values (@user_id, @quest_id);
END