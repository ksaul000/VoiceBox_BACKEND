CREATE or ALTER PROCEDURE [dbo].[usp_save_user] 
            @usr_nickname  VARCHAR(50),
            @usr_email VARCHAR(100),
			@usr_password VARCHAR(100)
AS
BEGIN
	INSERT INTO users(nickname, email, password) 
	VALUES(@usr_nickname, @usr_email, @usr_password); 
	SELECT SCOPE_IDENTITY() AS id;
END