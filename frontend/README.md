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
- AI-generated itineraries (e.g., “Jaipur 3 nights under $150”)
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
| React 18 (JavaScript) | UI development |
| Tailwind CSS | Styling |
| React Router v6 | Routing |
| Firebase Authentication | User authentication |
| React Context API | Global state management |
| Playfair Display, EB Garamond | Typography |

### Backend (In Progress)
| Technology | Purpose |
|-----------|--------|
| Node.js + Express | REST API development |
| MongoDB Atlas | Database |
| Socket.io | Real-time communication |
| Google Gemini 1.5 Flash | AI itinerary generation |
| Stripe + Razorpay | Payment processing |
| Twilio | SMS alerts |

### Infrastructure
| Service | Purpose |
|--------|--------|
| Firebase Auth | Authentication |
| Firestore | User profiles and roles |
| Vercel | Frontend deployment |
| Railway | Backend deployment |
| MongoDB Atlas | Database hosting |

---

## User Roles

| Role | Access | Capabilities |
|------|--------|-------------|
| Public | No login required | Panic button, basic access |
| Tourist | Authenticated | Trip planning, wallet, guide booking |
| Guide | Verified access | Dashboard, alerts, earnings |

---

## Project Structure

```
safar-sathi/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   ├── dashboard/
│       │   │   ├── TripPlanner.js
│       │   │   ├── SafetyPanel.js
│       │   │   ├── WalletPanel.js
│       │   │   └── GuidesPanel.js
│       │   └── guide/
│       │       ├── GuideOverview.js
│       │       ├── PanicAlerts.js
│       │       ├── EarningsPanel.js
│       │       ├── ChatPanel.js
│       │       └── ProfilePanel.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── CertificateUpload.js
│       │   ├── TouristDashboard.js
│       │   └── GuideDashboard.js
│       ├── context/
│       ├── hooks/
│       ├── firebase.js
│       └── App.js
└── server/
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase project

### Installation

```bash
git clone https://github.com/your-username/safar-sathi.git
cd safar-sathi/client
npm install
```

---

### Firebase Setup

1. Create a project at Firebase Console  
2. Enable:
   - Email/Password authentication  
   - Google authentication  
3. Create Firestore database (asia-south1 region)  
4. Register a web app and obtain config credentials  

---

### Environment Variables

Create a `.env` file inside `client/`:

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

### Run the Application

```bash
npm start
```

Visit: http://localhost:3000

---

## Authentication Flow

- Public → Access panic feature without login  
- Tourist → Signup → Dashboard access  
- Guide → Signup → Certificate upload → Approval → Dashboard  

---

## Progressive Web App Features

- Installable on mobile devices  
- Offline panic queue  
- Background GPS tracking  
- Push notifications  
- Hardware-triggered panic detection  

---

## Roadmap

- Frontend implementation (completed)
- Firebase authentication (completed)
- Tourist dashboard (completed)
- Guide dashboard (completed)
- Backend API development (in progress)
- AI integration (planned)
- Payment gateway integration (planned)
- Real-time alerts system (planned)
- PWA enhancements (planned)
- Deployment (planned)

---

## Team

| Role | Name |
|------|------|
| Frontend | Amrita |
| Backend | Jatin |

---

## License

This project is licensed under the MIT License.

---

## Closing Note

SafarSathi aims to redefine travel safety in India by combining intelligent planning with real-time emergency response systems in a unified platform.