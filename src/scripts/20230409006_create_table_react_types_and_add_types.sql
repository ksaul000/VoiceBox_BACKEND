IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[react_types]'))
BEGIN

CREATE TABLE react_types (
  id INT PRIMARY KEY IDENTITY(1,1),
  type_name VARCHAR(50)
);

INSERT INTO react_types (type_name) 
VALUES ('AGREE'), ('Opinion Is Unclear'), ('DISAGREE');

END