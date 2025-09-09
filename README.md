# 🌐 Manuels Personal Website
Welcome to the repository for my personal website. This project embodies the brand of a "Creative Force Multiplier," showcasing how to build AI systems that empower creative teams. The live site demonstrates the strategic value of augmenting creative workflows with technology.

You can view the deployed project at: [https://www.manuelito.tech/](https://www.manuelito.tech/)

## 📂 Project Structure

- **public/**: Contains public assets like images, fonts, and videos.
- **src/**: Includes the source code for the portfolio.
- **scripts/**: Node.js scripts for asset optimization.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **astro.config.mjs**: Configuration file for Astro.
- **package.json**: Lists project dependencies and scripts.
- **tailwind.config.mjs**: Configuration file for Tailwind CSS.
- **tsconfig.json**: TypeScript configuration file.

### 🧭 /src structure

The `/src` directory contains the main source code for the project. Below is an overview of its structure:

```
src
├── assets
│   └── (image assets for the project)
├── components
│   ├── DesktopNav.astro
│   ├── MobileNav.astro
│   ├── HamburgerButton.astro
│   ├── VideoBackground.astro
│   ├── ElevenlabsAudioNative.jsx
│   └── ui/ (UI-specific components)
├── consts.ts
├── content
│   ├── blog/ (*.mdx blog posts)
│   └── courses/ (*.mdx course pages)
├── content.config.ts
├── icons
│   └── (*.svg icons)
├── layouts
│   ├── BaseLayout.astro
│   └── BlogPost.astro
├── pages
│   ├── admin/
│   ├── api/
│   │   └── ama/
│   ├── blog
│   │   ├── index.astro
│   │   └── [...slug].astro
│   ├── courses/
│   │   └── [slug].astro
│   ├── courses.astro
│   ├── gallery.astro
│   ├── about.astro
│   ├── index.astro
│   └── rss.xml.js
├── scripts
│   └── theme-initializer.ts
├── styles
│   ├── global.css
│   └── hamburgers.css
├── tests (Playwright E2E test suites)
├── types
│   └── (TypeScript type definitions)
└── utils
    ├── image-preloader.ts
    ├── mobile-navigation.ts
    ├── progressive-loader.ts
    ├── video-background.ts
    ├── faqTemplate.ts
    └── theme.ts
```

#### Explanation

- **assets**: Contains image files used within the Astro project.
- **components**: Contains reusable UI components built with Astro, including a `ui` subdirectory for more generic elements.
- **content**: Contains content collections, primarily Markdown/MDX files for the blog.
- **content.config.ts**: Configuration file for Astro's content collections.
- **icons**: Contains SVG icon files used in the project.
- **layouts**: Contains layout components that define the structure of pages.
- **pages**: Contains the site's pages and API routes. This includes the main pages (`index.astro`, `about.astro`), the blog, and serverless functions under `api/`.
- **scripts**: Contains client-side TypeScript scripts.
- **styles**: Contains global and component-specific CSS files.
- **tests**: Contains end-to-end tests (Playwright).
- **types**: Contains custom TypeScript type definitions.
- **utils**: Contains helper functions and utilities used across the project.

This structure helps in organizing the project files and makes it easier to maintain and scale the project.

## 📜 Available Scripts

### Development
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build

### Testing
- `bun run test` - Run Playwright tests
- `bun run test:smoke` - Run fast smoke suite (core routes + nav)
- `bun run test:ui` - Run tests with UI
- `bun run test:headed` - Run tests in headed mode
- `bun run test:debug` - Run tests in debug mode
- `bun run test:install` - Install Playwright browsers

#### Streamlined Test Strategy
- **Smoke (default in CI quick checks):** `bun run test:smoke` covers homepage render, basic navigation to `about`, `courses`, `blog`, and one blog post.
- **Focused subsets:**
  - Mobile-only: `bun run test:mobile`
  - Navigation suites: `bun run test:navigation`
  - Performance-focused: `bun run test:perf`
- **Full suite:** Use `bun run test` locally or in nightly CI if configured.

This keeps day-to-day runs fast while preserving deep coverage when needed.

### Code Quality
- `bun run lint` - Run Astro type checking
- `bun run lint:fix` - Fix Astro type issues
- `bun run type-check` - Type checking only
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting

### Asset Optimization
- `bun run optimize:video` - Optimize video assets
- `bun run optimize:video:webm` - Optimize video to WebM format
- `bun run check-optimization` - Check video optimization status

## 🚀 Getting Started

To run this project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SkelegonDK/manuelito.git
   cd manuelito
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start the development server:**

   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:4321`.

## 🛠️ Technologies Used

- **Astro**: A modern static site builder.
- **Tailwind CSS**: A utility-first CSS framework.
- **TypeScript**: A statically typed programming language.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🔊 ElevenLabs Audio Native: Setup and Usage

### What it is
- **Component**: `src/components/ElevenlabsAudioNative.jsx` (wrapped by `src/components/ElevenlabsAudioNative.astro`)
- **Usage location**: Included in `src/layouts/BlogPost.astro` to render a player on each blog post.

### Important: Local development behavior
- You won't be able to hear or see the components in your local development environment. This is expected because ElevenLabs Audio Native requires approved, publicly accessible URLs to surface generated audio.

### Critical step: Approve your blog URL in ElevenLabs
- In ElevenLabs, open Audio Native settings and add your blog URL to the approved list.
- Approve at least:
  - Production: `https://www.manuelito.tech/blog`
  - Local dev (optional): `http://localhost:4321/blog`
- This approval enables ElevenLabs to automatically detect your articles and generate voice-overs. Without approval, the player may load but no audio will appear.

### Get your identifiers
- **Public User ID (required)**: Found in your ElevenLabs Audio Native widget snippet or profile.
- **Project ID (optional)**: If you organize content under a specific Audio Native Project, copy its ID.

### Add the player to pages
The blog layout already includes the player:

```astro
---
// src/layouts/BlogPost.astro
import ElevenlabsAudioNative from "@/components/ElevenlabsAudioNative.astro";
---
<ElevenlabsAudioNative
  publicUserId="YOUR_PUBLIC_USER_ID"
/>
```

To place it on another page:

```astro
---
import ElevenlabsAudioNative from "@/components/ElevenlabsAudioNative.astro";
---
<ElevenlabsAudioNative publicUserId="YOUR_PUBLIC_USER_ID" />
```

### How it works
- On mount, the component injects a widget container with data attributes and loads `https://elevenlabs.io/player/audioNativeHelper.js`, then initializes the player.
- When your blog URL is approved, ElevenLabs automatically generates/publishes audio for detected articles. The widget then displays the latest audio for the current page.

### Customization (props)
- **publicUserId** (string, required): Your ElevenLabs public user ID.
- **projectId** (string, optional): Restrict to a specific project if used.
- **size** ("large"|"small", default "large")
- **textColorRgba** (string, default `rgba(0,0,0,1.0)`)
- **backgroundColorRgba** (string, default `rgba(255,255,255,1.0)`)
- **height** (number, default `90`)
- **width** (string|number, default `"100%"`)

Example:

```astro
<ElevenlabsAudioNative
  publicUserId="YOUR_PUBLIC_USER_ID"
  projectId="YOUR_PROJECT_ID"
  size="small"
  textColorRgba="rgba(255,255,255,1)"
  backgroundColorRgba="rgba(0,0,0,0.6)"
  height={80}
  width="100%"
/>
```

### Troubleshooting
- Player loads but no audio:
  - Ensure your blog URL is approved in ElevenLabs Audio Native settings.
  - Confirm the page is publicly accessible (for production).
  - If using `projectId`, verify the article is part of that project.
- Player never renders:
  - Check `publicUserId`.
  - Ensure third-party scripts aren’t blocked by CSP or extensions.
  - For local dev, use the exact dev URL and consider approving it in ElevenLabs.

## 🧱 Brand Color Tokens

Brand colors are defined in `.documentation/style-guide.md`. For overlays and gradients in `BaseLayout.astro`, RGB tokens enable opacity via the `rgb(var(--token) / alpha)` pattern:

```css
:root {
  --nintendbro-rgb: 204 37 44;
  --jabro-rgb: 255 253 116;
  --brony-rgb: 97 64 81;
  --bluey-rgb: 150 199 242;
  --liquirice-rgb: 48 48 48;
}

.video-overlay { background: var(--overlay-gradient); }
:root { --overlay-gradient: linear-gradient(to bottom, rgb(var(--liquirice-rgb)/0.30), rgb(var(--liquirice-rgb)/0.10)); }
```

Tailwind color names: `jabro`, `liquirice`, `nintendbro`, `bluey`, `brony` (see `tailwind.config.mjs`).