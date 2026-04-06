"use client";

import { useState, useRef } from "react";
import styles from "./analyzer.module.css";


const DEFAULT_PROMPT = "What is in this image? Be precise.";


export default function Home() {
  // "url" | "upload"
  const [mode, setMode] = useState("url");

  const [imageUrl, setImageUrl] = useState();
  // For local upload — we store the base64 data URL
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);


  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // ── File → base64 ───────────────────────────────────────────
  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result); // base64 data URL
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    loadFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const imageSource = mode === "upload" ? uploadedImage : imageUrl;

    if (!imageSource) {
      setError(mode === "upload" ? "Please upload an image first." : "Image URL is required.");
      setLoading(false);
      return;
    }

    const expectedKeywords = [];
    const userPrompt = prompt.trim() || DEFAULT_PROMPT;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageSource, expectedKeywords, prompt: userPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Active preview (whichever mode)
  const previewSrc = mode === "upload" ? uploadedImage : imageUrl;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🔍</span>
            <span className={styles.logoText}>GroqVision</span>
          </div>
          <p className={styles.headerSub}>
            AI-powered image analysis · Llama 4 Scout
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Left: Form */}
        <section className={styles.formSection}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Analyze an Image</h2>
            <p className={styles.cardDesc}>
              Use a URL or upload a local file, then optionally add keywords to
              check accuracy.
            </p>

            {/* Mode tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${mode === "url" ? styles.tabActive : ""}`}
                onClick={() => { setMode("url"); setResult(null); setError(null); }}
              >
                🔗 Image URL
              </button>
              <button
                type="button"
                className={`${styles.tab} ${mode === "upload" ? styles.tabActive : ""}`}
                onClick={() => { setMode("upload"); setResult(null); setError(null); }}
              >
                📁 Upload File
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* URL mode */}
              {mode === "url" && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="imageUrl">
                    Image URL
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    className={styles.input}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              )}

              {/* Upload mode */}
              {mode === "upload" && (
                <div className={styles.field}>
                  <label className={styles.label}>Local Image</label>
                  <div
                    className={`${styles.dropzone} ${dragOver ? styles.dropzoneOver : ""} ${uploadedImage ? styles.dropzoneFilled : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadedImage ? (
                      <div className={styles.dropzoneContent}>
                        <span className={styles.dropzoneCheck}>✅</span>
                        <span className={styles.dropzoneName}>{uploadedFileName}</span>
                        <span className={styles.dropzoneChange}>Click to change</span>
                      </div>
                    ) : (
                      <div className={styles.dropzoneContent}>
                        <span className={styles.dropzoneIcon}>📂</span>
                        <span className={styles.dropzoneText}>
                          Drag &amp; drop or <u>click to browse</u>
                        </span>
                        <span className={styles.dropzoneSub}>
                          JPG, PNG, GIF, WebP — max 10 MB
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className={styles.fileInputHidden}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}


              {/* Prompt */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="prompt">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  className={styles.textarea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything about the image…"
                  rows={3}
                />
              </div>

              {/* Preview */}
              {previewSrc && (
                <div className={styles.previewWrapper}>
                  <p className={styles.previewLabel}>Preview</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className={styles.preview}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? (
                  <span className={styles.btnLoading}>
                    <span className={styles.spinner} />
                    Analyzing…
                  </span>
                ) : (
                  "Analyze Image"
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Right: Results */}
        <section className={styles.resultSection}>
          {!result && !error && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🖼️</div>
              <p className={styles.emptyText}>
                Results will appear here after analysis.
              </p>
            </div>
          )}

          {loading && (
            <div className={styles.emptyState}>
              <div className={styles.pulseRing} />
              <p className={styles.emptyText}>Sending to Groq API…</p>
            </div>
          )}

          {error && (
            <div className={styles.errorCard}>
              <span className={styles.errorIcon}>⚠️</span>
              <p className={styles.errorMsg}>{error}</p>
            </div>
          )}

          {result && (
            <>
              <div className={styles.responseCard}>
                <div className={styles.responseHeader}>
                  <span className={styles.responseIcon}>🤖</span>
                  <span className={styles.responseTitle}>Model Response</span>
                </div>
                <p className={styles.responseText}>{result.response}</p>
              </div>

              <div className={styles.meta}>
                <span>Model: meta-llama/llama-4-scout-17b-16e-instruct</span>
                <span>·</span>
                <span>via Groq API</span>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
