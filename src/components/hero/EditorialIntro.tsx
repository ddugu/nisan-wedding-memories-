import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function EditorialIntro() {
  return (
    <section className="py-16 md:py-24 border-t border-line">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="anı albümü"
              title={<>Bu günü birlikte<br /><span className="italic text-terracotta">saklayalım.</span></>}
              subtitle="Her kare, bu özel gecenin sessiz bir hatırası. Misafirlerimizin gözünden büyüyen dijital bir albüm."
            />
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-6 md:gap-8 border-t lg:border-t-0 lg:border-l border-line pt-8 lg:pt-0 lg:pl-10">
            <div>
              <p className="display-serif text-4xl md:text-5xl text-ink leading-none">02</p>
              <p className="mt-2 text-xs text-ink-muted uppercase tracking-widest">Eylül</p>
              <p className="text-xs text-ink-muted">2026</p>
            </div>
            <div>
              <p className="display-serif text-lg md:text-xl text-ink leading-tight">Necati</p>
              <p className="display-serif text-terracotta text-lg italic my-0.5">&</p>
              <p className="display-serif text-lg md:text-xl text-ink leading-tight">Tuğçe</p>
            </div>
            <div>
              <p className="display-serif text-4xl md:text-5xl text-terracotta leading-none">∞</p>
              <p className="mt-2 text-xs text-ink-muted uppercase tracking-widest">anı</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
