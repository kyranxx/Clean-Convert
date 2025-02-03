# Image Converter Setup Guide

## 1. Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create a free account or sign in
3. In the dashboard, go to Developers > API keys
4. You'll find two keys:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)
5. Create a `.env.local` file in the project root and add:
   ```
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_publishable_key
   STRIPE_SECRET_KEY=your_secret_key
   ```

## 2. GitHub Repository Setup
1. Go to [GitHub](https://github.com)
2. Click the '+' icon > New repository
3. Name it 'image-converter'
4. Keep it private
5. Don't initialize with any files
6. Copy the repository URL
7. Update `scripts/init-repo.js` with your repository URL
8. Run:
   ```bash
   node scripts/init-repo.js
   ```

## 3. Vercel Setup
1. Go to [Vercel](https://vercel.com)
2. Sign up with your GitHub account
3. Click "Import Project"
4. Select your GitHub repository
5. Keep the default settings and click Deploy
6. After deployment, go to Settings > General
7. Copy these values:
   - Project ID
   - Organization ID
8. Go to Settings > Tokens
9. Create a new token with full access
10. Add these secrets to your GitHub repository:
    - VERCEL_TOKEN
    - VERCEL_ORG_ID
    - VERCEL_PROJECT_ID
    - NEXT_PUBLIC_STRIPE_PUBLIC_KEY
    - STRIPE_SECRET_KEY

## Environment Variables
Create a `.env.local` file in the project root with:
```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Deployment
The project will automatically deploy to Vercel when you push changes to the main branch. The GitHub Actions workflow handles the CI/CD pipeline.