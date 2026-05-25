import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
  import { getToken } from "@/lib/auth";

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrl) {
    setBaseUrl(apiBaseUrl);
  }

  // Otomatis kirim JWT token ke setiap request API
  setAuthTokenGetter(() => getToken());

  createRoot(document.getElementById("root")!).render(<App />);
  