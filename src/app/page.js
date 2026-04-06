"use client";

import { useState, useRef } from "react";

// MUI Layout
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
// MUI AppBar
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
// MUI Inputs
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
// MUI Navigation
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
// MUI Feedback
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
// MUI Typography
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import LinkIcon from "@mui/icons-material/Link";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ImageIcon from "@mui/icons-material/Image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const DEFAULT_PROMPT = "What is in this image? Be precise.";

export default function Home() {
  const [mode, setMode] = useState(0); // 0 = URL, 1 = Upload
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // ── File → base64 ─────────────────────────────────────────────
  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) { loadFile(e.target.files[0]); }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  }

  // ── Submit ─────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const imageSource = mode === 1 ? uploadedImage : imageUrl;

    if (!imageSource) {
      setError(mode === 1 ? "Please upload an image first." : "Image URL is required.");
      setLoading(false);
      return;
    }

    const userPrompt = prompt.trim() || DEFAULT_PROMPT;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageSource,
          expectedKeywords: [],
          prompt: userPrompt,
        }),
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

  const previewSrc = mode === 1 ? uploadedImage : imageUrl;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,92,252,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(91,138,247,0.1) 0%, transparent 60%), #0d0e14",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(13,14,20,0.85)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, md: 4 } }}>
          <SearchIcon sx={{ color: "primary.main", mr: 1.5, fontSize: 26 }} />
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              background: "linear-gradient(100deg, #7c5cfc, #5b8af7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.3px",
              flexGrow: 1,
            }}
          >
            GroqVision
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            AI-powered image analysis · Llama 4 Scout
          </Typography>
        </Toolbar>
        {loading && <LinearProgress color="primary" sx={{ height: 2 }} />}
      </AppBar>

      {/* ── Main ── */}
      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        <Grid container spacing={3} alignItems="flex-start">

          {/* Left: Form */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 3,
                background: "#1a1d2e",
              }}
            >
              <Typography variant="h5" fontWeight={700} letterSpacing="-0.4px" mb={0.5}>
                Analyze an Image
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3} lineHeight={1.7}>
                Use a URL or upload a local file. Type a custom prompt to ask anything about the image.
              </Typography>

              {/* Mode Tabs */}
              <Box
                sx={{
                  background: "#20243a",
                  borderRadius: 2,
                  p: 0.5,
                  mb: 3,
                }}
              >
                <Tabs
                  value={mode}
                  onChange={(_, v) => { setMode(v); setResult(null); setError(null); }}
                  variant="fullWidth"
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{
                    minHeight: 40,
                    "& .MuiTab-root": {
                      minHeight: 40,
                      borderRadius: 1.5,
                      color: "text.secondary",
                      transition: "all 0.2s",
                    },
                    "& .Mui-selected": {
                      background: "linear-gradient(135deg, #7c5cfc, #5b8af7)",
                      color: "#fff !important",
                      borderRadius: 1.5,
                    },
                  }}
                >
                  <Tab icon={<LinkIcon fontSize="small" />} iconPosition="start" label="Image URL" />
                  <Tab icon={<FolderOpenIcon fontSize="small" />} iconPosition="start" label="Upload File" />
                </Tabs>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                {/* URL Input */}
                {mode === 0 && (
                  <TextField
                    id="imageUrl"
                    label="Image URL"
                    type="url"
                    fullWidth
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    variant="outlined"
                    size="small"
                  />
                )}

                {/* Upload Dropzone */}
                {mode === 1 && (
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.primary" mb={1} display="block">
                      Local Image
                    </Typography>
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      sx={{
                        minHeight: 120,
                        border: `2px dashed`,
                        borderColor: uploadedImage
                          ? "primary.main"
                          : dragOver
                            ? "primary.main"
                            : "rgba(255,255,255,0.12)",
                        borderRadius: 2,
                        background: dragOver
                          ? "rgba(124,92,252,0.08)"
                          : uploadedImage
                            ? "rgba(124,92,252,0.05)"
                            : "#20243a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 1,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          background: "rgba(124,92,252,0.07)",
                        },
                      }}
                    >
                      {uploadedImage ? (
                        <>
                          <CheckCircleIcon sx={{ color: "success.main", fontSize: 32 }} />
                          <Typography variant="body2" fontWeight={600}>{uploadedFileName}</Typography>
                          <Typography variant="caption" color="primary.main">Click to change</Typography>
                        </>
                      ) : (
                        <>
                          <UploadFileIcon sx={{ fontSize: 36, opacity: 0.4 }} />
                          <Typography variant="body2" color="text.secondary">
                            Drag &amp; drop or <u>click to browse</u>
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            JPG, PNG, GIF, WebP — max 10 MB
                          </Typography>
                        </>
                      )}
                    </Box>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Box>
                )}

                {/* Prompt */}
                <TextField
                  id="prompt"
                  label="Prompt"
                  fullWidth
                  multiline
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything about the image…"
                  variant="outlined"
                  size="small"
                />

                {/* Preview */}
                {previewSrc && (
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.8} textTransform="uppercase" display="block" mb={1}>
                      Preview
                    </Typography>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSrc}
                      alt="Preview"
                      onError={(e) => (e.target.style.display = "none")}
                      style={{
                        width: "100%",
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.07)",
                        display: "block",
                      }}
                    />
                  </Box>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  size="large"
                  sx={{
                    mt: 0.5,
                    py: 1.5,
                    background: "linear-gradient(135deg, #7c5cfc, #5b8af7)",
                    "&:hover": { opacity: 0.9, background: "linear-gradient(135deg, #7c5cfc, #5b8af7)" },
                    "&:disabled": { opacity: 0.55 },
                  }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                >
                  {loading ? "Analyzing…" : "Analyze Image"}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right: Results */}
          <Grid item size={{ xs: 12, md: 6 }}>
            {/* Empty state */}
            {!result && !error && !loading && (
              <Paper
                elevation={0}
                sx={{
                  minHeight: 340,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  background: "#1a1d2e",
                  p: 4,
                }}
              >
                <ImageIcon sx={{ fontSize: 56, opacity: 0.2 }} />
                <Typography variant="body2" color="text.disabled" textAlign="center">
                  Results will appear here after analysis.
                </Typography>
              </Paper>
            )}

            {/* Loading */}
            {loading && (
              <Paper
                elevation={0}
                sx={{
                  minHeight: 340,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2.5,
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 3,
                  background: "#1a1d2e",
                  p: 4,
                }}
              >
                <CircularProgress color="primary" size={52} thickness={3} />
                <Typography variant="body2" color="text.secondary">
                  Sending to Groq API…
                </Typography>
              </Paper>
            )}

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                icon={<CancelIcon />}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#fca5a5",
                  "& .MuiAlert-icon": { color: "#ef4444" },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Result */}
            {result && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Response card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 3,
                    background: "#1a1d2e",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, pb: 2, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <SmartToyIcon sx={{ color: "primary.main" }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.8} textTransform="uppercase">
                      Model Response
                    </Typography>
                  </Box>
                  <Typography variant="body2" lineHeight={1.8} sx={{ whiteSpace: "pre-wrap" }}>
                    {result.response}
                  </Typography>
                </Paper>

                {/* Meta */}
                <Typography variant="caption" color="text.disabled" sx={{ px: 0.5 }}>
                  Model: meta-llama/llama-4-scout-17b-16e-instruct · via Groq API
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
