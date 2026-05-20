/** Match backend sharp resize in OcrService — keeps detail for Azure Read. */
export const OCR_MAX_EDGE = 2200;
export const OCR_SKIP_REENCODE_MAX_BYTES = 4 * 1024 * 1024;
export const OCR_JPEG_QUALITY = 0.92;

function scaleToFit(width, height, maxEdge) {
    if (width <= maxEdge && height <= maxEdge) {
        return { width, height };
    }
    if (width >= height) {
        const nextH = Math.round((height * maxEdge) / width);
        return { width: maxEdge, height: nextH };
    }
    const nextW = Math.round((width * maxEdge) / height);
    return { width: nextW, height: maxEdge };
}

export function prepareImageBase64ForOcr(file, dataUrl, img) {
    const withinSize = img.width <= OCR_MAX_EDGE && img.height <= OCR_MAX_EDGE;
    if (withinSize && file.size <= OCR_SKIP_REENCODE_MAX_BYTES) {
        return {
            base64Data: dataUrl.split(',')[1],
            mimeType: file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'
        };
    }

    const { width, height } = scaleToFit(img.width, img.height, OCR_MAX_EDGE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    const compressedDataUrl = canvas.toDataURL('image/jpeg', OCR_JPEG_QUALITY);
    return {
        base64Data: compressedDataUrl.split(',')[1],
        mimeType: 'image/jpeg'
    };
}

export function readAndPrepareImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                try {
                    resolve(prepareImageBase64ForOcr(file, reader.result, img));
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = reader.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
