import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail } from '../mockApi';

function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) {
        return null;
    }

    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
}

export default function Preview(){
    const { filename } = useParams();
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loadedFilename, setLoadedFilename] = useState(null);
    const [color, setColor] = useState('#00ff00');
    const [tolerance, setTolerance] = useState(80);
    const [imageReady, setImageReady] = useState(false);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        getThumbnail(filename)
            .then((url) => {
                if (isMounted) {
                    setImageReady(false);
                    setThumbnailUrl(url);
                    setError(null);
                    setLoadedFilename(filename);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setThumbnailUrl(null);
                    setError(err.message);
                    setLoadedFilename(filename);
                    setImageReady(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [filename]);

    useEffect(() => {
        if (!thumbnailUrl) {
            return;
        }

        let isMounted = true;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (!isMounted) {
                return;
            }

            imgRef.current = img;
            setImageReady(true);
        };
        img.onerror = () => {
            if (!isMounted) {
                return;
            }

            setError(`Could not decode image for ${filename}`);
            setImageReady(false);
        };
        img.src = thumbnailUrl;

        return () => {
            isMounted = false;
        };
    }, [thumbnailUrl, filename]);

    useEffect(() => {
        if (!imageReady) {
            return;
        }

        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) {
            return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.drawImage(img, 0, 0);

        const target = hexToRgb(color);
        if (!target) {
            return;
        }

        const tol = Number(tolerance);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;

        for (let i = 0; i < px.length; i += 4) {
            // px[i]     = red channel of this pixel (0-255)
            // px[i + 1] = green channel
            // px[i + 2] = blue channel
            // px[i + 3] = alpha (transparency, usually leave alone)
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
    }, [imageReady, color, tolerance]);

    const loading = loadedFilename !== filename;

    return (
        <div className="rounded border bg-white p-4">
            <h1 className="mb-2 text-xl font-bold">Preview: {filename}</h1>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-3 text-sm">
                    <span>Target Color</span>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                            const next = e.target.value;
                            setColor(next);
                            console.log('color:', next);
                        }}
                    />
                </label>
                <label className="text-sm">
                    <span className="mb-1 block">Tolerance: {tolerance}</span>
                    <input
                        className="w-full"
                        type="range"
                        min="0"
                        max="255"
                        step="1"
                        value={tolerance}
                        onChange={(e) => {
                            const next = Number(e.target.value);
                            setTolerance(next);
                            console.log('tolerance:', next);
                        }}
                    />
                </label>
            </div>
            {loading ? (
                <p className="mb-3 text-sm">Loading thumbnail...</p>
            ) : error ? (
                <p className="mb-3 text-sm text-red-600">Could not load thumbnail: {error}</p>
            ) : (
                <div className="mb-3 grid gap-3 md:grid-cols-2">
                    <img className="w-full rounded border" src={thumbnailUrl} alt={`${filename} thumbnail`} />
                    <canvas ref={canvasRef} className="w-full rounded border" />
                </div>
            )}
            <p className="mb-3 text-sm text-gray-700">Thumbnail and tuning controls for your salamander project</p>
            <Link to="/videos" className="text-sm underline">Back to videos</Link>
        </div>
    );
}
