import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ theme, toggleTheme }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <img
            src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="Argon's A.I. Labs Logo"
            className="logo"
          />
        </div>
        <nav id="main-nav">
          <ul>
            <li><NavLink to="/">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.28 1.28a1.5 1.5 0 00-2.12.055l-3.07 3.07a1.5 1.5 0 00-.055 2.12l1.28 1.28a1.5 1.5 0 002.12.055l3.07-3.07a1.5 1.5 0 00.055-2.12l-1.28-1.28zM9.75 3.104l6.132 6.132a1.5 1.5 0 01.055 2.12l-1.28 1.28a1.5 1.5 0 01-2.12.055l-3.07-3.07a1.5 1.5 0 01-.055-2.12l1.28-1.28a1.5 1.5 0 012.12-.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 9.25l-1.28 1.28a1.5 1.5 0 01-2.12.055l-3.07-3.07a1.5 1.5 0 01-.055-2.12l1.28-1.28a1.5 1.5 0 012.12-.055l3.07 3.07a1.5 1.5 0 01.055 2.12z" /></svg>
              Analysis Tool
            </NavLink></li>
            <li><NavLink to="/archive">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
               Document Archive
            </NavLink></li>
            {/* ADD THE NEW LINKS BELOW */}
            <li><NavLink to="/estimator">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Fee Estimator
            </NavLink></li>
            <li><NavLink to="/compliance">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Compliance Generator
            </NavLink></li>
            <li><NavLink to="/settings">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.053-.022c.563-.23 1.18-.166 1.683.197l.052.052c.42.42.684 1.003.684 1.615c0 .612-.264 1.195-.684 1.615l-.052.052c-.504.363-1.12.427-1.683.197l-.053-.022c-.55-.219-1.02-.684-1.11-1.226zM12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              Team & Settings
            </NavLink></li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-footer">
        {/* ...footer code is unchanged... */}
      </div>
    </aside>
  );
}

export default Sidebar;