import Link from "next/link";
import { Container } from "../ui/Container";

export function UploadCTA() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="relative bg-wine text-bg overflow-hidden rounded-sm">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(ellipse at 30% 50%, #fff 0%, transparent 60%)",
          }} aria-hidden="true" />

          <div className="relative px-8 py-14 md:px-16 md:py-20 max-w-2xl">
            <p className="eyebrow text-bg/50 mb-6">paylaş</p>
            <h2 className="display-serif text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-bg">
              Bu geceden
              <br />
              <span className="italic text-blush">bir iz bırak.</span>
            </h2>
            <p className="mt-6 text-sm md:text-base text-bg/65 leading-relaxed max-w-md">
              Fotoğrafını veya küçük bir notunu bizimle paylaş.
              Bu albüm seninle birlikte büyüyecek.
            </p>
            <Link
              href="/#upload"
              className="mt-10 inline-flex items-center gap-2 min-h-[48px] px-7 bg-bg text-ink text-[0.8125rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-blush transition-colors duration-300"
            >
              Bir Anı Bırak →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
