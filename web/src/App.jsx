import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import SignUp from './pages/SignUp';
import './index.css';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="app-container">
      <Navbar setPage={setPage} />
      
      <main className="main-content">
        {page === 'home' && <Home setPage={setPage} />}
        {page === 'catalog' && <Catalog />}
        {page === 'signup' && <SignUp />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
