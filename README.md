# 🧘 5分気晴らし - AI-Powered Stress Relief App

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Now-brightgreen?style=for-the-badge)](https://kibarashi-app.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**AI-powered stress relief suggestions with voice guidance**  
**AIによる音声ガイド付きストレス解消提案アプリ**

[English](#english) | [日本語](#japanese)

</div>

---

## 🎯 Live Demo

<div align="center">
  <a href="https://kibarashi-app.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20Try%20the%20App-kibarashi--app.vercel.app-blue?style=for-the-badge" alt="Live Demo">
  </a>
</div>

---

<a name="english"></a>
## 🌟 Overview

A stress relief application that provides personalized relaxation suggestions powered by Google's Gemini AI. Built with modern web technologies and designed for people experiencing workplace stress, this PWA offers instant, accessible mental health support without requiring registration or payment.

<a name="japanese"></a>
## 🌟 概要

職場でのストレスを抱える方々のために開発した、AIによる気晴らし提案アプリケーションです。Google Gemini AIを活用し、ユーザーの状況に応じた最適なリラックス方法を提案。登録不要・完全無料で、必要な時にすぐ使えるPWAとして設計されています。

---

## ✨ Key Features / 主な機能

### 🤖 AI-Powered Suggestions
- **Gemini 2.5 Flash Preview** integration for dynamic, context-aware suggestions
- Personalized recommendations based on location (workplace/home/outside) and available time

### 🎙️ Advanced Voice Guidance
- **Gemini TTS** (Text-to-Speech) with high-quality Japanese voices
- Automatic fallback to browser TTS for seamless experience
- Voice-guided relaxation exercises with synchronized timers

### 📱 Progressive Web App (PWA)
- Install on any device like a native app
- **Offline support** - core features work without internet
- Push notifications for relaxation reminders

### 🎨 Modern UI/UX
- **Dark mode** with system preference detection
- **WCAG AA compliant** for accessibility
- Responsive design optimized for all devices
- Smooth animations and micro-interactions

### 🧪 Technical Excellence
- **95.5% test coverage** with zero mocking policy
- **Serverless architecture** on Vercel Functions
- **TypeScript** throughout for type safety
- **Performance optimized** with code splitting

---

## 🛠️ Technology Stack

<div align="center">

| Frontend | Backend | AI & Voice | Infrastructure |
|:--------:|:-------:|:----------:|:--------------:|
| React 18 | Vercel Functions | Gemini AI | Vercel |
| TypeScript | Node.js | Gemini TTS | GitHub Actions |
| Tailwind CSS | Express.js | Web Speech API | Docker |
| Vite | PostgreSQL | | GCP |
| PWA | Redis | | |

</div>

### 📊 Performance Metrics

```
┌─────────────────────────────────────┐
│ 🚀 Bundle Size                      │
├─────────────────────────────────────┤
│ Vendor:  139.45 KB                  │
│ Main:     14.79 KB                  │
│ Total:   ~154 KB (gzipped)          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✅ Test Coverage                    │
├─────────────────────────────────────┤
│ Total Tests: 425                    │
│ Passing: 419 (98.6%)                │
│ Coverage: 95.5%                     │
│ Zero Mocks: 100%                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🌐 Lighthouse Scores                │
├─────────────────────────────────────┤
│ Performance:    95+                 │
│ Accessibility:  100                 │
│ Best Practices: 100                 │
│ SEO:           100                  │
│ PWA:           ✓                    │
└─────────────────────────────────────┘
```

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/images/light-mode-home.png" alt="Light Mode Home" width="300">
        <br>
        <em>Light Mode - Home Screen</em>
      </td>
      <td align="center">
        <img src="docs/images/dark-mode-suggestions.png" alt="Dark Mode Suggestions" width="300">
        <br>
        <em>Dark Mode - AI Suggestions</em>
      </td>
      <td align="center">
        <img src="docs/images/mobile-pwa.png" alt="Mobile PWA" width="300">
        <br>
        <em>Mobile PWA Experience</em>
      </td>
    </tr>
  </table>
</div>

---

## 🎯 Technical Challenges & Solutions

### 1. Zero-Mock Testing Philosophy
**Challenge**: Ensuring test reliability without using any mocks  
**Solution**: 
- Implemented real test databases with transaction rollback
- Created isolated test environments for each test suite
- Achieved 95.5% coverage with only real integrations

### 2. Gemini TTS Integration in Serverless
**Challenge**: Integrating Gemini 2.5 Flash Preview TTS in Vercel Functions  
**Solution**:
- Converted PCM audio data to WAV format without ffmpeg
- Implemented custom WAV header generation
- Created fallback mechanism to browser TTS

### 3. Offline PWA Functionality
**Challenge**: Providing meaningful offline experience  
**Solution**:
- Implemented intelligent service worker caching strategies
- Pre-cached essential suggestion data
- Created offline-first architecture with sync capabilities

### 4. Accessibility at Scale
**Challenge**: Ensuring WCAG AA compliance across all features  
**Solution**:
- Automated accessibility testing in CI/CD
- Custom Tailwind color palette with proper contrast ratios
- Comprehensive ARIA labeling and keyboard navigation

---

## 🚀 What I Learned

1. **Serverless Architecture**: Migrating from Express.js to Vercel Functions taught me about optimizing for cold starts and managing stateless services
2. **AI Integration**: Working with Gemini API showed me the importance of prompt engineering and fallback strategies
3. **Testing Philosophy**: The zero-mock approach improved my understanding of integration testing and test environment management
4. **Accessibility**: Implementing WCAG AA compliance deepened my knowledge of inclusive design principles
5. **Performance**: Achieving sub-200KB bundle size required careful analysis of dependencies and code splitting strategies

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Gemini API key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/CaCC-Lab/kibarashi-app.git
cd kibarashi-app

# Install dependencies
npm run setup

# Set up environment variables
cp frontend/.env.example frontend/.env
# Edit .env and add your GEMINI_API_KEY

# Start development server
vercel dev
# Visit http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "TTS"
```

---

## 📈 Future Enhancements

- [ ] Multi-language support (English, Chinese, Korean)
- [ ] Apple Watch / Wear OS companion apps
- [ ] Integration with popular meditation apps
- [ ] Advanced analytics dashboard
- [ ] Community-sourced relaxation techniques

---

## 🤝 Contributing

While this is a personal portfolio project, I welcome feedback and suggestions! Feel free to:
- Open issues for bugs or feature requests
- Submit PRs for improvements
- Star the repository if you find it useful

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 About the Developer

Hi! I'm [Your Name], a full-stack developer passionate about creating meaningful applications that improve people's daily lives. This project combines my interests in mental health, AI technology, and user-centered design.

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://yourportfolio.com)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)

</div>

---

<div align="center">
  Made with ❤️ and ☕ by [Your Name]
  <br>
  <sub>Last updated: January 2025</sub>
</div>