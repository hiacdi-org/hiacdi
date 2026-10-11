import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Database,
  FileStack,
  FolderOpen,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { adminPath } from "../../adminPath";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import { adminLogout, changeAdminPassword, fetchAdminMe, isAuthenticated } from "../../services/auth";
import { fetchApplications, fetchContactMessages } from "../../services/api";
import ServerStatusBanner from "../layout/ServerStatusBanner";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: adminPath(), label: "Dashboard", end: true, icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { to: adminPath("applications"), label: "Applications", icon: FolderOpen },
      { to: adminPath("applicants"), label: "Applicants", icon: Users, badge: "applicants" },
      { to: adminPath("calls"), label: "Booked Calls", icon: Phone },
    ],
  },
  {
    label: "Certificates",
    items: [
      { to: adminPath("graduates"), label: "Certificates", icon: GraduationCap },
      { to: adminPath("certificates"), label: "Issue certificates", icon: ShieldCheck },
    ],
  },
  {
    label: "Content",
    items: [
      { to: adminPath("programmes"), label: "Programmes", icon: BookOpen },
      { to: adminPath("site"), label: "Site Content", icon: Newspaper },
      { to: adminPath("content"), label: "News & files", icon: FileStack },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: adminPath("contacts"), label: "Contact Messages", icon: MessageSquare, badge: "contacts" },
      { to: adminPath("broadcast"), label: "Email Students", icon: Mail },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: adminPath("visitors"), label: "Website Visitors", icon: Bell },
      { to: adminPath("intakes"), label: "Course Intakes", icon: CalendarDays },
      { to: adminPath("database"), label: "Database", icon: Database },
      { to: adminPath("staff-tokens"), label: "Staff Tokens", icon: KeyRound },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => sessionStorage.getItem("hiacdi.admin.collapsed") === "1");
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [newApplicants, setNewApplicants] = useState(0);
  const [badgeError, setBadgeError] = useState("");
  const [admin, setAdmin] = useState({ name: "", email: "" });
  const [menu, setMenu] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(adminPath("login"), { replace: true });
      return;
    }
    setChecked(true);
    fetchAdminMe().then((profile) => {
      if (profile) setAdmin({ name: profile.name || "HIACDI Admin", email: profile.email || "" });
    });
  }, [navigate]);

  const refreshBadges = useCallback(async () => {
    try {
      const [contacts, apps] = await Promise.all([fetchContactMessages(), fetchApplications()]);
      setUnreadContacts(contacts.unreadCount || 0);
      setNewApplicants(apps.filter((app) => (app.status || "Submitted") === "Submitted").length);
      setBadgeError("");
    } catch (error) {
      setBadgeError(error.message || "Could not refresh admin data.");
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!checked) return;
    refreshBadges().catch(() => {});
  }, [checked, location.pathname, refreshBadges]);

  useLiveRefresh(refreshBadges, { enabled: checked && !badgeError });

  useEffect(() => {
    sessionStorage.setItem("hiacdi.admin.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  async function handleLogout() {
    await adminLogout();
    navigate(adminPath("login"), { replace: true });
  }

  const initials = useMemo(() => {
    const parts = String(admin.name || "HA").trim().split(/\s+/);
    return ((parts[0]?.[0] || "H") + (parts[1]?.[0] || "A")).toUpperCase();
  }, [admin.name]);

  if (!checked) return null;

  const badges = { applicants: newApplicants, contacts: unreadContacts };

  return (
    <div className="flex min-h-screen bg-soft">
      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-30 flex h-dvh shrink-0 flex-col text-white transition-all duration-200 lg:static ${
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} w-[260px]`}
      >
        <div className={`flex h-[72px] shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "gap-3 px-4"}`}>
          <div className="admin-logo-badge flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            {logoFailed ? (
              <span className="text-xs font-bold text-navy">HIACDI</span>
            ) : (
              <img
                src="/brand/logo-mark.png?v=3"
                alt="HIACDI"
                className="admin-brand-logo h-12 w-12 object-contain"
                onError={() => setLogoFailed(true)}
              />
            )}
          </div>
          {collapsed ? null : (
            <div className="min-w-0">
              <p className="font-heading text-base font-bold leading-tight text-white">HIACDI</p>
              <p className="text-xs font-semibold text-gold">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-2 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {collapsed ? null : (
                <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-white/45 uppercase">{group.label}</p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const count = item.badge ? badges[item.badge] : 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={item.label}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex h-11 items-center rounded-xl px-3 text-sm font-semibold transition ${
                          collapsed ? "justify-center" : "justify-between gap-2"
                        } ${
                          isActive
                            ? "bg-gold text-navy"
                            : "text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                        }`
                      }
                    >
                      <span className={`flex min-w-0 items-center ${collapsed ? "" : "gap-3"}`}>
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
                      </span>
                      {!collapsed && count > 0 ? (
                        <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">{count}</span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`shrink-0 border-t border-white/10 ${collapsed ? "p-2" : "p-3"}`}>
          <div className={`mb-2 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
              {initials}
            </span>
            {collapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{admin.name || "HIACDI Admin"}</p>
                <p className="truncate text-[11px] text-white/55">{admin.email}</p>
              </div>
            )}
          </div>
          {collapsed ? null : (
            <a href="/" className="mb-2 block rounded-lg px-3 py-2 text-xs font-semibold text-gold hover:bg-white/10">
              View website
            </a>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className={`inline-flex h-11 w-full items-center justify-center rounded-lg border border-white/15 text-sm font-semibold text-white/80 transition hover:border-gold hover:text-gold ${
              collapsed ? "px-0" : "gap-2"
            }`}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
            {collapsed ? <span className="sr-only">Log out</span> : "Log out"}
          </button>
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-navy/10 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 items-center rounded-md border border-navy/15 px-3 text-sm font-semibold text-navy lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="mr-2 h-4 w-4" />
              Menu
            </button>
            <button
              type="button"
              className="hidden h-11 w-11 items-center justify-center rounded-md border border-navy/15 text-navy lg:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <p className="font-heading hidden text-lg font-bold text-navy sm:block">Admin Dashboard</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((value) => !value)}
              className="flex max-w-[220px] items-center gap-2 rounded-full border border-navy/10 px-2 py-1.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-sm font-semibold text-navy">{admin.name || "HIACDI Admin"}</span>
                <span className="block truncate text-[11px] text-muted">{admin.email}</span>
              </span>
            </button>
            {menu ? (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-navy/10 bg-white p-2 shadow-xl">
                <p className="px-3 py-2 text-xs font-semibold text-muted">Profile</p>
                <p className="px-3 pb-2 text-sm font-semibold text-navy">{admin.name || "HIACDI Admin"}</p>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-soft"
                  onClick={() => {
                    setMenu(false);
                    setPasswordOpen(true);
                  }}
                >
                  <Settings2 className="h-4 w-4" /> Change password
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <ServerStatusBanner />
        {badgeError ? (
          <div className="flex items-center justify-between gap-3 bg-red-50 px-4 py-2 text-sm text-red-800">
            <span>{badgeError}</span>
            <button type="button" className="font-semibold underline" onClick={() => refreshBadges().catch(() => {})}>
              Retry
            </button>
          </div>
        ) : null}
        <main className="table-scroll flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      {passwordOpen ? <PasswordModal onClose={() => setPasswordOpen(false)} /> : null}
    </div>
  );
}

function PasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setOk("");
    try {
      await changeAdminPassword({ currentPassword, newPassword });
      setOk("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Could not update the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/40 p-4" onClick={onClose}>
      <form
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <p className="text-sm font-semibold text-gold">Account</p>
        <h2 className="font-heading mt-1 text-xl font-bold text-navy">Change password</h2>
        <label className="mt-4 block text-sm font-semibold text-navy">
          Current password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label className="mt-3 block text-sm font-semibold text-navy">
          New password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={10}
            required
          />
        </label>
        {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {ok ? <p className="mt-3 text-sm font-semibold text-emerald-700">{ok}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-navy">
            Close
          </button>
          <button type="submit" disabled={busy} className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
            {busy ? "Saving…" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
