export function hexToRgb(hex) {
    const normalized = String(hex || '').replace('#', '');
    if (normalized.length !== 6) {
        return null;
    }

    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
}

export function drawBinarizedSource(source, canvas, color, tolerance) {
    const width = source.videoWidth || source.naturalWidth;
    const height = source.videoHeight || source.naturalHeight;
    const target = hexToRgb(color);
    const tol = Number(tolerance);

    if (!width || !height || !target || !Number.isFinite(tol)) {
        return false;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return false;
    }

    ctx.drawImage(source, 0, 0, width, height);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;

    for (let i = 0; i < px.length; i += 4) {
        const dr = px[i] - target.r;
        const dg = px[i + 1] - target.g;
        const db = px[i + 2] - target.b;
        const distance = Math.sqrt((dr * dr) + (dg * dg) + (db * db));
        const value = distance <= tol ? 255 : 0;

        px[i] = value;
        px[i + 1] = value;
        px[i + 2] = value;
    }

    ctx.putImageData(data, 0, 0);
    return true;
}
