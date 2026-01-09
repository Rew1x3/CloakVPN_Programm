import pg from 'pg'
const { Pool } = pg

// Парсим строку подключения
const parseConnectionString = (connectionString) => {
  const url = new URL(connectionString.replace('postgresql://', 'http://'))
  return {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1) || 'postgres',
    user: url.username,
    password: url.password,
    ssl: {
      rejectUnauthorized: false
    }
  }
}

// Строка подключения из переменной окружения
// Установите DATABASE_URL в .env файле или через переменные окружения
// Формат: postgresql://postgres:PASSWORD@db.ncjadpqxkekqprnvsbee.supabase.co:5432/postgres
const CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:[YOUR-PASSWORD]@db.ncjadpqxkekqprnvsbee.supabase.co:5432/postgres'

let pool = null

export const getPool = () => {
  if (!pool) {
    try {
      const config = parseConnectionString(CONNECTION_STRING)
      pool = new Pool(config)
      
      // Тестируем подключение
      pool.query('SELECT NOW()', (err) => {
        if (err) {
          console.error('Ошибка подключения к БД:', err)
        } else {
          console.log('Подключение к БД установлено')
        }
      })
    } catch (error) {
      console.error('Ошибка создания пула подключений:', error)
      throw error
    }
  }
  return pool
}

// Инициализация таблиц
export const initDatabase = async () => {
  const pool = getPool()
  
  try {
    // Создаем таблицу users если её нет
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        telegram_id BIGINT UNIQUE,
        telegram_username VARCHAR(255),
        telegram_first_name VARCHAR(255),
        telegram_last_name VARCHAR(255),
        telegram_photo_url TEXT,
        subscription_plan VARCHAR(50) DEFAULT 'free',
        subscription_expires_at TIMESTAMP,
        subscription_is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Создаем таблицу sessions если её нет
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Таблицы БД инициализированы')
  } catch (error) {
    console.error('Ошибка инициализации БД:', error)
    throw error
  }
}

// Функции для работы с пользователями
export const db = {
  // Поиск пользователя по email
  async findUserByEmail(email) {
    const pool = getPool()
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  },

  // Поиск пользователя по Telegram ID
  async findUserByTelegramId(telegramId) {
    const pool = getPool()
    const result = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    )
    return result.rows[0] || null
  },

  // Создание пользователя
  async createUser(userData) {
    const pool = getPool()
    const {
      email,
      name,
      passwordHash,
      telegramId,
      telegramUsername,
      telegramFirstName,
      telegramLastName,
      telegramPhotoUrl,
    } = userData

    const result = await pool.query(
      `INSERT INTO users (
        email, name, password_hash, telegram_id, telegram_username,
        telegram_first_name, telegram_last_name, telegram_photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        email,
        name,
        passwordHash || null,
        telegramId || null,
        telegramUsername || null,
        telegramFirstName || null,
        telegramLastName || null,
        telegramPhotoUrl || null,
      ]
    )
    return result.rows[0]
  },

  // Обновление пользователя
  async updateUser(userId, userData) {
    const pool = getPool()
    const updates = []
    const values = []
    let paramIndex = 1

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(userData[key])
        paramIndex++
      }
    })

    if (updates.length === 0) return null

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0]
  },

  // Получение пользователя по ID
  async getUserById(userId) {
    const pool = getPool()
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
    return result.rows[0] || null
  },
}

