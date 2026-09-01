import { GalleryNavbar } from "@/components/gallery/GalleryNavbar";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";

export default function GaleriPage() {
  return (
    <>
      <GalleryNavbar />
      <main className="gal-main min-h-[100svh]">
        <PhotoGallery />
      </main>
    </>
  );
}
