function safeFilename(name: string) {
  return name.replace(/[^\w\-ğüşıöçĞÜŞİÖÇ ]/gi, "").trim() || "ani";
}

function guessExtension(url: string): string {
  if (/\.png(\?|$)/i.test(url)) return "png";
  if (/\.webp(\?|$)/i.test(url)) return "webp";
  return "jpg";
}

export async function downloadPhoto(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Fotoğraf indirilemedi.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadMemoryPhotos(
  urls: string[],
  guestName: string | null
) {
  const base = safeFilename(guestName ?? "ani");

  for (let i = 0; i < urls.length; i++) {
    const ext = guessExtension(urls[i]);
    await downloadPhoto(urls[i], `${base}-${i + 1}.${ext}`);
    if (i < urls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
}
