# MetaPrompter

A React/TypeScript web application designed to help users create comprehensive, one-shot prompts for AI software generation tools. The app provides a chat interface where users can iteratively refine their software requirements through conversation with an LLM, ultimately generating a detailed specification that can be transformed into an optimized, platform-specific prompt using advanced AI prompt engineering.

## Features

### 🤖 AI-Powered Requirement Gathering

- Interactive chat interface with OpenAI GPT and Google Gemini
- Real-time streaming responses with character-by-character display
- Intelligent follow-up questions to clarify requirements
- Contextual conversation management with message filtering
- Advanced system prompts that adapt based on conversation state

### 📋 Smart Requirements Extraction

- LLM-powered extraction of structured requirements from conversations
- Categorized requirements: Features, Technical, UI/UX, Constraints, and Tech Stack
- Priority and importance level assignment with intelligent classification
- Robust JSON parsing with error recovery and structure completion
- Manual editing capabilities for fine-tuning extracted requirements

### 🎯 LLM-Enhanced Prompt Generation

- **AI-Powered Prompt Engineering**: Uses LLMs to create comprehensive software development prompts
- **Platform-Specific Optimization**: Specialized prompts for Lovable, v0, Replit, and general platforms
- **Intelligent Architecture Analysis**: AI analyzes requirements and suggests optimal tech stacks
- **Comprehensive Coverage**: Includes project overview, technical architecture, implementation plans, and quality standards
- **Streaming Generation**: Real-time prompt generation with live preview
- Copy-to-clipboard and download functionality with prompt statistics

### 💾 Project-Based Data Management

- **Complete Project Architecture**: Full project management with persistent storage
- **IndexedDB Database**: Local database for conversations, requirements, and generated prompts
- **Auto-save Functionality**: All changes automatically persist to database
- **Project History**: Track multiple generated prompts per project with platform targeting
- **Data Integrity**: Robust database operations with transaction support

### 🔔 Enhanced User Experience

- Real-time notifications with detailed feedback
- Comprehensive error handling with helpful recovery suggestions
- Responsive design optimized for desktop and mobile
- Loading states and progress indicators throughout the application
- Platform selection with context-aware prompt optimization

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with optimized configuration
- **Styling**: Tailwind CSS with responsive design
- **State Management**: Zustand with database integration
- **AI Integration**:
  - OpenAI API with `@ai-sdk/openai`
  - Google Gemini API with `@ai-sdk/google`
  - Unified AI SDK with streaming support
- **Database**: IndexedDB with `idb` for local persistence
- **Development**: Biome (ESLint + Prettier replacement), TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
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

### 1. Configure AI Settings

- Click the "Settings" button in the header
- Add your OpenAI and/or Google Gemini API keys
- Select your preferred AI provider and configure parameters

### 2. Start a Project Conversation

- Begin describing your software requirements in the chat interface
- The AI will ask clarifying questions about technologies, features, and constraints
- Continue the conversation until you have comprehensive requirements
- All messages are automatically saved to your project

### 3. Extract and Refine Requirements

- Click "Update Requirements" to use AI-powered extraction of structured requirements
- Review the intelligently categorized requirements in the right panel
- Edit manually if needed using the intuitive editing interface
- Requirements include features, technical specs, UI/UX needs, constraints, and tech stack

### 4. Generate Platform-Optimized Prompts

- Select your target platform: Lovable, v0, Replit, or General
- Click "Generate Prompt" to create a comprehensive, AI-optimized software development prompt
- Watch real-time streaming generation with live preview
- Copy the prompt to your clipboard or download as a text file
- Generated prompts include architecture analysis, implementation plans, and platform-specific optimizations

### 5. Manage Projects

- All work is automatically saved to your local database
- Create new projects to organize different software requirements
- Switch between projects to compare different approaches
- Your API keys and settings persist across projects

## Project Structure

