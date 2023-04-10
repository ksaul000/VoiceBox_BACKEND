CREATE or ALTER PROCEDURE [dbo].[usp_save_hot_take] 
            @ht_content  VARCHAR(MAX),
            @ht_usr_id INTEGER,
			@ht_topic VARCHAR(50)
AS
BEGIN
	INSERT INTO hot_takes (content, user_id, topic)
	VALUES (@ht_content, @ht_usr_id, @ht_topic);
	SELECT SCOPE_IDENTITY() AS id;
END