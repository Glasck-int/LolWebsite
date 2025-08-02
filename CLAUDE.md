# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glasck is a full-stack esports application for League of Legends data visualization, featuring:
- **Frontend**: Next.js 15 with TypeScript, React 19, and Tailwind CSS
- **Backend**: Fastify server with TypeScript, Prisma ORM, and PostgreSQL
- **Architecture**: Monorepo with separate frontend and backend packages

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

## Architecture

### Backend Structure
- **Server**: Fastify with TypeScript, running on port 3000
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis integration for API responses
- **API**: RESTful endpoints with Swagger documentation
- **Monitoring**: Fastify metrics and custom counters

### Database Schema
The Prisma schema includes comprehensive League of Legends esports data:
- **Leagues & Tournaments**: Tournament hierarchies and metadata
- **Teams & Players**: Team rosters, player information, and redirects
- **Matches**: Game schedules, results, and detailed statistics
- **Standings**: Tournament standings and rankings
- **Game Data**: Detailed match and game statistics

### Frontend Structure
- **Internationalization**: next-intl for multi-language support (English/French)
- **UI Components**: shadcn/ui with custom card, button, and form components
- **Routing**: App Router with dynamic routes for leagues and tournaments
- **State Management**: React Server Components with client-side interactions
- **Styling**: Tailwind CSS v4 with custom design system

### Key Features
- **League Pages**: Dynamic routing for league-specific content (`/leagues/[leagueName]`)
- **Standings**: Tournament standings with tabs and sorting functionality
- **Match Scheduling**: Upcoming matches and results display
- **Team Analytics**: Team performance metrics and recent match history
- **Image Optimization**: Next.js Image component with remote pattern support

## API Endpoints

### Teams
- `GET /teams/name/:name` - Get team by name
- `GET /teams/name/:name/tournament/:tournament/recent-matches` - Recent match results
- `GET /teams/name/:name/tournament/:tournament/recent-games` - Recent game results
- `GET /teams/name/:name/tournament/:tournament/games` - All games for tournament

### Tournaments
- Tournament standings and results endpoints (check backend/src/routes/tournaments/)

### Leagues
- League information and associated tournaments (check backend/src/routes/leagues/)

## Configuration

### Environment Setup
- Backend requires PostgreSQL database and Redis
- Configure `DATABASE_URL` environment variable for Prisma
- Image optimization configured for localhost:3000 static assets

### Key Configuration Files
- `next.config.ts` - Next.js configuration with image optimization
- `components.json` - shadcn/ui configuration
- `backend/prisma/schema.prisma` - Database schema
- `eslint.config.mjs` - ESLint configuration

## Development Patterns

### Component Structure
- Use shadcn/ui components as base building blocks
- Custom components in `src/components/` organized by feature
- Barrel exports via `index.ts` files for clean imports

### API Integration
- Client-side API calls using fetch with error handling
- Server-side data fetching in page components
- Redis caching with appropriate TTL values

### Styling Conventions
- Tailwind CSS with utility-first approach
- Custom CSS variables for theming
- Responsive design with mobile-first approach

### Code Organization
- Feature-based directory structure
- Shared utilities in `src/lib/`
- Custom hooks in `src/lib/hooks/`
- Type definitions alongside components