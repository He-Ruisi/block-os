# Requirements Document

## Introduction

BlockOS is a writing-first, AI-native personal knowledge operating system built with React 18, TypeScript 5, Vite 6, TipTap 2, and Bun. The current `src/` directory suffers from a flat component structure, scattered type definitions, duplicated utilities, repeated IndexedDB initialization across stores, circular dependencies, and business logic mixed into UI components. This refactoring introduces an 8-layer modular architecture with strict one-way dependency flow to resolve these issues while preserving all existing functionality.

## Glossary

- **Type_Layer**: The `src/types/` directory containing unified type definitions with zero dependencies on other project modules
- **Util_Layer**: The `src/utils/` directory containing pure utility functions that depend only on the Type_Layer
- **Storage_Layer**: The `src/storage/` directory containing IndexedDB database initialization and store classes that depend on Type_Layer and Util_Layer
- **Service_Layer**: The `src/services/` directory containing business logic that depends on Type_Layer, Util_Layer, and Storage_Layer
- **Editor_Layer**: The `src/editor/` directory containing TipTap editor extensions that depend on Type_Layer and Storage_Layer
- **Hook_Layer**: The `src/hooks/` directory containing custom React hooks that depend on Type_Layer, Storage_Layer, and Service_Layer
- **Component_Layer**: The `src/components/` directory containing UI components grouped by feature domain that depend on all layers above
- **Assembly_Layer**: The `src/App.tsx` file acting as a slim layout shell and unified initialization point
- **Dependency_Direction**: The strict rule that imports flow only downward through the layer stack (types → utils → storage → services/editor → hooks → components → App.tsx)
- **BlockStore**: The storage class responsible for Block CRUD operations in IndexedDB
- **DocumentStore**: The storage class responsible for Document CRUD operations in IndexedDB
- **ProjectStore**: The storage class responsible for Project CRUD operations in IndexedDB
- **Database_Singleton**: The unified IndexedDB initialization module (`database.ts`) that provides a single shared `IDBDatabase` instance to all stores
- **Block**: A unit of knowledge content with metadata, tags, links, and optional derivation information
- **Document**: A TipTap editor document with title, JSON content, implicit blocks, and project association
- **Project**: A workspace grouping of documents with metadata
- **Tab**: A UI tab representing a today view, project view, or document view
- **Message**: A chat message exchanged between the user and the AI assistant
- **generateUUID**: A utility function that produces UUID v4 strings, currently duplicated in `blockStore.ts` and `projectStore.ts`

## Requirements

### Requirement 1: Unified Type Definitions Layer

**User Story:** As a developer, I want all shared type definitions centralized in a single `types/` directory, so that types are defined once and imported consistently across the codebase.

#### Acceptance Criteria

1. THE Type_Layer SHALL export the Block and BlockDerivative interfaces from `types/block.ts`
2. THE Type_Layer SHALL export the Document and DocumentBlock interfaces from `types/document.ts`
3. THE Type_Layer SHALL export the Project and Tab interfaces from `types/project.ts`
4. THE Type_Layer SHALL export the Message and PanelTab types from `types/chat.ts`
5. THE Type_Layer SHALL re-export all types from `types/index.ts`
6. THE Type_Layer SHALL contain zero import statements referencing other project modules outside `types/`
7. WHEN a type is moved to the Type_Layer, THE Type_Layer SHALL preserve the original interface shape including all properties and their types

### Requirement 2: Pure Utility Functions Layer

**User Story:** As a developer, I want pure utility functions extracted into a dedicated `utils/` directory, so that duplicated logic is eliminated and utilities are reusable across all layers.

#### Acceptance Criteria

1. THE Util_Layer SHALL export a single `generateUUID` function from `utils/uuid.ts` that produces UUID v4 strings
2. THE Util_Layer SHALL export markdown-to-HTML conversion functions from `utils/markdown.ts`
3. THE Util_Layer SHALL export date formatting functions from `utils/date.ts`
4. THE Util_Layer SHALL import only from the Type_Layer or external packages
5. WHEN the `generateUUID` function is consolidated, THE Util_Layer SHALL remove the duplicate definitions from `blockStore.ts` and `projectStore.ts`
6. WHEN the markdown conversion logic is extracted from `App.tsx`, THE Util_Layer SHALL produce identical HTML output for the same markdown input

### Requirement 3: Unified Storage Layer with Single Database Initialization

**User Story:** As a developer, I want a unified storage layer with a single IndexedDB initialization point, so that race conditions from multiple `indexedDB.open` calls are eliminated and all stores share one database connection.

#### Acceptance Criteria

1. THE Database_Singleton SHALL open the IndexedDB database exactly once and provide a shared `IDBDatabase` instance via a `getDatabase()` function
2. THE Database_Singleton SHALL create all required object stores (`blocks`, `documents`, `projects`) during the single `onupgradeneeded` handler
3. WHEN any store in the Storage_Layer needs database access, THE store SHALL obtain the connection from the Database_Singleton instead of calling `indexedDB.open` independently
4. THE Storage_Layer SHALL import only from the Type_Layer, the Util_Layer, or external packages
5. THE BlockStore SHALL preserve all existing CRUD, search, link management, and derivative operations with identical method signatures
6. THE DocumentStore SHALL preserve all existing CRUD, block extraction, and link relation operations with identical method signatures
7. THE ProjectStore SHALL preserve all existing CRUD and document association operations with identical method signatures
8. THE Storage_Layer SHALL export a unified `initStorage()` function from `storage/index.ts` that initializes the database and all stores in a single call
9. IF the database connection fails during initialization, THEN THE Database_Singleton SHALL reject the promise with a descriptive error

