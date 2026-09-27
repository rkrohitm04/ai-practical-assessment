/* eslint-disable react/prop-types */
export default function AlertBanner({ variant = 'error', title, message, onDismiss }) {
  if (!message) return null

  return (
    <div className={`alert alert-${variant}`} role="alert">
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        <p className="alert-message">{message}</p>
      </div>
      {onDismiss && (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
}
