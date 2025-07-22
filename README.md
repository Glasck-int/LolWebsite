# Glasck - LoL Esports Platform

Glasck is a full-stack esports application for League of Legends data visualization, featuring real-time match tracking, tournament standings, team analytics, and comprehensive player statistics.

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript, React 19, and Tailwind CSS
- **Backend**: Fastify server with TypeScript, Prisma ORM, and PostgreSQL
- **Database**: PostgreSQL with Redis caching
- **Architecture**: Monorepo with separate frontend and backend packages
- **Internationalization**: next-intl (English/French support)

## Key Features

- **League Pages**: Dynamic routing for league-specific content
- **Tournament Standings**: Real-time standings with sorting and filtering
- **Match Scheduling**: Upcoming matches and historical results
- **Team Analytics**: Performance metrics and recent match history
- **Player Statistics**: Comprehensive KDA tracking and player profiles
- **Image Optimization**: Next.js Image component with remote pattern support

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Glasck-int/LolWebsite.git
cd LolWebsite
```

### 2. Configure GitHub Packages
This project uses a private package for shared types.

#### Create a Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate a token with permissions: `read:packages`, `write:packages`

#### Configure npm
```bash
# Global (recommended)
echo //npm.pkg.github.com/:_authToken=YOUR_TOKEN >> %USERPROFILE%\.npmrc
echo @Glasck-int:registry=https://npm.pkg.github.com >> %USERPROFILE%\.npmrc

# Or environment variable
set NPM_TOKEN=YOUR_TOKEN
```

### 3. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 4. Environment Setup
Configure your environment variables:
- `DATABASE_URL` - PostgreSQL connection string for Prisma
- Redis configuration for caching

### 5. Start the project
```bash
npm run dev  # Starts both frontend and backend
```

## Development Commands

### Frontend (Root Directory)
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the Next.js application for production
- `npm run start` - Start the production build
- `npm run lint` - Run ESLint checks

### Backend (backend/ Directory)
- `npm run dev` - Start the backend server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start the production server

## API Endpoints

### Teams
- `GET /teams/name/:name` - Get team by name
- `GET /teams/name/:name/tournament/:tournament/recent-matches` - Recent match results
- `GET /teams/name/:name/tournament/:tournament/recent-games` - Recent game results
- `GET /teams/name/:name/tournament/:tournament/games` - All games for tournament

### Tournaments
- Tournament standings and results endpoints
- Match scheduling and results

### Leagues
- League information and associated tournaments

## Database Schema

The Prisma schema includes comprehensive League of Legends esports data:
- **Leagues & Tournaments**: Tournament hierarchies and metadata
- **Teams & Players**: Team rosters, player information, and redirects
- **Matches**: Game schedules, results, and detailed statistics
- **Standings**: Tournament standings and rankings
- **Game Data**: Detailed match and game statistics

## Project Structure

```
├── src/
│   ├── app/[locale]/           # Next.js App Router with i18n
│   ├── components/             # React components
│   │   ├── leagues/           # League-specific components
│   │   ├── ui/                # shadcn/ui components
│   │   └── navigation/        # Navigation components
│   ├── lib/                   # Utilities and API functions
│   └── contexts/              # React contexts
├── backend/
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── schemas/           # Validation schemas
│   │   └── prisma/            # Database schema and migrations
└── messages/                  # Internationalization files
```

## Shared Types

Types are managed via `@Glasck-int/glasck-types`.

To update types:
```bash
cd packages/types
npm run release:patch
```

To install or update types
```bash
 $env:NPM_TOKEN="YOUT_TOKEN"; npm (update || install) @glasck-int/glasck-types
```

## Configuration

- `next.config.ts` - Next.js configuration with image optimization
- `components.json` - shadcn/ui configuration
- `backend/prisma/schema.prisma` - Database schema
- `eslint.config.mjs` - ESLint configuration

## Monitoring

- Fastify metrics and custom counters
- Redis caching with appropriate TTL values
- Error tracking and performance monitoring