# 🕹️ Space Snake Arcade

A retro arcade-style snake game with authentic 8-bit sound effects and classic arcade cabinet design.

## 🎮 How to Play

- **Arrow Keys** - Move the snake
- **Space** - Start game / Restart after game over
- **Collect red food** to grow and increase score
- **Avoid walls and yourself** to survive

## 🚀 How to Run

### Option 1: Simple HTTP Server
```bash
# If you have Python installed
python3 -m http.server 8000

# Or with Node.js
npx http-server -p 8000

# Then open http://localhost:8000
```

### Option 2: Live Server (Auto-reload)
```bash
npx live-server --port=8000
```

### Option 3: Just open index.html
Double-click `index.html` to open in your browser (some features may not work due to CORS)

## 🌐 How to Share

### GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch" → main branch
5. Your game will be available at `https://yourusername.github.io/repository-name`

### Netlify (Quick Deploy)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Get instant public URL

### Vercel (Fast Deploy)
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Automatic deployment with custom domain options

## 🎵 Features

- **Retro Arcade Design** - Classic blue arcade cabinet styling
- **8-bit Sound Effects** - Authentic arcade sounds
- **CRT Effects** - Scanlines and glow effects
- **Responsive Design** - Works on mobile and desktop
- **Space Theme** - Cosmic visual effects

## 📁 Files

- `index.html` - Main game file
- `snake.js` - Game logic and sound effects
- `style.css` - Arcade cabinet styling
- `package.json` - Project configuration

## 🎯 Game Controls

- **Arrow Keys** - Move snake
- **Space** - Start/Restart game
- **Sound** - Automatic arcade sound effects

Enjoy the game! 🐍✨ 