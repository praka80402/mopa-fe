import React from 'react';

const RobotSvg = ({ isSpeaking, width = 48 }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ width: `${width}px`, height: `${width}px`, display: 'block' }}
    >
      <circle cx="50" cy="50" r="45" fill="url(#bg-gradient)" stroke="url(#border-gradient)" strokeWidth="3" />
      <rect x="22" y="44" width="8" height="12" rx="2" fill="#475569" />
      <rect x="70" y="44" width="8" height="12" rx="2" fill="#475569" />
      <rect x="15" y="38" width="8" height="24" rx="4" fill="#FF9933" />
      <rect x="77" y="38" width="8" height="24" rx="4" fill="#128807" />
      <path d="M26 44C26 30.7452 36.7452 20 50 20C63.2548 20 74 30.7452 74 44V60C74 65.5228 69.5228 70 64 70H36C30.4772 70 26 65.5228 26 60V44Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2"/>
      <rect x="32" y="34" width="36" height="22" rx="6" fill="#020617" stroke="#38BDF8" strokeWidth="1.5" />
      <circle cx="43" cy="43" r="3.5" fill="#38BDF8">
        <animate attributeName="opacity" values="1;0.3;1" dur="4s" repeatCount="indefinite" />
        {isSpeaking && <animate attributeName="r" values="3.5;2;3.5" dur="0.3s" repeatCount="indefinite" />}
      </circle>
      <circle cx="57" cy="43" r="3.5" fill="#38BDF8">
        <animate attributeName="opacity" values="1;0.3;1" dur="4s" repeatCount="indefinite" />
        {isSpeaking && <animate attributeName="r" values="3.5;2;3.5" dur="0.3s" repeatCount="indefinite" />}
      </circle>
      {isSpeaking ? (
        <path d="M44 50Q50 54 56 50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" values="M44 50Q50 54 56 50;M44 50Q50 46 56 50;M44 50Q50 54 56 50" dur="0.25s" repeatCount="indefinite" />
        </path>
      ) : (
        <path d="M44 50H56" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      )}
      <line x1="50" y1="20" x2="50" y2="10" stroke="#64748B" strokeWidth="2.5" />
      <circle cx="50" cy="7" r="4.5" fill="#FF9933">
        <animate attributeName="fill" values="#FF9933;#FFFFFF;#128807;#FF9933" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="4.5;5.5;4.5" dur="1s" repeatCount="indefinite" />
      </circle>
      <defs>
        <linearGradient id="bg-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="border-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#128807" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default RobotSvg;
