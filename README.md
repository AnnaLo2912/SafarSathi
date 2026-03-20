# SafarSathi  
### AI-Powered Tourist Safety & Travel Platform

**Tagline:** Safe Travels

SafarSathi is a full-stack web platform designed to enhance safety and convenience for foreign tourists visiting India. It integrates AI-driven trip planning, real-time safety systems, dual-currency payments, and a verified guide network into a single seamless experience.

---

## Live Demo
Coming soon after deployment.

---

## Core Features

### Safety System
- Triple power button panic detection (PWA)
- Ultra-fast GPS broadcast to nearby verified guides
- Emergency SMS integration with 112 India and custom contacts
- Offline panic queue with automatic sync
- AI-based real-time safety score

### AI Trip Planning
- AI-generated itineraries (e.g., "Jaipur 3 nights under $150")
- Day-wise schedules with timings, cost estimates, and visuals
- Hotel comparison insights (e.g., ITC vs Taj)
- Budget calculator for full trip planning
- Destination gallery powered by Unsplash

### Dual Currency Wallet
- USD payments via Stripe for international transactions
- INR wallet top-up via Razorpay
- UPI QR scanning for local payments
- Live USD to INR conversion
- Complete transaction history

### Verified Guide Network
- Government certificate verification using OCR
- Detailed guide profiles with ratings and availability
- Real-time chat between tourists and guides
- Panic alert broadcasting to nearby guides
- Earnings dashboard for guides

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|--------|
| React 19 (JavaScript) | UI development with Vite |
| Tailwind CSS 4 | Styling with @tailwindcss/vite |
| React Router v6 | Client-side routing |
| Firebase 12.11 | Authentication & Firestore DB |
| React Context API | Global state management |
| @fontsource/playfair-display | Headline typography |
| @fontsource/eb-garamond | Body typography |

### Backend (In Progress)
| Technology | Purpose |
|-----------|--------|
| Node.js + Express | REST API development |
| MongoDB Atlas | Document database |
| Mongoose | MongoDB ODM |
| Nodemon | Development auto-reload |
| CORS | Cross-origin handling |
| dotenv | Environment variables |

### Infrastructure
| Service | Purpose |
|--------|--------|
| Firebase Auth | User authentication |
| Firestore | User profiles and roles |
| Vercel | Frontend deployment |
| Railway | Backend deployment |
| MongoDB Atlas | Database hosting |

---

## User Roles

| Role | Access | Capabilities |
|------|--------|-------------|
| Public | No login required | Panic button, landing page |
| Tourist | Authenticated | Trip planning, wallet, guide booking, safety panel |
| Guide | Verified access | Overview, alerts, earnings, messages, profile management |

---

## Project Structure

```
safar-sathi/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── TripPlanner.jsx
│   │   │   │   ├── SafetyPanel.jsx
│   │   │   │   ├── WalletPanel.jsx
│   │   │   │   └── GuidesPanel.jsx
│   │   │   └── guide/
│   │   │       ├── GuideOverview.jsx
│   │   │       ├── PanicAlerts.jsx
│   │   │       ├── EarningsPanel.jsx
│   │   │       ├── ChatPanel.jsx
│   │   │       └── ProfilePanel.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── CertificateUpload.jsx
│   │   │   ├── TouristDashboard.jsx
│   │   │   └── GuideDashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   └── trip.routes.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- MongoDB Atlas account (for backend)

### Frontend Installation

```bash
cd frontend
npm install
```

### Backend Installation

```bash
cd backend
npm install
```

---

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable:
   - Email/Password authentication  
   - Google Sign-In authentication  
3. Create Firestore database (asia-south1 region preferred for India)  
4. Register a web app and obtain config credentials  

---

### Environment Variables

**Frontend** - Create `.env.local` in `frontend/`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:5001
```

**Backend** - Create `.env` in `backend/`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

---

### Run the Application

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5176 (or shown port in terminal)

**Backend:**
```bash
cd backend
npm run dev
```

Server runs on: http://localhost:5001

---

## Authentication Flow

1. **Public Visitor** → Access panic SOS without authentication
2. **Tourist** → Sign up → Login → Trip dashboard access
3. **Guide** → Sign up → Certificate upload → Admin approval → Guide dashboard

---

## Features by Role

### Tourist Features
- ✅ AI-powered trip planning with itineraries
- ✅ Safety panel with panic button (SOS)
- ✅ Dual-currency wallet (USD/INR)
- ✅ Browse and book verified guides
- ✅ Live chat with guides
- ✅ Trip history and bookings

### Guide Features
- ✅ Profile management and rates
- ✅ Panic alert monitoring
- ✅ Earnings and payout dashboard
- ✅ Real-time messages with tourists
- ✅ Certificate verification status
- ✅ Availability scheduling
- ✅ Languages and specialization management

---

## Design System

### Colors
- **Cream:** #FAF7F2 (Primary background)
- **Sand:** #F5F0E8 (Secondary background)
- **Saffron:** #E8892B (Accent/CTA)
- **Terracotta:** #C84B31 (Danger/Alert)
- **Deep Blue:** #1B3A5C (Headers/Overlays)
- **Charcoal:** #2C2C2C (Text)

### Typography
- **Headlines:** Playfair Display (serif)
- **Body:** EB Garamond (serif)

---

## Progressive Web App Features

- Installable on mobile devices  
- Offline panic queue  
- Background GPS tracking (planned)
- Push notifications (planned)
- Hardware-triggered panic detection (planned)  

---

## API Endpoints

### Trip Endpoints
- `GET /api/health` - Health check
- `POST /api/trips/generate` - Generate AI itinerary

---

## Roadmap

| Phase | Status | Items |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | Landing page, authentication, dashboards |
| **Phase 2** | 🔄 In Progress | Backend API, MongoDB integration |
| **Phase 3** | 📋 Planned | AI integration, payment gateways |
| **Phase 4** | 📋 Planned | Real-time alerts, PWA features |
| **Phase 5** | 📋 Planned | Production deployment |

---

## Development Notes

### CORS Configuration
Frontend on `http://localhost:5176` is whitelisted in backend CORS settings.

### Port Changes
- Frontend port may vary (check terminal output)
- Backend runs on port `5001`
- Ensure ports are free before running `npm run dev`

### Kill Process on Port
If port is already in use:
```bash
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## Team

| Role | Name |
|------|------|
| Frontend Lead | Amrita Pati |
| Backend Lead | Jatin Gupta |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

## Closing Note

SafarSathi aims to redefine travel safety in India by combining intelligent planning with real-time emergency response systems in a unified platform. We believe every tourist deserves a safe, guided, and memorable experience exploring India's rich heritage.

**Safe travels! 🙏**

---

**Last Updated:** March 20, 2026
