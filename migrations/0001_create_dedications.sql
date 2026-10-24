CREATE TABLE IF NOT EXISTS dedications (
	 id TEXT PRIMARY KEY NOT NULL,
	 name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 48),
	 message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 240),
	 color_index INTEGER NOT NULL CHECK (color_index BETWEEN 0 AND 3),
	 font_index INTEGER NOT NULL CHECK (font_index BETWEEN 0 AND 2),
	 created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS dedications_created_at_idx ON dedications (created_at DESC);
