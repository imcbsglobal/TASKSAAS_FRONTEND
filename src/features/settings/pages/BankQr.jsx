import { useEffect, useRef, useState } from "react";
import { getBankQr, uploadBankQr } from "../api/bankQrApi";
import "./BankQr.scss";

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

const BankQr = () => {
  const [currentBankQrUrl, setCurrentBankQrUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getBankQr()
      .then((data) => setCurrentBankQrUrl(data.bank_qr_url || null))
      .catch(() => setCurrentBankQrUrl(null))
      .finally(() => setLoading(false));
  }, []);

  const validateAndSetFile = (file) => {
    setError("");
    setSuccess("");

    if (!file) return;

    // Block .ico files
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "ico") {
      setError("ICO files are not supported. Please use JPG, PNG, SVG, or GIF.");
      return;
    }

    // Must be a web image
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, GIF, SVG, or WebP images are allowed.");
      return;
    }

    // Max 1 MB
    if (file.size > MAX_SIZE_BYTES) {
      setError(
        `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum allowed size is 1 MB.`
      );
      return;
    }

    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a Bank QR image first.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const data = await uploadBankQr(selectedFile);
      setCurrentBankQrUrl(data.bank_qr_url);
      setSuccess("Bank QR updated successfully!");
      clearFile();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div className="all-body">
      <div className="bank-qr-page">
        <h2>Bank QR Settings</h2>
        <p className="subtitle">
          Upload your bank QR image. This will be used for customer payments.
          Maximum file size is <strong>1 MB</strong>.
        </p>

        <div className="bank-qr-card">
          {/* Current QR Preview */}
          <div className="qr-preview-wrapper">
            <span className="qr-preview-label">Current Bank QR</span>
            {currentBankQrUrl ? (
              <img
                src={currentBankQrUrl}
                alt="Current bank QR"
                className="qr-preview-img"
              />
            ) : (
              <div className="qr-placeholder">
                <span className="placeholder-icon">📷</span>
                <span>No QR uploaded yet</span>
              </div>
            )}
          </div>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="drop-icon">📁</div>
            <p className="drop-text">Click to browse or drag &amp; drop</p>
            <p className="drop-hint">JPG, PNG, SVG, GIF, WebP — max 1 MB (no ICO)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              onChange={handleFileChange}
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="file-info">
              <span className="file-info-name">
                🖼️ {selectedFile.name}
              </span>
              <span className="file-info-size">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <button
                className="file-clear-btn"
                onClick={clearFile}
                title="Remove selected file"
              >
                ✕
              </button>
            </div>
          )}

          {/* New Preview (when file selected) */}
          {preview && (
            <div className="qr-preview-wrapper" style={{ marginBottom: 20 }}>
              <span className="qr-preview-label">New QR Preview</span>
              <img
                src={preview}
                alt="New QR preview"
                className="qr-preview-img"
              />
            </div>
          )}

          {/* Error */}
          {error && <div className="qr-error">⚠️ {error}</div>}

          {/* Success */}
          {success && <div className="qr-success">✅ {success}</div>}

          {/* Upload Button */}
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner" />
                Uploading…
              </>
            ) : currentBankQrUrl ? (
              "Update Bank QR"
            ) : (
              "Upload Bank QR"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankQr;
