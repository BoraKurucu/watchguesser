# Deployment Guide

To update your website with the latest changes (including Terms of Service and Privacy Policy), you must run the build command before deploying.

### 1. Build the Static Files
This command generates the latest version of your website in the `out` folder.
```bash
npm run build
```

### 2. Deploy to Firebase
This command uploads the contents of the `out` folder to Firebase Hosting.
```bash
firebase deploy
```

### Why was it not updating?
By default, `firebase deploy` only uploads the files currently in the `public` (or `out`) directory. If you haven't run `npm run build` since making changes, you are essentially re-deploying the old version of the site.

### Custom Domains
If `watchguesser.watch` is connected to your Firebase project, these two commands together will update it. If it is hosted elsewhere (like Vercel), you may need to use their specific deployment tools instead.
