-- Create session table for connect-pg-simple
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE
);

-- Create user_sections (categories) table
CREATE TABLE user_sections (
    section_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    section_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, section_name)
);

-- Create user_transactions table
CREATE TABLE user_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    section_id INTEGER REFERENCES user_sections(section_id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_sections_user_id ON user_sections(user_id);
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_section_id ON user_transactions(section_id);
CREATE INDEX idx_session_expire ON "session"(expire); 