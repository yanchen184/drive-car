## FEATURE:

**Drive & Park - Educational Parking Game**

A web-based parking simulation game with 15 progressive levels designed to teach proper parking techniques. Players control a car using steering wheel and forward/backward controls, learning various parking skills from basic forward parking to advanced parallel parking in challenging conditions.

## EXAMPLES:

### Game Mechanics Examples:
- **Level 1:** Empty parking lot with visual guides showing ideal parking position
- **Level 5:** Basic reverse parking with side mirrors visualization
- **Level 10:** Multi-point turn in tight space with turn counter
- **Level 15:** Master challenge combining parallel parking, time limit, and weather effects

### Control Schemes:
1. **Desktop:** Keyboard (WASD/Arrows) + Mouse for fine steering
2. **Mobile:** Touch controls with virtual steering wheel and pedals
3. **Tablet:** Hybrid controls with touch steering and on-screen buttons

## DOCUMENTATION:

### Physics & Game Development:
- Matter.js Documentation: https://brm.io/matter-js/docs/
- GSAP Animation Library: https://greensock.com/docs/
- React Game Development Patterns: https://react.gg/

### Parking Techniques Reference:
- Parallel Parking Geometry: Standard 1.2x vehicle length minimum
- Angled Parking Standards: 30°, 45°, 60° configurations
- Reverse Parking Guidelines: Mirror usage and reference points

### Deployment:
- Vite Static Site Deployment: https://vitejs.dev/guide/static-deploy.html
- GitHub Pages with GitHub Actions: https://docs.github.com/en/pages

## OTHER CONSIDERATIONS:

### Common Implementation Pitfalls:

1. **Physics Engine Integration:**
   - Avoid updating physics state directly in React components
   - Use refs for Matter.js bodies to prevent re-renders
   - Implement fixed timestep for consistent physics across devices

2. **Performance Optimization:**
   - Car sprite should be pre-loaded and cached
   - Use CSS transforms for UI animations, Matter.js for game physics
   - Implement viewport culling for off-screen obstacles

3. **Mobile Responsiveness:**
   - Touch controls need larger hit areas (minimum 44x44px)
   - Steering sensitivity should adapt to screen size
   - Prevent default touch behaviors (scrolling, zooming) in game area

4. **State Management:**
   - Game state and UI state should be separate
   - Level progress must persist in localStorage
   - Implement state recovery for page refreshes mid-game

5. **Collision Detection:**
   - Use compound bodies for accurate car shape
   - Implement grace period for minor collisions
   - Differentiate between cosmetic and functional collisions

6. **Level Design:**
   - Each level JSON should be under 10KB
   - Use procedural generation for obstacle placement variations
   - Implement level validation to ensure it's completeable

7. **Accessibility:**
   - Provide keyboard-only navigation for all menus
   - Include colorblind-friendly indicators
   - Add option to reduce motion for animations

8. **Testing Requirements:**
   - Test on devices with refresh rates from 30Hz to 144Hz
   - Ensure game works with 200ms+ network latency
   - Validate touch controls on screens from 5" to 13"
