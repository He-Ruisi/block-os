# Implementation Plan: Code Reorganization Phase 5

## Overview

This implementation plan covers Steps 2 and 3 of the Phase 5 code reorganization. Step 1 (high priority improvements) has been completed, including:
- ✅ Merged duplicate files (useToast)
- ✅ Unified style management (src/styles/)
- ✅ Added constants directory (src/constants/)

This plan focuses on:
- **Step 2**: Features architecture, type definitions improvement, service layer optimization
- **Step 3**: Contexts directory, plugin system structure, test directory structure

## Tasks

### Step 1: High Priority Improvements (COMPLETED)

- [x] 1. Merge duplicate files
  - Merged useToast.ts and use-toast.ts
  - Updated all import references
  - _Requirements: 1.1-1.7_

- [x] 2. Unify style management
  - Created src/styles/ directory structure
  - Moved CSS files to src/styles/components/
  - Updated all CSS import paths
  - _Requirements: 2.1-2.7_

- [x] 3. Add constants directory
  - Created src/constants/ with ui.ts, storage.ts, api.ts, editor.ts
  - Extracted magic values to named constants
  - Updated code to use new constants
  - _Requirements: 3.1-3.7_

### Step 2: Medium Priority Improvements (Structure Optimization)

- [x] 4. Introduce Features architecture
  - [x] 4.1 Create feature directory structure
    - Create src/features/ai/{components,hooks,services}
    - Create src/features/editor/{components,hooks,extensions}
    - Create src/features/auth/{components,hooks,services}
    - Create src/features/blocks/{components,hooks,services}
    - _Requirements: 4.1, 4.2_

  - [x] 4.2 Move AI feature files
    - Move src/components/ai/* to src/features/ai/components/
    - Move src/hooks/useAIChat.ts to src/features/ai/hooks/
    - Move src/hooks/useSession.ts to src/features/ai/hooks/
    - Move src/services/aiService.ts to src/features/ai/services/
    - Move src/services/sessionService.ts to src/features/ai/services/
    - Create src/features/ai/index.ts with exports
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 4.3 Move Editor feature files
    - Move src/components/editor/* to src/features/editor/components/
    - Move src/editor/extensions/* to src/features/editor/extensions/
    - Create src/features/editor/index.ts with exports
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 4.4 Move Auth feature files
    - Move src/components/auth/* to src/features/auth/components/
    - Move src/hooks/useAuth.ts to src/features/auth/hooks/
    - Move src/services/authService.ts to src/features/auth/services/
    - Create src/features/auth/index.ts with exports
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 4.5 Move Blocks feature files
    - Move src/components/panel/BlockSpacePanel.tsx to src/features/blocks/components/
    - Move src/components/panel/BlockDetailPanel.tsx to src/features/blocks/components/
    - Move src/components/panel/BlockDerivativeSelector.tsx to src/features/blocks/components/
    - Move src/components/panel/DocumentBlocksPanel.tsx to src/features/blocks/components/
    - Move src/hooks/useBlockSearch.ts to src/features/blocks/hooks/
    - Move src/services/blockCaptureService.ts to src/features/blocks/services/
    - Move src/services/blockReleaseService.ts to src/features/blocks/services/
    - Move src/services/exportService.ts to src/features/blocks/services/
    - Create src/features/blocks/index.ts with exports
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 4.6 Verify dependency hierarchy for features
    - Check that services don't depend on hooks or components
    - Check that hooks don't depend on components
    - Ensure no circular dependencies introduced
    - _Requirements: 4.6, 12.1-12.7_

  - [x] 4.7 Run type check and functional tests
    - Run `bun run type-check` (must pass with 0 errors)
    - Test in browser: editor, AI chat, blocks, auth
    - _Requirements: 4.7, 4.8, 10.1-10.6_

- [x] 5. Improve type definitions
  - [x] 5.1 Create type subdirectories
    - Create src/types/models/
    - Create src/types/api/
    - Create src/types/common/
    - _Requirements: 5.1_

  - [x] 5.2 Move model types
    - Move src/types/block.ts to src/types/models/block.ts
    - Move src/types/document.ts to src/types/models/document.ts
    - Move src/types/project.ts to src/types/models/project.ts
    - Move src/types/chat.ts to src/types/models/chat.ts
    - _Requirements: 5.2_

  - [x] 5.3 Move common types
    - Move src/types/layout.ts to src/types/common/layout.ts
    - Move src/types/plugin.ts to src/types/common/plugin.ts
    - Move src/types/ocr.ts to src/types/common/ocr.ts
    - _Requirements: 5.2_

  - [x] 5.4 Update types index.ts
    - Update src/types/index.ts to re-export all types from subdirectories
    - _Requirements: 5.3, 5.4_

  - [x] 5.5 Run type check
    - Run `bun run type-check` (must pass with 0 errors)
    - _Requirements: 5.5, 5.6, 10.1-10.6_

- [ ] 6. Optimize Service layer
  - [x] 6.1 Create service subdirectories
    - Create src/services/api/
    - Create src/services/business/
    - Create src/services/integration/
    - Create src/services/core/
    - _Requirements: 6.1_

  - [x] 6.2 Move API layer services
    - Move src/services/aiService.ts to src/services/api/aiService.ts
    - Move src/services/authService.ts to src/services/api/authService.ts
    - _Requirements: 6.2_

  - [x] 6.3 Move business logic services
    - Move src/services/blockCaptureService.ts to src/services/business/blockCaptureService.ts
    - Move src/services/blockReleaseService.ts to src/services/business/blockReleaseService.ts
    - Move src/services/exportService.ts to src/services/business/exportService.ts
    - Move src/services/sessionService.ts to src/services/business/sessionService.ts
    - _Requirements: 6.2_

  - [x] 6.4 Move integration layer services
    - Move src/services/syncService.ts to src/services/integration/syncService.ts
    - Move src/services/autoSyncService.ts to src/services/integration/autoSyncService.ts
    - Move src/services/gitIntegration.ts to src/services/integration/gitIntegration.ts
    - Move src/services/ocrBlockService.ts to src/services/integration/ocrBlockService.ts
    - _Requirements: 6.2_

  - [x] 6.5 Move core services
    - Move src/services/pluginAPI.ts to src/services/core/pluginAPI.ts
    - Move src/services/pluginRegistry.ts to src/services/core/pluginRegistry.ts
    - _Requirements: 6.2_

  - [x] 6.6 Create services index.ts
    - Create src/services/index.ts to re-export all services
    - _Requirements: 6.2, 6.3_

  - [x] 6.7 Verify service layer dependencies
    - Check that services don't depend on hooks or components
    - Ensure dependency hierarchy is maintained
    - _Requirements: 6.4, 12.1-12.7_

  - [x] 6.8 Run type check and functional tests
    - Run `bun run type-check` (must pass with 0 errors)
    - Test in browser: all services function correctly
    - _Requirements: 6.5, 6.6, 10.1-10.6_

- [x] 7. Checkpoint - Step 2 complete
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 10.1-10.6_

### Step 3: Low Priority Improvements (Long-term Optimization)

- [x] 8. Add Contexts directory
  - [x] 8.1 Create contexts directory
    - Create src/contexts/
    - _Requirements: 7.1_

  - [x] 8.2 Identify extractable contexts (optional)
    - Review codebase for global state that could be Context
    - Consider AuthContext, ThemeContext for future use
    - _Requirements: 7.2_

  - [x] 8.3 Create Context files (optional)
    - Create src/contexts/AuthContext.tsx (if needed)
    - Create src/contexts/ThemeContext.tsx (if needed)
    - Follow naming convention: <Name>Context.tsx
    - _Requirements: 7.3_

  - [x] 8.4 Create contexts index.ts
    - Create src/contexts/index.ts with exports
    - _Requirements: 7.4_

  - [x] 8.5 Update components to use new Contexts (if created)
    - Update relevant components to use Context providers
    - _Requirements: 7.5_

  - [x] 8.6 Run type check and functional tests
    - Run `bun run type-check` (must pass with 0 errors)
    - Test Context functionality in browser
    - _Requirements: 7.6, 7.7, 10.1-10.6_

- [x] 9. Improve Plugin system structure
  - [x] 9.1 Create plugin subdirectories
    - Create src/plugins/core/
    - Create src/plugins/built-in/
    - _Requirements: 8.1_

  - [x] 9.2 Move OCR plugin to built-in
    - Move src/plugins/ocr-plugin/ to src/plugins/built-in/ocr-plugin/
    - _Requirements: 8.2_

  - [x] 9.3 Create plugin core files
    - Create src/plugins/core/types.ts (re-export from @/types/common/plugin)
    - Create src/plugins/core/base.ts (optional base class)
    - _Requirements: 8.3_

  - [x] 9.4 Create plugins index.ts
    - Create src/plugins/index.ts to export core and built-in plugins
    - _Requirements: 8.1, 8.2_

  - [x] 9.5 Run type check and functional tests
    - Run `bun run type-check` (must pass with 0 errors)
    - Test plugin functionality (OCR) in browser
    - _Requirements: 8.4, 8.5, 10.1-10.6_

- [x] 10. Add test directory structure
  - [x] 10.1 Create test directories
    - Create src/__tests__/unit/
    - Create src/__tests__/integration/
    - Create src/__tests__/e2e/
    - Create src/__tests__/fixtures/
    - Create src/__tests__/utils/
    - _Requirements: 9.1, 9.2_

  - [x] 10.2 Create test README
    - Create src/__tests__/README.md with testing guidelines
    - Document test structure, naming conventions, and commands
    - _Requirements: 9.3_

  - [x] 10.3 Move existing test files (if any)
    - Move any existing test files to appropriate test directories
    - _Requirements: 9.4_

  - [x] 10.4 Create example test file (optional)
    - Create src/__tests__/unit/utils/uuid.test.ts as example
    - _Requirements: 9.5_

  - [x] 10.5 Run type check
    - Run `bun run type-check` (must pass with 0 errors)
    - _Requirements: 9.6, 10.1-10.6_

- [x] 11. Checkpoint - Step 3 complete
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 10.1-10.6_

### Cross-cutting Tasks (Apply to All Steps)

- [x] 12. Update documentation
  - [x] 12.1 Update CLAUDE.md
    - Update project structure section with new directory layout
    - _Requirements: 11.1_

  - [ ] 12.2 Update docs/ARCHITECTURE.md
    - Update architecture diagram
    - Update directory structure explanation
    - Update dependency hierarchy diagram
    - _Requirements: 11.2_

  - [ ] 12.3 Update .kiro/rules/structure.md
    - Update directory descriptions
    - Update naming conventions
    - Update dependency hierarchy rules
    - _Requirements: 11.3_

  - [ ] 12.4 Update tsconfig.json (if necessary)
    - Add path aliases for new directories (@features/*, @contexts/*, etc.)
    - _Requirements: 11.4_

  - [ ] 12.5 Update vite.config.ts (if necessary)
    - Add resolve aliases for new directories
    - _Requirements: 11.5_

  - [-] 12.6 Create reorganization summary
    - Create docs/guide/phase5-reorganization-summary.md
    - Document all changes made
    - Provide migration guide for developers
    - _Requirements: 11.6_

  - [ ] 12.7 Run final type check
    - Run `bun run type-check` (must pass with 0 errors)
    - _Requirements: 11.7_

- [ ] 13. Final verification
  - [ ] 13.1 Verify dependency hierarchy
    - Check types → utils → storage → services → hooks → components
    - Verify features follow dependency rules internally
    - Ensure no circular dependencies
    - _Requirements: 12.1-12.7_

  - [ ] 13.2 Run comprehensive functional tests
    - Test editor loading and editing
    - Test AI conversation functionality
    - Test Block creation and references
    - Test document save and load
    - Test plugin functionality (OCR)
    - Test styles display correctly
    - Test responsive layout
    - _Requirements: 10.3, 10.4_

  - [ ] 13.3 Create Git commit
    - Create meaningful commit message for Phase 5 completion
    - _Requirements: 10.5_

## Notes

- All file moves should use `smartRelocate` tool to automatically update import paths
- Run `bun run type-check` after each major step to catch issues early
- Test in browser after each step to ensure functionality is preserved
- Each checkpoint is an opportunity to pause and verify with the user
- Step 1 is already complete, focus on Steps 2 and 3
- Features architecture (Step 2) is the most complex and highest risk
- Plugin and test directory changes (Step 3) are lower risk
- Documentation updates should happen continuously throughout implementation
