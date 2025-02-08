import { NextApiRequest, NextApiResponse } from 'next';
import { stripeService } from '@/utils/stripe-service';
import { ConversionError } from '@/types/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    const { files, format } = req.body;
    
    if (!files || !format || typeof files !== 'number') {
      return res.status(400).json({
        error: 'Invalid request parameters',
        code: 'INVALID_PARAMETERS'
      });
    }

    const origin = req.headers.origin || 'http://localhost:3000';
    const sessionId = await stripeService.createCheckoutSession(files, format, origin);

    res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Checkout session error:', error);
    
    if (error instanceof ConversionError) {
      res.status(400).json({
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({
        error: 'Failed to create checkout session',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}
