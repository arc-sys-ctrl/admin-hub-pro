import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import clothing1 from "@/assets/clothing-1.jpg";
import clothing2 from "@/assets/clothing-2.jpg";
import clothing3 from "@/assets/clothing-3.jpg";
import clothing4 from "@/assets/clothing-4.jpg";
import clothing5 from "@/assets/clothing-5.jpg";
import clothing6 from "@/assets/clothing-6.jpg";
import clothing7 from "@/assets/clothing-7.jpg";
import clothing8 from "@/assets/clothing-8.jpg";

const images = [clothing1, clothing2, clothing3, clothing4, clothing5, clothing6, clothing7, clothing8];
const doubledImages = [...images, ...images, ...images];

/** App shell: #0A0E14 — accent #00D1FF */
const BG = "#0A0E14";
const ACCENT = "#00D1FF";

function extractErrorDetail(data: unknown): string {
  if (typeof data !== "object" || data === null) return "";
  const o = data as { details?: unknown; error?: unknown; message?: unknown };
  if (typeof o.details === "string" && o.details.trim()) return o.details.trim();
  if (typeof o.error === "string" && o.error.trim()) return o.error.trim();
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  return "";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"logo" | "login">("logo");
  const [apiStatus, setApiStatus] = useState<"idle" | "checking" | "ok" | "offline">("idle");
  const { toast } = useToast();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setPhase("login"), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "login") return;
    let cancelled = false;
    setApiStatus("checking");
    api
      .get("/health", { timeout: 5000 })
      .then(() => {
        if (!cancelled) setApiStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setApiStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (user.role !== "admin") {
        toast({
          title: "Access denied",
          description: "This portal is for administrators only.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("sophix_token", token);
      localStorage.setItem("sophix_user", JSON.stringify(user));
      setUser(user);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.full_name}`,
      });

      navigate("/");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
        code?: string;
        message?: string;
        config?: { url?: string };
      };
      const status = err.response?.status;
      const serverMsg = extractErrorDetail(err.response?.data);
      // 401/400 are expected auth failures — avoid console.error so devtools are not mistaken for a crash.
      if (status === 401 || status === 400) {
        console.info("[Login]", status, serverMsg || err.response?.data);
      } else {
        console.error("[Login Error Trace]", {
          status,
          data: err.response?.data,
          message: err.message,
          url: err.config?.url,
        });
      }

      let errorMessage = "An error occurred during login.";
      const isNetworkish =
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNABORTED" ||
        (typeof err.message === "string" &&
          (err.message === "Network Error" || err.message.toLowerCase().includes("network")));

      if (err.response?.status === 502) {
        const detail = extractErrorDetail(err.response?.data);
        errorMessage = detail
          ? detail
          : "Cannot reach the hosted Sophix API. Verify VITE_API_URL points to https://sophix-backend.onrender.com/api and redeploy/restart the CRM.";
      } else if (isNetworkish && !err.response) {
        errorMessage =
          "Cannot reach the hosted API. Ensure VITE_API_URL is set to https://sophix-backend.onrender.com/api and the backend service is healthy.";
      } else if (err.response?.status === 400) {
        errorMessage = serverMsg || "Email and password are required.";
      } else if (err.response?.status === 401) {
        errorMessage =
          serverMsg ||
          "Invalid email or password. For a fresh install, seed the admin database (infrastructure/db/admin_schema.sql).";
      } else if (err.response?.status === 500) {
        const detail = extractErrorDetail(err.response?.data);
        errorMessage = detail
          ? detail
          : "Server error. Start the API on port 5000 and ensure Postgres is reachable.";
      } else if (err.response?.data && typeof err.response.data === "object" && "error" in err.response.data) {
        errorMessage = String((err.response.data as { error?: string }).error ?? errorMessage);
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const titleGradient = {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: `linear-gradient(135deg, ${ACCENT}, hsl(195, 100%, 72%), ${ACCENT})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  } as const;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: BG }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex gap-3 h-full">
          {[0, 1, 2, 3, 4, 5].map((colIdx) => (
            <div key={colIdx} className="flex-1 min-w-[180px] overflow-hidden">
              <div
                className={`flex flex-col gap-3 ${colIdx % 2 === 0 ? "animate-grid-scroll" : ""}`}
                style={{
                  animationDuration: `${40 + colIdx * 8}s`,
                  animationDirection: colIdx % 2 === 0 ? "normal" : "reverse",
                  transform: colIdx % 2 !== 0 ? "translateY(-25%)" : undefined,
                  animation: `grid-scroll ${40 + colIdx * 8}s linear infinite ${colIdx % 2 !== 0 ? "reverse" : "normal"}`,
                }}
              >
                {doubledImages.map((img, imgIdx) => (
                  <div
                    key={`${colIdx}-${imgIdx}`}
                    className="relative rounded-lg overflow-hidden aspect-[2/3] shrink-0"
                  >
                    <img
                      src={images[(colIdx + imgIdx) % images.length]}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 30%, hsla(191, 100%, 50%, 0.08) 0%, transparent 55%),
              radial-gradient(ellipse at center, hsla(212, 43%, 8%, 0.75) 0%, hsla(212, 43%, 5%, 0.92) 70%, ${BG} 100%),
              linear-gradient(to bottom, hsla(212, 43%, 5%, 0.4) 0%, transparent 22%, transparent 78%, ${BG} 100%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {phase === "logo" && (
          <div className="flex flex-col items-center animate-logo-draw">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight animate-logo-glow" style={titleGradient}>
                Sophix
              </h1>
              <div
                className="absolute -inset-4 rounded-3xl opacity-25 blur-3xl -z-10"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, hsl(195, 100%, 55%))` }}
              />
            </div>
            <p
              className="mt-4 text-lg tracking-[0.35em] uppercase opacity-0"
              style={{
                color: "hsl(215, 14%, 58%)",
                animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards",
              }}
            >
              Admin CRM
            </p>
          </div>
        )}

        {phase === "login" && (
          <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "0s" }}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight animate-logo-glow" style={titleGradient}>
                Sophix
              </h1>
              <p className="text-muted-foreground text-sm mt-2 tracking-widest uppercase">Admin CRM</p>
            </div>

            {apiStatus === "offline" && (
              <div
                className="mb-4 flex gap-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "hsla(191, 100%, 50%, 0.35)",
                  background: "hsla(214, 22%, 11%, 0.9)",
                  color: "hsl(210, 20%, 92%)",
                }}
                role="alert"
              >
                <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: ACCENT }} />
                <div>
                  <p className="font-medium" style={{ color: ACCENT }}>
                    API unreachable
                  </p>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    CRM cannot reach the hosted backend. Set{" "}
                    <code className="text-foreground/90">VITE_API_URL=https://sophix-backend.onrender.com/api</code>{" "}
                    and restart/redeploy admin-side.
                  </p>
                </div>
              </div>
            )}

            <div className="glass-card-strong rounded-2xl p-8 glow-accent">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@yourstore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_28px_hsla(191,100%,50%,0.35)]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-muted-foreground/40 text-xs mt-6">© 2026 Sophix. All rights reserved.</p>
          </div>
        )}
      </div>
    </div>
  );
}
