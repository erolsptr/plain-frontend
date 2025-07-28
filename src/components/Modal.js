import React from 'react';
import './Modal.css'; // Birazdan bu CSS dosyasını da oluşturacağız

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null; // Eğer modal açık değilse, hiçbir şey gösterme
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          × {/* Bu, 'X' (çarpı) işaretidir */}
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;