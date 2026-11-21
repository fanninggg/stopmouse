# StopMouse

Organise a weekly social game: who's in, teams, fixtures, results and drinks after.

The first person to sign in becomes admin. Admins edit the game, drinks, team names and fixtures, enter scores, set anyone's availability and make other players admin (the star on a team page). Everyone else picks a team, can switch team at any time, and sets their own availability.

## Set up

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Authentication: enable the **Google** sign-in provider.
3. Firestore: create a database, then paste `firestore.rules` into its **Rules** tab and publish.
4. Project settings: add a **Web app** and copy its config into `.env` (see `.env.example`).
5. Run it:

```bash
npm install
npm run dev
```

## Host on Vercel

1. At [vercel.com/new](https://vercel.com/new), import this repo. Vercel spots Vite on its own; leave the build settings as they are.
2. Before you deploy, add the four `VITE_` values from `.env` under **Environment Variables**.
3. Deploy, then add the site's domain (e.g. `stopmouse.vercel.app`) in Firebase under Authentication → Settings → Authorised domains.

Every push to `main` goes live.
