import {Routes, Route, Link} from 'react-router-dom';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Preview from './pages/Preview';

export default function App(){
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="border-b bg-white p-4">
        <div className="mx-auto flex max-w-3xl gap-4 text-sm">
          <Link to="/" className="underline">Home</Link>
          <Link to="/videos" className="underline">Videos</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl p-4">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/videos" element={<Videos />} />
          <Route path="/preview/:filename" element={<Preview />} />
        </Routes>
      </main>
    </div>
  )
}
