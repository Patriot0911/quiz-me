'use client';

import type { IModalProps } from '@/interfaces/shared/modal';
import { AnimatePresence, motion, } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import Loading from '../Loading';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';
import ModalHeader from './components/ModalHeader';
import ModalFormBody from './components/ModalFormBody';
import ModalFooter from './components/ModalFooter';
import ModalContent from './components/ModalContent';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const Modal = ({ children, isOpen, isLoading, className, size, onClose, }: IModalProps) => {

  useEffect(() => {
    if (!isOpen) return;

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, onClose]);

  if (typeof window !== 'object') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          variants={overlayVariants}
          initial='hidden'
          animate='visible'
          exit='hidden'
          transition={{ duration: 0.3 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(styles.modal, className, size && styles[size])}
            variants={modalVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
            <motion.div
              className={
                cn(
                  styles['loading-overlay'],
                  !isLoading && styles['loading-overlay__hidden']
                )
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoading ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading && <Loading />}
            </motion.div>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

Modal.Header = ModalHeader;
Modal.FormBody = ModalFormBody;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
