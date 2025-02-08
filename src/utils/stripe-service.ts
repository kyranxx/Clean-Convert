import Stripe from 'stripe';
import { ConversionError, ErrorCodes } from '@/types/errors';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export interface PriceTier {
  minImages: number;
  maxImages: number;
  priceInCents: number;
  description: string;
}

export const PRICE_TIERS: PriceTier[] = [
  { minImages: 2, maxImages: 10, priceInCents: 199, description: 'Small batch conversion' },
  { minImages: 11, maxImages: 30, priceInCents: 399, description: 'Medium batch conversion' },
  { minImages: 31, maxImages: 100, priceInCents: 799, description: 'Large batch conversion' },
];

export class StripeService {
  private getPriceForImageCount(count: number): PriceTier | null {
    if (count <= 1) return null;
    return PRICE_TIERS.find(
      tier => count >= tier.minImages && count <= tier.maxImages
    ) || null;
  }

  async createCheckoutSession(imageCount: number, format: string, origin: string): Promise<string> {
    const priceTier = this.getPriceForImageCount(imageCount);
    
    if (!priceTier) {
      throw new ConversionError(
        'Invalid number of images for batch conversion',
        ErrorCodes.INVALID_PARAMETERS
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Image Conversion',
                description: `Convert ${imageCount} images to ${format} format`,
              },
              unit_amount: priceTier.priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}`,
      });

      return session.id;
    } catch (error) {
      console.error('Stripe error:', error);
      throw new ConversionError(
        'Failed to create payment session',
        ErrorCodes.PAYMENT_ERROR
      );
    }
  }

  async verifySession(sessionId: string): Promise<boolean> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session.payment_status === 'paid';
    } catch (error) {
      console.error('Session verification error:', error);
      throw new ConversionError(
        'Failed to verify payment session',
        ErrorCodes.PAYMENT_ERROR
      );
    }
  }
}

export const stripeService = new StripeService();
