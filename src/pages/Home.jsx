import { Link } from 'react-router-dom';

export default function Home(){
    return (
        <div className="rounded border bg-white p-4">
            <h1 className="mb-2 text-xl font-bold">Slamander Dashboard</h1>
            <p className="mb-3 text-sm text-gray-700">Welcome. Click below to see your videos.</p>
            <Link to="/videos" className="text-sm underline">Go to videos</Link>
        </div>
    )
}
