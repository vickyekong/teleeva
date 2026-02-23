# Deploy MedConnect: Build Once, Deploy to Netlify and Your Server

The project is set up for **static export**: you build once on your machine and deploy the same `out` folder to both Netlify and your own server.

## 1. Build locally

```bash
cd medconnect
npm install
npm run build
```

When it finishes, the site is in the **`out`** folder (static HTML, JS, CSS).

---

## 2. Deploy to Netlify

**Option A – Netlify runs the build (Git)**

- Push the repo to GitHub/GitLab and connect it in Netlify.
- Build command: `npm run build`
- Publish directory: **`out`**
- Netlify will run `npm run build` and publish `out`.

**Option B – You build, Netlify only deploys `out`**

- In Netlify: **Sites → Add new site → Deploy manually** (or drag and drop).
- Drag the **`out`** folder into the Netlify deploy zone.
- Or use the CLI after building locally:

  ```bash
  npm install -g netlify-cli
  netlify login
  netlify deploy --prod --dir=out
  ```

---

## 3. Deploy to your own server

Copy the contents of **`out`** to your web server’s document root.

**Examples:**

- **Nginx:** e.g. `root /var/www/medconnect;` and put the contents of `out` in `/var/www/medconnect`.
- **Apache:** set `DocumentRoot` to the folder that contains the `out` contents.
- **cPanel / FTP:** upload everything inside `out` into `public_html` (or your site’s root).

The app is static: any server that can serve HTML, JS, and CSS is enough. No Node.js required on the server for this setup.

---

## Summary

| Step        | Command / action                          |
|------------|--------------------------------------------|
| Build here | `npm run build` → creates **`out`**        |
| Netlify    | Publish directory **`out`** or deploy `out` |
| Your server| Copy **`out`** contents to document root   |

One build, same `out` folder, for both Netlify and your live server.
