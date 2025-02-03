# Clean Convert

A minimalist and beautiful web application for converting images between different formats.

## Features

- Drag and drop interface for easy file uploads
- Support for popular image formats (PNG, JPG, WebP, GIF)
- Single image conversion for free
- Batch conversion with competitive pricing:
  - 2-10 images: $1.99
  - 11-30 images: $3.99
  - 31-100 images: $7.99
- Secure payment processing with Stripe
- Automatic deployment with GitHub Actions and Vercel

## Tech Stack

- Next.js for frontend and API routes
- TailwindCSS for styling
- Sharp for image processing
- Stripe for payments
- TypeScript for type safety
- Vercel for hosting

## Development

1. Clone the repository:
```bash
git clone https://github.com/kyranxx/Clean-Convert.git
cd Clean-Convert
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The application automatically deploys to Vercel when changes are pushed to the main branch. To set up deployment:

1. Create a Vercel account and install Vercel CLI:
```bash
npm install -g vercel
```

2. Set up environment variables in Vercel:
```bash
vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY
vercel env add STRIPE_SECRET_KEY
```

3. Deploy to Vercel:
```bash
vercel --prod
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `node scripts/setup-vercel.js` - Set up Vercel project and environment variables
- `node scripts/deploy-vercel.js` - Deploy to Vercel manually