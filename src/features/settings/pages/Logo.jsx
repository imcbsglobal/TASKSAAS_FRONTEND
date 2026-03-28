import { useEffect, useRef, useState } from "react";
import { getLogo, uploadLogo } from "../api/logoApi";
import "./Logo.scss";

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

const Logo = () => {
  const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getLogo()
      .then((data) => setCurrentLogoUrl(data.logo_url || null))
      .catch(() => setCurrentLogoUrl(null))
      .finally(() => setLoading(false));
  }, []);

  const validateAndSetFile = (file) => {
    setError("");
    setSuccess("");

    if (!file) return;

    // Block .ico files (Pillow on server can't process them reliably)
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
      setError("Please select a logo image first.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const data = await uploadLogo(selectedFile);
      setCurrentLogoUrl(data.logo_url);
      setSuccess("Logo updated successfully!");
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
      <div className="logo-page">
        <h2>Logo Settings</h2>
        <p className="subtitle">
          Upload your company logo. It will be shared across all admins with the
          same Client ID. Maximum file size is <strong>1 MB</strong>.
        </p>

        <div className="logo-card">
          {/* Current Logo Preview */}
          <div className="logo-preview-wrapper">
            <span className="logo-preview-label">Current Logo</span>
            {currentLogoUrl ? (
              <img
                src={currentLogoUrl}
                alt="Current company logo"
                className="logo-preview-img"
              />
            ) : (
              <div className="logo-placeholder">
                <span className="placeholder-icon">🖼️</span>
                <span>No logo uploaded yet</span>
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
            <div className="logo-preview-wrapper" style={{ marginBottom: 20 }}>
              <span className="logo-preview-label">New Logo Preview</span>
              <img
                src={preview}
                alt="New logo preview"
                className="logo-preview-img"
              />
            </div>
          )}

          {/* Error */}
          {error && <div className="logo-error">⚠️ {error}</div>}

          {/* Success */}
          {success && <div className="logo-success">✅ {success}</div>}

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
            ) : currentLogoUrl ? (
              "Update Logo"
            ) : (
              "Upload Logo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logo;
