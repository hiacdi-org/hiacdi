import { useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { aboutPages, involvedPages, newsPages, projectPages, resourcePages } from "../../data/cboPages";
import { programmeGroups } from "../../data/programmes";
import { site as fallbackSite } from "../../data/site";
import { useCmsNav, usePublicSite } from "../../hooks/useCms";
import ApplyCta from "../ui/ApplyCta";
import NavDropdown from "./NavDropdown";

const menus = {
  about: aboutPages,
  programmes: [
    { to: "/programmes", label: "All programmes", text: "Twelve areas of HIACDI community work" },
    ...programmeGroups.map((group) => ({
      to: `/programmes/${group.slug}`,
      label: group.title,
      text: group.summary,
    })),
  ],
  projects: [{ to: "/projects", label: "Overview", text: "Projects and impact" }, ...projectPages],
  news: [{ to: "/news", label: "Overview", text: "News and events" }, ...newsPages],
  resources: [{ to: "/resources", label: "Overview", text: "Downloads and guidance" }, ...resourcePages],
  involved: [{ to: "/get-involved", label: "Overview", text: "Ways to take part" }, ...involvedPages],
};

const fallbackMenuByUrl = {
  "/about": "about",
  "/programmes": "programmes",
  "/projects": "projects",
  "/news": "news",
  "/resources": "resources",
  "/get-involved": "involved",
};

function isExternal(url, openInNewTab) {
  return Boolean(openInNewTab) || /^https?:\/\//i.test(url || "");
}

function navTree(items) {
  const list = [...(items || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const tops = list.filter((item) => !item.parent);
  return tops.map((item) => ({
    ...item,
    children: list.filter(
      (child) =>
        child.parent &&
        (String(child.parent) === String(item.id) || child.parent === item.url || child.parent === item.label)
    ),
  }));
}

export default function Navbar({ onSearch, onBook }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState("");
  const closeTimer = useRef(null);
  const location = useLocation();
  const site = usePublicSite();
  const cmsItems = useCmsNav();
  const tree = navTree(cmsItems);
  const hasVerify = tree.some((item) => item.url === "/verify");
  const links = hasVerify ? tree : [...tree, { id: "verify", label: "Verify Certificate", url: "/verify", children: [] }];
  const logo = site.logo?.url || "/brand/logo-icon.png?v=5";
  const orgName = site.shortName || site.name || fallbackSite.name;

  function showMenu(name) {
    clearTimeout(closeTimer.current);
    setMenu(name);
  }

  function hideMenu() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(""), 80);
  }

  function hideMenuNow() {
    clearTimeout(closeTimer.current);
    setMenu("");
  }

  function closeAll() {
    setOpen(false);
    setMenu("");
  }

  function dropdownItems(item) {
    if (item.children?.length) {
      return item.children.map((child) => ({
        to: child.url,
        label: child.label,
        text: "",
        openInNewTab: child.openInNewTab,
      }));
    }
    const key = fallbackMenuByUrl[item.url];
    return key ? menus[key] : [];
  }

  function NavItemLink({ item, className, onClick, onMouseEnter }) {
    const href = item.url || "/";
    if (isExternal(href, item.openInNewTab)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick} onMouseEnter={onMouseEnter}>
          {item.label}
        </a>
      );
    }
    return (
      <NavLink
        to={href}
        end={href === "/"}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={({ isActive }) => `${className} ${isActive ? "text-gold" : ""}`}
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <header className="relative sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-5">
        <Link to="/" className="flex h-10 w-[88px] shrink-0 items-center" onClick={closeAll} onMouseEnter={hideMenuNow}>
          <img src={logo} alt={orgName} width={88} height={40} className="nav-logo" />
        </Link>

        <nav className="desktop-nav hidden items-center gap-3 xl:flex xl:gap-4">
          {links.map((item) => {
            const drop = dropdownItems(item);
            if (drop.length) {
              const active = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
              return (
                <div
                  key={item.id || item.url}
                  className="relative"
                  onMouseEnter={() => showMenu(item.url)}
                  onMouseLeave={hideMenu}
                >
                  <NavLink
                    to={item.url || "/"}
                    className={`whitespace-nowrap text-xs font-semibold xl:text-sm ${
                      active || menu === item.url ? "text-gold" : "text-navy hover:text-gold"
                    }`}
                  >
                    {item.label} ▾
                  </NavLink>
                  {menu === item.url ? (
                    <div className="absolute left-1/2 top-full z-50 max-h-[70vh] -translate-x-1/2 overflow-auto pt-3">
                      <NavDropdown items={drop} onNavigate={closeAll} />
                    </div>
                  ) : null}
                </div>
              );
            }
            return (
              <NavItemLink
                key={item.id || item.url}
                item={item}
                onMouseEnter={hideMenuNow}
                className="whitespace-nowrap text-xs font-semibold text-navy hover:text-gold xl:text-sm"
              />
            );
          })}
          <button type="button" aria-label="Search" onClick={onSearch} onMouseEnter={hideMenuNow} className="text-navy hover:text-gold">
            <SearchIcon />
          </button>
          <button
            type="button"
            onClick={onBook}
            onMouseEnter={hideMenuNow}
            className="rounded-full bg-gold px-3 py-2 text-xs font-semibold whitespace-nowrap text-white hover:bg-gold-dark xl:px-4 xl:text-sm"
          >
            Book for Calls
          </button>
          <div onMouseEnter={hideMenuNow}>
            <ApplyCta className="rounded-full bg-navy px-3 py-2 text-xs font-semibold whitespace-nowrap text-white hover:bg-navy/90 xl:px-4 xl:text-sm">
              Apply
            </ApplyCta>
          </div>
        </nav>

        <button
          type="button"
          className="mobile-menu-btn ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-navy/15 text-navy xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open ? (
        <div className="max-h-[80vh] overflow-auto border-t border-black/5 bg-white px-4 py-4 xl:hidden">
          <div className="flex flex-col gap-2">
            {links.map((item) => {
              const drop = dropdownItems(item);
              if (drop.length) {
                return <MobileMenu key={item.id || item.url} label={item.label} items={drop} onNavigate={closeAll} />;
              }
              return (
                <NavItemLink
                  key={item.id || item.url}
                  item={item}
                  onClick={closeAll}
                  className="py-1 text-sm font-semibold text-navy"
                />
              );
            })}
            <NavLink to="/courses" onClick={closeAll} className="py-1 text-sm font-semibold text-navy">
              Education courses
            </NavLink>
            <button
              type="button"
              className="mt-1 w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-white"
              onClick={() => {
                closeAll();
                onBook();
              }}
            >
              Book for Calls
            </button>
            <div className="mt-2" onClick={closeAll}>
              <ApplyCta className="block rounded-full bg-navy px-4 py-3 text-center text-sm font-semibold text-white">
                Apply
              </ApplyCta>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MobileMenu({ label, items, onNavigate }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-sm font-semibold text-navy"
        onClick={() => setShow((value) => !value)}
      >
        {label}
        <span>{show ? "−" : "+"}</span>
      </button>
      {show ? (
        <div className="mt-2">
          <NavDropdown items={items} onNavigate={onNavigate} />
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
