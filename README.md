# StudyPath

StudyPath is a Ramkhamhaeng graduation operating system built with React, Tailwind CSS, Framer Motion, Recharts, and Firebase.

## Features

- Firebase authentication with Google and email/password
- Firestore cloud sync per user
- LocalStorage fallback before sign-in
- Persistent subject progress, notes, checklist, timer, flashcards, and streak
- Semester roadmap and cumulative credit tracking
- Mobile-first productivity dashboard

## Local Setup

1. Install Node.js from [nodejs.org](https://nodejs.org).
2. Install dependencies:

```bash
npm install
```

3. Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
4. Enable Authentication providers:
   - Google
   - Email/password
5. Create a Firestore database.
6. Copy `.env.example` to `.env.local` and fill in your Firebase web app values.
7. Start the app:

```bash
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Add the same Firebase environment variables from `.env.example` in Vercel Project Settings.
4. Use these build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

## Firebase Rules

The included `firestore.rules` file only allows users to read and write their own study document.

## Notes

This workspace does not currently have `npm` installed, so dependencies were not installed locally here. The project is ready for `npm install` on a normal Node environment or on Vercel.
