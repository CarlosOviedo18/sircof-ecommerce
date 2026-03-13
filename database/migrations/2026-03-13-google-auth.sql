-- Google Auth migration for existing databases
-- Run this once on the same database used by the app.

ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;

SET @has_google_column := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'google_id'
);

SET @add_google_column_sql := IF(
  @has_google_column = 0,
  'ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL AFTER password',
  'SELECT "google_id column already exists"'
);

PREPARE add_google_column_stmt FROM @add_google_column_sql;
EXECUTE add_google_column_stmt;
DEALLOCATE PREPARE add_google_column_stmt;

SET @has_google_index := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND index_name = 'uq_users_google_id'
);

SET @add_google_index_sql := IF(
  @has_google_index = 0,
  'ALTER TABLE users ADD UNIQUE INDEX uq_users_google_id (google_id)',
  'SELECT "uq_users_google_id index already exists"'
);

PREPARE add_google_index_stmt FROM @add_google_index_sql;
EXECUTE add_google_index_stmt;
DEALLOCATE PREPARE add_google_index_stmt;
