// src/components/common/ConfirmModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import './ConfirmModal.scss'

export default function ConfirmModal({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="confirm_modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="confirm_container"
                        initial={{ scale: 0.85, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <h3 className="confirm_title">{title}</h3>
                        {typeof message === "string" ? <p className="confirm_text">{message}</p> : message}

                        <div className="confirm_buttons">
                            <button className="btn secondary" onClick={onCancel} disabled={loading}>
                                {cancelText}
                            </button>
                            <button className="btn primary" onClick={onConfirm} disabled={loading}>
                                {loading ? "Processing..." : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
