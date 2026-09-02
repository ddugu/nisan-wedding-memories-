import JSZip from "jszip";

export interface MemoryDownloadInfo {
  guestName: string | null;
  message: string | null;
  createdAt: string;
}

function safeFilename(name: string) {
  return name.replace(/[^\w\-ğüşıöçĞÜŞİÖÇ ]/gi, "").trim() || "ani";
}

function guessExtension(url: string, blobType?: string): string {
  if (blobType === "image/png" || /\.png(\?|$)/i.test(url)) return "png";
  if (blobType === "image/webp" || /\.webp(\?|$)/i.test(url)) return "webp";
  return "jpg";
}

function buildMemoryTextFile(info: MemoryDownloadInfo): string {
  const name = info.guestName?.trim() || "Misafir";
  const message = info.message?.trim() || "";
  const date = new Date(info.createdAt).toLocaleString("tr-TR");

  const lines = [`Ad: ${name}`, `Tarih: ${date}`, ""];
  if (message) {
    lines.push("Anı:", message);
  } else {
    lines.push("Anı: (mesaj yok)");
  }

  return `${lines.join("\n")}\n`;
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
  info: MemoryDownloadInfo
) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  if (uniqueUrls.length === 0) {
    throw new Error("İndirilecek fotoğraf yok.");
  }

  const base = safeFilename(info.guestName ?? "ani");
  const hasMessage = Boolean(info.message?.trim());
  const useZip = uniqueUrls.length > 1 || hasMessage;

  if (!useZip) {
    const blob = await fetchPhotoBlob(uniqueUrls[0]);
    const ext = guessExtension(uniqueUrls[0], blob.type);
    triggerDownload(blob, `${base}.${ext}`);
    return;
  }

  const zip = new JSZip();
  zip.file("ani.txt", buildMemoryTextFile(info));

  for (let i = 0; i < uniqueUrls.length; i++) {
    const blob = await fetchPhotoBlob(uniqueUrls[i]);
    const ext = guessExtension(uniqueUrls[i], blob.type);
    zip.file(`${base}-${i + 1}.${ext}`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, `${base}-ani.zip`);
}
