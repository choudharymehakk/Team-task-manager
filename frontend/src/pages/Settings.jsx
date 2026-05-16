import { Bell, Moon, UserRound } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../api/hooks/useAuth.js";
import { displayUserName } from "../utils/tasks.js";

export default function Settings() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <main className="app-page">
      <div>
        <p className="font-bold text-indigo-600">Account</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Settings</h1>
        <p className="mt-2 text-slate-500">Profile and workspace preferences.</p>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white">
              {displayUserName(user).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black">{displayUserName(user)}</h2>
              <p className="text-sm capitalize text-slate-500">{user?.role || "member"}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="label-premium">Full name</span>
              <input className="input-premium" value={displayUserName(user)} readOnly />
            </label>
            <label className="grid gap-2">
              <span className="label-premium">Email</span>
              <input className="input-premium" value={user?.email || ""} readOnly />
            </label>
          </div>
        </article>

        <div className="grid gap-5">
          <article className="premium-card flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Moon className="text-indigo-600" />
              <div>
                <h2 className="font-black">Theme preference</h2>
                <p className="text-sm text-slate-500">Stored locally for this browser session.</p>
              </div>
            </div>
            <button className={`h-8 w-14 rounded-full p-1 transition ${darkMode ? "bg-slate-950" : "bg-slate-200"}`} onClick={() => setDarkMode((value) => !value)}>
              <span className={`block h-6 w-6 rounded-full bg-white transition ${darkMode ? "translate-x-6" : ""}`} />
            </button>
          </article>
          <article className="premium-card flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Bell className="text-indigo-600" />
              <div>
                <h2 className="font-black">Notifications</h2>
                <p className="text-sm text-slate-500">Visual preference only.</p>
              </div>
            </div>
            <button className={`h-8 w-14 rounded-full p-1 transition ${notifications ? "bg-indigo-600" : "bg-slate-200"}`} onClick={() => setNotifications((value) => !value)}>
              <span className={`block h-6 w-6 rounded-full bg-white transition ${notifications ? "translate-x-6" : ""}`} />
            </button>
          </article>
          <article className="premium-card p-5">
            <div className="flex items-center gap-3">
              <UserRound className="text-indigo-600" />
              <div>
                <h2 className="font-black">Profile source</h2>
                <p className="text-sm text-slate-500">Name, email, and role are loaded from the backend user record.</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
