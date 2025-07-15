# MetaPrompter - Implementation Plan

## Project Overview

**MetaPrompter** is a web application designed to help users create comprehensive, one-shot prompts for software generation tools. The app provides a chat interface where users can iteratively refine their software requirements through conversation with an LLM, ultimately generating a detailed specification that can be transformed into an optimized prompt.

## Core Features

### 1. Chat Interface

- Interactive chat UI for requirement gathering
- Real-time conversation with LLM (OpenAI GPT or Google Gemini)
- Message history and conversation persistence
- Typing indicators and message status

### 2. Requirements Processing

- Parse user input for software requirements
- Extract features, functionality, and constraints
- Maintain a dynamic specification document
- Real-time specification updates as conversation progresses

### 3. Specification Generation

- Transform chat conversation into structured software specification
- Include technical requirements, features, UI/UX considerations
- Support for different types of software (web apps, mobile, desktop)
- Export specification in multiple formats

### 4. Prompt Generation

- Convert specification into a comprehensive, structured prompt
- Generic prompt optimized for any code generation tool
- Copy-to-clipboard functionality
- Clear, detailed prompt formatting

## Technical Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS for rapid UI development
- **State Management**: Zustand (lightweight alternative to Redux)
- **UI Components**: Headless UI or shadcn/ui for accessible components

### LLM Integration

- **SDK**: Vercel AI SDK
- **Providers**: OpenAI API, Google Gemini API
- **Streaming**: Real-time response streaming
- **Context Management**: Conversation context and token management

### Development Tools

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality

## Project Structure

```
metaprompter/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── TwoColumnLayout.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── requirements/
│   │   │   ├── RequirementsPanel.tsx
│   │   │   ├── RequirementsEditor.tsx
│   │   │   └── RequirementsDisplay.tsx
│   │   ├── prompt/
│   │   │   ├── PromptGenerator.tsx
│   │   │   └── PromptOutput.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── Textarea.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useSpecification.ts
│   │   └── usePromptGeneration.ts
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── openai.ts
│   │   │   ├── gemini.ts
│   │   │   └── chat-service.ts
│   │   ├── specification/
│   │   │   ├── parser.ts
│   │   │   ├── generator.ts
│   │   │   └── types.ts
│   │   └── prompts/
│   │       ├── generators.ts
│   │       └── optimizers.ts
│   ├── store/
│   │   ├── chat-store.ts
│   │   ├── specification-store.ts
│   │   └── settings-store.ts
│   ├── types/
│   │   ├── chat.ts
│   │   ├── specification.ts
│   │   └── prompt.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Environment Configuration

### Required Environment Variables

```bash
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

## Key Components Design

### 1. Main Layout (`MainLayout.tsx`)

```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}
```

### 2. Header (`Header.tsx`)

```typescript
interface HeaderProps {
  onNewProject: () => void;
  projectTitle?: string;
  onProjectTitleChange?: (title: string) => void;
}
```

### 3. Chat Interface (`ChatInterface.tsx`) - Left Column

```typescript
interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedModel: 'openai' | 'gemini';
  apiKey: string;
}
```

### 4. Requirements Panel (`RequirementsPanel.tsx`) - Right Column

```typescript
interface RequirementsPanelProps {
  requirements: Specification;
  onUpdateRequirements: () => void;
  onRequirementsChange: (requirements: Specification) => void;
  isUpdating: boolean;
}
```

### 5. Prompt Generator (`PromptGenerator.tsx`) - Bottom Section

```typescript
interface PromptGeneratorProps {
  requirements: Specification;
  onGeneratePrompt: () => void;
  generatedPrompt?: string;
  isGenerating: boolean;
}
```

### 6. Two Column Layout (`TwoColumnLayout.tsx`)

```typescript
interface TwoColumnLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  bottomSection: React.ReactNode;
}
```

## Data Models

### Specification Type

