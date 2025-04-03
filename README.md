# ServiHub Report Handling System

## Overview

This is a full-stack Report Handling System built for ServiHub's trust and safety pipeline. The application allows users to submit reports (for abuse, spam, or inappropriate content) and provides an admin interface to view and resolve these reports.

## Features

### User-side: Report Submission
- Form to submit reports with:
  - Report type selection (review, user, business, service, other)
  - Target ID input
  - Reason selection (spam, harassment, misleading)
  - Optional description field

### Admin-side: Report Management
- Table view of all submitted reports
- Filter reports by status (resolved/unresolved) or type
- Functionality to mark reports as resolved
- Display of submission and resolution details

### Bonus Features
- Admin authentication with role-based access control
- Report rejection flow with reason for dismissal
- Notifications for user actions
- Sorting and pagination for the reports table

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database ORM**: Prisma
- **Styling**: TailwindCSS

## Project Structure

```
Report-Handling-System/
├── .vscode/             # VS Code configuration
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router
│   ├── components/      # UI components
│   ├── lib/             # Utility functions and shared logic
│   ├── pages/           # Routes (if using Pages Router)
│   ├── types/           # TypeScript type definitions
├── .gitignore           # Git ignore file
├── components.json      # shadcn/ui configuration
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/report-handling-system.git
   cd report-handling-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your-database-connection-string"
   # Add any other required environment variables
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database:
   ```bash
   npx prisma db seed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## API Routes

### Report Submission
- `POST /api/reports` - Submit a new report

### Report Management
- `GET /api/reports` - Get all reports (with optional filtering)
- `PUT /api/reports/:id` - Update a report status
- `GET /api/reports/:id` - Get a specific report

## Authentication

The system includes role-based authentication to restrict admin functionality. Admin users can:

- View all submitted reports
- Resolve or reject reports
- Filter and sort through reports

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
