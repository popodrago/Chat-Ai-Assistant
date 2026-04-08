# AI Chat Assistant

Intelligent conversations powered by advanced AI models.

## Deployment to GitHub Pages

This project is configured for automated deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1.  **Configure API Key**:
    *   Go to your repository on GitHub.
    *   Navigate to **Settings** > **Secrets and variables** > **Actions**.
    *   Add a **New repository secret**:
        *   Name: `NEXT_PUBLIC_GEMINI_API_KEY`
        *   Value: (Your Gemini API Key from [Google AI Studio](https://aistudio.google.com/))

2.  **Enable GitHub Pages**:
    *   Go to **Settings** > **Pages**.
    *   Under **Build and deployment** > **Source**, select **GitHub Actions**.

3.  **Firebase Configuration**:
    *   Ensure your GitHub Pages domain (e.g., `your-username.github.io`) is added to the **Authorized domains** in your Firebase Console under **Authentication** > **Settings**.

### Local Development

```bash
npm install
npm run dev
```

### Manual Build

```bash
npm run build
```
The static files will be generated in the `out` folder.
