# Stripe Minions MVP1 - Next.js App Structure

This project is a Next.js application with a structured layout to facilitate development and maintainability.

## Project Structure

- `src/app`: Contains the main application routes and layout.
  - `layout.tsx`: Root layout for the application.
  - `page.tsx`: The main landing page.
- `src/components`: Reusable UI components.
  - `ui`: Shadcn/ui components or other generic UI components.
    - `button.tsx`: Example button component.
    - `card.tsx`: Example card component.
- `src/lib`: Utility functions, helpers, and configurations.
  - `utils.ts`: General utility functions.
- `src/styles`: Global styles and Tailwind CSS configuration.
  - `globals.css`: Global CSS file.
- `public`: Static assets like images, fonts, etc.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `postcss.config.js`: PostCSS configuration.
- `next.config.js`: Next.js configuration.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This structure provides a clear separation of concerns, making it easier to scale and manage the application.
