import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// fade out the launch splash once the app has painted
requestAnimationFrame(() => {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.style.opacity = "0";
  setTimeout(() => splash.remove(), 450);
});
