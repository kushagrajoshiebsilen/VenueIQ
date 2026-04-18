# Deployment Options for VenueIQ

To get a public link for your submission, you have two great options:

## Option 1: Vercel (Easiest & Fastest)
Ideal if you've already pushed to GitHub.
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New"** > **"Project"**.
3. Import your `VenueIQ` repository.
4. **Environment Variables**: Add `VITE_GEMINI_API_KEY` and your Firebase keys (from your `.env` file).
5. Click **"Deploy"**.
6. **Result**: You'll get a URL like `https://venueiq.vercel.app`.

## Option 2: Firebase Hosting (Best integration)
Since you are already using Firebase, this keeps everything in one place.
1. Install Firebase tools: `npm install -g firebase-tools`
2. Run `firebase login`
3. Run `firebase init hosting` (Select your project, set public directory to `dist`)
4. Build the project: `npm run build`
5. Deploy: `firebase deploy`
6. **Result**: You'll get a URL like `https://your-project.web.app`.

## Option 3: Cloud Run (If required)
If the competition specifically requires Cloud Run:
1. You would need to create a `Dockerfile`.
2. Use Google Cloud Build to push to Artifact Registry.
3. Deploy the container to Cloud Run.
*(Note: For a frontend-only app, Firebase Hosting or Vercel is much more efficient).*
