import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 py-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 px-6">
        <div className="font-bold text-lg">
          <span className="text-emerald-400">&lt;</span>
          <span className="text-white">Pass</span>
          <span className="text-emerald-400">OP/&gt;</span>
        </div>
        <p className="text-slate-500 text-xs">
          Encrypted credential vault • AES-256-GCM
        </p>
      </div>
    </footer>
  );
};

export default Footer;