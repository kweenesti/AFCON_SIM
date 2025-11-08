# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
# African Nations League – Tournament Management System

## 1. Introduction
This system is designed to simulate and manage a football (soccer) tournament for the African Nations League.  
The main aim is to automate administrative tasks such as registering teams, creating player squads, assigning ratings, and simulating matches.

To reduce manual data entry, the system incorporates a random generator that automatically assigns:

- 23 player names per team
- Natural positions for each player
- Positional ratings:
  - 50–100 for primary roles
  - 0–50 for alternate positions
- Overall team rating for each country (calculated via weighted averages)

This approach enables quick and consistent formation of at least eight national teams, which is essential for the tournament starting at the quarter-final stage.

---

## 2. System Components

**Authentication**  
- Managed using Firebase Authentication
- Ensures secure login for both representatives and administrators

**Representative Portal**  
- Allows country representatives to register teams, manage player rosters, and auto-generate player profiles

**Team Rating Engine**  
- Calculates country ratings based on player performance in various positions
- Uses weighted averages to reflect the importance of each position

**Tournament Engine**  
- Enables administrators to manage tournament stages:
  - Quarterfinals
  - Semi-Finals
  - Finals

**Match Simulator**  
- Generates realistic match outcomes using probability functions
- Simulates scores, goals, extra time, and penalties

**Match Viewer**  
- Public-facing page displaying:
  - Final score
  - Goal scorers
  - Winning team
  - Method of match resolution

---

## 3. How to Run the Application Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/kweenesti/AFCON_SIM.git
   cd AFCON_SIM
npm install
npm start
Deployment

This system is deployed on Vercel Hosting.

Live application: https://afconsim-git-main-uct-submission.vercel.app

Firebase Studio: https://studio.firebase.google.com/studio-8231274621

GitHub Repository: https://github.com/kweenesti/AFCON_SIM.git

Deployment steps:

Connected GitHub repository to Vercel

Added Firebase environment variables in Vercel

Deployed the main branch
Technologies Used

React.js

Firebase (Authentication, Firestore)

Vercel (Hosting & Deployment)
