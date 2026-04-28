import html2canvas from 'html2canvas';

function getMaxContentWidth(rootElement) {
  let maxWidth = Math.max(rootElement.scrollWidth, rootElement.offsetWidth);
  const allNodes = rootElement.querySelectorAll('*');

  allNodes.forEach((node) => {
    maxWidth = Math.max(maxWidth, node.scrollWidth, node.offsetWidth);
  });

  return maxWidth;
}

/**
 * Generate PNG image from bill HTML element
 * @param {HTMLElement} element - Bill template element
 * @returns {Promise<Blob>} PNG blob
 */
export async function generateBillPNG(element) {
  let captureRoot = null;
  let cleanupCaptureRoot = null;
  try {
    if (!element) {
      throw new Error('Element is required for PNG generation');
    }
    
    // Wait for all images to load before capturing
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.warn('Image load timeout:', img.src);
            resolve(); // Continue even if image fails to load
          }, 5000); // 5 second timeout per image
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            console.warn('Image failed to load:', img.src);
            resolve(); // Continue even if image fails
          };
        });
      })
    );
    
    // Clone to an offscreen container and expand widths before capture.
    const offscreenContainer = document.createElement('div');
    offscreenContainer.style.position = 'fixed';
    offscreenContainer.style.left = '-100000px';
    offscreenContainer.style.top = '0';
    offscreenContainer.style.background = '#ffffff';
    offscreenContainer.style.zIndex = '-1';
    document.body.appendChild(offscreenContainer);

    const clonedElement = element.cloneNode(true);
    offscreenContainer.appendChild(clonedElement);

    captureRoot = clonedElement;
    cleanupCaptureRoot = () => {
      if (offscreenContainer.parentNode) {
        offscreenContainer.parentNode.removeChild(offscreenContainer);
      }
    };

    const expandableSections = clonedElement.querySelectorAll('[data-export-expand="true"]');
    expandableSections.forEach((section) => {
      const sectionWidth = Math.max(section.scrollWidth, section.offsetWidth);

      section.style.overflow = 'visible';
      section.style.overflowX = 'visible';
      section.style.maxWidth = 'none';
      section.style.width = `${sectionWidth}px`;

      if (section.firstElementChild) {
        section.firstElementChild.style.width = `${Math.max(
          section.firstElementChild.scrollWidth,
          section.firstElementChild.offsetWidth
        )}px`;
      }
    });

    // Recalculate full width after expansion to avoid iOS viewport clipping.
    const captureWidth = getMaxContentWidth(captureRoot);
    captureRoot.style.maxWidth = 'none';
    captureRoot.style.width = `${captureWidth}px`;
    captureRoot.style.overflow = 'visible';

    const captureHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight);

    // Add a timeout wrapper for html2canvas
    const canvasPromise = html2canvas(captureRoot, {
      scale: 2, // Medium quality for iPhone viewing
      useCORS: true,
      allowTaint: true, // Allow tainted canvas if CORS fails
      logging: true, // Enable logging for debugging
      backgroundColor: '#ffffff',
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      imageTimeout: 5000
    });
    
    // Add timeout wrapper (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PNG generation timeout after 30 seconds')), 30000);
    });
    
    console.log('Starting html2canvas...');
    const canvas = await Promise.race([canvasPromise, timeoutPromise]);
    console.log('html2canvas completed');

    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        reject(new Error(`Failed to convert canvas to blob: ${error.message}`));
      }
    });
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  } finally {
    if (cleanupCaptureRoot) {
      cleanupCaptureRoot();
    }
  }
}

/**
 * Download PNG file
 * @param {Blob} blob - PNG blob
 * @param {string} filename - Filename (e.g., "bill-INV-0001.png")
 */
export function downloadPNG(blob, filename) {
  try {
    if (!blob) {
      throw new Error('Invalid blob provided');
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error downloading PNG:', error);
    throw error;
  }
}

/**
 * Share PNG via Web Share API (for WhatsApp, etc.)
 * On mobile devices (iOS/Android), WhatsApp will appear in the share sheet if installed.
 * On macOS, WhatsApp Desktop may not appear - user can manually share from Downloads.
 * @param {Blob} blob - PNG blob
 * @param {string} filename - Filename
 * @returns {Promise<boolean>} True if shared successfully, false otherwise
 */
export async function sharePNG(blob, filename) {
  // Web Share API is primarily for mobile devices
  // On iOS/Android, WhatsApp will appear in the share sheet if installed
  if (!navigator.share) {
    return false;
  }

  try {
    const file = new File([blob], filename, { type: 'image/png' });
    
    // Check if file sharing is supported
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      return false;
    }
    
    await navigator.share({
      files: [file],
      title: 'Bill',
      text: 'Bill from Bhanus Studio'
    });
    return true;
  } catch (error) {
    // User cancelled - this is fine
    if (error.name === 'AbortError') {
      return true;
    }
    // Other errors - file sharing not supported or failed
    console.error('Error sharing PNG:', error);
    return false;
  }
}

