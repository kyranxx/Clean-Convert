import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { stripeService } from '@/utils/stripe-service';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id || typeof session_id !== 'string') {
      setError('Invalid session');
      setVerifying(false);
      return;
    }

    async function verifyPayment(sessionId: string) {
      try {
        const isPaid = await stripeService.verifySession(sessionId);
        if (!isPaid) {
          setError('Payment verification failed');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Payment verification failed');
      } finally {
        setVerifying(false);
        // Redirect after 5 seconds regardless of verification result
        const timer = setTimeout(() => {
          router.push('/');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }

    verifyPayment(session_id);
  }, [session_id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <Head>
        <title>Payment Status - Image Converter</title>
        <meta name="description" content="Payment verification" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {verifying ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                Verifying Payment...
              </h1>
              <div className="flex justify-center mb-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </>
          ) : error ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-red-600">
                Payment Verification Failed
              </h1>
              <p className="text-gray-600 mb-8">{error}</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4 gradient-text">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-8">
                Thank you for your purchase. Your images will be converted and downloaded shortly.
              </p>
            </>
          )}
          
          <p className="text-sm text-gray-500">
            Redirecting to home page in a few seconds...
          </p>

          <button
            onClick={() => router.push('/')}
            className="btn-primary mt-8"
          >
            Return to Home
          </button>
        </div>
      </main>
    </div>
  );
}
