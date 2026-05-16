import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import "./Login.css";

export default function Signup() {
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "member" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.email.includes("@") || form.username.length < 3 || form.password.length < 8 || !["admin", "member"].includes(form.role)) {
      setError("Use valid account details and choose either Admin or Member.");
      return;
    }
    try {
      setLoading(true);
      await signup(form);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="grid place-items-center bg-slate-50 px-5 py-12 text-slate-950">
          <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md" onSubmit={submit}>
            <Link to="/" className="mb-8 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white font-black">T</span>
              <span className="font-black">TaskPilot</span>
            </Link>
            <h2 className="text-4xl font-black">Create account</h2>
            <p className="mt-3 text-slate-500">Launch a workspace built for real team momentum.</p>
            <div className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="label-premium">Email</span>
                <span className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="input-premium pl-10" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></span>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Username</span>
                <span className="relative"><UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="input-premium pl-10" value={form.username} onChange={(event) => update("username", event.target.value)} /></span>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Password</span>
                <span className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input-premium px-10" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" type="button" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Role</span>
                <select className="input-premium" value={form.role} onChange={(event) => update("role", event.target.value)}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <span className="text-xs text-slate-500">Admins can manage projects, users, and task assignments. Members only work on assigned tasks.</span>
              </label>
            </div>
            {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>}
            <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
            <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-indigo-600" to="/login">Sign in</Link></p>
          </motion.form>
        </section>
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-900 p-10 lg:block">
          <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="glass-card bg-white/10 p-6 text-white">
              <p className="text-sm text-cyan-100">Setup takes less than a minute</p>
              <h1 className="mt-3 text-5xl font-black leading-tight">Invite the team, assign the work, watch progress compound.</h1>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
