import './TitleBar.css'
import logoImage from '../img/logo.jpg'

const TitleBar = () => {
  return (
    <div className="title-bar">
      <div className="title-bar-drag-region">
        <div className="title-bar-content">
          <div className="title-bar-logo">
            <img src={logoImage} alt="CloakVPN" className="logo-image" />
          </div>
        </div>
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-button minimize" onClick={() => window.electronAPI?.minimize?.()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="title-bar-button maximize" onClick={() => window.electronAPI?.maximize?.()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2H10V10H2V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="title-bar-button close" onClick={() => window.electronAPI?.close?.()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
