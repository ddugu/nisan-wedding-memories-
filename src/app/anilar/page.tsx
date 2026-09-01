import { GalleryNavbar } from "@/components/gallery/GalleryNavbar";
import { Gallery } from "@/components/gallery/Gallery";

export default function AnilarPage() {
  return (
    <>
      <GalleryNavbar />
      <main className="gal-main min-h-[100svh]">
        <Gallery />
      </main>
    </>
  );
}
