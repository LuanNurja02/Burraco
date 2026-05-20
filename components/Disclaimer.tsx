'use client';

import { useState, useEffect } from 'react';

export default function Disclaimer() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('burraco-disclaimer-seen');
    if (!seen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShow(false);
      localStorage.setItem('burraco-disclaimer-seen', 'true');
    }, 300);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center transform transition-all duration-300 ${
          fadeOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="text-6xl mb-4">🃏</div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Burraco Manager
        </h2>

        <div className="w-16 h-1 bg-primary-600 mx-auto mb-4 rounded-full" />

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Applicazione professionale per la gestione di partite e tornei di Burraco.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sviluppato da</p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
            Luan Nurja
          </p>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500 mb-6 space-y-1">
          <p>Tutti i dati vengono salvati localmente nel browser.</p>
          <p>Nessun dato viene inviato a server esterni.</p>
        </div>

        <button
          onClick={handleClose}
          className="w-full btn-primary text-base py-3 px-6 rounded-xl font-semibold"
        >
          Inizia a giocare
        </button>
      </div>
    </div>
  );
}
