import { useRef, useState } from "react";
import { colorFor, pretty } from "./Icons.jsx";

export default function Uploader({ previewUrl, fileName, onFile, onPredict, onClear, status, result }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const loading = status === "loading";
  const done = status === "done" && result;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="scanner">
      <div
        className={`vf ${dragging ? "is-dragging" : ""} ${loading ? "is-scanning" : ""}`}
        style={done ? { "--c": colorFor(result.predicted_class) } : undefined}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !previewUrl && inputRef.current?.click()}
        onKeyDown={(e) => { if (!previewUrl && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); inputRef.current?.click(); } }}
        role={previewUrl ? undefined : "button"}
        tabIndex={previewUrl ? -1 : 0}
        aria-label={previewUrl ? undefined : "Upload an image. Click, or drag and drop a file here."}
      >
        <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />

        {previewUrl ? (
          <img src={previewUrl} alt="Your uploaded photo" className="vf-img" />
        ) : (
          <div className="vf-empty">
            <span className="cross" aria-hidden="true" />
            <p className="vf-title">Drop a photo into the frame</p>
            <p className="vf-sub">or click to browse. JPG, PNG or WEBP, up to 10 MB.</p>
          </div>
        )}

        {loading && <div className="scanline" aria-hidden="true" />}
        {done && (
          <div className="lock">
            <strong>{pretty(result.predicted_class)}</strong>
            <span>{result.confidence.toFixed(2)}%</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
        />
      </div>

      <p className="filename" title={fileName}>{fileName || "No image selected yet"}</p>

      <div className="actions">
        <button className="btn ghost" onClick={() => inputRef.current?.click()} disabled={loading}>
          {previewUrl ? "Change image" : "Upload image"}
        </button>
        <button className="btn go" onClick={onPredict} disabled={!previewUrl || loading}>
          {loading ? "Scanning..." : "Predict"}
        </button>
        {previewUrl && <button className="btn quiet" onClick={onClear} disabled={loading}>Clear</button>}
      </div>
    </div>
  );
}
