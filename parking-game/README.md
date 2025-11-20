# 🚗 Parking Master - Educational Parking Game

A modern, responsive web-based parking simulation game designed to teach proper parking techniques through progressively challenging levels. Built with React, Tailwind CSS, and GSAP animations.

**Current Version: v3.5.0** - Improved accuracy calculation with polygon overlap algorithm

## 🎮 Game Overview

**Parking Master** is an educational driving game that helps players learn and master various parking techniques through 15 carefully designed levels. From basic forward parking to complex parallel parking scenarios, players will develop real-world parking skills in a fun, interactive environment.

### Key Features
- 📱 **Mobile-First Design**: Fully responsive, touch-optimized controls
- 🎯 **15 Progressive Levels**: From beginner to expert difficulty
- 🎮 **Intuitive Controls**: Realistic steering wheel and gear controls
- 📊 **Performance Tracking**: Star ratings and score system
- 🎨 **Smooth Animations**: GSAP-powered transitions and effects
- ♿ **Accessibility**: WCAG 2.1 AA compliant design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 UI/UX Design System

### Color Palette
- **Primary Blue**: `#3B82F6` - Main CTAs, active states
- **Road Gray**: `#374151` - Game road surface
- **Parking Yellow**: `#FCD34D` - Parking lines, guides
- **Target Green**: `#10B981` - Success states, targets
- **Danger Red**: `#EF4444` - Collisions, warnings

### Typography
- **Display Font**: Orbitron (Game titles, scores)
- **UI Font**: Inter (Interface elements)
- **Mono Font**: JetBrains Mono (Numbers, timers)

## 🕹️ Game Controls

### Mobile Controls
- **Steering**: Touch and drag the steering wheel
- **Acceleration**: Hold Forward button
- **Reverse**: Hold Reverse button
- **Brake**: Tap Brake button

### Desktop Controls
- **Steering**: Mouse drag on wheel or Arrow keys
- **Forward**: W or Up Arrow
- **Reverse**: S or Down Arrow
- **Brake**: Space bar

## 📊 Level Progression

### Difficulty Tiers
- **🟢 Beginner (Levels 1-3)**: Large spaces, no obstacles, visual guides
- **🟡 Intermediate (Levels 4-9)**: Medium spaces, static obstacles, time limits
- **🟠 Advanced (Levels 10-13)**: Tight spaces, multiple obstacles, complex maneuvers
- **🔴 Expert (Levels 14-15)**: Minimum clearance, moving obstacles, time trials

## 🏗️ Project Structure

```
parking-game/
├── src/
│   ├── components/
│   │   ├── game/           # Game logic components
│   │   ├── ui/             # UI components
│   │   ├── controls/       # Control components
│   │   └── common/         # Reusable components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   └── data/               # Level configurations
└── public/                 # Static assets
```

## 📱 Responsive Design

- **Mobile**: 320px - 767px (Touch-optimized, portrait priority)
- **Tablet**: 768px - 1023px (Flexible layouts)
- **Desktop**: 1024px+ (Keyboard support, extended features)

## ♿ Accessibility Features

- High contrast mode
- Colorblind-friendly options
- Adjustable control sensitivity
- Tutorial mode
- Visual parking guides

## 📄 License

MIT License - see LICENSE file for details
