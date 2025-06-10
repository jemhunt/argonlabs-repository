import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// 1. Import all your page components
import AnalysisTool from './pages/AnalysisTool';
import DocumentArchive from './pages/DocumentArchive';
import FeeEstimator from './pages/FeeEstimator';
import ComplianceGenerator from './pages/ComplianceGenerator';
import Settings from './pages/Settings';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('argon-theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('argon-theme', theme);
  }, [theme]);

  return (
    <div className="app-layout">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        {/* 2. Add the new routes here */}
        <Routes>
          <Route path="/" element={<AnalysisTool />} />
          <Route path="/archive" element={<DocumentArchive />} />
          <Route path="/estimator" element={<FeeEstimator />} />
          <Route path="/compliance" element={<ComplianceGenerator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;