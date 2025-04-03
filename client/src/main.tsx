import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import CreateSecretPage from "./pages/CreateSecretPage";
import SecondPage from "./pages/SecondPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateSecretPage />} />
        <Route path="/second" element={<SecondPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
