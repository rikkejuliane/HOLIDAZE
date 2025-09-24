# Holidaze — Rikkejuliane  
<img width="1000" alt="Logo for holidaze" src="https://github.com/user-attachments/assets/4997a9e6-47e7-4a69-8e4f-ecb99f2229dc" />


## Table of Contents 📚  
1. [Project Overview](#project-overview-🌍)   
2. [Demo](#demo-🎥)  
3. [User Stories](#user-stories-👤)  
4. [Key Features](#key-features-✨)  
5. [Tech Stack](#tech-stack)  
6. [Installation](#installation-⚙️)  
7. [Contact](#contact-me-🙋🏽‍♀️)  
8. [Other](#other-📌)


## Project Overview 🌍
**Holidaze** is a responsive and intuitive booking site where users can discover places to stay, check availability, and make bookings with ease.

Customers can manage their profiles, track upcoming trips, and securely log in/out, while venue managers have full control over their listings—creating, updating, or deleting venues and viewing all bookings.

The application combines clean design, accessibility, and robust API integration to create a seamless booking experience. It is built with **Next.js, React, TypeScript,** and **Tailwind CSS,** using the official Noroff Holidaze API.

This project was developed as part of my **Project Exam 2** at Noroff, showcasing my skills in modern frontend development, API consumption, and responsive UI/UX.


## Demo 🎥
**Home / Explore:**  
![Home Demo](https://github.com/user-attachments/assets/f82dedb7-c9ad-44c1-8124-83231e786e8b)  

**Auth:**   
![Auth demo](https://github.com/user-attachments/assets/4ffaaad9-6647-4e8f-b8ed-4dd70730f573)

**Profile:**  
![Profile](https://github.com/user-attachments/assets/583f10df-3269-449d-b257-8835150d9eb2)



## User Stories 👤 
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



## Key Features ✨
- **Venue browsing & search**
  - Pagination, keyword search, amenity, guests count, date-range & price filters. 
  - Junk listing filtering and minimum content checks.
- **Availability & booking**
  - Date-range picker with blocked dates from existing bookings.
  - Booking confirmation flow with summary (nights, cleaning, tax, total).
  - Conflict handling (overlapping bookings).
- **Profiles**
  - Private profile dashboard tabs: **Bookings**, **Favorites**.
  - Update profile (bio, avatar, banner) with robust error messages.
  - Can become venue manager.
- **Venue management (managers)**
  - Create/edit/delete venues
  - Ratings, media, amenities, location (with optional lat/lng)
  - New dashboard tab: **My Venues**.
  - Bookings list per venue (modal).
- **Favorites**
  - Users can save venues to their personal favorites list.
  - Favorites are stored per user and persist across sessions (Zustand + localStorage).
- **Map & media**
  - Photo/Map toggle on venue page (Mapbox GL)
  - Fallback geocoding based on city/country when coordinates are missing
- **Auth & session**
  - Single authentication page for login and registration with animations
  - Normalized API responses → consistent `token` + `username`
  - Tokens stored in `localStorage` and mirrored as cookies for server reads
  - Simple “auth changed” events for UI updates



## Tech Stack
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Mapbox GL JS
- React Toastify
- Netlify
- Figma
- ESLint + Prettier
- Noroff API (v2)




## Installation ⚙️  
Click the link to access the project: 🔗 [Holidaze](https://holidaze-rikkejuliane.netlify.app/)  

**Clone + install:**  
```bash
git clone https://github.com/rikkejuliane/holidaze.git
cd holidaze
npm install
```

**Install dependencies:**  
Ensure you have Node.js installed. Then, run:  
```bash
npm install
```

**Environment Setup:**  
Copy the example environment file:  
```bash
cp .env.local.example .env.local
```

Open the newly created .env.local file in your editor and replace the placeholder values with your real credentials:  
```bash
# Noroff API key (replace with your own from Noroff API docs)  
NEXT_PUBLIC_NOROFF_API_KEY=your-api-key-here  

# Mapbox access token (replace with your own from mapbox.com)  
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-access-token-here  

# Mapbox style URL (replace with your own style URL, or use the provided one)  
NEXT_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/your-username/your-style-id  
```

👉 You can get your API key here: [Noroff API Key Documentation](https://docs.noroff.dev/docs/v2)    
👉 You can get your Mapbox token here: [Mapbox Account Tokens](https://docs.mapbox.com/help/dive-deeper/access-tokens/)    

**Run locally:**  
```bash
npm run dev
```

**Open the project:**  
```bash
http://localhost:3000
```


## Contact me 🙋🏽‍♀️  
Don’t hesitate to reach out to me or connect with me on social media if you have any questions, collaboration ideas, or an exciting new project in mind. I’m always open to new opportunities!   
🩷 [Instagram](https://www.instagram.com/rikkejuliane/)  
💙 [Linkedin](https://www.linkedin.com/in/rikkejuliane/)  

---

## Other 📌  
**Gantt Chart:** [View the timeline](https://github.com/users/rikkejuliane/projects/5/views/4)  
**Figma wireframes:** [View wireframes](https://www.figma.com/design/wX4OlYFlvdmTgCCV09ryv0/HOLIDAZE?node-id=0-1)  
**GitHub Kanban Board:** [View the board](https://github.com/users/rikkejuliane/projects/5/views/1)    
**Style Guide:** [View styleguide](https://www.figma.com/design/wX4OlYFlvdmTgCCV09ryv0/HOLIDAZE?node-id=18-102)  
