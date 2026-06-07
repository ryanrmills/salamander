const DEFAULT_API_BASE_URL = 'http://localhost:8080';

export const VIDEO_API_BASE_URL = (
    import.meta.env.VITE_VIDEO_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

function toErrorMessage(response, payload) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        return payload.error;
    }

    if (typeof payload === 'string' && payload.trim()) {
        return payload;
    }

    return `Request failed with status ${response.status}`;
}

export function getResultUrl(downloadPath) {
    if (!downloadPath) {
        return null;
    }

    if (/^https?:\/\//i.test(downloadPath)) {
        return downloadPath;
    }

    return `${VIDEO_API_BASE_URL}${downloadPath.startsWith('/') ? '' : '/'}${downloadPath}`;
}

export async function createCentroidJob({ file, targetColor, threshold }) {
    if (!file) {
        throw new Error('Choose a video file before submitting.');
    }

    const cleanTargetColor = String(targetColor || '')
        .trim()
        .replace(/^#/, '')
        .toUpperCase();
    const cleanThreshold = String(threshold ?? '').trim();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetColor', cleanTargetColor);
    formData.append('threshold', cleanThreshold);

    const response = await fetch(`${VIDEO_API_BASE_URL}/api/videos/centroids`, {
        method: 'POST',
        body: formData,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(toErrorMessage(response, payload));
    }

    return {
        ...payload,
        resultUrl: getResultUrl(payload.downloadPath),
    };
}
