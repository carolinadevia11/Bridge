# Bridge Co-Parenting Platform - Development Guide

---

## 📋 Streamlined Documentation for Development

The original PRD has been optimized into two focused documents for efficient development:

### 1. **[Developer PRD](./frontend/DEV-PRD.md)** ⚙️
**Technical specifications for building features**

Contains:
- Core architecture & data models
- MVP feature specifications with technical requirements
- API endpoint definitions
- User stories and acceptance criteria
- Design system specifications
- Security and compliance requirements
- Development setup instructions

👉 **Use this for:** Building features, understanding technical requirements, API integration

---

### 2. **[Feature Checklist](./FEATURE-CHECKLIST.md)** ✅
**Track what's built vs. what's needed**

Contains:
- Complete feature inventory with status (✅ ❌ 🚧)
- Frontend vs backend completion tracking
- Priority roadmap
- API endpoint coverage
- MVP progress metrics (currently ~45% complete)
- Next steps and immediate priorities

👉 **Use this for:** Sprint planning, progress tracking, identifying gaps, prioritizing work

---

## 🎯 Quick Start

### Current Tech Stack:
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend:** Python 3.11 + FastAPI + MongoDB
- **Auth:** JWT with bcrypt
- **AI:** Placeholder (ready for GPT-4/Claude integration)

### What's Already Built:
✅ Landing pages & marketing content  
✅ Authentication system (signup, login, JWT)  
✅ Family creation & linking (Family Code system)  
✅ Onboarding flow UI  
✅ Calendar UI (complete)  
✅ Messaging UI (complete)  
✅ Expense tracker UI (complete)  
✅ Bridgette avatar system  
✅ Contract upload (basic AI parsing simulation)

### Top Priorities (Need Building):
1. 🔥 **Calendar Backend API** - Create/edit/delete events, change requests
2. 🔥 **Messaging Backend API** - Conversations, send messages, immutable logs
3. 🔥 **Expense Backend API** - CRUD operations, disputes, receipts
4. 🔥 **Dashboard Page** - Main app landing after login
5. 🔥 **Real-time Sync** - WebSocket/polling for calendar/messages

---

## 🚀 Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
pnpm install
pnpm dev
```

**Environment Variables:**
```bash
# Backend (.env)
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/bridge
DATABASE_NAME=bridge

# Frontend (.env)
VITE_API_URL=http://localhost:8000
```

---

## 📂 Key Files & Directories

### Frontend (`/frontend`)
```
src/
├── components/           # React components
│   ├── CalendarView.tsx      ✅ Complete UI
│   ├── MessagingInterface.tsx ✅ Complete UI
│   ├── ExpenseTracker.tsx     ✅ Complete UI
│   ├── BridgetteAvatar.tsx    ✅ Avatar system
│   ├── OnboardingFlow.tsx     ✅ Onboarding
│   └── ui/                    ✅ shadcn/ui components
├── pages/
│   ├── LandingPage.tsx        ✅ Complete
│   ├── Login.tsx              ✅ Complete
│   ├── Signup.tsx             ✅ Complete
│   └── FeatureDetail.tsx      ✅ Complete
├── lib/
│   └── api.ts             🚧 API client (partial)
└── types/
    └── family.ts          ✅ TypeScript types