```
src/
├── components/
│   ├── chat/           # Enhanced chat interface with streaming
│   ├── requirements/   # AI-powered requirements management
│   ├── prompt/         # LLM-based prompt generation
│   ├── project/        # Project management and selection
│   ├── settings/       # Configuration and API key management
│   ├── layout/         # Responsive layout components
│   └── ui/             # Reusable UI components with notifications
├── hooks/              # Custom React hooks for complex operations
├── lib/
│   ├── ai/             # Advanced AI service integrations
│   │   ├── chat-service.ts        # Unified AI provider interface
│   │   ├── prompt-generation-service.ts  # LLM prompt engineering
│   │   ├── openai.ts             # OpenAI integration
│   │   └── gemini.ts             # Google Gemini integration
│   ├── database/       # IndexedDB persistence layer
│   ├── specification/  # LLM-powered requirement processing
│   ├── prompts/        # Template-based prompt utilities
│   └── utils/          # Message filtering and processing
├── store/              # Zustand state management with database sync
├── types/              # Comprehensive TypeScript definitions
└── utils/              # General utility functions
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run Biome linting and formatting
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...

# Google Gemini Configuration
VITE_GEMINI_API_KEY=AI...

# Application Configuration (Optional)
VITE_APP_NAME=MetaPrompter
VITE_APP_VERSION=1.0.0
VITE_MAX_TOKENS=4000
VITE_MAX_CONVERSATION_LENGTH=50
```

## Architecture

### Database Schema

```sql
projects (id, name, description, created_at, updated_at, settings)
conversations (id, project_id, messages, created_at, updated_at)
specifications (id, project_id, conversation_id, title, description, features, technical_requirements, constraints, ui_requirements, tech_stack, created_at, updated_at)
generated_prompts (id, project_id, specification_id, content, created_at, target_platform, generated_with_llm)
```

### State Management Architecture

- **Database Service**: IndexedDB operations with transaction support
- **Project Store**: Main Zustand store with automatic database synchronization
- **Auto-save**: All changes automatically persist to local database
- **Legacy Compatibility**: Session-based stores for UI state management

### AI Integration Architecture

- **Unified Chat Service**: Abstracts OpenAI and Gemini APIs with consistent interface
- **Prompt Generation Service**: LLM-based comprehensive prompt engineering
- **Streaming Support**: Real-time response streaming for both chat and prompt generation
- **Message Filtering**: Intelligent conversation filtering to prevent API errors
- **Context Management**: Dynamic system prompts that adapt to conversation state
- **Platform Targeting**: Specialized optimization for different AI development platforms

### Requirements Processing Pipeline

1. **Conversation**: User interacts with AI via enhanced chat interface
2. **LLM Extraction**: AI-powered analysis extracts structured requirements from natural language
3. **Validation**: Robust JSON parsing with error recovery and intelligent structure completion
4. **Storage**: Automatic persistence to IndexedDB with transaction integrity
5. **Display**: Real-time updates in organized requirements panel

### Prompt Generation Pipeline

1. **Requirements Analysis**: LLM analyzes extracted specifications and conversation context
2. **Platform Optimization**: Generates platform-specific guidelines (Lovable, v0, Replit, general)
3. **Architecture Design**: AI creates technical architecture recommendations
4. **Implementation Planning**: Detailed step-by-step development approach
5. **Quality Standards**: Comprehensive testing, performance, and security requirements

## Platform-Specific Optimizations

### Lovable

- React/TypeScript with modern practices
- Component-based architecture emphasis
- Tailwind CSS styling guidelines
- Database models and API endpoints
- Real-time features and state management
- User authentication patterns

### v0

- React with Next.js optimization
- Component composition focus
- Specific UI component requirements
- Responsive design with Tailwind CSS
- Modern React patterns (hooks, context)

### Replit

- Multi-language support
- Complete project setup
- Educational and collaborative features
- Well-commented code patterns
- Testing and debugging approaches

### General

- Platform-agnostic specifications
- Multiple technology stack options
- Industry standard best practices
- Comprehensive documentation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

Please ensure your code follows the Biome formatting standards and passes TypeScript checks.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**MetaPrompter** - Transforming conversations into comprehensive, platform-optimized software development prompts using advanced AI prompt engineering.
