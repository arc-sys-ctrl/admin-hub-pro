import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"logo" | "login">("logo");
  const { toast } = useToast();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setPhase("login"), 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (user.role !== 'admin') {
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
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.error || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "hsl(0 0% 5%)" }}>
      {/* Netflix-style scrolling image grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex gap-3 h-full">
          {[0, 1, 2, 3, 4, 5].map((colIdx) => (
            <div
              key={colIdx}
              className="flex-1 min-w-[180px] overflow-hidden"
            >
              <div
                className={`flex flex-col gap-3 ${colIdx % 2 === 0 ? 'animate-grid-scroll' : ''}`}
                style={{
                  animationDuration: `${40 + colIdx * 8}s`,
                  animationDirection: colIdx % 2 === 0 ? "normal" : "reverse",
                  transform: colIdx % 2 !== 0 ? "translateY(-25%)" : undefined,
                  animation: `grid-scroll ${40 + colIdx * 8}s linear infinite ${colIdx % 2 !== 0 ? 'reverse' : 'normal'}`,
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
        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at center, hsla(0,0%,5%,0.6) 0%, hsla(0,0%,5%,0.85) 70%, hsla(0,0%,5%,0.95) 100%),
              linear-gradient(to bottom, hsla(0,0%,5%,0.3) 0%, transparent 20%, transparent 80%, hsla(0,0%,5%,1) 100%)
            `,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo Animation Phase */}
        {phase === "logo" && (
          <div className="flex flex-col items-center animate-logo-draw">
            <div className="relative">
              <h1
                className="text-6xl md:text-8xl font-bold tracking-tight animate-logo-glow"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  background: "linear-gradient(135deg, hsl(30, 40%, 65%), hsl(40, 55%, 80%), hsl(30, 40%, 65%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Style Haven
              </h1>
              <div
                className="absolute -inset-4 rounded-3xl opacity-20 blur-3xl -z-10"
                style={{ background: "linear-gradient(135deg, hsl(30, 40%, 65%), hsl(40, 55%, 80%))" }}
              />
            </div>
            <p
              className="mt-4 text-lg tracking-[0.4em] uppercase opacity-0"
              style={{
                color: "hsl(30, 20%, 60%)",
                animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards",
              }}
            >
              Admin Portal
            </p>
          </div>
        )}

        {/* Login Phase */}
        {phase === "login" && (
          <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "0s" }}>
            {/* Logo small */}
            <div className="text-center mb-8">
              <h1
                className="text-4xl font-bold tracking-tight animate-logo-glow"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  background: "linear-gradient(135deg, hsl(30, 40%, 65%), hsl(40, 55%, 80%), hsl(30, 40%, 65%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Style Haven
              </h1>
              <p className="text-muted-foreground text-sm mt-2 tracking-widest uppercase">Admin Portal</p>
            </div>

            {/* Glass Login Card */}
            <div className="glass-card-strong rounded-2xl p-8 glow-gold">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@stylehaven.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">Password</Label>
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
                  className="w-full h-12 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_30px_hsla(30,40%,65%,0.3)]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-muted-foreground/40 text-xs mt-6">
              © 2026 Style Haven. All rights reserved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