```

### Backend (`/backend`)
```
backend/
├── main.py            ✅ FastAPI app setup
├── models.py          ✅ Pydantic data models
├── database.py        ✅ MongoDB connection
├── routers/
│   ├── auth.py        ✅ Authentication endpoints
│   ├── family.py      ✅ Family & children endpoints
│   └── calendar.py    🚧 Calendar endpoints (partial)
└── requirements.txt   ✅ Python dependencies
```

---

## 🎨 Design Philosophy

### Core Principles:
1. **Emotionally Intelligent** - Calming UX, empathetic microcopy, low cognitive load
2. **Fair & Balanced** - Equal access for both parents, transparent logging
3. **Child-First** - Every feature prioritizes children's best interests
4. **Progressive Disclosure** - Features introduced step-by-step, minimal decision fatigue
5. **Conflict Prevention** - Proactive suggestions over reactive fixes

### Color System:
- `bridge-blue` (#3b82f6) - Primary actions, trust
- `bridge-green` (#10b981) - Success, balanced decisions
- `bridge-yellow` (#f59e0b) - Warnings, pending items
- `bridge-red` (#ef4444) - Urgent, disputes
- `bridge-black` (#1f2937) - Text

### Bridgette AI Assistant:
- **Visual:** Justice/balance symbol avatar (covered eyes, scales)
- **Personality:** Neutral, helpful, empathetic, never judgmental
- **Expressions:** happy, thinking, encouraging, celebrating, waving, balanced
- **Role:** Context-aware guidance, alternative solutions, emotional support

---

## 📊 Current Status (November 10, 2025)

**Overall MVP Progress: ~45%**

| Feature Area | Frontend | Backend | Status |
|-------------|----------|---------|--------|
| Landing Pages | 100% | N/A | ✅ Complete |
| Authentication | 90% | 90% | ✅ Complete |
| Family Setup | 95% | 95% | ✅ Complete |
| Onboarding | 70% | 60% | 🚧 Partial |
| Calendar | 95% | 40% | 🚧 Partial |
| Messaging | 90% | 0% | ❌ Backend needed |
| Expenses | 85% | 0% | ❌ Backend needed |
| Bridgette (Visual) | 100% | N/A | ✅ Complete |
| Bridgette (AI) | N/A | 10% | ❌ Real AI needed |
| Documents | 50% | 50% | 🚧 Partial |
| Dashboard | 0% | 0% | ❌ Not started |

---

## 🔄 Removed from Original PRD

The following sections were removed to streamline development documentation:

**Business/Marketing Content:**
- Market insights (TAM/SAM/SOM)
- Competitor analysis
- Detailed user personas (Rachel & Mark story)
- RICE framework scoring
- Positioning statements
- Roll-out strategy
- Stakeholder communication plans

**Rationale:** Valuable for product strategy but not needed for day-to-day coding. Development team should focus on technical specifications in the DEV-PRD.

**Technology Change:**
- Original PRD specified: React Native + Vue.js + Node.js
- Actual implementation: React + TypeScript + Python FastAPI + MongoDB
- Decision: Continue with current stack (working well)

---

## 🧩 Next Steps for Developers

### Week 1-2 Priorities:
1. Complete Calendar backend API
   - POST/PUT/DELETE `/api/v1/calendar/events`
   - Change request endpoints
   - Email notification on approval
   
2. Complete Messaging backend API
   - Conversation CRUD
   - Send message endpoint
   - Immutable log storage
   
3. Complete Expense backend API
   - Expense CRUD
   - Receipt upload
   - Dispute workflow

4. Build Dashboard page
   - Today's schedule widget
   - Unread messages count
   - Pending expenses alert
   - Quick action cards

5. Real-time sync
   - WebSocket or polling strategy
   - Calendar event updates
   - New message notifications

---

## 📚 Documentation Structure

```
crimson-binturong-sniff/
├── DEVELOPMENT-GUIDE.md         ← You are here (this file)
├── FEATURE-CHECKLIST.md          ← Feature completion tracking
├── frontend/
│   ├── DEV-PRD.md                ← Technical specifications
│   ├── PRD.md                     ← Original comprehensive PRD (archived)
│   ├── AI_RULES.md                ← AI coding guidelines
│   └── ONBOARDING_FLOW.md         ← Onboarding documentation
└── backend/
    └── README.md                  ← Backend setup instructions
```

---

## 🤖 AI Integration Roadmap

**Current:** Simulated AI responses (placeholder logic)

**Next Steps:**
1. Integrate GPT-4 or Claude for contract parsing
2. Implement real message tone analysis
3. Build conflict prediction model
4. Generate schedule optimization suggestions
5. Create educational content recommendation engine

**Key Files to Update:**
- `/backend/routers/family.py` - `parse_contract_with_ai()` function
- Future: `/backend/ai/` directory for AI services

---

## 🧪 Testing (Not Yet Implemented)

**Needed:**
- Unit tests (frontend components, backend endpoints)
- Integration tests (API + database)
- E2E tests (Playwright/Cypress)
- Accessibility tests
- Performance tests

---

## 🔒 Security Considerations

**Implemented:**
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ CORS configuration

**Needed:**
- ❌ Message encryption (E2E)
- ❌ File encryption
- ❌ Audit logging (immutable)
- ❌ Rate limiting
- ❌ Input sanitization
- ❌ GDPR/CCPA compliance tools

---

## 📞 Getting Help

**Documentation:**
1. Check [DEV-PRD.md](./frontend/DEV-PRD.md) for feature specs
2. Check [FEATURE-CHECKLIST.md](./FEATURE-CHECKLIST.md) for status
3. Review data models in `/backend/models.py`
4. Check component implementations in `/frontend/src/components/`

**Common Questions:**
- **"What needs building next?"** → See Priority Roadmap in Feature Checklist
- **"How does X feature work?"** → See technical requirements in DEV-PRD
- **"What's the API format?"** → See API Design Standards in DEV-PRD
- **"What's the data model?"** → See `/backend/models.py`

---

## 🎯 Definition of Done

A feature is considered "done" when:
1. ✅ Frontend UI is implemented and styled
2. ✅ Backend API endpoints are implemented
3. ✅ Frontend-backend integration is working
4. ✅ Error handling is in place
5. ✅ Loading states are handled
6. ✅ Bridgette provides contextual assistance
7. ✅ Feature is manually tested
8. ✅ Feature Checklist is updated

---

**Happy Coding! 🚀**

For detailed technical specifications, see **[DEV-PRD.md](./frontend/DEV-PRD.md)**  
For progress tracking, see **[FEATURE-CHECKLIST.md](./FEATURE-CHECKLIST.md)**

