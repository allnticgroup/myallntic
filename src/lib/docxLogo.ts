import { ImageRun } from 'docx';
import { getCompanySettings } from './companySettings';

const EMU_PER_PX = 9525; // 96 dpi

function getExtension(base64: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  if (base64.match(/^data:image\/jpeg/i)) return 'jpg';
  if (base64.match(/^data:image\/gif/i)) return 'gif';
  if (base64.match(/^data:image\/bmp/i)) return 'bmp';
  return 'png';
}

function base64ToUint8Array(base64: string): Uint8Array {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

/**
 * Charge le logo entreprise pour l'insérer dans un document docx.
 * Le logo est redimensionné pour tenir dans une zone carrée sans déformation.
 */
export async function loadLogoImageRun(
  maxSizeEmu = 548640 // ~0.6 inch
): Promise<ImageRun | null> {
  try {
    const settings = getCompanySettings();
    const src = settings.logo || '/logo.png';
    const img = await loadImage(src);

    const width = img.naturalWidth || img.width || 1;
    const height = img.naturalHeight || img.height || 1;
    const maxPx = maxSizeEmu / EMU_PER_PX;
    const scale = Math.min(maxPx / width, maxPx / height, 1);

    const displayWidthPx = Math.max(1, Math.round(width * scale));
    const displayHeightPx = Math.max(1, Math.round(height * scale));

    const type = getExtension(src);
    const data = base64ToUint8Array(src);

    return new ImageRun({
      data,
      transformation: { width: displayWidthPx, height: displayHeightPx },
      type,
    });
  } catch (e) {
    console.log('Logo non chargé pour docx:', e);
    return null;
  }
}
