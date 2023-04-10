
use voicebox;
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]'))
BEGIN
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

ALTER TABLE users ADD tokens INT NOT NULL DEFAULT 0 CHECK (tokens >= 0);

END