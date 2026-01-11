import html2canvas from 'html2canvas';

/**
 * Generate PNG image from bill HTML element
 * @param {HTMLElement} element - Bill template element
 * @returns {Promise<Blob>} PNG blob
 */
export async function generateBillPNG(element) {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Medium quality for iPhone viewing
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate PNG blob'));
          }
        },
        'image/png',
        0.85 // Medium quality
      );
    });
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
}

/**
 * Download PNG file
 * @param {Blob} blob - PNG blob
 * @param {string} filename - Filename (e.g., "bill-INV-0001.png")
 */
export function downloadPNG(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share PNG via Web Share API (for WhatsApp, etc.)
 * @param {Blob} blob - PNG blob
 * @param {string} filename - Filename
 * @returns {Promise<boolean>} True if shared successfully, false otherwise
 */
export async function sharePNG(blob, filename) {
  if (!navigator.share) {
    return false;
  }

  try {
    const file = new File([blob], filename, { type: 'image/png' });
    await navigator.share({
      files: [file],
      title: 'Bill',
      text: 'Bill from Bhanus Studio'
    });
    return true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error sharing PNG:', error);
    }
    return false;
  }
}

