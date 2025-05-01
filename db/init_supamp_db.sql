
-- CREATE DATABASE supmap_db;

-- Extension pour UUID aléatoire
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE : users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE : incident_types
CREATE TABLE IF NOT EXISTS incident_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insertion des types d’incidents
INSERT INTO incident_types (name) VALUES
('accident'),
('embouteillage'),
('route fermée'),
('contrôle policier'),
('obstacle')
ON CONFLICT DO NOTHING;

-- TABLE : active_incidents
CREATE TABLE IF NOT EXISTS active_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type_id INT REFERENCES incident_types(id),
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_count INT DEFAULT 0,
    denied_count INT DEFAULT 0
);

-- TABLE : archived_incidents
CREATE TABLE IF NOT EXISTS archived_incidents (
    id UUID PRIMARY KEY,
    user_id UUID,
    type_id INT,
    description TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    reported_at TIMESTAMP,
    resolved_at TIMESTAMP,
    confirmed_count INT,
    denied_count INT
);

-- ⚙️ Données de test
-- Insertion d’un utilisateur test
INSERT INTO users (username, email, password_hash)
VALUES ('testuser', 'test@supmap.com', crypt('password', gen_salt('bf')))
ON CONFLICT DO NOTHING;

-- Insertion d’un incident actif test
INSERT INTO active_incidents (user_id, type_id, description, latitude, longitude)
SELECT u.id, it.id, 'Accident sur la route A7', 45.764043, 4.835659
FROM users u, incident_types it
WHERE u.username = 'testuser' AND it.name = 'accident'
LIMIT 1;
