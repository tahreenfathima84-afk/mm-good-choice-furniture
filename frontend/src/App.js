import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import Home from "@/pages/Home";
import Owner from "@/pages/Owner";
import { api } from "@/lib/api";

function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = new URLSearchParams(location.hash.replace("#", "")).get("session_id");
    api
      .post("/auth/session", { session_id: sessionId })
      .then((r) => {
        window.history.replaceState(null, "", "/owner");
        navigate("/owner", { state: { user: r.data }, replace: true });
      })
      .catch(() => navigate("/owner", { replace: true }));
  }, [location.hash, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-espresso">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-4 font-btn text-sm font-semibold text-cream/70">Signing you in...</p>
      </div>
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/owner" element={<Owner />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
