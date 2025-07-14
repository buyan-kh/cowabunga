# Cowabunga VSCode Fork - Cursor Rules

## Project Overview

This is a revolutionary IDE project forked from VSCode, implementing spatial, visual, and intuitive development environments with features like infinite canvas, visual code flow, and AI-powered assistance.

## Core Development Principles

### 1. **Scalability First**

- Everything must be designed to handle millions of users
- Always consider performance implications at scale
- Design for enterprise-grade reliability and security
- Implement proper error handling and graceful degradation

### 2. **Fix Root Causes, Not Symptoms**

- Always trace issues to their fundamental cause
- Avoid band-aid solutions that create technical debt
- Consider architectural implications of every change
- Document decision rationale for future reference

### 3. **Canvas-First Architecture**

- Prioritize infinite canvas functionality in all UI decisions
- Maintain spatial relationships between code elements
- Ensure zoom levels work consistently across all features
- Design for both detail work and overview modes

## Code Organization & Architecture

### File Structure Guidelines

```
vscode/
├── src/vs/                 # Core VSCode source (minimize changes)
├── src/cowabunga/         # New canvas-based features
│   ├── canvas/            # Infinite canvas implementation
│   ├── visual/            # Visual code flow components
│   ├── navigation/        # Advanced navigation features
│   └── spatial/           # Spatial organization tools
├── extensions/cowabunga/  # Custom extensions
└── resources/cowabunga/   # Canvas-specific resources
```

### Code Style & Conventions

- Use TypeScript for all new features
- Follow existing VSCode patterns where possible
- Implement proper dependency injection
- Use event-driven architecture for canvas updates
- Maintain backward compatibility with existing VSCode extensions

## Feature Implementation Guidelines

### Canvas Features

- **Infinite Canvas**: Implement with efficient viewport culling
- **Zoom Levels**: Support 0.1x to 10x zoom with smooth transitions
- **Spatial Memory**: Persist layout positions across sessions
- **Performance**: Maintain 60fps during canvas operations

### Visual Code Flow

- **Function Graphs**: Generate from AST analysis
- **Dependency Visualization**: Real-time updates on code changes
- **Data Flow**: Show variable lifecycle and transformations
- **Cross-file Navigation**: Seamless transitions between files

### Navigation System

- **History Tracking**: Browser-like navigation with deep history
- **Breadcrumbs**: Visual path representation
- **Search Integration**: Natural language queries
- **Microservice Support**: Handle 15+ service architectures

## Technical Requirements

### Performance Standards

- Canvas rendering: <16ms per frame
- Search results: <100ms for semantic queries
- Layout changes: <200ms for complex rearrangements
- Memory usage: <500MB additional to base VSCode

### Compatibility

- Support all existing VSCode extensions
- Maintain Language Server Protocol compatibility
- Preserve existing keyboard shortcuts
- Ensure theme compatibility (dark/light modes)

### Security & Privacy

- Local-first architecture by default
- Optional cloud features with explicit opt-in
- No code transmission without user consent
- Enterprise-grade security compliance

## Development Workflow

### Branch Strategy

- `main`: Stable release branch
- `develop`: Integration branch for features
- `feature/canvas-*`: Canvas-related features
- `feature/visual-*`: Visual representation features
- `feature/nav-*`: Navigation enhancements

### Testing Requirements

- Unit tests for all canvas operations
- Integration tests for cross-file navigation
- Performance benchmarks for large codebases
- Accessibility tests for keyboard navigation
- Cross-platform testing (Windows, macOS, Linux)

### Code Review Guidelines

- All canvas changes require visual screenshots
- Performance impact analysis for new features
- Accessibility compliance verification
- Security review for any data handling
- Backward compatibility confirmation

## AI Integration Rules

### AI-Powered Features

- **Contextual Suggestions**: Understand spatial code organization
- **Pattern Recognition**: Identify and suggest code patterns
- **Refactoring Assistance**: AI-guided code restructuring
- **Layout Optimization**: Suggest optimal canvas arrangements

### AI Implementation Guidelines

- Make AI features optional and easily disableable
- Ensure AI suggestions respect user's spatial arrangements
- Provide clear feedback on AI decision-making
- Maintain local processing for security-sensitive environments

## User Experience Priorities

### Interface Design

- Minimal, distraction-free environment
- Consistent with VSCode's design language
- Smooth animations and transitions
- Clear visual hierarchy

### Accessibility

- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Gesture support for touch interfaces

### Customization

- Saveable and shareable layouts
- Customizable keyboard shortcuts
- Themeable canvas elements
- Extensible through plugins

## Integration Standards

### Extension Ecosystem

- Maintain VSCode extension API compatibility
- Provide new APIs for canvas interactions
- Support existing language servers
- Enable third-party canvas extensions

### External Tools

- Git integration with visual diff representation
- Debugging with canvas-based stack visualization
- Testing with visual coverage displays
- Documentation generation from canvas layouts

## Quality Assurance

### Code Quality

- Maintain >90% test coverage for new features
- Use TypeScript strict mode
- Implement comprehensive error handling
- Follow clean architecture principles

### Performance Monitoring

- Track canvas rendering performance
- Monitor memory usage patterns
- Measure search response times
- Analyze startup time impact

### User Feedback

- Collect usage analytics (with consent)
- Implement A/B testing for UI changes
- Regular user experience surveys
- Community feedback integration

## Documentation Standards

### Technical Documentation

- API documentation for all canvas features
- Architecture decision records (ADRs)
- Performance optimization guides
- Extension development guides

### User Documentation

- Feature tutorials with visual guides
- Keyboard shortcut references
- Troubleshooting guides
- Migration guides from traditional IDEs

## Release Management

### Version Strategy

- Semantic versioning for all releases
- Beta releases for major canvas features
- LTS versions for enterprise users
- Security patches within 48 hours

### Deployment Pipeline

- Automated testing on all platforms
- Performance regression detection
- Accessibility compliance validation
- Security vulnerability scanning

## Community & Collaboration

### Open Source Approach

- Transparent development process
- Community contribution guidelines
- Regular developer calls
- Public roadmap maintenance

### Enterprise Features

- Optional enterprise-specific features
- Professional support tiers
- Custom deployment options
- Advanced security features

---

## Quick Reference Commands

### Canvas Operations

- `Ctrl+0`: Reset canvas zoom
- `Ctrl+Mouse Wheel`: Zoom in/out
- `Space+Drag`: Pan canvas
- `Ctrl+Shift+L`: Save current layout

### Navigation

- `Ctrl+Alt+Back`: Previous location
- `Ctrl+Alt+Forward`: Next location
- `Ctrl+Shift+F`: Semantic search
- `Ctrl+Shift+G`: Visual function graph

### Layout Management

- `Ctrl+Shift+S`: Save layout
- `Ctrl+Shift+O`: Load layout
- `Ctrl+Shift+R`: Reset to default
- `Ctrl+Shift+T`: Toggle canvas mode

Remember: Every feature should enhance the spatial, visual development experience while maintaining VSCode's core strengths.
