# MetaPrompter

A React/TypeScript web application designed to help users create comprehensive, one-shot prompts for AI software generation tools. The app provides a chat interface where users can iteratively refine their software requirements through conversation with an LLM, ultimately generating a detailed specification that can be transformed into an optimized prompt.

## Features

### 🤖 AI-Powered Requirement Gathering
- Interactive chat interface with OpenAI GPT and Google Gemini
- Real-time streaming responses
- Intelligent follow-up questions to clarify requirements
- Contextual conversation management

### 📋 Smart Requirements Extraction
- Automatic extraction of structured requirements from conversations
- Categorized requirements: Features, Technical, UI/UX, and Constraints
- Priority and importance level assignment
- Manual editing capabilities for fine-tuning

### 🎯 Comprehensive Prompt Generation
- Professional software development prompts
- Industry-standard formatting optimized for AI code generation
- Includes implementation guidelines, quality standards, and deliverables
- Copy-to-clipboard and download functionality

### 💾 Data Persistence
- Local storage for conversations and requirements
- Project management with "New Project" functionality
- Complete state management with Zustand

### 🔔 User Experience
- Real-time notifications for user feedback
- Comprehensive error handling with helpful messages
- Responsive design for desktop and mobile
- Loading states and progress indicators

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI API, Google Gemini API
- **Development**: ESLint, Prettier, TypeScript

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key and/or Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd metaprompter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
VITE_OPENAI_API_KEY=sk-your-openai-key-here
VITE_GEMINI_API_KEY=AI-your-gemini-key-here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### 1. Configure API Keys
- Click the "Settings" button in the header
- Add your OpenAI and/or Google Gemini API keys
- Select your preferred AI provider

### 2. Start a Conversation
- Begin describing your software requirements in the chat interface
- The AI will ask clarifying questions about technologies, features, and constraints
- Continue the conversation until you have comprehensive requirements

### 3. Extract Requirements
- Click "Update Requirements" to automatically extract structured requirements
- Review the generated requirements in the right panel
- Edit manually if needed using the "Edit" button

### 4. Generate Prompt
- Click "Generate Prompt" to create a comprehensive software development prompt
- Copy the prompt to your clipboard or download as a text file
- Use the generated prompt with any AI code generation tool

### 5. Start New Projects
- Click "New Project" to clear all data and start fresh
- Your API keys and settings will be preserved

## Project Structure

```
src/
├── components/
│   ├── chat/           # Chat interface components
│   ├── requirements/   # Requirements management
│   ├── prompt/         # Prompt generation
│   ├── settings/       # Configuration panels
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/
│   ├── ai/             # AI service integrations
│   ├── specification/  # Requirement processing
│   └── prompts/        # Prompt generation logic
├── store/              # Zustand state management
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4-turbo-preview

# Google Gemini Configuration
VITE_GEMINI_API_KEY=AI...
VITE_GEMINI_MODEL=gemini-1.5-pro

# Application Configuration
VITE_APP_NAME=MetaPrompter
VITE_APP_VERSION=1.0.0
VITE_MAX_TOKENS=4000
VITE_MAX_CONVERSATION_LENGTH=50
```

## Architecture

### State Management
- **Chat Store**: Manages conversations and messages
- **Specification Store**: Handles requirements and specifications
- **Settings Store**: Manages user preferences and API keys
- **Notification Store**: Handles user feedback and error messages

### AI Integration
- **OpenAI Service**: GPT model integration with streaming
- **Gemini Service**: Google Gemini integration
- **Chat Service**: Unified interface for AI providers

### Data Flow
1. User interacts with chat interface
2. Messages are processed and stored
3. AI responds with contextual questions
4. Requirements are extracted from conversations
5. Structured specifications are generated
6. Comprehensive prompts are created for code generation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**MetaPrompter** - Transforming conversations into comprehensive software development prompts.