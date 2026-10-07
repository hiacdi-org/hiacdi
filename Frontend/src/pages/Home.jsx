import { useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Hero from "../components/home/Hero";
import VerifyCertificateCard from "../components/verify/VerifyCertificateCard";
import RichHtml from "../components/cms/RichHtml";
import { programmeGroups } from "../data/programmes";
import { about } from "../data/about";
import { useCatalog } from "../hooks/useContent";
import { useCmsHome } from "../hooks/useCms";
import { features, graduateEmployers, site } from "../data/site";
import { apiUrl } from "../services/apiBase";
import { optimizedImage } from "../utils/media";

export default function Home() {
  const { onBook } = useOutletContext();
  const { data, error } = useCmsHome();

  if (!data && !error) {
    return (
      <div className="animate-pulse px-4 py-24 text-center text-sm text-muted">
        Loading HIACDI…
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Hero onBook={onBook} />
        <AboutSummary />
        <ProgrammesOverview />
        <ImpactStrip />

        <section className="bg-soft px-4 py-14 sm:px-6 sm:py-20">
          <VerifyCertificateCard compact />
        </section>
      </div>
    );
  }

  const settings = data.settings || {};

  const extras = {
    stats: data.stats || [],
    partners: data.partners?.length
      ? data.partners
      : graduateEmployers.map((item) => ({
          name: item.name,
          logo: { url: item.src },
        })),
    testimonials: data.testimonials || [],
    slides: data.slides || [],
  };

  return (
    <div>
      {(data.sections || []).map((section) => (
        <HomeSection
          key={section.id || section.key}
          section={section}
          extras={extras}
          settings={settings}
          onBook={onBook}
        />
      ))}

      {(data.sections || []).some((row) => row.key === "verify") ? null : (
        <section className="bg-soft px-4 py-14 sm:px-6 sm:py-20">
          <VerifyCertificateCard compact />
        </section>
      )}
    </div>
  );
}

function HomeSection({ section, extras, settings, onBook }) {
  if (section.key === "hero") {
    return (
      <Hero
        onBook={onBook}
        section={section}
        slide={extras.slides[0]}
        settings={settings}
      />
    );
  }

  if (section.key === "about-summary") {
    return <AboutSummary section={section} />;
  }

  if (section.key === "programmes-overview") {
    return <ProgrammesOverview section={section} />;
  }

  if (section.key === "impact") {
    return <ImpactStrip section={section} stats={extras.stats} />;
  }

  if (section.key === "verify") {
    return (
      <section className="bg-soft px-4 py-14 sm:px-6 sm:py-20">
        <VerifyCertificateCard compact />
      </section>
    );
  }

  if (section.key === "news-preview") {
    return <NewsPreview section={section} />;
  }

  if (section.key === "get-involved") {
    return <GetInvolvedBand section={section} />;
  }

  if (section.key === "partners") {
    return <Partners section={section} partners={extras.partners} />;
  }

  if (section.key === "testimonials") {
    return (
      <Testimonials
        section={section}
        testimonials={extras.testimonials}
      />
    );
  }

  if (section.key === "features") {
    return <FeatureSlider />;
  }

  if (section.key === "courses") {
    return <CoursesPreview section={section} />;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {section.subtitle ? (
        <p className="text-sm font-semibold text-gold">
          {section.subtitle}
        </p>
      ) : null}

      {section.title ? (
        <h2 className="font-heading mt-2 text-2xl font-bold text-navy">
          {section.title}
        </h2>
      ) : null}

      <RichHtml
        html={section.body}
        className="mt-4 text-sm leading-7 text-muted"
      />
    </section>
  );
}

function AboutSummary({ section }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <p className="text-sm font-semibold text-gold">
        {section?.subtitle || "About HIACDI"}
      </p>

      <h2 className="font-heading mt-2 max-w-3xl text-2xl font-bold text-navy sm:text-4xl">
        {section?.title || site.fullName}
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-navy/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Our Vision
          </p>

          <p className="mt-3 text-sm font-semibold leading-7 text-navy">
            {section?.extra?.vision || about.vision}
          </p>
        </article>

        <article className="rounded-2xl border border-navy/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Our Mission
          </p>

          <p className="mt-3 text-sm leading-7 text-muted">
            {section?.extra?.mission || about.mission}
          </p>
        </article>
      </div>

      <RichHtml
        html={section?.body}
        className="mt-4 text-sm leading-7 text-muted"
      />

      <div className="mt-6 flex flex-wrap gap-3">
        {(section?.buttons || []).map((button) => (
          <Link
            key={button.label}
            to={button.url || "/about"}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
          >
            {button.label}
          </Link>
        ))}

        {section?.buttons?.length ? null : (
          <>
            <Link
              to="/about"
              className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
            >
              About HIACDI
            </Link>

            <Link
              to="/get-involved"
              className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy"
            >
              Get involved
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

function ProgrammesOverview({ section }) {
  return (
    <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-gold">
          {section?.subtitle || "Our Programmes"}
        </p>

        <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-4xl">
          {section?.title || "Community work across twelve areas"}
        </h2>

        <RichHtml
          html={section?.body}
          className="mt-3 max-w-3xl text-sm text-muted"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programmeGroups.map((group) => (
            <Link
              key={group.slug}
              to={`/programmes/${group.slug}`}
              className="rounded-2xl bg-white p-5 shadow-sm hover:border-gold"
            >
              <h3 className="font-heading font-bold text-navy">
                {group.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                {group.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactStrip({ stats }) {
  const items = stats?.length
    ? stats
    : [
        {
          value: "12",
          label: "Programme areas from health to digital inclusion",
        },
        {
          value: "Community-led",
          label: "Work designed with local people and partners",
        },
        {
          value: "Verifiable",
          label: "Training graduates receive a HIACDI certificate",
        },
      ];

  return (
    <section className="bg-navy px-4 py-12 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-heading text-3xl font-bold text-gold">
              {item.value}
              {item.suffix || ""}
            </p>

            <p className="mt-2 text-sm text-white/80">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureSlider() {
  const [index, setIndex] = useState(0);

  const visible = [
    features[index % features.length],
    features[(index + 1) % features.length],
  ];

  return (
    <section
      className="relative bg-white px-4 pb-10 sm:px-6 sm:pb-16"
      aria-label="HIACDI areas of focus"
    >
      <button
        type="button"
        className="absolute top-[40%] left-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-lg text-white sm:left-3 sm:h-10 sm:w-10"
        onClick={() =>
          setIndex(
            (value) =>
              (value + features.length - 1) % features.length
          )
        }
        aria-label="Previous HIACDI feature"
      >
        ‹
      </button>

      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 md:gap-6">
        {visible.map((item, cardIndex) => (
          <article
            key={item.title}
            className={`overflow-hidden rounded-2xl sm:rounded-3xl ${
              cardIndex === 1 ? "hidden md:block" : ""
            }`}
          >
            <img
              src={item.image}
              alt={`${item.title} - HIACDI`}
              className="h-48 w-full object-cover sm:h-64"
              loading="lazy"
            />

            <div className={`${item.color} p-5 text-white sm:p-8`}>
              <h3 className="font-heading text-xl font-bold sm:text-2xl">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/90 sm:leading-7">
                {item.text}
              </p>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="absolute top-[40%] right-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-lg text-white sm:right-3 sm:h-10 sm:w-10"
        onClick={() =>
          setIndex((value) => (value + 1) % features.length)
        }
        aria-label="Next HIACDI feature"
      >
        ›
      </button>
    </section>
  );
}

function CoursesPreview({ section }) {
  const catalog = useCatalog();

  return (
    <section className="bg-navy-dark px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          {section?.title || "Six course parts"}
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-white/75">
          {section?.subtitle ||
            "Choose a path, then pick the program and learning mode that fits you."}
        </p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {catalog.map((category) => (
            <article
              key={category.slug}
              className="overflow-hidden rounded-2xl bg-white text-navy"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={`${category.title} course`}
                  className="course-card-image"
                  loading="lazy"
                />
              ) : null}

              <div className="p-5 sm:p-6">
                <h3 className="font-heading text-lg font-bold sm:text-xl">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {category.summary}
                </p>

                <Link
                  to={`/courses/${category.slug}`}
                  className="mt-5 inline-block text-sm font-semibold text-gold"
                >
                  View programs
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners({ section, partners: cmsPartners }) {
  const items = cmsPartners?.length
    ? cmsPartners.map((p) => ({
        name: p.name,
        src: p.logo?.url,
        href: p.website,
      }))
    : graduateEmployers.map((e) => ({
        name: e.name,
        src: e.src,
        href: "",
      }));

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <h2 className="font-heading px-2 text-center text-2xl font-bold text-navy sm:text-3xl md:text-4xl">
        {section?.title || "Where Our Graduates Work"}
      </h2>

      {section?.subtitle ? (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
          {section.subtitle}
        </p>
      ) : null}

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 items-center gap-x-6 gap-y-10 sm:mt-14 sm:grid-cols-3 md:grid-cols-5 md:gap-x-10 md:gap-y-12">
        {items.map((employer) => {
          const img = (
            <img
              src={optimizedImage(employer.src) || employer.src}
              alt={`${employer.name} partner logo`}
              className="partner-logo max-h-10 w-auto object-contain sm:max-h-12"
              loading="lazy"
            />
          );

          return (
            <div
              key={employer.name}
              className="flex h-14 items-center justify-center px-2 sm:h-16"
            >
              {employer.href ? (
                <a
                  href={employer.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${employer.name}`}
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "7", label: "Core technology programs" },
    { value: "3", label: "Pillars: Learn. Build. Innovate." },
    { value: "Hands-on", label: "Project-based training model" },
    { value: "1", label: "Mission: digital opportunity" },
  ];

  return (
    <section className="bg-navy-dark px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-l-2 border-b-2 border-white/40 p-4 sm:p-5"
          >
            <p className="font-heading text-2xl font-bold text-gold sm:text-3xl">
              {item.value}
            </p>

            <p className="mt-2 text-sm text-white/85">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Awards() {
  const items = [
    "Practical, industry-focused training",
    "Real-world learner projects",
    "Mentorship and career preparation",
    "A technology community, not only a classroom",
  ];

  return (
    <section className="bg-navy px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <h2 className="font-heading text-2xl font-bold sm:min-w-48 sm:text-3xl">
          Our Focus
        </h2>

        <div className="grid flex-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <p
              key={item}
              className="text-sm leading-6 text-white/90"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunityBanner() {
  return (
    <section className="bg-soft px-4 py-12 text-center sm:px-6 sm:py-20">
      <h2 className="font-heading mx-auto max-w-4xl text-2xl font-bold text-navy sm:text-3xl md:text-4xl">
        Join #HIACDI Community of Innovators and Tech Leaders
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm text-navy/80 sm:mt-5 sm:text-base">
        Stay up to date with upcoming events, free learning materials, news
        and updates.
      </p>

      <Link
        to="/community"
        className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-white sm:mt-8 sm:px-8"
      >
        HIACDI Community
      </Link>
    </section>
  );
}

function NewsPreview({ section }) {
  const btn = section?.buttons?.[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-gold">
        {section?.subtitle || "News & Events"}
      </p>

      <h2 className="font-heading mt-2 text-2xl font-bold text-navy">
        {section?.title || "What is happening in the community"}
      </h2>

      {section?.body ? (
        <RichHtml
          html={section.body}
          className="mt-3 max-w-2xl text-sm text-muted"
        />
      ) : (
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Field updates, workshops, and campaigns. Open the news section for
          the full calendar.
        </p>
      )}

      <Link
        to={btn?.url || "/news"}
        className="mt-5 inline-flex text-sm font-semibold text-gold"
      >
        {btn?.label || "News & Events →"}
      </Link>
    </section>
  );
}

function GetInvolvedBand({ section }) {
  const buttons = section?.buttons?.length
    ? section.buttons
    : [
        {
          label: "Ways to take part",
          url: "/get-involved",
          style: "primary",
        },
        {
          label: "Contact",
          url: "/contact",
          style: "secondary",
        },
      ];

  return (
    <section className="bg-navy-dark px-4 py-12 text-center text-white sm:px-6">
      <h2 className="font-heading text-2xl font-bold sm:text-3xl">
        {section?.title || "Get involved"}
      </h2>

      {section?.body ? (
        <RichHtml
          html={section.body}
          className="mx-auto mt-3 max-w-2xl text-sm text-white/80"
        />
      ) : (
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80">
          {section?.subtitle ||
            "Volunteer, partner, donate, or train with HIACDI. Communities move when people take part."}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {buttons.map((btn) => (
          <Link
            key={btn.label}
            to={btn.url || "/"}
            className={
              btn.style === "secondary"
                ? "rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
                : "rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy"
            }
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ section, testimonials: cmsItems }) {
  const items = cmsItems?.length
    ? cmsItems
    : [
        {
          quote:
            "HIACDI Tech Hub is built so learners do not only attend class. They practise, build, and leave with work they can show.",
          name: site.name,
          role: "Learn. Build. Innovate.",
          photo: { url: "/brand/logo-mark.png?v=3" },
        },
      ];

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-20">
      <h2 className="font-heading text-center text-2xl font-bold text-navy sm:text-3xl">
        {section?.title || "Our Testimonials"}
      </h2>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 sm:mt-10">
        {items.map((item) => (
          <article
            key={item.name + (item.quote || "")}
            className="flex flex-col items-center gap-5 rounded-2xl bg-navy-dark p-5 text-white sm:p-8 md:flex-row md:items-center md:gap-6"
          >
            <div className="flex-1">
              <p className="text-sm leading-7 text-white/90 sm:text-base sm:leading-8">
                {item.quote}
              </p>

              <p className="mt-4 font-semibold text-gold sm:mt-5">
                {item.name}
              </p>

              <p className="text-sm text-white/70">
                {item.role}
              </p>
            </div>

            {item.photo?.url ? (
              <img
                src={
                  optimizedImage(item.photo.url, 200) ||
                  item.photo.url
                }
                alt={`${item.name} - HIACDI testimonial`}
                className="h-20 w-20 rounded-full object-contain sm:h-28 sm:w-28"
                loading="lazy"
              />
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Stories() {
  const clips = [
    {
      src: "/home/success-1.mp4",
      poster: "/home/success-1.jpg",
      title: "Graduation ceremony",
    },
    {
      src: "/home/success-2.mp4",
      poster: "/home/success-2.jpg",
      title: "Learner success",
    },
  ];

  return (
    <section className="bg-white px-4 pb-12 sm:px-6 sm:pb-20">
      <h2 className="font-heading text-center text-2xl font-bold text-gold sm:text-3xl">
        Learner Success Stories
      </h2>

      <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2">
        {clips.map((clip) => (
          <StoryVideo key={clip.src} clip={clip} />
        ))}
      </div>
    </section>
  );
}

function StoryVideo({ clip }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-dark">
      <video
        ref={videoRef}
        className="h-48 w-full object-cover sm:h-64"
        poster={clip.poster}
        playsInline
        preload="metadata"
        onClick={toggle}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      >
        <source src={clip.src} type="video/mp4" />
      </video>

      {playing ? null : (
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-xl text-white sm:h-16 sm:w-16 sm:text-2xl"
          aria-label={`Play ${clip.title}`}
        >
          ▶
        </button>
      )}
    </div>
  );
}

function StayUpdated() {
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    interests: [],
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("Thank you. We will keep you updated.");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        interests: [],
      });
    } catch {
      setStatus(
        "Could not subscribe just now. Please try again."
      );
    }
  }

  function toggleInterest(value) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
  }

  const images = [
    "/home/stay-updated-1.jpg",
    "/home/stay-updated-2.jpg",
    "/home/stay-updated-3.jpg",
    "/home/stay-updated-4.jpg",
  ];

  return (
    <section className="bg-white px-4 pb-28 sm:px-6 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`HIACDI community and learning activity ${
                index + 1
              }`}
              className="h-32 w-full rounded-2xl object-cover sm:h-52"
              loading="lazy"
            />
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-navy-dark p-5 text-white sm:p-8"
        >
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Stay Updated with HIACDI
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Get learning resources, event invites, and important updates.
          </p>

          <div className="mt-6 grid gap-4">
            <input
              required
              placeholder="First Name"
              value={form.firstName}
              onChange={(event) =>
                setForm({
                  ...form,
                  firstName: event.target.value,
                })
              }
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            />

            <input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(event) =>
                setForm({
                  ...form,
                  lastName: event.target.value,
                })
              }
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            />

            <input
              required
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            />

            <select
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value,
                })
              }
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            >
              <option value="">
                Which of these best describes you?
              </option>
              <option>Primary school learner</option>
              <option>Secondary school learner</option>
              <option>Graduate</option>
              <option>Working professional</option>
              <option>Anyone with a passion to learn tech</option>
              <option>Organization / partner</option>
            </select>

            <fieldset>
              <legend className="mb-2 text-sm">
                What are you interested in?
              </legend>

              {[
                "Software Engineering",
                "Data Courses",
                "Cyber Security",
                "AI",
                "DPO",
                "High School Bootcamp",
              ].map((item) => (
                <label
                  key={item}
                  className="mr-4 mb-2 inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.interests.includes(item)}
                    onChange={() => toggleInterest(item)}
                  />

                  {item}
                </label>
              ))}
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark sm:ml-auto sm:w-auto"
            >
              Submit
            </button>

            {status ? (
              <p className="text-sm text-gold">{status}</p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
