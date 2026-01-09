import { useState, useEffect } from 'react'
import './Loader.css'
import logoImage from '../img/logo.jpg'

const Loader = () => {
  const [currentText, setCurrentText] = useState(0)

  const loadingTexts = [
    'Ищем хост...',
    'Обходим провайдеров...',
    'Шифруем соединение...',
    'Активируем защиту...',
    'Подключаемся к сети...',
    'Проверяем безопасность...',
    'Инициализируем VPN...',
    'Настраиваем туннель...',
    'Сканируем серверы...',
    'Проверяем сертификаты...',
    'Устанавливаем протокол...',
    'Создаём зашифрованный канал...',
    'Маскируем IP-адрес...',
    'Активируем Kill Switch...',
    'Настраиваем DNS...',
    'Проверяем утечки...',
    'Загружаем конфигурацию...',
    'Подключаемся к серверам...',
    'Проверяем скорость соединения...',
    'Инициализируем шифрование...',
    'Активируем защиту от утечек...',
    'Настраиваем маршрутизацию...',
    'Проверяем целостность данных...',
    'Загружаем список локаций...',
    'Проверяем доступность серверов...',
    'Инициализируем протокол WireGuard...',
    'Настраиваем split tunneling...',
    'Активируем блокировку рекламы...',
    'Проверяем обновления...',
    'Финальная проверка безопасности...',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => {
        if (prev < loadingTexts.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const progress = Math.min(100, ((currentText + 1) / loadingTexts.length) * 100)

  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="loader-logo-wrapper">
          <img src={logoImage} alt="CloakVPN" className="loader-logo" />
          <div className="loader-pulse"></div>
        </div>
        
        <div className="loader-text-container">
          <div className="loader-text-wrapper" key={currentText}>
            <span className="loader-text">{loadingTexts[currentText]}</span>
            <span className="loader-dots">
              <span className="dot dot-1">.</span>
              <span className="dot dot-2">.</span>
              <span className="dot dot-3">.</span>
            </span>
          </div>
        </div>

        <div className="loader-progress">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  )
}

export default Loader
