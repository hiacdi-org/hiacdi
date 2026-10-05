import Accordion from "../components/ui/Accordion";
import PageHero from "../components/layout/PageHero";
import { faqs as fallbackFaqs } from "../data/about";
import { useCmsFaqs } from "../hooks/useCms";

export default function Faqs() {
  const rows = useCmsFaqs();
  const items =
    rows?.length
      ? rows.map((row) => ({ title: row.question, body: row.answer }))
      : fallbackFaqs;
  return (
    <div>
      <PageHero
        eyebrow="FAQs"
        title="Questions people ask HIACDI"
        text="Programmes, certificates, and how to take part. If your question is not here, write to us or book a call."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        {rows === null ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 rounded-2xl bg-navy/5" />
            <div className="h-16 rounded-2xl bg-navy/5" />
          </div>
        ) : (
          <Accordion items={items} />
        )}
      </section>
    </div>
  );
}
