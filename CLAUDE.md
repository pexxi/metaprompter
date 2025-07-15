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
- **State Management**: Zustand with IndexedDB persistence
- **Database**: IndexedDB with better-sqlite3
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

### Database Schema (IndexedDB)

```sql
projects (id, name, description, created_at, updated_at, settings)
conversations (id, project_id, created_at, updated_at)
messages (id, conversation_id, role, content, timestamp, is_error)
specifications (id, project_id, conversation_id, title, description, features, technical_requirements, constraints, ui_requirements, tech_stack, created_at, updated_at)
generated_prompts (id, project_id, specification_id, content, created_at, target_platform, generated_with_llm)
```

### State Management Architecture

- **Database Service** (`/src/lib/database/database.ts`): Handles all IndexedDB operations
- **Project Store** (`/src/store/project-store.ts`): Main Zustand store with database integration
- **Legacy Stores**: Session-based stores for backwards compatibility and UI state
- **Auto-save**: All changes automatically persist to database

### AI Integration Pattern

- **Unified Chat Service** (`/src/lib/ai/chat-service.ts`): Abstracts OpenAI and Gemini APIs
- **Prompt Generation Service** (`/src/lib/ai/prompt-generation-service.ts`): LLM-based prompt generation with platform optimization
- **Streaming Support**: Real-time response streaming with character-by-character display
- **Message Filtering**: `filterMessagesForLLM` prevents consecutive user messages
- **Context Management**: Dynamic system prompts based on conversation state
- **Platform Targeting**: Specialized prompt generation for Lovable, v0, Replit, and general platforms

### Requirements Processing Pipeline

1. **Conversation**: User interacts with AI via chat interface
2. **Extraction**: `SpecificationParser.parseConversation()` extracts structured requirements
3. **Validation**: Robust JSON parsing with error recovery and structure completion
4. **Storage**: Persists to IndexedDB database with auto-save
5. **Display**: Real-time updates in requirements panel

### Prompt Generation Pipeline

1. **Requirements Analysis**: LLM analyzes extracted specifications and conversation context
2. **Platform Optimization**: Generates platform-specific guidelines (Lovable, v0, Replit, general)
3. **Architecture Design**: Creates technical architecture recommendations based on requirements
4. **Implementation Planning**: Develops step-by-step implementation strategy
5. **Comprehensive Output**: Produces self-contained, actionable prompts for AI code generation

## Key Components Structure

### Layout Architecture
- **MainLayout**: Root container managing all application state and project operations
- **TwoColumnLayout**: Left (chat) / Right (requirements) layout with bottom prompt section
- **Header**: Project dropdown, new project button, settings access

### Core Components
- **ChatInterface**: Message display, input, streaming indicators, uses `useChat` hook
- **RequirementsPanel**: Specification display with edit capabilities
- **PromptGenerator**: LLM-based prompt generation with platform selection and streaming output
- **ProjectDropdown**: Project selection with recent projects list

### Data Flow
```
User Input → ChatInterface → useChat → ChatService → AI API
     ↓
Message Storage → Database → ProjectStore → UI Updates
     ↓
SpecificationParser → AI Analysis → Structured Data → RequirementsPanel
     ↓
PromptGenerator → PromptGenerationService → LLM Analysis → Platform-Optimized Prompt → Export
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
- **System Message Support**: Supports user, assistant, and system roles for comprehensive LLM interactions
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

### LLM-Based Prompt Generation
- **Platform-Specific Optimization**: Generates tailored prompts for Lovable, v0, Replit, and general platforms
- **Intelligent Architecture Analysis**: LLM analyzes requirements to recommend optimal tech stacks and patterns
- **Streaming Generation**: Real-time prompt generation with character-by-character display
- **Context-Aware Processing**: Incorporates conversation history and structured requirements
- **Self-Contained Output**: Produces comprehensive prompts requiring no additional clarification

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
- **Local IndexedDB**: Browser-based database for development
- **Schema Evolution**: Manual schema updates in database service constructor
- **Data Integrity**: Foreign key constraints and proper indexing
- **Backup Strategy**: Database file can be exported for backups

## Common Development Patterns

### Adding New AI Features
1. Extend `ChatService` with new method for basic chat operations
2. For complex AI operations, create specialized services like `PromptGenerationService`
3. Add corresponding action to `project-store.ts` with database persistence
4. Update UI components to call new actions with proper streaming support
5. Ensure proper error handling, loading states, and API key validation

### Database Schema Changes
1. Update schema in `DatabaseService.initializeDatabase()` with proper indexes
2. Add corresponding TypeScript types and interfaces
3. Update CRUD operations in database service with transaction support
4. Test migration with existing data and handle backward compatibility
5. Update database version number if breaking changes

### State Management Updates
1. Modify interfaces in `/src/types/` with proper typing for new fields
2. Update Zustand store actions with database synchronization
3. Ensure database persistence for new state with auto-save
4. Update UI components to use new state with proper loading states
5. Handle optimistic updates with rollback on failures

### LLM Integration Patterns
1. Create specialized services for different LLM tasks (chat, prompt generation, parsing)
2. Implement streaming support for real-time user feedback
3. Add platform-specific optimization logic for different AI development tools
4. Handle context management and conversation history efficiently
5. Implement robust error recovery and fallback mechanisms

## Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Debounced Updates**: Specification updates debounced to prevent excessive re-renders
- **Token Management**: Efficient token usage and conversation context management
- **Bundle Splitting**: Vite handles code splitting automatically
- **Database Indexing**: Proper indexes on frequently queried columns

## Security & Privacy

- **Local Storage**: All data stored locally in IndexedDB database
- **API Key Management**: Secure storage in localStorage with settings panel
- **Input Validation**: Comprehensive sanitization of user inputs
- **No Server Dependencies**: Fully client-side application

## Implementation Status

The project is **fully implemented** with all major features working:
- ✅ IndexedDB database persistence with project management
- ✅ AI-powered requirement gathering with OpenAI and Gemini
- ✅ Structured requirement extraction and editing with LLM processing
- ✅ LLM-based comprehensive prompt generation with platform optimization
- ✅ Real-time streaming responses for chat and prompt generation
- ✅ Project switching and state management with auto-save
- ✅ Platform-specific prompt optimization (Lovable, v0, Replit, General)
- ✅ Error handling and recovery with graceful degradation
- ✅ Mobile-responsive design with comprehensive notifications