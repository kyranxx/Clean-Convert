const { execSync } = require('child_process');
const path = require('path');

// Install Vercel CLI if not already installed
try {
  execSync('vercel --version');
} catch {
  execSync('npm install -g vercel');
}

const commands = [
  // Deploy to Vercel
  `vercel --token ${process.env.VERCEL_TOKEN} --confirm --prod`,
  // Set environment variables
  `vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY production ${process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY} --token ${process.env.VERCEL_TOKEN}`,
  `vercel env add STRIPE_SECRET_KEY production ${process.env.STRIPE_SECRET_KEY} --token ${process.env.VERCEL_TOKEN}`
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

  console.log('\n✨ Project deployed to Vercel successfully!');
} catch (error) {
  console.error('Failed to deploy:', error.message);
  process.exit(1);
}