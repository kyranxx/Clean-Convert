import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState('Processing your conversion...');

  useEffect(() => {
    if (session_id) {
      // Here you would typically trigger your batch conversion process
      // For now, we'll just show a success message
      setTimeout(() => {
        setStatus('Conversion complete! You can now download your files.');
      }, 2000);
    }
  }, [session_id]);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Success - Image Converter</title>
        <meta name="description" content="Conversion success page" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Thank you for your purchase!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {status}
            </p>

            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Convert More Images
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}