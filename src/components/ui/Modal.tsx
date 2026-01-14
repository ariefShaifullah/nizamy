import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 1. Handle Focus Management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Small timeout to allow render in portal
      setTimeout(() => {
          const modalElement = modalRef.current;
          if (modalElement) {
            const focusableElements = modalElement.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            } else {
              modalElement.focus();
            }
          }
      }, 50);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // 2. Handle Scroll Locking (Prevent background scroll)
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 3. Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Use Portal to render outside root div, avoiding z-index/stacking context issues with Header
  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" aria-modal="true" role="dialog">
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden transform transition-all scale-100 animate-fade-in-up border border-slate-100 dark:border-slate-700 outline-none max-h-[90vh] flex flex-col`}
      >
        {(title || onClose) && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                {title && <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>}
                {onClose && (
                    <button 
                      onClick={onClose} 
                      className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Tutup Modal"
                    >
                        <span className="icon-wrapper w-4 h-4 flex items-center justify-center"><FaTimes /></span>
                    </button>
                )}
            </div>
        )}
        <div className="text-slate-800 dark:text-slate-200 overflow-y-auto custom-scrollbar flex-1 min-h-0">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};