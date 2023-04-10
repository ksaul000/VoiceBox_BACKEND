CREATE or ALTER PROCEDURE [dbo].[usp_add_or_update_react] 
           @UserId INT,
    @HotTakeId INT,
    @ReactType VARCHAR(50)
AS
BEGIN
    DECLARE @ReactTypeId INT

    SELECT @ReactTypeId = id FROM react_types WHERE type_name = @ReactType

    IF EXISTS (SELECT * FROM Reacts WHERE user_id = @UserId AND hot_take_id = @HotTakeId)
    BEGIN
        UPDATE Reacts SET react_type_id = @ReactTypeId WHERE user_id = @UserId AND hot_take_id = @HotTakeId
    END
    ELSE
    BEGIN
        INSERT INTO Reacts (user_id, hot_take_id, react_type_id) VALUES (@UserId, @HotTakeId, @ReactTypeId)
    END
END