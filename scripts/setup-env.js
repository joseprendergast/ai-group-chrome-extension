const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('TabOrg Environment Setup');
console.log('=======================');

rl.question('Enter your OpenAI API key: ', (apiKey) => {
  const envContent = `# OpenAI API Key for tab categorization
OPENAI_API_KEY=${apiKey}

# Development mode
NODE_ENV=development

# Build configuration
VITE_APP_TITLE=TabOrg
VITE_APP_DESCRIPTION=AI-powered Chrome tab organization extension
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
  console.log('\nEnvironment variables have been set up successfully!');
  console.log('You can now run the extension in development mode.');
  rl.close();
}); 