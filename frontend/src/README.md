# FinTrack — React Frontend

## Stack
- **React 18** + Vite
- **CSS Modules** (separate .css per component)
- **Spring Boot** backend (http://localhost:8080)
- **SQLite** via Spring Data JPA

---

## 📁 Project Structure

```
src/
├── assets/
│   └── styles/
│       ├── variables.css       ← CSS variables + global reset
│       └── layout.css          ← App-level layout
│
├── components/
│   ├── Sidebar/
│   │   ├── Sidebar.jsx         ← Component logic + JSX only
│   │   └── Sidebar.css         ← Styles only
│   │
│   ├── Dashboard/
│   │   ├── DashboardHeader.jsx + .css
│   │   ├── StatCards.jsx       + .css
│   │   └── MoneyFlowChart.jsx  + .css
│   │
│   ├── Budget/
│   │   └── BudgetPlanner.jsx   + .css
│   │
│   └── Transactions/
│       └── RecentTransactions.jsx + .css
│
├── pages/
│   ├── Dashboard.jsx           ← Assembles components, holds mock/real data
│   └── Dashboard.css           ← Page-level layout only
│
├── services/
│   └── api.js                  ← All HTTP calls to Spring Boot
│
├── hooks/
│   └── hooks/useFinTrack.js    ← Custom React hooks
│
└── App.jsx                     ← Root: layout + routing
```

---

## Rules (Follow These Always)

| Rule | Detail |
|------|--------|
| CSS alag | Har component ka apna `.css` file |
| JSX alag | Sirf JSX/logic, koi inline style nahi |
| Events alag | Event handlers component ke andar, CSS mein nahi |
| Services layer | API calls sirf `services/api.js` mein |
| Hooks | Reusable state logic sirf `hooks/` mein |

---

## Getting Started

```bash
npm install
npm run dev       # React dev server on :5173
```

Backend Spring Boot alag run karo on `:8080`

---

## Adding a New Page

1. `src/pages/NewPage.jsx` banao
2. `src/pages/NewPage.css` banao (layout only)
3. `App.jsx` ke `PAGES` object mein add karo
4. `Sidebar.jsx` ke `NAV_ITEMS` mein already hai
