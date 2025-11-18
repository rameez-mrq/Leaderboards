# CS7IS3 Search Engine Leaderboard

A modern leaderboard application built with SvelteKit to display student MAP scores for the CS7IS3 Search Engine assignment.

## Development

```sh
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying to GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Push your code to GitHub**
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
   - Save the settings

3. **The deployment will run automatically**
   - Every push to `main` or `master` branch will trigger a deployment
   - You can also manually trigger it from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

4. **Access your site**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - If your repository name is `Leaderboards`, the URL will be: `https://YOUR_USERNAME.github.io/Leaderboards/`

### If deploying to a subdirectory

If your repository name is not the root path, update `svelte.config.js`:

```js
kit: {
  paths: {
    base: '/your-repo-name'  // Uncomment and set your repo name
  }
}
```

### Manual Deployment

If you prefer to deploy manually:

```sh
npm run build
# Then push the 'build' folder contents to the 'gh-pages' branch
```

## Project Structure

```
├── src/
│   ├── routes/
│   │   ├── +layout.svelte    # Layout wrapper
│   │   ├── +layout.ts        # Prerender configuration
│   │   └── +page.svelte      # Main leaderboard page
│   └── app.css               # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment workflow
└── svelte.config.js          # SvelteKit configuration with static adapter
```

## Technologies

- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
