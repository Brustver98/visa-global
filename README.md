# Visa Global (fresh)

## Pages
- `/` — Home
- `/check` — Client check page
- `/admin-login` — Admin login page
- `/admin` — Admin panel

## Admin credentials
Set these in Railway (Variables):
- `ADMIN_USER`
- `ADMIN_PASS`
- `SESSION_SECRET` (any long random string)

Default (if you do NOT set variables):
- user: `admin`
- pass: `admin123`  **(please change!)**

## Notes
- Newlines in notes are preserved (Enter works).
- Auto-delete: choose 3/5/7/14 days. When time passes, the case and its uploads are removed.

## Run locally
```bash
npm install
npm start
```

Open: http://localhost:8080
