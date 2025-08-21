import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Tailwind base
const style = document.createElement("style");
style.innerHTML = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
