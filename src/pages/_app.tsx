import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}