```typescript
interface Specification {
  id: string;
  title: string;
  description: string;
  features: Feature[];
  technicalRequirements: TechnicalRequirement[];
  constraints: Constraint[];
  uiRequirements: UIRequirement[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversation Type

```typescript
interface Conversation {
  id: string;
  messages: Message[];
  specification: Specification;
  createdAt: Date;
  updatedAt: Date;
}
```

## Application Layout

### Two-Column Layout Structure

**Left Column - Chat Interface:**

- Interactive chat input for developer-AI discussion
- AI asks clarifying questions about requirements (technologies, functional/non-functional requirements)
- Message history cached locally for persistence
- Scrollable conversation history

**Right Column - Requirements Summary:**

- Dynamic summary of all gathered requirements
- Real-time updates as conversation progresses
- "Update requirements" button to refresh summary from cached discussion
- Editable requirements display

**Bottom Section - Full Width:**

- Final prompt generation area
- "Generate prompt" button to trigger prompt creation
- Generated prompt display with copy-to-clipboard functionality
- Generic prompt generation interface

**Top Section - Header:**

- "New Project" button to reset entire application state
- Clear cache and all fields functionality
- Project title/name input (optional)

## User Experience Flow

1. **Start New Project**: User clicks "New Project" button to begin fresh
2. **Chat Interaction**:
   - User describes initial software requirements in left chat panel
   - AI asks clarifying questions about technologies, features, constraints
   - Conversation continues until requirements are comprehensive
3. **Requirements Update**:
   - User clicks "Update requirements" button in right panel
   - AI processes cached conversation and generates structured requirements summary
4. **Review & Edit**: User reviews and can manually edit the generated requirements
5. **Generate Prompt**:
   - User clicks "Generate prompt" button
   - AI creates optimized prompt based on gathered requirements
6. **Export & Use**: User copies generated prompt for use in code generation tools

## Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Debounced Updates**: Specification updates debounced to prevent excessive re-renders
- **Token Management**: Efficient token usage and conversation context management
- **Caching**: API responses cached where appropriate
- **Bundle Splitting**: Code splitting for optimal loading

## Security & Privacy

- **API Key Storage**: Secure local storage of API keys
- **No Server Storage**: All data stored locally in browser
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Client-side rate limiting for API calls

## Future Enhancements

- **Multiple Conversations**: Support for multiple concurrent projects
- **Collaboration**: Share specifications with team members
- **Version Control**: Track specification changes over time
- **Prompt Customization**: User-defined prompt formatting options
- **AI Model Comparison**: Compare outputs from different AI models
- **Export Formats**: Additional export formats (PDF, DOCX)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Add your OpenAI and/or Gemini API keys
5. Start development server: `npm run dev`
6. Open `http://localhost:5173` in your browser

## Success Metrics

- **Usability**: Users can create complete specifications within 15 minutes
- **Accuracy**: Generated prompts produce desired software 80% of the time
- **Efficiency**: Reduce prompt creation time by 60% compared to manual writing
- **Adoption**: Positive user feedback and regular usage patterns

## Implementation Phases

### Phase 1: Project Setup & Layout Structure (Week 1) ✅ COMPLETED

- [x] Initialize Vite + React + TypeScript project
- [x] Set up Tailwind CSS and basic styling
- [x] Create MainLayout and TwoColumnLayout components
- [x] Implement Header with "New Project" button
- [x] Set up responsive two-column design
- [x] Set up development tools (ESLint, Prettier, Husky)

### Phase 2: Chat Interface - Left Column (Week 2) ✅ COMPLETED

- [x] Design and implement ChatInterface component
- [x] Create MessageList with scrollable history
- [x] Add MessageInput with send functionality
- [x] Implement typing indicators and loading states
- [x] Add local storage for message persistence
- [x] Create AI conversation flow for requirement gathering

### Phase 3: LLM Integration & AI Logic (Week 3) ✅ COMPLETED

- [x] Set up Vercel AI SDK
- [x] Implement OpenAI API integration
- [x] Add Google Gemini API support
- [x] Create AI prompts for requirement clarification
- [x] Implement streaming responses
- [x] Add error handling and fallbacks
- [x] Create API key management system

### Phase 4: Requirements Panel - Right Column (Week 4) ✅ COMPLETED

- [x] Create RequirementsPanel component
- [x] Implement "Update requirements" button functionality
- [x] Build RequirementsEditor for manual editing
- [x] Add RequirementsDisplay with structured view
- [x] Create AI service for processing cached conversations
- [x] Implement real-time requirements updates

### Phase 5: Prompt Generation - Bottom Section (Week 5) ✅ COMPLETED

- [x] Design PromptGenerator component
- [x] Add "Generate prompt" button functionality
- [x] Create PromptOutput with copy-to-clipboard
- [x] Implement generic prompt generation logic
- [x] Add prompt formatting and optimization
- [x] Create comprehensive prompt structure

### Phase 6: State Management & Polish (Week 6) ✅ COMPLETED

- [x] Implement global state management (Zustand)
- [x] Add "New Project" functionality to reset state
- [x] Create comprehensive error handling
- [x] Add loading states for all async operations
- [x] Implement data persistence (localStorage)
- [x] Performance optimization and testing
