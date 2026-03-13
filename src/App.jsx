import { useState } from 'react';
import Home from './pages/home';
import Admin from './pages/admin';

export default function App() {
  const [page, setPage] = useState('home');
  return page === 'admin'
    ? <Admin onNavigate={setPage} />
    : <Home onNavigate={setPage} />;
}