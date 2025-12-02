-- Create Database
CREATE DATABASE IF NOT EXISTS music_store;
USE music_store;

-- 1. Table: User
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' COMMENT 'customer or admin',
    address TEXT,
    
    -- Audit & Soft Delete
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '0: Active, 1: Deleted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Table: Instrument
CREATE TABLE Instrument (
    instrument_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    
    -- Audit & Soft Delete
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Table: Sale (Links User and Instrument directly as requested)
CREATE TABLE Sale (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    instrument_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, paid, shipped',
    
    -- Audit & Soft Delete (Useful for cancelled orders)
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Relationships
    CONSTRAINT fk_sale_user FOREIGN KEY (user_id) 
        REFERENCES User(user_id),
    CONSTRAINT fk_sale_instrument FOREIGN KEY (instrument_id) 
        REFERENCES Instrument(instrument_id)
);

-- 4. Table: Payment
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit & Soft Delete
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Relationship
    CONSTRAINT fk_payment_sale FOREIGN KEY (sale_id) 
        REFERENCES Sale(sale_id)
);