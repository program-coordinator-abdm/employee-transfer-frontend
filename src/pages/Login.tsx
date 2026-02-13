import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, LogIn, User, Shield, Database } from "lucide-react";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import abdmLogo from "@/assets/abdm-logo.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDataOfficer } = useAuth();

  // Admin state
  const [adminData, setAdminData] = useState({ email: "", password: "" });
  const [adminShowPw, setAdminShowPw] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});

  // Data Officer state
  const [doData, setDoData] = useState({ username: "", password: "" });
  const [doShowPw, setDoShowPw] = useState(false);
  const [doLoading, setDoLoading] = useState(false);
  const [doErrors, setDoErrors] = useState<Record<string, string>>({});

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!adminData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) errs.email = "Enter a valid email";
    if (!adminData.password) errs.password = "Password is required";
    else if (adminData.password.length < 6) errs.password = "Min 6 characters";
    setAdminErrors(errs);
    if (Object.keys(errs).length) return;

    setAdminLoading(true);
    try {
      await login({ email: adminData.email, password: adminData.password });
      navigate("/categories");
    } catch {
      setAdminErrors({ form: "Login failed. Check your credentials." });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!doData.username.trim()) errs.username = "Username is required";
    if (!doData.password) errs.password = "Password is required";
    setDoErrors(errs);
    if (Object.keys(errs).length) return;

    setDoLoading(true);
    try {
      await loginDataOfficer({ username: doData.username, password: doData.password });
      navigate("/data-officer");
    } catch {
      setDoErrors({ form: "Invalid credentials. Please try again." });
    } finally {
      setDoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="govt-banner w-full shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border-2 border-border/30 overflow-hidden shadow-md">
                <img src={karnatakaEmblem} alt="Government of Karnataka" className="w-10 h-10 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-banner-foreground/80">Government of</p>
                <p className="text-sm font-semibold text-banner-foreground">Karnataka</p>
              </div>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-banner-foreground">
                Employee Transfer Management
              </h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border-2 border-border/30 overflow-hidden shadow-md">
              <img src={abdmLogo} alt="ABDM" className="w-10 h-10 object-contain" />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Login Card */}
          <div className="bg-surface rounded-2xl shadow-floating p-6 sm:p-8 border border-border/50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Admin Login</h2>
              <p className="text-muted-foreground text-sm mt-1">Transfer management administrator</p>
            </div>

            {adminErrors.form && (
              <div className="mb-4 p-3 bg-danger-light rounded-xl border border-danger/20">
                <p className="text-sm text-danger font-medium">{adminErrors.form}</p>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="admin-email"
                    type="email"
                    value={adminData.email}
                    onChange={(e) => { setAdminData(p => ({ ...p, email: e.target.value })); setAdminErrors(p => ({ ...p, email: "" })); }}
                    className={`input-field pl-12 ${adminErrors.email ? "border-danger" : ""}`}
                    placeholder="Enter your email"
                  />
                </div>
                {adminErrors.email && <p className="input-error">{adminErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="admin-password" className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="admin-password"
                    type={adminShowPw ? "text" : "password"}
                    value={adminData.password}
                    onChange={(e) => { setAdminData(p => ({ ...p, password: e.target.value })); setAdminErrors(p => ({ ...p, password: "" })); }}
                    className={`input-field pl-12 pr-12 ${adminErrors.password ? "border-danger" : ""}`}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setAdminShowPw(!adminShowPw)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors" aria-label={adminShowPw ? "Hide" : "Show"}>
                    {adminShowPw ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
                {adminErrors.password && <p className="input-error">{adminErrors.password}</p>}
              </div>
              <button type="submit" disabled={adminLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-70 disabled:cursor-not-allowed">
                {adminLoading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
                {adminLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Data Officer Login Card */}
          <div className="bg-surface rounded-2xl shadow-floating p-6 sm:p-8 border border-border/50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center shadow-lg">
                <Database className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Employee / Data Officer Login</h2>
              <p className="text-muted-foreground text-sm mt-1">For DH/TH employee data entry (HR Data Admin)</p>
            </div>

            {doErrors.form && (
              <div className="mb-4 p-3 bg-danger-light rounded-xl border border-danger/20">
                <p className="text-sm text-danger font-medium">{doErrors.form}</p>
              </div>
            )}

            <form onSubmit={handleDoSubmit} className="space-y-4">
              <div>
                <label htmlFor="do-username" className="input-label">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="do-username"
                    type="text"
                    value={doData.username}
                    onChange={(e) => { setDoData(p => ({ ...p, username: e.target.value })); setDoErrors(p => ({ ...p, username: "" })); }}
                    className={`input-field pl-12 ${doErrors.username ? "border-danger" : ""}`}
                    placeholder="Enter your username"
                  />
                </div>
                {doErrors.username && <p className="input-error">{doErrors.username}</p>}
              </div>
              <div>
                <label htmlFor="do-password" className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="do-password"
                    type={doShowPw ? "text" : "password"}
                    value={doData.password}
                    onChange={(e) => { setDoData(p => ({ ...p, password: e.target.value })); setDoErrors(p => ({ ...p, password: "" })); }}
                    className={`input-field pl-12 pr-12 ${doErrors.password ? "border-danger" : ""}`}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setDoShowPw(!doShowPw)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors" aria-label={doShowPw ? "Hide" : "Show"}>
                    {doShowPw ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
                {doErrors.password && <p className="input-error">{doErrors.password}</p>}
              </div>
              <button type="submit" disabled={doLoading} className="btn-secondary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-70 disabled:cursor-not-allowed">
                {doLoading ? <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
                {doLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
