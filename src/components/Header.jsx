import React from 'react';
import { Shield, Globe2, Landmark } from 'lucide-react';

function Header({ currentPortal, onTogglePortal, user, onLogout, appLanguage, onToggleLanguage }) {
  return (
    <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--gray-border)' }}>
      {/* 1. Indian flag tricolor top border strip */}
      <div className="tricolor-strip">
        <div className="tricolor-saffron"></div>
        <div className="tricolor-white"></div>
        <div className="tricolor-green"></div>
      </div>

      {/* 2. Top meta nav */}
      <div style={{ backgroundColor: '#F8FAFC', padding: '6px 0', fontSize: '0.8rem', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ display: 'flex', color: '#475569' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="https://www.india.gov.in/" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="top-nav-link">
              भारत सरकार | GOVERNMENT OF INDIA
            </a>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <a href="https://www.mpa.gov.in/" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="top-nav-link">
              संसदीय कार्य मंत्रालय | MINISTRY OF PARLIAMENTARY AFFAIRS
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main header content */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
        {/* Logo and Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src="/mopa_logo.png" 
            alt="Ministry of Parliamentary Affairs Logo" 
            style={{ height: '65px', objectFit: 'contain' }} 
          />
        </div>

        {/* Action Buttons & Portal Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Digital India Logo */}
          <div style={{ display: 'flex', alignItems: 'center', borderRight: '1px solid var(--gray-border)', paddingRight: '15px' }}>
            <img 
              src="/digital_india.png" 
              alt="Digital India Logo" 
              style={{ height: '55px', objectFit: 'contain' }} 
            />
          </div>

          {/* User Profile / Portal Switcher */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>{user.phone ? `Mobile: ${user.phone}` : 'Administrator'}</div>
              </div>
              <button onClick={onLogout} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                Log Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onTogglePortal} 
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Shield size={14} />
              {currentPortal === 'user' ? 'Admin Portal' : 'User Portal'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
