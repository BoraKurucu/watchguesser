# WatchGuesser 🕐

**🌐 Live Demo:** [https://watchguesser.web.app](https://watchguesser.web.app)

A luxury watch identification game that tests your horological knowledge. Guess the brand and model from high-quality watch images — built with Next.js, Firebase, and a database of 15,000+ watch references.

## 🎯 How to Play

1. **View the Watch Image** - A high-quality photo of a luxury watch is displayed
2. **Make Your Guess** - Type the brand and model name in the search box
3. **Get Instant Feedback** - See if you're correct and learn interesting facts about the timepiece
4. **Track Your Progress** - Build your streak and improve your watch knowledge

## ✨ Features

- **15,000+ Watch Database** - Extensive collection of luxury timepieces
- **Fuzzy Search** - Intelligent search that finds matches even with partial spelling
- **Instant Validation** - Real-time feedback on your guesses
- **Beautiful UI** - Smooth animations and responsive design
- **Mobile Friendly** - Play on any device
- **No Registration Required** - Start playing immediately

## 🛠️ Tech Stack

- **Next.js 16** — App Router for optimal performance
- **Firebase** — Authentication and Firestore database
- **Framer Motion** — Smooth animations and transitions
- **Fuse.js** — Advanced fuzzy search functionality
- **Tailwind CSS** — Modern, utility-first styling

## 🚀 Quick Start

### Play Online
Visit the live application: **[https://watchguesser.web.app](https://watchguesser.web.app)**

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/BoraKurucu/watchguesser.git
   cd watchguesser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase configuration values to `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google/Firebase account (for local development)

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore
3. Download your service account key
4. Configure your environment variables

## 🎮 Game Tips

- **Start with Popular Brands** - Rolex, Omega, Patek Philippe are good starting points
- **Look for Distinctive Features** - Bezels, dials, and case shapes are key identifiers
- **Use Partial Names** - The search accepts partial matches (e.g., "Sub" for "Submariner")
- **Learn from Mistakes** - Each guess teaches you something new!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌐 Live Demo

Try the game now: **[https://watchguesser.web.app](https://watchguesser.web.app)**

---

Made with ❤️ for watch enthusiasts worldwide
