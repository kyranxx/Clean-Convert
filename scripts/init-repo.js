const { execSync } = require('child_process');
const path = require('path');

const commands = [
  'git init',
  'git add .',
  'git commit -m "Initial commit: Image converter app setup"',
  'git branch -M main',
  'git remote add origin https://github.com/kyranxx/Clean-Convert.git',
  'git push -u origin main'
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

  console.log('\n✨ Repository initialized and pushed to GitHub successfully!');
} catch (error) {
  console.error('Failed to initialize repository:', error.message);
  process.exit(1);
}