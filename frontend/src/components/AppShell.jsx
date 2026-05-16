import {
  CheckSquare,
  ChevronLeft,
  ChevronDown,
  LayoutDashboard,
  Menu,
  PanelsTopLeft,
  Users,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../api/hooks/useAuth.js";
import { displayUserName } from "../utils/tasks.js";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: PanelsTopLeft },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/team", label: "Team", icon: Users }
];

function Sidebar({ collapsed, setCollapsed, onNavigate }) {
  const { user } = useAuth();
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 284 }}
      className="relative hidden min-h-screen shrink-0 border-r border-slate-200/70 bg-white/75 shadow-soft backdrop-blur-xl lg:block"
    >
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <div className="mb-8 flex items-center justify-between gap-3">
          <NavLink to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-lg font-black text-white shadow-glow">
              T
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-black text-slate-950">TaskPilot</p>
                <p className="text-xs text-slate-500">Team OS</p>
              </div>
            )}
          </NavLink>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
            onClick={() => setCollapsed((value) => !value)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft size={17} className={collapsed ? "rotate-180 transition" : "transition"} />
          </button>
        </div>

        <nav className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={19} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4">
          {!collapsed ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Workspace</p>
              <p className="mt-2 text-sm font-bold text-slate-950">{displayUserName(user)}</p>
              <p className="mt-1 text-xs capitalize text-slate-500">{user?.role || "member"} access</p>
            </>
          ) : (
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black text-indigo-600">
              {displayUserName(user).slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-app-radial">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                className="h-full w-[300px] bg-white p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-lg font-black">TaskPilot</span>
                  <button className="grid h-10 w-10 place-items-center rounded-xl border" onClick={() => setMobileOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                <nav className="grid gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold ${
                            isActive ? "bg-slate-950 text-white" : "text-slate-600"
                          }`
                        }
                      >
                        <Icon size={19} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1440px] items-center gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="min-w-0 flex-1" />
              <div className="relative">
                <button
                  className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex"
                  onClick={() => setProfileOpen((value) => !value)}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-black text-white">
                    {displayUserName(user).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="leading-tight text-left">
                    <p className="text-sm font-bold text-slate-900">{displayUserName(user)}</p>
                    <p className="text-xs capitalize text-slate-500">{user?.role || "member"}</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
                    <div className="rounded-xl px-3 py-2">
                      <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                      <p className="text-xs capitalize text-slate-500">{user?.role}</p>
                    </div>
                    <button className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50" onClick={logout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
