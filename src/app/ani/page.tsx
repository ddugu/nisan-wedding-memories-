import { AniNavbar } from "@/components/ani/AniNavbar";
import { MemoryForm } from "@/components/ani/MemoryForm";

export default function AniPage() {
  return (
    <>
      <AniNavbar />
      <main className="ani-main min-h-[100svh]">
        <MemoryForm />
      </main>
    </>
  );
}
