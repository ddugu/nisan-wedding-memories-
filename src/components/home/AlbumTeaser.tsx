import { Container } from "../ui/Container";

export function AlbumTeaser() {
  return (
    <section className="py-14 md:py-16">
      <Container className="text-center max-w-2xl">
        <p className="display-serif text-[clamp(1.5rem,3.5vw,2.25rem)] text-ink leading-snug">
          Bu albüm sizin anılarınızla tamamlanacak.
        </p>
        <p className="mt-4 font-hand text-xl text-terracotta/70">her kare bir hatıra ♡</p>
      </Container>
    </section>
  );
}
