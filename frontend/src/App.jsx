import { useEffect, useRef, useState } from "react";
import { checkHealth, predictImage } from "./api.js";
import { PROJECT } from "./config.js";
import Uploader from "./components/Uploader.jsx";
import Results from "./components/Results.jsx";
import Info from "./components/Info.jsx";
import { PawMark } from "./components/Icons.jsx";

const MAX_BYTES = 10 * 1024 * 1024;

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [server, setServer] = useState("checking"); // checking | online | offline
  const urlRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((h) => !cancelled && setServer(h.model_loaded ? "online" : "offline"))
      .catch(() => !cancelled && setServer("offline"));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const handleFile = (f) => {
    if (!f.type.startsWith("image/")) {
      setStatus("error"); setError("Please choose an image file (JPG, PNG or WEBP)."); return;
    }
    if (f.size > MAX_BYTES) {
      setStatus("error"); setError("That image is larger than 10 MB. Please choose a smaller one."); return;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(f);
    urlRef.current = url;
    setFile(f); setPreviewUrl(url); setResult(null); setError(""); setStatus("idle");
  };

  const handleClear = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setFile(null); setPreviewUrl(""); setResult(null); setError(""); setStatus("idle");
  };

  const handlePredict = async () => {
    if (!file) return;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const data = await predictImage(file);
      setResult(data); setStatus("done"); setServer("online");
    } catch (e) {
      setError(e.message); setStatus("error");
    }
  };

  const serverText = { checking: "Waking up the server...", online: "Model online", offline: "Server not reachable" }[server];

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top"><PawMark />{PROJECT.name}</a>
        <nav aria-label="Sections">
          <a href="#demo">Scan</a>
          <a href="#report">Report</a>
          <a href="#about">Build</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="orbs" aria-hidden="true"><i /><i /><i /></div>
          <h1>{PROJECT.name}</h1>
          <p className="hero-sub">{PROJECT.tagline}</p>
          <span className={`pill ${server}`}><i aria-hidden="true" />{serverText}</span>
        </section>

        <section id="demo" className="demo" aria-label="Classifier">
          <Uploader
            previewUrl={previewUrl}
            fileName={file?.name}
            onFile={handleFile}
            onPredict={handlePredict}
            onClear={handleClear}
            status={status}
            result={result}
          />
          <Results status={status} result={result} error={error} />
        </section>

        <Info project={PROJECT} />
      </main>

      <footer className="footer">
        <p>{PROJECT.fullTitle}. {PROJECT.badge}.</p>
      </footer>
    </>
  );
}
