// src/components/common/BaseModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import './BaseModal.scss'
import { FaTimes } from "react-icons/fa";
export default function BaseModal({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
}) {
    
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirm_modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeOnBackdropClick ? onClose : undefined}
        >
          <motion.div
            className="confirm__container"
            initial={{ scale: 0.85, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <div className="closs_cross">
              <FaTimes className="close-icon" onClick={onClose} style={{ cursor: "pointer" }} />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
