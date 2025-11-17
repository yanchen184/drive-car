# Drive & Park - Claude Development Guide

## 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Review `DESIGN_SPEC.md`** for UI/UX requirements and component specifications.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Project location**: All React development happens in the `parking-game/` subdirectory.

## 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize components into clearly separated directories**, grouped by feature or responsibility:
  ```
  src/
  ├── components/
  │   ├── ui/          # UI screens (MainMenu, LevelSelect, HUD)
  │   ├── controls/    # Input controls (SteeringWheel, GearControls)
  │   ├── game/        # Game logic (GameCanvas, Car, ParkingSpot)
  │   └── common/      # Shared components (Button, Modal, etc.)
  ├── hooks/           # Custom React hooks
  ├── utils/           # Helper functions and utilities
  ├── data/            # Level configurations and constants
  └── styles/          # Global styles and Tailwind config
  ```
- **Component organization**:
  - Each complex component should have its own directory with:
    - `ComponentName.jsx` - Main component logic
    - `ComponentName.module.css` - Component-specific styles (if needed beyond Tailwind)
    - `index.js` - Export barrel file
- **Use clear, consistent imports** (prefer named imports over default imports).
- **Use environment variables** via Vite's `import.meta.env` for configuration.

## 🎨 Styling & Design
- **Use Tailwind CSS** as the primary styling solution.
- **Follow the design system** defined in `DESIGN_SPEC.md` for colors, spacing, typography.
- **Responsive design approach**:
  - Mobile-first design (320px minimum width)
  - Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
  - Test on various screen sizes and devices
- **Animations**:
  - Use GSAP for complex animations (menu transitions, game intro/outro)
  - Use CSS transitions for simple hover/focus states
  - Always clean up GSAP timelines in `useEffect` cleanup functions
- **Accessibility**:
  - Maintain WCAG 2.1 AA compliance
  - Ensure keyboard navigation works for all interactive elements
  - Use semantic HTML and ARIA labels where appropriate
  - Provide alternative text for visual indicators

## 🎮 Game Development Best Practices
- **Physics Engine (Matter.js)**:
  - Never update Matter.js bodies directly in React state
  - Use `useRef` to store references to Matter.js objects
  - Implement fixed timestep (16.67ms for 60 FPS) for consistent physics
  - Clean up Matter.js world and bodies on component unmount

- **Performance Optimization**:
  - Pre-load and cache all game assets (sprites, sounds)
  - Use `useMemo` and `useCallback` for expensive computations
  - Implement viewport culling for off-screen objects
  - Monitor FPS and add performance budgets (60 FPS desktop, 30+ FPS mobile)

- **State Management**:
  - Use React Context API for global state (game progress, settings)
  - Use `useReducer` for complex state logic (game state machine)
  - Persist important state (level progress, settings) to localStorage
  - Separate game state from UI state

- **Level Data**:
  - Store level configurations as JSON files in `src/data/levels/`
  - Each level should define: obstacles, parking spot, difficulty, time limits, etc.
  - Validate level data structure on load (consider using PropTypes or TypeScript)

## 🧪 Testing & Reliability
- **Component Testing**:
  - Use Vitest + @testing-library/react for component tests
  - Test user interactions (clicks, drags, keyboard input)
  - Test responsive behavior at different viewports
  - Mock external dependencies (Matter.js, GSAP, localStorage)

- **Game Logic Testing**:
  - Unit test physics calculations (car movement, collision detection, scoring)
  - Test level completion conditions
  - Test edge cases (division by zero, boundary conditions)

- **Integration Testing**:
  - Test complete user flows (start game → complete level → progress)
  - Test state persistence across page refreshes
  - Test error recovery (network failures, localStorage quota exceeded)

- **Manual Testing Checklist**:
  - [ ] Test on real mobile devices (iOS Safari, Android Chrome)
  - [ ] Test touch controls with actual fingers, not mouse emulation
  - [ ] Test on different screen sizes (phone, tablet, desktop)
  - [ ] Test on different refresh rates (60Hz, 90Hz, 120Hz)
  - [ ] Test with reduced motion settings enabled
  - [ ] Test keyboard navigation for accessibility

## ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.
- Update task status with actual completion dates.
- Move completed tasks to a "Completed" section at the bottom.

## 📎 Style & Conventions
- **Use JavaScript (ES6+)** with JSX for React components.
- **Code formatting**:
  - Use ESLint configuration provided in `eslint.config.js`
  - 2-space indentation
  - Single quotes for strings
  - Semicolons at end of statements
  - Trailing commas in objects/arrays

- **Naming Conventions**:
  - Components: PascalCase (`SteeringWheel.jsx`)
  - Hooks: camelCase with "use" prefix (`useCarPhysics.js`)
  - Utilities: camelCase (`calculateScore.js`)
  - Constants: UPPER_SNAKE_CASE (`MAX_SPEED`)
  - CSS classes: kebab-case or Tailwind utilities

