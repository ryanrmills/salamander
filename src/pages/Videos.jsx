import {useEffect, useState} from 'react';
import { getVideos } from '../mockApi';
import { Link } from 'react-router-dom';

export default function Videos(){
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="rounded border bg-white p-4">
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
        </div>
    )    
}
