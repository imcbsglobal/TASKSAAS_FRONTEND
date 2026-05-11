import { useState, useEffect, useMemo } from "react";
import { clearTableAction } from "../api/developerOptionsApi";
import { FaDatabase, FaBoxOpen, FaBarcode, FaExclamationTriangle, FaServer, FaLock, FaShieldAlt } from "react-icons/fa";
import "./DeveloperOptions.scss";

// ── Captcha Gate ──────────────────────────────────────────────────────────────
const CaptchaGate = ({ onSuccess }) => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    // Expected value: current date in DD-MM-YYYY format
    const expectedCaptcha = useMemo(() => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }, []);

    const handleVerify = () => {
        if (input.trim() === expectedCaptcha) {
            setError("");
            onSuccess();
        } else {
            setError(`Incorrect. Enter today's date in DD-MM-YYYY format.`);
            setShake(true);
            setInput("");
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleVerify();
    };

    return (
        <div className="captcha-gate-overlay">
            <div className={`captcha-gate-box ${shake ? "shake" : ""}`}>
                <div className="captcha-gate-icon">
                    <FaShieldAlt />
                </div>
                <h2>Developer Access</h2>
                <p className="captcha-gate-subtitle">
                    This area is restricted. Enter today's date to continue.
                </p>
                <div className="captcha-hint">
                    Format: <code>DD-MM-YYYY</code>
                </div>
                <input
                    type="text"
                    className={`captcha-input ${error ? "captcha-input-error" : ""}`}
                    placeholder="e.g. 11-05-2026"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    maxLength={10}
                />
                {error && <p className="captcha-error">{error}</p>}
                <button className="captcha-btn" onClick={handleVerify}>
                    <FaLock style={{ marginRight: 8 }} /> Verify & Enter
                </button>
            </div>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const DeveloperOptions = () => {
    const [verified, setVerified] = useState(false);
    const [clientId, setClientId] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [actionLabel, setActionLabel] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.client_id) {
            setClientId(user.client_id);
        }
    }, []);

    const openConfirmation = (action, label) => {
        setSelectedAction(action);
        setActionLabel(label);
        setModalOpen(true);
    };

    const handleConfirm = async () => {
        if (!selectedAction) return;

        setLoading(true);
        setModalOpen(false);

        try {
            const result = await clearTableAction(selectedAction);
            alert(result.message);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
            setSelectedAction(null);
        }
    };

    // Show captcha gate until verified
    if (!verified) {
        return <CaptchaGate onSuccess={() => setVerified(true)} />;
    }

    return (
        <div className="developer-options-container">
            <div className="header-section">
                <h1><FaServer className="header-icon" /> Developer Console</h1>
                <p className="subtitle">Manage and reset system data for your client environment</p>
            </div>

            <div className="client-info-banner">
                <div className="info-content">
                    <span className="label">Active Environment</span>
                    <span className="value">Client ID: <strong>{clientId}</strong></span>
                </div>
                <div className="status-badge">Level 3 Access</div>
            </div>

            <div className="actions-grid">
                <div className="action-card warning-level-high">
                    <div className="card-icon">
                        <FaDatabase />
                    </div>
                    <h3>ACC_MASTER</h3>
                    <p>Permanently remove all account master records. This includes customer and vendor data.</p>
                    <button
                        className="action-btn danger"
                        onClick={() => openConfirmation("clear_acc_master", "Clear ACC_MASTER")}
                        disabled={loading}
                    >
                        Clear Data
                    </button>
                </div>

                <div className="action-card warning-level-medium">
                    <div className="card-icon">
                        <FaBoxOpen />
                    </div>
                    <h3>ACC_PRODUCT</h3>
                    <p>Remove all product definitions. Inventory links will be broken.</p>
                    <button
                        className="action-btn danger"
                        onClick={() => openConfirmation("clear_acc_product", "Clear ACC_PRODUCT")}
                        disabled={loading}
                    >
                        Clear Data
                    </button>
                </div>

                <div className="action-card warning-level-medium">
                    <div className="card-icon">
                        <FaBarcode />
                    </div>
                    <h3>ACC_PRODUCTBATCH</h3>
                    <p>Clear all batch and pricing information associated with products.</p>
                    <button
                        className="action-btn danger"
                        onClick={() => openConfirmation("clear_acc_productbatch", "Clear ACC_PRODUCTBATCH")}
                        disabled={loading}
                    >
                        Clear Data
                    </button>
                </div>
            </div>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FaExclamationTriangle className="warning-icon" />
                            <h3>Confirm Destructive Action</h3>
                        </div>

                        <div className="modal-body">
                            <p>You are about to <strong>{actionLabel}</strong>.</p>
                            <div className="warning-box">
                                <p>This process is <strong>irreversible</strong>.</p>
                                <p>All data for Client ID <code>{clientId}</code> in this table will be permanently wiped.</p>
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button onClick={() => setModalOpen(false)} className="btn-cancel">Cancel</button>
                            <button onClick={handleConfirm} className="btn-confirm">Yes, Delete Everything</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperOptions;