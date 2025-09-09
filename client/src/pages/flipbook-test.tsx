import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlipbookTest() {
  const [currentPage, setCurrentPage] = useState(0);
  
  const pages = [
    {
      id: 'cover',
      title: 'Capa',
      content: 'Organização da Casa - Sistema Simples que Funciona',
      bg: 'bg-gradient-to-br from-purple-600 to-pink-600'
    },
    {
      id: 'intro',
      title: 'Introdução',
      content: 'Você não está sozinha nessa jornada!',
      bg: 'bg-white'
    },
    {
      id: 'chapter1',
      title: 'Capítulo 1',
      content: 'Por que a organização parece impossível?',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50'
    }
  ];

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {/* Page Content */}
      <div className={`w-full h-full flex items-center justify-center ${currentPageData.bg}`}>
        <div className="text-center p-8 max-w-md">
          <h1 className={`font-fredoka text-3xl mb-4 ${
            currentPage === 0 ? 'text-white' : 'text-gray-800'
          }`}>
            {currentPageData.title}
          </h1>
          <p className={`font-poppins text-lg ${
            currentPage === 0 ? 'text-white/90' : 'text-gray-700'
          }`}>
            {currentPageData.content}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`p-4 m-4 rounded-full bg-white/20 backdrop-blur-sm transition-all ${
            currentPage === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white/30'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className={`p-4 m-4 rounded-full bg-white/20 backdrop-blur-sm transition-all ${
            currentPage === pages.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white/30'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Page Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage 
                  ? 'bg-purple-600 scale-125' 
                  : 'bg-gray-400 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Page Counter */}
      <div className="absolute top-6 right-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
          {currentPage + 1} / {pages.length}
        </div>
      </div>
    </div>
  );
}