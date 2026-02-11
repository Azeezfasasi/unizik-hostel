'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Set up the worker with the local version
if (typeof window !== 'undefined') {
  // Use the local worker file to avoid CORS issues
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
}

export default function PDFViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8 border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">PDF Document</h2>
      <div className="flex flex-col items-center">
        {/* Controls Section */}
        <div className="mb-4 w-full">
          {/* Page Info */}
          <p className="text-gray-700 font-medium text-center text-sm sm:text-base mb-3">
            Page {pageNumber} {numPages && `of ${numPages}`}
          </p>
          
          {/* Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 sm:items-center sm:justify-center">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPageNumber(Math.min(numPages || pageNumber, pageNumber + 1))}
              disabled={numPages && pageNumber >= numPages}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              Next →
            </button>
            <a
              href={pdfUrl}
              download
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 font-medium transition text-center"
            >
              Download
            </a>
          </div>
        </div>

        {/* PDF Container */}
        <div className="w-full overflow-x-auto flex justify-center bg-gray-100 p-2 sm:p-4 rounded-lg">
          <div className="max-w-full">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p className="text-gray-600 text-center py-8">Loading PDF...</p>}
              error={<p className="text-red-600 text-center py-8">Error loading PDF</p>}
            >
              <Page pageNumber={pageNumber} width={Math.min(window.innerWidth - 48, 600)} />
            </Document>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="mb-4 w-full">
          {/* Page Info */}
          <p className="text-gray-700 font-medium text-center text-sm sm:text-base mb-3">
            Page {pageNumber} {numPages && `of ${numPages}`}
          </p>
          
          {/* Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 sm:items-center sm:justify-center">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPageNumber(Math.min(numPages || pageNumber, pageNumber + 1))}
              disabled={numPages && pageNumber >= numPages}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              Next →
            </button>
            <a
              href={pdfUrl}
              download
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 font-medium transition text-center"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
