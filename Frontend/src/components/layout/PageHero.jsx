export default function PageHero({ eyebrow, title, text, children }) {
  return (
    <section className="relative overflow-x-clip overflow-y-hidden bg-navy-dark px-4 py-14 text-white sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/10" />
        <div className="absolute bottom-0 left-6 h-32 w-32 translate-y-1/4 rounded-full bg-white/5" />
      </div>
      <div className="relative mx-auto max-w-6xl">
        {eyebrow ? <p className="text-sm font-semibold tracking-wide text-gold">{eyebrow}</p> : null}
        <h1 className="font-heading mt-3 max-w-4xl text-[clamp(1.4rem,6.4vw,3rem)] font-bold leading-[1.22] sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {text ? (
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/80 sm:mt-6 sm:text-base sm:leading-8">{text}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
