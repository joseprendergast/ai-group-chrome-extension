# TabOrg - AI-Powered Chrome Tab Organization

A Chrome extension that uses AI to automatically organize your tabs into logical groups.

## Features

- AI-powered tab categorization
- Manual tab grouping by keyword/domain
- Undo functionality
- Admin dashboard with statistics
- Beautiful purple and fuchsia UI theme

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/taborg.git
cd taborg
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Build the extension:
```bash
npm run build
```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory

## Development

- Run development server:
```bash
npm run dev
```

- Run tests:
```bash
npm test
```

- Run end-to-end tests:
```bash
npm run test:e2e
```

## Usage

1. Click the TabOrg icon in your Chrome toolbar
2. Use "AI Suggest" to get automatic tab grouping suggestions
3. Or use the manual grouping feature to create custom groups
4. Access the admin dashboard through `chrome://extensions` or the extension options

## Tech Stack

- TypeScript
- React
- Tailwind CSS
- OpenAI GPT-4
- Chrome Extension Manifest V3

## License

MIT 