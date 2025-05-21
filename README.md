# Task Management Application

A modern task management application built with React, TypeScript, and Vite. The application uses a feature-based architecture for better organization and maintainability.

## Features

- User authentication with Supabase
- Sprint management
- Dashboard for task overview
- Clean, modern UI with Material-UI

## Architecture

This project uses a feature-based architecture where code is organized by feature rather than by type:

```
src/
  ├── features/            # Feature modules
  │   ├── auth/            # Authentication feature
  │   ├── dashboard/       # Dashboard feature
  │   └── sprints/         # Sprints feature
  ├── shared/              # Shared code across features
  ├── store/               # Redux store configuration
  └── routes/              # Routing configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server:

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Project Structure Guidelines

When working on this project, please follow these guidelines:

### Adding New Features

1. Create a new directory under `src/features/` for your feature
2. Organize your feature with subdirectories:
   - `components/` - UI components specific to this feature
   - `pages/` - Page components
   - `services/` - API services and business logic
   - `hooks/` - Feature-specific hooks
   - `utils/` - Utility functions

### Shared Code

If code is used by multiple features:
1. Move it to the appropriate directory under `src/shared/`
2. Update imports in the dependent features

### State Management

For global state:
1. Create slices in `src/store/slices/`
2. Use the hooks in `src/store/hooks.ts` to access the store

## Documentation

For more detailed information about the project structure and architecture, refer to:
- [Refactoring Documentation](./refactoring-documentation.md)
- [Migration Plan](./migration-plan.md)
- [Refactoring Summary](./refactoring-summary.md)
  },
})
```