### Requirement 4: Business Logic Service Layer

**User Story:** As a developer, I want business logic extracted from UI components into a dedicated `services/` directory, so that components remain focused on rendering and services are testable independently.

#### Acceptance Criteria

1. THE Service_Layer SHALL export an `aiService.ts` module containing the AI API call logic currently embedded in `RightPanel.tsx`, including streaming response handling and response parsing
2. THE Service_Layer SHALL export a `blockCaptureService.ts` module containing the Block capture logic currently embedded in `RightPanel.tsx`, including both manual capture and automatic implicit Block creation
3. THE Service_Layer SHALL export a `gitIntegration.ts` module containing the existing Git integration logic relocated from `lib/gitIntegration.ts`
4. THE Service_Layer SHALL import only from the Type_Layer, the Util_Layer, the Storage_Layer, or external packages
5. WHEN the AI service sends a message, THE aiService SHALL produce identical streaming behavior and response parsing as the current `RightPanel.tsx` implementation

### Requirement 5: Modular Editor Extensions

**User Story:** As a developer, I want TipTap editor extensions split into individual files under `editor/extensions/`, so that each extension is independently maintainable and the circular dependency on `blockStore` is managed through the Storage_Layer.

#### Acceptance Criteria

1. THE Editor_Layer SHALL export the BlockLink extension from `editor/extensions/blockLink.ts`
2. THE Editor_Layer SHALL export the BlockReference extension from `editor/extensions/blockReference.ts`
3. THE Editor_Layer SHALL export the suggestion plugin and `searchBlocks` function from `editor/extensions/suggestion.ts`
4. THE Editor_Layer SHALL re-export all extensions from `editor/extensions/index.ts`
5. THE Editor_Layer SHALL import only from the Type_Layer, the Storage_Layer, or external packages
6. WHEN the extensions are split into individual files, THE Editor_Layer SHALL preserve identical TipTap node schemas, HTML parsing rules, and rendering behavior

### Requirement 6: Feature-Domain Component Organization

**User Story:** As a developer, I want UI components grouped by feature domain under `components/`, so that related components are co-located and the flat directory structure is replaced with a navigable hierarchy.

#### Acceptance Criteria

1. THE Component_Layer SHALL organize layout components (Sidebar, TabBar, ResizeHandle, ActivityBar) under `components/layout/`
2. THE Component_Layer SHALL organize editor components (Editor, SuggestionMenu) under `components/editor/`
3. THE Component_Layer SHALL organize panel components (RightPanel, BlockSpacePanel, DocumentBlocksPanel, BlockDerivativeSelector) under `components/panel/`
4. THE Component_Layer SHALL organize shared components (Toast) under `components/shared/`
5. WHEN components are relocated, THE Component_Layer SHALL preserve each component's props interface unchanged
6. WHEN components are relocated, THE Component_Layer SHALL co-locate each component's CSS file alongside its TSX file in the same subdirectory

### Requirement 7: Custom React Hooks Extraction

**User Story:** As a developer, I want application state logic extracted from `App.tsx` into custom React hooks, so that `App.tsx` becomes a slim layout shell and state management is reusable and testable.

#### Acceptance Criteria

1. THE Hook_Layer SHALL export a `useAppLayout` hook from `hooks/useAppLayout.ts` managing sidebar collapsed state, fullscreen state, and editor width calculation
2. THE Hook_Layer SHALL export a `useTabs` hook from `hooks/useTabs.ts` managing tab creation, selection, closing, and active tab tracking
3. THE Hook_Layer SHALL export a `useBlockSearch` hook from `hooks/useBlockSearch.ts` encapsulating Block search functionality
4. THE Hook_Layer SHALL import only from the Type_Layer, the Storage_Layer, the Service_Layer, or external packages
5. WHEN hooks are extracted from `App.tsx`, THE Assembly_Layer SHALL contain only layout rendering, hook composition, and unified store initialization

### Requirement 8: Strict Dependency Direction Enforcement

**User Story:** As a developer, I want the dependency direction enforced so that imports flow only downward through the layer stack, so that circular dependencies are structurally prevented.

#### Acceptance Criteria

1. THE Type_Layer SHALL contain zero imports from any other project layer
2. THE Util_Layer SHALL contain imports only from the Type_Layer
3. THE Storage_Layer SHALL contain imports only from the Type_Layer and the Util_Layer
4. THE Service_Layer SHALL contain imports only from the Type_Layer, the Util_Layer, and the Storage_Layer
5. THE Editor_Layer SHALL contain imports only from the Type_Layer and the Storage_Layer
6. THE Hook_Layer SHALL contain imports only from the Type_Layer, the Storage_Layer, and the Service_Layer
7. THE Component_Layer SHALL contain imports only from layers above the Component_Layer in the dependency stack
8. IF a module attempts to import from a layer above it in the dependency stack, THEN the TypeScript compiler SHALL report an error or the import SHALL be restructured to respect the Dependency_Direction
9. WHEN the refactoring is complete, THE codebase SHALL pass `bun run type-check` with zero type errors
