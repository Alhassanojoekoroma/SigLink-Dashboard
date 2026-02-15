# Deployment Guide

This project is built with Next.js and uses Supabase for the backend. It is ready to be deployed to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Supabase Project**: Ensure you have your Supabase project URL and Anon Key.

## Deploying to Vercel

### Option 1: Vercel CLI (Recommended)

1.  Open a terminal in the project root.
2.  Run the following command:
    ```bash
    npx vercel
    ```
3.  Follow the prompts:
    -   Set up and deploy? **Y**
    -   Which scope? (Select your team/user)
    -   Link to existing project? **N**
    -   Project name? **sig-link** (or your preference)
    -   Directory? **./** (default)
    -   Want to modify settings? **N**

4.  **Important**: Set Environment Variables
    -   Go to the Vercel Dashboard for your new project.
    -   Navigate to **Settings > Environment Variables**.
    -   Add the following variables (copy values from your `.env.local`):
        -   `NEXT_PUBLIC_SUPABASE_URL`
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5.  Redeploy (if needed) for env vars to take effect:
    ```bash
    npx vercel --prod
    ```

### Option 2: Git Integration

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project in Vercel Dashboard.
3.  In the "Environment Variables" section during import, add:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  Click **Deploy**.

## Verification

After deployment, open the provided URL and check:
-   Dashboard loads with data from Supabase.
-   "Add Subscription" works.
-   Theme toggle works.

## Troubleshooting

-   **Build Failures**: Check Vercel logs. Common issues are missing environment variables during build (though we added lazy loading to prevent crashes, the app needs them at runtime).
-   **Data Issues**: Ensure your Supabase RLS policies allow public read/write (or are configured correctly for your auth model).
