import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "GroqVision — AI Image Analyzer",
  description:
    "Analyze images with Groq's Llama 4 Scout multimodal model and evaluate response accuracy against expected keywords.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
