# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MetaPrompter is a React/TypeScript web application that helps users create comprehensive, one-shot prompts for software generation tools. The app provides a chat interface where users can iteratively refine their software requirements through conversation with an LLM, ultimately generating a detailed specification that can be transformed into an optimized prompt.

## Development Commands

```bash
# Development
npm run dev                   # Start development server on localhost:5173
npm run build                 # Build for production (tsc + vite build)
npm run preview              # Preview production build locally

# Code Quality
npm run lint                 # Run Biome linter and formatter
npm run type-check           # Run TypeScript type checking without emitting files
```

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand with SQLite persistence
- **Database**: SQLite with better-sqlite3
- **UI Components**: Headless UI for accessible components
- **LLM Integration**: OpenAI API and Google Gemini API with streaming support
- **Code Quality**: Biome for linting and formatting

## Architecture Overview

### Project-Based Data Model

The application uses a **project-based architecture** where each project contains:

- **Project**: Root entity with metadata (name, description, settings)
- **Conversation**: Single conversation per project with message history
- **Specification**: Structured requirements extracted from conversation
- **Generated Prompts**: Multiple prompt generations per project

### Database Schema (SQLite)

```sql
projects (id, name, description, created_at, updated_at, settings)
conversations (id, project_id, created_at, updated_at)
messages (id, conversation_id, role, content, timestamp, is_error)
specifications (id, project_id, conversation_id, title, description, features, technical_requirements, constraints, ui_requirements, created_at, updated_at)
generated_prompts (id, project_id, specification_id, content, created_at)
```

### State Management Architecture

- **Database Service** (`/src/lib/database/database.ts`): Handles all SQLite operations
- **Project Store** (`/src/store/project-store.ts`): Main Zustand store with database integration
- **Legacy Stores**: Session-based stores for backwards compatibility and UI state
- **Auto-save**: All changes automatically persist to database

### AI Integration Pattern

- **Unified Chat Service** (`/src/lib/ai/chat-service.ts`): Abstracts OpenAI and Gemini APIs
- **Streaming Support**: Real-time response streaming with character-by-character display
- **Message Filtering**: `filterMessagesForLLM` prevents consecutive user messages
- **Context Management**: Dynamic system prompts based on conversation state

### Requirements Processing Pipeline

1. **Conversation**: User interacts with AI via chat interface
2. **Extraction**: `SpecificationParser.parseConversation()` extracts structured requirements
3. **Validation**: Robust JSON parsing with error recovery and structure completion
4. **Storage**: Persists to both SQLite database and localStorage
5. **Display**: Real-time updates in requirements panel

## Key Components Structure

### Layout Architecture
- **MainLayout**: Root container managing all application state and project operations
- **TwoColumnLayout**: Left (chat) / Right (requirements) layout with bottom prompt section
- **Header**: Project dropdown, new project button, settings access

### Core Components
- **ChatInterface**: Message display, input, streaming indicators, uses `useChat` hook
- **RequirementsPanel**: Specification display with edit capabilities
- **PromptGenerator**: Prompt creation and export functionality
- **ProjectDropdown**: Project selection with recent projects list

### Data Flow
```
User Input → ChatInterface → useChat → ChatService → AI API
     ↓
Message Storage → Database → ProjectStore → UI Updates
     ↓
SpecificationParser → AI Analysis → Structured Data → RequirementsPanel
     ↓
PromptGenerator → Template System → Comprehensive Prompt → Export
```

## Critical Implementation Details

### Robust JSON Parsing
The `SpecificationParser` includes sophisticated error recovery:
- Handles incomplete/malformed AI responses
- Automatically completes unclosed brackets and braces
- Extracts valid JSON portions from corrupted responses
- Multiple parsing attempts with progressive fixes

### Message Role Management
- **LLM Compatibility**: Prevents consecutive user messages that break AI APIs
- **Error Handling**: Messages marked with `is_error` flag for failed responses
- **Context Preservation**: Maintains conversation flow while adding system context

### Database Integration
- **Auto-save**: All state changes automatically persist
- **Foreign Keys**: Proper relational structure with cascading deletes
- **Transactions**: Atomic operations for data consistency
- **Migration**: Database schema initialization on first run

### Project Management
- **Nanoid IDs**: Uses nanoid for unique project identifiers
- **Project Dropdown**: Recent projects with metadata (message count, creation date)
- **State Switching**: Seamless project switching with full state restoration
- **Settings Persistence**: Project-specific settings stored in database

## Environment Configuration

Required environment variables:
```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4-turbo-preview

# Google Gemini Configuration
VITE_GEMINI_API_KEY=AI...
VITE_GEMINI_MODEL=gemini-1.5-pro

# Application Configuration
VITE_MAX_TOKENS=4000
VITE_MAX_CONVERSATION_LENGTH=50
```

## Development Workflow

### Code Quality
- **TypeScript**: Strict type checking with comprehensive interfaces
- **Biome**: Handles both linting and formatting (replaces ESLint + Prettier)
- **Error Boundaries**: Comprehensive error handling with user-friendly messages
- **State Consistency**: Optimistic updates with automatic rollback on failures

### Testing and Validation
- **Type Safety**: All database operations and AI responses properly typed
- **Error Recovery**: Graceful degradation when AI services fail
- **Data Validation**: Input sanitization and validation throughout
- **Performance**: Efficient re-renders with Zustand state management

### Database Development
- **Local SQLite**: File-based database (`metaprompter.db`) for development
- **Schema Evolution**: Manual schema updates in database service constructor
- **Data Integrity**: Foreign key constraints and proper indexing
- **Backup Strategy**: Database file can be copied for backups

## Common Development Patterns

### Adding New AI Features
1. Extend `ChatService` with new method
2. Add corresponding action to `project-store.ts`
3. Update UI components to call new actions
4. Ensure proper error handling and loading states

### Database Schema Changes
1. Update schema in `DatabaseService.initializeDatabase()`
2. Add corresponding TypeScript types
3. Update CRUD operations in database service
4. Test migration with existing data

### State Management Updates
1. Modify interfaces in `/src/types/`
2. Update Zustand store actions
3. Ensure database persistence for new state
4. Update UI components to use new state

## Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Debounced Updates**: Specification updates debounced to prevent excessive re-renders
- **Token Management**: Efficient token usage and conversation context management
- **Bundle Splitting**: Vite handles code splitting automatically
- **Database Indexing**: Proper indexes on frequently queried columns

## Security & Privacy

- **Local Storage**: All data stored locally in SQLite database
- **API Key Management**: Secure storage in localStorage with settings panel
- **Input Validation**: Comprehensive sanitization of user inputs
- **No Server Dependencies**: Fully client-side application

## Implementation Status

The project is **fully implemented** with all major features working:
- ✅ SQLite database persistence with project management
- ✅ AI-powered requirement gathering with OpenAI and Gemini
- ✅ Structured requirement extraction and editing
- ✅ Comprehensive prompt generation
- ✅ Real-time streaming responses
- ✅ Project switching and state management
- ✅ Error handling and recovery
- ✅ Mobile-responsive design