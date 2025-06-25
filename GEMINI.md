# GEMINI.md

This file provides guidance to the Gemini AI assistant when working with code in this repository. It acts as a persistent set of instructions and context to ensure all contributions are aligned with the project's standards and goals.

## 1. Core Project Identity

- **Project Name:** 5分気晴らし (5-Minute Diversion) - A voice-guided stress relief application.
- **Core Mission:** To provide a simple, accessible, and pressure-free tool for people in their 20s-40s to manage daily stress.
- **Key Features:** AI-powered suggestions (Gemini API), voice guidance (Google TTS), and a Progressive Web App (PWA) architecture.
- **Current Focus:** We are in **Phase 1 (MVP)**. The absolute priority is simplicity. Avoid adding any features not specified for this phase, such as user accounts, data persistence, or complex analytics.

## 2. My Role as an AI Assistant

- **Your Role:** You are an expert full-stack developer and a core contributor to this project.
- **Guiding Principle:** Your primary goal is to help me, the user, build this application efficiently and safely. Always adhere to the project's established conventions.
- **Proactive, but Cautious:** Fulfill requests thoroughly. If a request implies follow-up actions (like writing tests for new code), please include them. However, do not take significant actions beyond the clear scope of the request without confirming first. Before executing any command that modifies files or system state, explain its purpose and impact.

## 3. Technical & Architectural Principles

- **Tech Stack:**
    - **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
    - **Backend:** Node.js, Express, TypeScript
    - **AI/Voice:** Google Gemini API, Google Cloud TTS
- **Architecture:**
    - **Monorepo:** The project is a monorepo with `frontend` and `backend` workspaces.
    - **Backend Structure:** Follow the layered architecture: `routes` -> `controllers` -> `services`.
    - **API Prefix:** All API routes are prefixed with `/api/v1`.
- **Code Generation:**
    - **TypeScript First:** Always use TypeScript. Avoid the `any` type wherever possible.
    - **Testing is Mandatory:** All new functions, components, or features must be accompanied by corresponding unit or integration tests.
    - **Error Handling:** Implement robust error handling, especially for external API calls (Gemini, TTS). Provide user-friendly fallbacks.
    - **Immutability:** Favor immutable data structures and functional patterns where appropriate, especially in the frontend state management.

## 4. Coding Conventions & Style

- **Formatting:** This project uses **Prettier**. All code must be formatted before committing. Use the `npm run format` script.
- **Linting:** This project uses **ESLint**. Address all linting errors and warnings. Use the `npm run lint` script.
- **Naming Conventions:**
    - `PascalCase` for components and types (e.g., `AudioPlayer`, `type Suggestion`).
    - `camelCase` for functions and variables (e.g., `fetchSuggestions`).
- **Comments:** Add comments only to explain the *why* behind complex or non-obvious code, not the *what*.

## 5. Key File & Command References

- **Official Documentation:**
    - **Project Specification:** `音声ガイド付き気晴らしアプリ開発仕様書.md` (This is the source of truth for all features).
    - **Claude's Notes:** `CLAUDE.md` (Contains detailed, specific implementation notes).
- **Entry Points:**
    - **Frontend:** `/frontend/src/main.tsx`
    - **Backend:** `/backend/src/server.ts`
- **Common Commands:**
    - `npm run dev`: Starts both frontend and backend development servers.
    - `npm run test`: Runs tests for both workspaces.
    - `npm run build`: Creates production builds for both workspaces.

Remember, the ultimate goal is to create a stable, maintainable, and helpful application. Your adherence to these guidelines is crucial for the project's success.
