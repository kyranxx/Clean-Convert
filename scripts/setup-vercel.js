const { execSync } = require('child_process');
const path = require('path');

const commands = [
  // Install Vercel CLI
  'npm install -g vercel@latest',
  
  // Link project with Vercel
  `vercel link --confirm --token ${process.env.VERCEL_TOKEN}`,
  
  // Set environment variables
  `vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY production ${process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY} --token ${process.env.VERCEL_TOKEN}`,
  `vercel env add STRIPE_SECRET_KEY production ${process.env.STRIPE_SECRET_KEY} --token ${process.env.VERCEL_TOKEN}`,
  
  // Deploy to production
  'vercel --prod --confirm'
];

try {
  const projectRoot = path.resolve(__dirname, '..');
  process.chdir(projectRoot);

  commands.forEach(command => {
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`✓ Successfully executed: ${command}`);
    } catch (error) {
      console.error(`✗ Failed to execute: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
  });

  console.log('\n✨ Project linked and configured with Vercel successfully!');
} catch (error) {
  console.error('Failed to setup Vercel:', error.message);
  process.exit(1);
}