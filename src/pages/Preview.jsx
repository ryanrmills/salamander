import {Link, useParams} from 'react-router-dom'

export default function Preview(){
    const {filename} = useParams();

    return (
        <div className="rounded border bg-white p-4">
            <h1 className="mb-2 text-xl font-bold">Preview: {filename}</h1>
            <p className="mb-3 text-sm text-gray-700">Thumbnail and tuning controls for your slamander project</p>
            <Link to="/videos" className="text-sm underline">Back to videos</Link>
        </div>
    )
}
