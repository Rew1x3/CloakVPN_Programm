-- SQL скрипт для создания таблицы users в Supabase
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- Создаем таблицу users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'yearly', 'family')),
  subscription_expires_at TIMESTAMPTZ,
  subscription_is_active BOOLEAN DEFAULT true,
  telegram_id BIGINT UNIQUE,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  telegram_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Включаем Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они существуют
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Политика: пользователи могут читать только свои данные
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Политика: пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Политика: пользователи могут создавать свой профиль
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политика для сервисной роли (для создания профилей через API)
-- ВАЖНО: Эта политика позволяет создавать профили для других пользователей
-- Используется только в databaseService для создания профилей при регистрации
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() = id
  );

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);

