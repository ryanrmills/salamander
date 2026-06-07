import {useEffect, useRef, useState} from 'react';
import { getVideos } from '../mockApi';
import { Link } from 'react-router-dom';
import { createCentroidJob } from '../api/videoProcessing';
import { drawBinarizedSource } from '../utils/binarize';

export default function Videos(){
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [targetColor, setTargetColor] = useState('#00ff00');
    const [threshold, setThreshold] = useState(80);
    const [processing, setProcessing] = useState(false);
    const [processingError, setProcessingError] = useState(null);
    const [result, setResult] = useState(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [previewError, setPreviewError] = useState(null);
    const [frameVersion, setFrameVersion] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const selectedVideoUrlRef = useRef(null);

    useEffect(() => {
        getVideos()
            .then((data) => {
                setVideos(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            })
    }, [])

    useEffect(() => {
        return () => {
            if (selectedVideoUrlRef.current) {
                URL.revokeObjectURL(selectedVideoUrlRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!selectedVideoUrl || frameVersion === 0) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
            return;
        }

        drawBinarizedSource(video, canvas, targetColor, threshold);
    }, [selectedVideoUrl, frameVersion, targetColor, threshold]);

    function captureCurrentFrame() {
        setFrameVersion((current) => current + 1);
    }

    function handleFileChange(file) {
        if (selectedVideoUrlRef.current) {
            URL.revokeObjectURL(selectedVideoUrlRef.current);
            selectedVideoUrlRef.current = null;
        }

        const nextUrl = file ? URL.createObjectURL(file) : null;
        selectedVideoUrlRef.current = nextUrl;
        setSelectedFile(file);
        setSelectedVideoUrl(nextUrl);
        setFrameVersion(0);
        setPreviewError(null);
        setResult(null);
        setProcessingError(null);
    }

    function handleVideoMetadata() {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        setPreviewError(null);

        if (Number.isFinite(video.duration) && video.duration > 0.25) {
            try {
                video.currentTime = Math.min(0.25, video.duration / 2);
                return;
            } catch {
                captureCurrentFrame();
                return;
            }
        }

        captureCurrentFrame();
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setProcessingError(null);
        setResult(null);

        try {
            setProcessing(true);
            const data = await createCentroidJob({
                file: selectedFile,
                targetColor,
                threshold,
            });
            setResult(data);
        } catch (err) {
            setProcessingError(err.message);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="space-y-4">
            <section className="rounded border bg-white p-4">
                <h1 className="mb-3 text-xl font-bold">Process Video</h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm">
                        <span className="mb-1 block font-medium">Video File</span>
                        <input
                            className="block w-full rounded border p-2 text-sm"
                            type="file"
                            accept="video/*"
                            onChange={(event) => {
                                handleFileChange(event.target.files?.[0] || null);
                            }}
                        />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">Target Color</span>
                            <input
                                type="color"
                                value={targetColor}
                                onChange={(event) => setTargetColor(event.target.value)}
                            />
                        </label>

                        <label className="block text-sm">
                            <span className="mb-1 block font-medium">Threshold</span>
                            <input
                                className="block w-full rounded border p-2"
                                type="number"
                                min="0"
                                step="1"
                                value={threshold}
                                onChange={(event) => setThreshold(event.target.value)}
                            />
                        </label>
                    </div>

                    {selectedVideoUrl ? (
                        <div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <h2 className="mb-2 text-sm font-semibold">Uploaded Thumbnail</h2>
                                    <video
                                        ref={videoRef}
                                        className="aspect-video w-full rounded border bg-black object-contain"
                                        src={selectedVideoUrl}
                                        controls
                                        muted
                                        playsInline
                                        preload="metadata"
                                        onLoadedMetadata={handleVideoMetadata}
                                        onLoadedData={captureCurrentFrame}
                                        onSeeked={captureCurrentFrame}
                                        onError={() => {
                                            setPreviewError('Could not load selected video preview.');
                                        }}
                                    />
                                </div>
                                <div>
                                    <h2 className="mb-2 text-sm font-semibold">Binarized Test Image</h2>
                                    <canvas
                                        ref={canvasRef}
                                        className="aspect-video w-full rounded border bg-gray-100"
                                    />
                                </div>
                            </div>
                            {previewError ? (
                                <p className="mt-2 text-sm text-red-600">{previewError}</p>
                            ) : null}
                        </div>
                    ) : null}

                    <button
                        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                        type="submit"
                        disabled={processing || !selectedFile}
                    >
                        {processing ? 'Processing...' : 'Submit Processing Job'}
                    </button>
                </form>

                {processingError ? (
                    <p className="mt-3 text-sm text-red-600">Processing failed: {processingError}</p>
                ) : null}

                {result ? (
                    <div className="mt-4 rounded border bg-gray-50 p-3 text-sm">
                        <h2 className="mb-2 font-semibold">Processing Result</h2>
                        <dl className="space-y-1">
                            <div>
                                <dt className="inline font-medium">Job ID: </dt>
                                <dd className="inline">{result.jobId}</dd>
                            </div>
                            <div>
                                <dt className="inline font-medium">Server CSV: </dt>
                                <dd className="inline">{result.outputCsv}</dd>
                            </div>
                        </dl>
                        {result.resultUrl ? (
                            <a
                                className="mt-3 inline-block underline"
                                href={result.resultUrl}
                                download
                            >
                                Download CSV
                            </a>
                        ) : null}
                    </div>
                ) : null}
            </section>

            <section className="rounded border bg-white p-4">
                <h1 className="mb-3 text-xl font-bold">Available Videos</h1>
                {loading ? <p className="text-sm">Loading videos...</p> : error ? (
                    <p className="text-sm text-red-600">Could not load videos: {error}</p>
                ) : (
                    <ul className="space-y-1 text-sm">
                        {videos.map((filename) => (
                            <li key={filename}>
                                <Link to={`/preview/${filename}`} className="underline">{filename}</Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )    
}