- **Component Structure**:
  ```jsx
  import React, { useState, useEffect } from 'react';
  import PropTypes from 'prop-types';

  /**
   * Brief component description
   *
   * @param {Object} props - Component props
   * @param {string} props.name - Prop description
   */
  const ComponentName = ({ name }) => {
    // Hooks
    const [state, setState] = useState(null);

    // Effects
    useEffect(() => {
      // Effect logic
      return () => {
        // Cleanup
      };
    }, []);

    // Event handlers
    const handleClick = () => {
      // Handler logic
    };

    // Render
    return (
      <div className="component-name">
        {/* JSX */}
      </div>
    );
  };

  ComponentName.propTypes = {
    name: PropTypes.string.isRequired,
  };

  export default ComponentName;
  ```

## 📚 Documentation & Explainability
- **Update `README.md`** when:
  - New features are added
  - Dependencies change
  - Setup steps are modified
  - Deployment process changes

- **Code Comments**:
  - Add JSDoc comments for all components and functions
  - Comment non-obvious code with explanations of "why", not just "what"
  - Use `// Reason:` prefix for important implementation decisions
  - Add TODO comments for future improvements: `// TODO: Add error boundary`

- **Component Documentation**:
  - Each component should have a brief description at the top
  - Document props with PropTypes or TypeScript
  - Include usage examples in comments for complex components

## 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or packages** – only use known, verified npm packages.
- **Always confirm file paths and module names** exist before referencing them in code.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **When suggesting new dependencies**, explain why they're needed and check bundle size impact.
- **Test on real devices when possible**, don't rely solely on browser DevTools mobile emulation.

## 🚀 Development Workflow

### Starting Development
1. Navigate to project: `cd parking-game`
2. Install dependencies (if not done): `npm install`
3. Start dev server: `npm run dev`
4. Open browser: `http://localhost:5173`

### Before Committing
1. Run linter: `npm run lint`
2. Build project: `npm run build`
3. Preview production build: `npm run preview`
4. Run tests: `npm run test` (when implemented)
5. Check for console errors and warnings

### Deployment Process
1. **Test production build locally**: `npm run build && npm run preview`
2. **Commit and push changes** to main branch
3. **GitHub Actions** will automatically deploy to gh-pages branch
4. **Verify deployment** at GitHub Pages URL

## 🎯 CI/CD Deployment Guide

**IMPORTANT**: Follow these steps for GitHub Pages deployment:

### Initial Setup (One-Time)
1. **Manually create `gh-pages` branch**:
   ```bash
   git checkout --orphan gh-pages
   echo "<html><body><h1>Site deploying...</h1></body></html>" > index.html
   git add index.html
   git commit -m "Initial gh-pages commit"
   git push origin gh-pages
   git checkout main
   ```

2. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Set source to `gh-pages` branch
   - Save settings

3. **Update `vite.config.js`**:
   ```js
   export default defineConfig({
     base: '/drive-car/', // Replace with your repo name
     // ... other config
   });
   ```

### Automated Deployment (GitHub Actions)
4. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install and Build
           working-directory: ./parking-game
           run: |
             npm ci
             npm run build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./parking-game/dist
   ```

**Reference**: See root `/CLAUDE.md` for additional CI/CD guidance.

## 🔧 Technology Stack

### Core Technologies
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Matter.js**: 2D physics engine
- **GSAP**: Animation library

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **@testing-library/react**: Component testing

### Utilities
- **react-use**: Collection of useful React hooks
- **clsx**: Conditional className utility
- **zustand** (optional): State management if Context API becomes too complex

## 📊 Performance Targets

- **Bundle Size**: < 500KB gzipped
- **Initial Load**: < 3 seconds on 4G
- **FPS**: 60 on desktop, 30+ on mobile
- **Lighthouse Score**: 90+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

## ⚠️ Common Gotchas

1. **Canvas DPI Scaling**: Always account for `devicePixelRatio` when sizing canvas
2. **Touch Event Bubbling**: Use `preventDefault()` to stop page scrolling during gameplay
3. **GSAP Cleanup**: Always kill tweens in cleanup functions to prevent memory leaks
4. **Matter.js State**: Never store Matter.js bodies in React state - use refs
5. **localStorage Quota**: Implement error handling for quota exceeded errors
6. **Vite Asset Imports**: Use `new URL('./asset.png', import.meta.url).href` for dynamic imports
7. **GitHub Pages SPA Routing**: Add 404.html that redirects to index.html for client-side routing
8. **Mobile Safari Viewport**: Use `viewport-fit=cover` and account for safe areas on notched devices
