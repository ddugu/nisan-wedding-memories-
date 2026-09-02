import JSZip from "jszip";

function safeFilename(name: string) {
  return name.replace(/[^\w\-ğüşıöçĞÜŞİÖÇ ]/gi, "").trim() || "ani";
}

function guessExtension(url: string, blobType?: string): string {
  if (blobType === "image/png" || /\.png(\?|$)/i.test(url)) return "png";
  if (blobType === "image/webp" || /\.webp(\?|$)/i.test(url)) return "webp";
  return "jpg";
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

async function fetchPhotoBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Fotoğraf indirilemedi.");
  }
  return response.blob();
}

export async function downloadMemoryPhotos(
  urls: string[],
  guestName: string | null
) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  if (uniqueUrls.length === 0) {
    throw new Error("İndirilecek fotoğraf yok.");
  }

  const base = safeFilename(guestName ?? "ani");

  if (uniqueUrls.length === 1) {
    const blob = await fetchPhotoBlob(uniqueUrls[0]);
    const ext = guessExtension(uniqueUrls[0], blob.type);
    triggerDownload(blob, `${base}.${ext}`);
    return;
  }

  const zip = new JSZip();

  for (let i = 0; i < uniqueUrls.length; i++) {
    const blob = await fetchPhotoBlob(uniqueUrls[i]);
    const ext = guessExtension(uniqueUrls[i], blob.type);
    zip.file(`${base}-${i + 1}.${ext}`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, `${base}-fotograflar.zip`);
}
