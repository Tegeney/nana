# 🥤 Golden Shells - Premium Shell Game

Golden Shells is a highly-polished, responsive, single-player "Shell Game" web application tailored for telegram mini-app environments and modern mobile/web browsers. Built with React, TypeScript, Zustand, and Tailwind CSS, it offers smooth interactive gameplay, dynamic Web Audio API synthesizer effects, configurable shuffling speeds, and a provably fair math model (10% House Edge / 1.9x Payout).

## 🚀 Key Features

### 1. State Management (Zustand)
- **Local Persistence**: Powered by Zustand `persist` middleware. Balance persists seamlessly between page reloads, while game statistics and results initialize on launch to maintain privacy and memory boundaries.
- **Transactional Consistency**: Bet deduction occurs immediately upon cup tapping, preventing double-play exploits or click spamming.
- **Mathematical Integrity**: 
  - Balance updates, bet deductions, and win credit are handled atomically in the store.
  - On a win, the winning amount is calculated as `betAmount × 0.9`. The total returned to the balance is `betAmount + (betAmount * 0.9) = 1.90x Payout`.
  - On a loss, the bet amount stays deducted.

### 2. Immersive Game Flow
1. **Selection**: User sets the bet size (default: `$10.00`) using pre-sets or a custom numeric input.
2. **Action**: The user clicks any of the three brown wooden cups on the casino table.
3. **Validation**: The engine validates if `balance >= betAmount`. If insufficient, a responsive error message floats on the screen and triggers a low buzzer sound.
4. **Immediate Deduction**: The bet is immediately subtracted from the balance.
5. **Dynamic Shuffling**: The cups enter a shuffle animation state for the chosen duration (default: `0.8` seconds).
6. **Interaction Safeguard**: All cup mouse clicks and touch events are locked out during shuffling to prevent manipulation.
7. **RNG Evaluation**: After the shuffle timer, standard secure cryptographical randomizer logic chooses the ball position.
8. **Lift Reveal & Results**: Cups transition upward (`-translate-y-20`), exposing a glowing golden ball underneath the winning cup.
9. **Payout & Confetti**: Winners celebrate with high-performance canvas-confetti bursts and ascending arpeggio chimes. Losers get a dramatic sub-bass dropping tone.
10. **Telemetry**: Performance statistics (Total Games, Wins, Losses, Win Rate %, Net Profit) update in real-time.
11. **Reset Options**: Users can reset their balance to `$500.00` or clear statistics separately.

### 3. Visual & Audio Aesthetics
- **Casino Felt Layout**: Elegant dark green velvet gradient (`#1a472a` to `#0e2a1a`) background featuring a subtle textured stitch pattern overlay.
- **Luxury Cup Designs**: Amber/brown gradient (`#b87333` to `#8b5a2b`) cups with rounded bottoms, golden rims, and high-fidelity icons (🥤).
- **Web Audio API Synth**: Immersive, light-weight sound synthesis (Select clicks, wooden shuffle rattles, golden chime arpeggios, and buzzer notes) that plays seamlessly across all mobile devices without loading bulky audio files.
- **Configurable Speed Slider**: Adjust the shuffle animation speed between `0.4` seconds (fast-paced arcade) and `2.5` seconds (cinematic high-roller).

---

## 🛠️ Project Structure

```bash
├── index.html            # Entry HTML document with modern SEO metadata
├── package.json          # Project dependencies (React 18, Zustand, Lucide, Tailwind)
├── tailwind.config.js    # Tailwind layout customizations and colors
├── postcss.config.js     # PostCSS configurations
├── vite.config.js        # Vite configurations
└── src/
    ├── App.tsx           # Primary application component & Instructions modal
    ├── main.tsx          # React client mounter
    ├── index.css         # Casino felt styles & keyframe shuffle animations
    ├── components/
    │   ├── Header.tsx     # Balance indicators, Sound controls, and Help
    │   ├── ShellGame.tsx  # Interactive cup board, lifter, and RNG engine
    │   ├── Controls.tsx   # Bet increments, Max/Min, and speed sliders
    │   └── StatsPanel.tsx # Win/Loss counters and house-edge math
    ├── store/
    │   └── useGameStore.ts # Zustand global store with persist middleware
    └── utils/
        └── audio.ts       # Synthesized dynamic AudioContext sound manager
```

---

## 💻 Local Setup & Development

Follow these simple steps to run the game locally:

### 1. Prerequisites
Ensure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your system.

### 2. Installation
Open your terminal inside the project directory and install the necessary dependencies:
```bash
npm install
```

### 3. Run Development Server
Start the local hot-reloading development server:
```bash
npm run dev
```
By default, the application will be hosted on **[http://localhost:3000](http://localhost:3000)**. Open this link in your browser to play!

### 4. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
The output files will be created in the `dist/` directory, ready to be hosted on any static provider.

---

## ☁️ Deployment Instructions

This application is 100% client-side (SPA) and can be hosted for **free** on major cloud hosting platforms:

### Deploy to Vercel (Recommended)
1. Install Vercel CLI globally or use the dashboard:
   ```bash
   npm install -g vercel
   vercel
   ```
2. Follow the interactive prompts. Vercel will automatically detect the **Vite** configuration, build the project, and provision a live HTTPS URL.

### Deploy to Netlify
1. Create a new site from Git or drag-and-drop the `dist` folder directly onto the Netlify dashboard.
2. Build Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Click **Deploy Site** to push the application live.
