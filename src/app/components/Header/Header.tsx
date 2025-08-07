import React, { useState } from 'react';
import { AuthModal } from '../AuthModal/AuthModal';

export function Header() {
    const [showAuth, setShowAuth] = useState(false);
  return (
    <header className="w-full fixed top-0 left-0 bg-white shadow z-50">
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">SERENZO</div>
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <a href="#about" className="hover:text-blue-600">Quem somos</a>
          <a href="#benefits" className="hover:text-blue-600">Vantagens</a>
          <a href="#testimonials" className="hover:text-blue-600">Depoimentos</a>
          <a href="#footer" className="hover:text-blue-600">Contato</a>
        </nav>
        <div>
        <button onClick={() => setShowAuth(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Entrar</button>
        </div>
      </div>
    </header>
  );
}