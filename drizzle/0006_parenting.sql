CREATE TABLE IF NOT EXISTS parenting_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (current_timestamp)
);

CREATE TABLE IF NOT EXISTS parenting_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES parenting_posts(id),
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT (current_timestamp)
);
