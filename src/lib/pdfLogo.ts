import { jsPDF } from 'jspdf';

function getImageFormat(base64: string): 'PNG' | 'JPEG' {
  if (base64.match(/^data:image\/(jpeg|jpg)/i)) return 'JPEG';
  return 'PNG';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function imageToBase64Png(img: HTMLImageElement): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Dessine le logo dans un cadre carré sans déformation (mode "contain" centré).
 * @param doc Instance jsPDF
 * @param logoBase64 Logo en base64 (data URL) ou null/undefined
 * @param x Coin supérieur gauche du cadre
 * @param y Coin supérieur gauche du cadre
 * @param boxSize Taille du cadre carré (mm)
 * @param fallbackUrl URL de secours si aucun logo n'est fourni
 */
export async function addLogoToPdf(
  doc: jsPDF,
  logoBase64: string | null | undefined,
  x: number,
  y: number,
  boxSize: number,
  fallbackUrl = '/icon-512.png'
): Promise<void> {
  try {
    const src = logoBase64 || fallbackUrl;
    const img = await loadImage(src);
    const imageData = logoBase64 ? src : await imageToBase64Png(img);
    const format = getImageFormat(imageData);

    const width = img.naturalWidth || img.width || 1;
    const height = img.naturalHeight || img.height || 1;
    const scale = Math.min(boxSize / width, boxSize / height);
    const drawW = width * scale;
    const drawH = height * scale;
    const offsetX = x + (boxSize - drawW) / 2;
    const offsetY = y + (boxSize - drawH) / 2;

    doc.addImage(imageData, format, offsetX, offsetY, drawW, drawH);
  } catch (e) {
    console.log('Logo non chargé:', e);
  }
}
