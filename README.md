# Digital Lava Lamp

A full-screen, softly illuminated procedural lava lamp made with **TypeScript + WebGL2 + GLSL**.

## Run locally

Install Node.js (current LTS), open this folder in VS Code, then use its terminal:

```bash
npm install
npm run dev
```

Open the address printed by Vite (usually `http://localhost:5173/`).

## Controls

- While playing, **click/tap anywhere** to pause and reveal settings.
- While paused, select **top background**, **bottom background**, **lava color**, **speed** (0.5×, 1×, 1.5×, 2×, 3×), and **keep screen awake**.
- Press **Resume** to hide controls and continue.
- On desktop, **Space** pauses/resumes when the document has focus; **Esc** resumes while paused.
- Moving away from the tab/window automatically pauses animation and releases the wake lock. Returning resumes unless you manually paused.
- Local settings persist on the same browser/device.

Wake locks are best-effort; browser, battery saver, or OS policies may prevent them. Browser PWA fullscreen support varies by device.

## Production and GitHub Pages

```bash
npm run build
npm run preview
```

For GitHub Pages: in your repository Settings → Pages → Build and deployment → **GitHub Actions**, the GitHub Actions workflow is already included at `.github/workflows/deploy.yml`; commit and push to `main`. The app uses a relative Vite base for a project-pages URL.

## Important design notes

This is a **runnable foundation**, not the final physically accurate wax simulation. It includes a smooth metaball field, procedural deformation, slow rising/falling, an edge pool, soft shading, and local color contrast adjustments. More natural merge/split dynamics and real-wax timing will be tuned in later iterations.

The graphics fragment shader can be GPU-intensive on older mobile hardware. The renderer limits internal resolution; sustained battery use and FPS should be tested on real phones.
