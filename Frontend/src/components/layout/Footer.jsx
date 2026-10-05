import { Link } from "react-router-dom";
import { aboutLinks } from "../../data/about";
import { EDUCATION_SITE_URL } from "../../data/cboPages";
import { navLinks, site as fallbackSite } from "../../data/site";
import { adminPath } from "../../adminPath";
import { useCmsNav, usePublicSite } from "../../hooks/useCms";
import RichHtml from "../cms/RichHtml";

function isExternal(url) {
  return /^https?:\/\//i.test(url || "");
}

export default function Footer() {
  const site = usePublicSite();
  const cmsNav = useCmsNav();
  const name = site.shortName || site.name || fallbackSite.name;
  const fullName = site.fullName || site.organizationName || fallbackSite.fullName;
  const email = site.contact?.email || site.email || fallbackSite.email;
  const phone = site.contact?.phone || "";
  const address = site.contact?.address || site.location || fallbackSite.location;
  const mapUrl = site.contact?.mapEmbedUrl || "https://maps.google.com/maps?q=Kenya&t=&z=6&ie=UTF8&iwloc=&output=embed";
  const education = site.educationSiteUrl || EDUCATION_SITE_URL;
  const logo = site.logo?.url || "/brand/logo-mark.png?v=3";
  const social = site.social || {};
  const socialItems = [
    ["Facebook", social.facebook],
    ["X", social.x],
    ["Instagram", social.instagram],
    ["LinkedIn", social.linkedin],
    ["YouTube", social.youtube],
    ["TikTok", social.tiktok],
  ].filter(([, href]) => href);
  const links = (cmsNav || []).filter((item) => !item.parent && item.url !== "/verify");
  const menu = links.length ? links : navLinks.map((item) => ({ label: item.label, url: item.to }));

  return (
    <footer className="bg-navy-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        <div>
          <img src={logo} alt={name} className="h-14 w-auto rounded-full bg-white object-contain p-1 sm:h-16" />
          <p className="mt-4 font-heading text-lg font-bold">{name}</p>
          <p className="mt-2 text-xs leading-5 text-white/70">{fullName}</p>
          {socialItems.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {socialItems.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs text-gold hover:border-gold"
                  title={label}
                >
                  {label[0]}
                </a>
              ))}
            </div>
          ) : null}
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-white/80 sm:grid-cols-1">
            {menu.map((link) => (
              <li key={link.url || link.to}>
                {isExternal(link.url) ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.url || link.to} className="hover:text-gold">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold">About</p>
          <ul className="mt-2 space-y-2 text-sm text-white/80">
            {aboutLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm leading-7 break-words text-white/85">
          {address ? (
            <p className="flex gap-2">
              <span className="text-gold">●</span> {address}
            </p>
          ) : null}
          {email ? (
            <p className="flex gap-2">
              <span className="text-gold">●</span>
              <a href={`mailto:${email}`} className="hover:text-gold">
                {email}
              </a>
            </p>
          ) : null}
          {phone ? (
            <p className="flex gap-2">
              <span className="text-gold">●</span>
              <a href={`tel:${phone}`} className="hover:text-gold">
                {phone}
              </a>
            </p>
          ) : null}
          {site.contact?.officeHours ? <p className="mt-2 text-white/70">{site.contact.officeHours}</p> : null}
          {site.footerText ? (
            <RichHtml html={site.footerText} className="mt-4 text-white/70" />
          ) : (
            <p className="mt-4 text-white/70">{site.tagline || fallbackSite.tagline}</p>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <div className="h-48 overflow-hidden rounded-md border border-white/10 bg-navy sm:h-56">
            <iframe
              title="HIACDI location"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        <p>
          Education:{" "}
          <a href={education} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
            hiacdi.org
          </a>
          {" · "}
          <Link to={adminPath("login")} className="text-gold hover:underline">
            Admin Login
          </Link>
          {" · "}
          <Link to="/verify" className="hover:text-gold">
            Verify a certificate
          </Link>
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} {name}. {site.copyright || "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
