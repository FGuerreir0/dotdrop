 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import Footer from './components/Footer/Footer';
import Main from './components/Main/Main';
import Canvas from './components/Canvas/Canvas';
import Navbar from './components/Navbar/Navbar';
import useBackendHook  from './hook/Backendhook.js'

function App() {
  const { online } = useBackendHook();

  const handlePixelClick = ({ x, y, color }) => {
    console.log(`Pixel at (${x},${y}) painted ${color}`)
  }
  return (

    <Router>
        <Navbar  online={online}/>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="/canvas" element={<Canvas width={1218} height={630} pixelSize={7} onPixelClick={handlePixelClick} />} />
          <Route path="*" element={<Navigate to="/canvas" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
