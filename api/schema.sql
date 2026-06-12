-- NIZAMY Blog — Database Schema
-- Run this on your MySQL/MariaDB database via cPanel > phpMyAdmin or CLI

-- ============================================
-- Categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed categories
INSERT IGNORE INTO categories (name, slug, description) VALUES
    ('Fiqh Waris', 'fiqh-waris', 'Hukum waris Islam, faraidh, dan pembagian harta'),
    ('Zakat', 'zakat', 'Zakat fitrah, maal, dan perhitungan syariah'),
    ('Hafalan Quran', 'hafalan-quran', 'Tips dan metode menghafal Al-Quran'),
    ('Ekonomi Syariah', 'ekonomi-syariah', 'Prinsip ekonomi dan keuangan Islam'),
    ('Amal & Ibadah', 'amal-ibadah', 'Amal yaumi dan ibadah harian'),
    ('Klinik Finansial', 'klinik-finansial', 'Audit halal, cek riba, dan konsultasi syariah');

-- ============================================
-- Posts
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT DEFAULT '',
    content LONGTEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Fiqh Waris',
    tags JSON DEFAULT ('[]'),
    author VARCHAR(200) DEFAULT 'Tim NIZAMY',
    status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
    featured_image_url VARCHAR(500) DEFAULT NULL,
    featured_image_alt VARCHAR(500) DEFAULT NULL,
    photographer_name VARCHAR(200) DEFAULT NULL,
    photographer_url VARCHAR(500) DEFAULT NULL,
    unsplash_url VARCHAR(500) DEFAULT NULL,
    seo_title VARCHAR(600) DEFAULT '',
    seo_description TEXT DEFAULT '',
    focus_keyphrase VARCHAR(200) DEFAULT '',
    reading_time INT DEFAULT 5,
    source ENUM('manual', 'auto-generated') DEFAULT 'manual',
    published_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published (published_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Admin Users
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin (password: ChangeMe123! — change immediately after first login)
INSERT IGNORE INTO admin_users (username, password_hash) VALUES
    ('admin', '$2y$10$tZ26Y8U0Y0BwI7D17p7.GO4QjI2rF0rV5Qh2GfX5n98V9T6Xz9C4e');
