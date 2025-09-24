FIRST DRAFT:
# Holidaze — Rikkejuliane  
_A modern front-end for an accommodation booking platform (Noroff FED exam)_

<img src="https://github.com/user-attachments/assets/ce8c56d8-4e2b-49e8-8c0e-43a505886284" alt="Holidaze logo placeholder" width="160" />

## Table of Contents
1. [Project Overview](#project-overview)
2. [Demo](#demo)
3. [User Roles & Stories](#user-roles--stories)
4. [Key Features](#key-features)
5. [Tech Stack](#tech-stack)
6. [Architecture Highlights](#architecture-highlights)
7. [Accessibility](#accessibility)
8. [Getting Started](#getting-started)
9. [Scripts](#scripts)
10. [Deployment](#deployment)
11. [Validation & QA](#validation--qa)
12. [Roadmap & Design](#roadmap--design)
13. [Contact](#contact)

---

## Project Overview
**Holidaze** is a responsive booking application where visitors can browse venues, customers can book stays, and **venue managers** can manage venues and bookings.  
This project reflects two years of front-end training with a focus on TypeScript/React, accessible UI, and production-ready patterns.

- Built against the official **Noroff Holidaze API**.
- Customer-facing: browse venues, view availability, book.
- Admin-facing (venue managers): create/edit/delete venues, view bookings.
- Custom UX/UI designed by me (Figma).

---

## Demo
> Live demos will be added here when deployments are ready.

- **Home / Explore:** _TBD_
- **Venue page:** _TBD_
- **Profile (Bookings / Favorites / My Venues):** _TBD_
- **Auth:** _TBD_

---

## User Roles & Stories
**All Users**
- View a list of venues
- Search for a specific venue
- View a venue by ID
- View booked vs available dates

**Customers**
- Register & log in (stud.noroff.no policy supported)
- Create a booking
- View upcoming bookings
- Update avatar/profile

**Venue Managers**
- Register & log in as a manager
- Create, edit, delete venues
- View bookings for managed venues
- Update avatar/profile

---

## Key Features
- **Venue browsing & search**
  - Pagination, keyword search, amenity & price filters
  - Junk listing filtering and minimum content checks
- **Availability & booking**
  - Date-range picker with blocked dates from existing bookings
  - Booking confirmation flow with summary (nights, cleaning, tax, total)
  - Conflict handling (overlapping bookings)
- **Profiles**
  - Public profile pages (venues)
  - Private profile dashboard tabs: **Bookings**, **Favorites**, **My Venues**
  - Update profile (bio, avatar, banner) with robust error messages
- **Venue management (managers)**
  - Create/edit/delete venues
  - Ratings, media, amenities, location (with optional lat/lng)
  - Bookings list per venue (modal)
- **Favorites**
  - Per-user favorites persisted locally (Zustand + localStorage)
- **Map & media**
  - Photo/Map toggle on venue page (Mapbox GL)
  - Fallback geocoding based on city/country when coordinates are missing
- **Auth & session**
  - Normalized API responses → consistent `token` + `username`
  - Tokens stored in `localStorage` and mirrored as cookies for server reads
  - Simple “auth changed” events for UI updates

---

## Tech Stack
- **Framework:** Next.js (React + TypeScript)
- **Styling:** Tailwind CSS
- **State:** Zustand (favorites)
- **Maps:** Mapbox GL JS
- **Build/Deploy:** Vercel (recommended)
- **Lint/Format:** ESLint + Prettier

---



## Installation ⚙️
### Prerequisites
- Node.js **18+**
- A **Noroff API Key**
- A **Mapbox access token** (for the map on venue pages)

### 1 Clone
```bash
git clone <your-repo-url>
cd <repo-folder>
```

2 Install
```bash
npm install
````


3 Environment

```bash
Create a .env.local in the project root:

# Noroff API (client)
NEXT_PUBLIC_NOROFF_API_KEY=your-noroff-api-key

# Noroff API (server – optional but recommended for server routes)
NOROFF_API_KEY=your-noroff-api-key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
# Optional custom style (falls back to dark-v11)
NEXT_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/your-style-id
`````

4 Run
```bash
npm run dev
````
Open http://localhost:3000




## Contact me 🙋🏽‍♀️  
Don’t hesitate to reach out to me or connect with me on social media if you have any questions, collaboration ideas, or an exciting new project in mind. I’m always open to new opportunities!   
🩷 [Instagram](https://www.instagram.com/rikkejuliane/)  
💙 [Linkedin](https://www.linkedin.com/in/rikkejuliane/)  


## Other 📌  
**Gantt Chart:** 
**Figma wireframes:** 
**GitHub Kanban Board:** 
**Style Guide:**