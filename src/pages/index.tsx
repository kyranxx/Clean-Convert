import { useState, useCallback, useEffect } from 'react';
import { ErrorCodes } from '@/types/errors';
import { useDropzone } from 'react-dropzone';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';

// Optional Stripe loading for future use
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : null;

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setFiles(acceptedFiles);
  }, []);

  useEffect(() => {
    // Reset error when format changes
    setError(null);
  }, [selectedFormat]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 100,
  });

  const handleConversion = async () => {
    if (files.length === 0) return;
    
    setConverting(true);
    setError(null);
    setProgress(0);
    
    try {
  // Convert each file one by one
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    setProgress(Math.round((i / files.length) * 100));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', selectedFormat);
    
    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    
    if (response.ok && contentType?.startsWith('image/')) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.split('.')[0]}_converted.${selectedFormat}`;
      a.click();
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(Math.round(((i + 1) / files.length) * 100));
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Conversion failed');
    }
  }
    } catch (error) {
      console.error('Conversion failed:', error);
      setError(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Head>
        <title>Image Converter - Simple & Beautiful</title>
        <meta name="description" content="Convert your images to different formats easily" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-4 gradient-text">
          Image Converter
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Convert your images easily with our beautiful and simple tool
        </p>

        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div
            {...getRootProps()}
            className={`card animated-border ${
              isDragActive ? 'border-primary-300 bg-primary-50' : ''
            } ${error ? 'border-red-300' : ''} transition-all duration-300 ease-in-out cursor-pointer`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4 text-center relative">
              <div className={`text-xl ${isDragActive ? 'text-primary-600' : 'text-gray-600'}`}>
                {isDragActive ? (
                  <p className="animate-float">Drop your images here...</p>
                ) : (
                  <p>Drag & drop images here, or click to select</p>
                )}
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-full inline-block">
                    {files.length} file(s) selected
                  </p>
                  <ul className="text-xs text-gray-500 max-h-24 overflow-y-auto">
                    {files.map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {converting && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">Converting...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Convert to:
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="input-field"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
              <option value="gif">GIF</option>
            </select>
          </div>

          <button
            onClick={handleConversion}
            disabled={files.length === 0 || converting}
            className="btn-primary w-full mt-8"
          >
            {converting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </span>
            ) : (
              'Convert Now'
            )}
          </button>
        </div>

      </main>
    </div>
  );
}
