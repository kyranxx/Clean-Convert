import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';

interface PricingTier {
  range: string;
  price: number;
  description: string;
}

const pricingTiers: PricingTier[] = [
  { range: '2-10', price: 1.99, description: 'Small batch conversion' },
  { range: '11-30', price: 3.99, description: 'Medium batch conversion' },
  { range: '31-100', price: 7.99, description: 'Large batch conversion' },
];

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

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
    try {
      if (files.length === 1) {
        // Free conversion logic
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('format', selectedFormat);
        
        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `converted.${selectedFormat}`;
          a.click();
        }
      } else {
        // Paid conversion logic
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: files.length,
            format: selectedFormat,
          }),
        });
        
        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Image Converter - Simple & Beautiful</title>
        <meta name="description" content="Convert your images to different formats easily" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Image Converter
        </h1>

        <div className="max-w-2xl mx-auto">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-lg text-gray-600">
                {isDragActive ? (
                  <p>Drop your images here...</p>
                ) : (
                  <p>Drag & drop images here, or click to select</p>
                )}
              </div>
              {files.length > 0 && (
                <p className="text-sm text-gray-500">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Convert to:
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
            className={`mt-6 w-full py-3 px-4 rounded-md text-white font-medium
              ${files.length === 0 || converting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-blue-600'}`}
          >
            {converting ? 'Converting...' : 'Convert Now'}
          </button>
        </div>

        {/* Pricing Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.range}
                className="bg-white rounded-lg shadow-lg p-6 text-center"
              >
                <h3 className="text-xl font-semibold mb-2">{tier.range} Images</h3>
                <p className="text-3xl font-bold text-primary mb-4">
                  ${tier.price}
                </p>
                <p className="text-gray-600">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}