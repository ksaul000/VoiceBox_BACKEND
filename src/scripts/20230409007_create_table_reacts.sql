IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reacts]'))
BEGIN

CREATE TABLE Reacts (
  id INT PRIMARY KEY IDENTITY(1,1),
  user_id INT FOREIGN KEY REFERENCES users(id),
  hot_take_id INT FOREIGN KEY REFERENCES hot_takes(id),
  react_type_id INT FOREIGN KEY REFERENCES react_types(id)
);

END