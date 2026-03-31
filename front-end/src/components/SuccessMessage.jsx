import React, { useEffect, useState } from 'react'

const SuccessMessage = ({ message, triggerKey, duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return undefined

    setVisible(true)

    const exitTimer = setTimeout(() => setVisible(false), duration)
    const cleanupTimer = setTimeout(() => {
      if (onClose) onClose()
    }, duration + 360)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(cleanupTimer)
    }
  }, [message, triggerKey, duration, onClose])

  if (!message) return null

  return (
    <>
      <style>{`
        .success-message {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translate(-50%, 0);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: #ffffff;
          color: #111111;
          border-radius: 10px;
          box-shadow: 0 6px 14px -12px rgba(0, 0, 0, 0.22), 0 3px 8px -10px rgba(0, 0, 0, 0.12);
          border: 1px solid #e5e7eb;
          font-weight: 600;
          z-index: 9999;
          pointer-events: none;
          width: max-content;
          max-width: calc(100vw - 28px);
          text-align: left;
        }

        .success-message__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .success-message__icon-svg {
          width: 100%;
          height: 100%;
        }

        .success-message__text {
          font-size: 17px;
          line-height: 1;
          font-weight: 600;
        }

        .success-message.enter {
          animation: success-message-in 0.35s ease-out forwards;
        }

        .success-message.exit {
          animation: success-message-out 0.35s ease-in forwards;
        }

        @keyframes success-message-in {
          from {
            opacity: 0;
            transform: translate(-50%, -140%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes success-message-out {
          from {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -140%);
          }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        className={`success-message ${visible ? 'enter' : 'exit'}`}
      >
        <span className="success-message__icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="success-message__icon-svg"
          >
            <circle cx="12" cy="12" r="12" fill="#22c55e" />
            <path
              d="M7 12.5l3 3 7-7"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="success-message__text">{message}</span>
      </div>
    </>
  )
}

export default SuccessMessage