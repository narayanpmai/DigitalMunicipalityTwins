import { jsPDF } from 'jspdf';
import { DocumentFilterType, ScannedPage } from '../types';

/**
 * Apply filters (Magic Color, B&W, Grayscale, Contrast, Brightness) and rotation to an image
 */
export async function processScannedImage(
  imageSource: string,
  options: {
    filter: DocumentFilterType;
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    rotation: number; // 0, 90, 180, 270
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const isRotated90or270 = options.rotation === 90 || options.rotation === 270;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(imageSource);
        }

        const width = isRotated90or270 ? img.height : img.width;
        const height = isRotated90or270 ? img.width : img.height;

        canvas.width = width;
        canvas.height = height;

        // Apply rotation
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        // Process pixel data for filters
        if (options.filter !== 'original' || options.brightness !== 0 || options.contrast !== 0) {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
          const brightnessOffset = options.brightness * 1.5;

          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // 1. Filter selection
            if (options.filter === 'bw') {
              // High-contrast Document B&W (Thresholding)
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              const bwVal = lum > 130 ? 255 : 0;
              r = bwVal;
              g = bwVal;
              b = bwVal;
            } else if (options.filter === 'grayscale') {
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              r = lum;
              g = lum;
              b = lum;
            } else if (options.filter === 'magic') {
              // Magic Color: Enhance document paper whiteness & sharpen ink
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum > 170) {
                // Bright background becomes pure white
                r = Math.min(255, r * 1.15 + 20);
                g = Math.min(255, g * 1.15 + 20);
                b = Math.min(255, b * 1.15 + 20);
              } else if (lum < 110) {
                // Dark text becomes deeper black/dark
                r = Math.max(0, r * 0.8);
                g = Math.max(0, g * 0.8);
                b = Math.max(0, b * 0.8);
              } else {
                // Midtones boosted
                r = Math.min(255, r * 1.05);
                g = Math.min(255, g * 1.05);
                b = Math.min(255, b * 1.05);
              }
            } else if (options.filter === 'contrast') {
              r = Math.min(255, Math.max(0, (r - 128) * 1.4 + 128));
              g = Math.min(255, Math.max(0, (g - 128) * 1.4 + 128));
              b = Math.min(255, Math.max(0, (b - 128) * 1.4 + 128));
            }

            // 2. Brightness & Contrast adjustment
            if (options.brightness !== 0 || options.contrast !== 0) {
              r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightnessOffset));
              g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightnessOffset));
              b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightnessOffset));
            }

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }

          ctx.putImageData(imgData, 0, 0);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (err) {
        console.error('Error processing scanned image:', err);
        resolve(imageSource);
      }
    };
    img.onerror = (err) => {
      console.error('Failed to load image for processing', err);
      reject(err);
    };
    img.src = imageSource;
  });
}

/**
 * Generate a clean Multi-Page PDF from scanned pages
 */
export async function generateMultiPagePdf(
  pages: ScannedPage[],
  title: string,
  quality: 'high' | 'medium' | 'low' = 'medium'
): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210; // mm
  const pageHeight = 297; // mm
  const margin = 8; // mm margin

  const maxContentWidth = pageWidth - margin * 2;
  const maxContentHeight = pageHeight - margin * 2;

  const qualityRatio = quality === 'high' ? 0.95 : quality === 'medium' ? 0.78 : 0.55;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const imgUrl = page.processedImageUrl || page.originalImageUrl;
    const imgProps = await getImageDimensions(imgUrl);

    let renderWidth = maxContentWidth;
    let renderHeight = (imgProps.height * renderWidth) / imgProps.width;

    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = (imgProps.width * renderHeight) / imgProps.height;
    }

    const xPos = margin + (maxContentWidth - renderWidth) / 2;
    const yPos = margin + (maxContentHeight - renderHeight) / 2;

    pdf.addImage(imgUrl, 'JPEG', xPos, yPos, renderWidth, renderHeight, undefined, 'FAST');

    // Page footer indicator
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 140);
    pdf.text(
      `${title} | पृष्ठ ${i + 1}/${pages.length} | डिजिटल पालिका स्मार्ट स्क्यानर`,
      pageWidth / 2,
      pageHeight - 3,
      { align: 'center' }
    );
  }

  return pdf;
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 800, height: 1100 });
    img.src = url;
  });
}

/**
 * Export OCR extracted text as .doc or .txt file
 */
export function exportTextAsDocument(text: string, title: string, format: 'txt' | 'doc') {
  if (format === 'txt') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${title}.txt`);
  } else {
    // Word document with UTF-8 Devanagari support
    const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body { font-family: 'Noto Sans Devanagari', 'Kalimati', Arial, sans-serif; line-height: 1.6; padding: 20px; }</style></head><body><h2>${title}</h2><hr/><pre style="font-family: inherit; white-space: pre-wrap;">${text}</pre></body></html>`;
    const blob = new Blob(['\ufeff' + header], { type: 'application/msword;charset=utf-8' });
    downloadBlob(blob, `${title}.doc`);
  }
}

/**
 * Helper to download Blob to user device
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
