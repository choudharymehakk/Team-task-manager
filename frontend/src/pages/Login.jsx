import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../api/hooks/useAuth.js";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your email or username and password.");
      return;
    }
    try {
      setLoading(true);
      await login(username, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl lg:grid-cols-2">
        <section className="relative hidden bg-gradient-to-br from-indigo-500 via-slate-900 to-cyan-500 p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.24),transparent_30%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Link to="/" className="flex items-center gap-3 text-lg font-black">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950">T</span>
              TaskPilot
            </Link>
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                <Sparkles size={16} /> Welcome back
              </div>
              <h1 className="text-5xl font-black leading-tight">Your execution cockpit is ready.</h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-indigo-50">Review priorities, move work forward, and keep the whole team aligned from one polished workspace.</p>
            </div>
          </div>
        </section>
        <section className="grid place-items-center bg-slate-50 px-5 py-12 text-slate-950">
          <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md" onSubmit={submit}>
            <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white font-black">T</span>
              <span className="font-black">TaskPilot</span>
            </Link>
            <h2 className="text-4xl font-black">Sign in</h2>
            <p className="mt-3 text-slate-500">Pick up right where your team left off.</p>
            <div className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="label-premium">Email or username</span>
                <span className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input-premium pl-10" value={username} onChange={(event) => setUsername(event.target.value)} />
                </span>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Password</span>
                <span className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input-premium px-10" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" type="button" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
            </div>
            <AnimatePresence>{error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</motion.p>}</AnimatePresence>
            <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
            <p className="mt-6 text-center text-sm text-slate-500">No account? <Link className="font-bold text-indigo-600" to="/signup">Create one</Link></p>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
