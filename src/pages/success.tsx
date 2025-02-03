import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (!session_id) return;

    // Here you could verify the session with Stripe
    // and handle any post-payment processing
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [session_id, router]);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Payment Successful - Image Converter</title>
        <meta name="description" content="Payment successful" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your purchase. Your images will be converted shortly.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected back to the home page in a few seconds...
          </p>
        </div>
      </main>
    </div>
  );
}