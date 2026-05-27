# Korean Through Fiction — GitHub Pages Blog

## Project overview

Static blog that replicates koreanfiction.bearblog.dev, hosted free on GitHub Pages. Posts are plain HTML files. No static site generator, no build step. Just HTML files committed to the repo, deployed automatically via GitHub Actions.

---

## Repository structure

```
/
├── index.html          ← homepage (post list)
├── blog/               ← post list page (alias for index essentially)
├── posts/
│   └── SLUG.html       ← individual post files
├── assets/
│   ├── style.css       ← the full site CSS (do not modify without instruction)
│   └── images/
│       └── SLUG.webp   ← post hero images (named after post slug)
├── .github/
│   └── workflows/
│       └── deploy.yml  ← GitHub Actions deploy config
└── CLAUDE.md           ← this file
```

---

## Theme rules (do not deviate)

The site uses a custom monospace theme. All design decisions are locked. Claude must preserve:

- Font: Galmuri14, with Menlo / Consolas / monospace fallbacks (loaded from CDN)
- Color scheme: white background `#ffffff`, black text `#111` by default; swaps to dark (`#222` bg, `#fff` text) for users who prefer light scheme (yes, this is intentional — the CSS media query is inverted on purpose)
- Max content width: 600px, centered
- All interactive elements use `outline: 1px solid black` (solid at rest, dashed on hover)
- Yellow chip color: `#fff642` for primary action buttons
- Post titles (`main h1`): black background, white text, inline-block, hover inverts to white bg / black text
- Navigation links: transparent bg, black outline, no fill
- Blog post list items: inverted pill style (dark bg, light text), `+` chevron prefix
- Footer: flex row, centered, buy-me-a-coffee button + Bear credit
- Hero image on desktop (≥1025px): floats left at 55% width, text wraps right
- Hero image on mobile: full width, no float
- No hover/transition effects on mobile (all disabled via media query)

The full CSS lives in `assets/style.css`. Do not regenerate it. Only edit it if explicitly told to.

---

## Adding a new post

When the user says "add a post" or "create a post", they will provide:

1. **Title** — bilingual format: `한국어 제목 - English Title [level]` where level is one of `[초 初]`, `[중 中]`, `[고 高]`
2. **Body text** — the full post content in Markdown or plain text
3. **Image** — an image file (the user will attach it or provide a path)
4. **Tags** (optional) — comma-separated list; if not provided, use standard defaults: `bilingual, comprehensible input, creative writing, fiction, korean, korean language, learn korean, shortstory`
5. **Slug** (optional) — if not provided, derive from the English part of the title: lowercase, spaces to hyphens, remove special characters

### Steps to create a post

**Step 1 — Process the image**

- Copy the image to `assets/images/SLUG.webp` (convert to webp if needed using Python Pillow; if conversion not possible, keep original format)
- The image filename must match the slug exactly

**Step 2 — Create the post HTML file**

Create `posts/SLUG.html` using the template below. Fill in all placeholders.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5">
  <title>POST_TITLE | 편안한 한국어 연습 - Korean Through Fiction</title>
  <meta name="description" content="SLUG_VALUE">
  <meta property="og:title" content="POST_TITLE">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/posts/SLUG">
  <meta property="og:image" content="/assets/images/SLUG.webp">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body>

  <header class="flex">
    <div class="title">
      <h1><a href="../index.html">편안한 한국어 연습 - Korean Through Fiction</a></h1>
    </div>
    <nav>
      <p>
        <a href="../blog/index.html">이야기 목록</a>
        <button type="button" id="random-post-btn" class="random-button">랜덤 이야기</button>
      </p>
    </nav>
  </header>

  <main>
    <h1>POST_TITLE</h1>
    <time datetime="YYYY-MM-DD">DD Mon, YYYY</time>

    <div class="content">
      <img src="../assets/images/SLUG.webp" alt="POST_TITLE">

      POST_BODY_HTML

    </div>

    <div id="tags" class="tags">
      <p class="tags">
        TAGS_HTML
      </p>
    </div>
  </main>

  <footer>
    <button type="button" class="random-button">랜덤 이야기</button>
    <a class="bmc-button" href="https://buymeacoffee.com/lazykoreanpratice" target="_blank" rel="noopener" aria-label="Buy me a coffee">
      <span>buy me a coffee</span>
    </a>
    <span>Powered by <a href="https://bearblog.dev">Bear ʕ•ᴥ•ʔ</a></span>
  </footer>

  <script src="../assets/random.js" defer></script>

</body>
</html>
```

**Filling the template:**

- `POST_TITLE`: the full bilingual title including level tag
- `SLUG_VALUE`: the slug string (used in meta description, matching bearblog convention)
- `YYYY-MM-DD`: today's date in ISO format
- `DD Mon, YYYY`: e.g. `20 Mar, 2026`
- `POST_BODY_HTML`: convert the user's body text to HTML paragraphs. Wrap each paragraph in `<p>`. Preserve blank lines as paragraph breaks. Do not add extra wrappers.
- `TAGS_HTML`: generate one `<a>` per tag in this format:
  ```html
  <a href="../blog/index.html?q=TAG_URLENCODED">#TAG_DISPLAY</a>
  ```

**Step 3 — Update the homepage post list**

Open `index.html`. Find the `<ul class="blog-posts">` list. Prepend a new `<li>` at the top:

```html
<li>
  <span>DD Mon, YYYY</span>
  <a href="posts/SLUG.html">POST_TITLE</a>
</li>
```

**Step 4 — Commit and push**

```bash
git add posts/SLUG.html assets/images/SLUG.webp index.html
git commit -m "post: SLUG"
git push
```

GitHub Actions will deploy automatically. Site live in ~30 seconds.

---

## Initial setup (first time only)

Do this once when setting up a new GitHub repo for this project.

### 1. Create GitHub repo

- Go to github.com, create a new public repository
- Name suggestion: `korean-through-fiction` or any name you prefer
- Do not initialize with README

### 2. Clone and scaffold locally

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
mkdir -p posts assets/images blog micro .github/workflows
```

### 3. Create assets/style.css

Copy the full CSS from the source. It is stored verbatim in this project. Do not regenerate or rewrite it; copy it exactly from the reference file `assets/style.css` that was committed during initial setup.

### 4. Create the GitHub Actions deploy workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5. Create index.html

Use this structure (fill in existing posts from bearblog CSV export if migrating):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5">
  <title>편안한 한국어 연습 - Korean Through Fiction</title>
  <meta name="description" content="소설을 읽으면서 한국어를 배워요. Learn Korean Through Reading Fiction.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>

  <header class="flex">
    <div class="title">
      <h1><a href="index.html">편안한 한국어 연습 - Korean Through Fiction</a></h1>
    </div>
    <nav>
      <p>
        <a href="blog/index.html">이야기 목록</a>
        <a href="https://www.youtube.com/@KoreanThroughFiction" target="_blank" rel="noopener">유튜브</a>
        <a href="https://www.tiktok.com/@korean.through.fiction" target="_blank" rel="noopener">틱톡</a>
        <a href="https://lazykoreanpractice.substack.com" target="_blank" rel="noopener">서브스택</a>
        <a href="https://bearblog.dev/discover/" target="_blank" rel="noopener">발견하다</a>
        <a href="micro/index.html">寸話</a>
      </p>
    </nav>
  </header>

  <main>
    <div id="home-text">
      <p>소설을 읽으면서 한국어를 배워요.<br>
      [Learn Korean Through Reading Fiction.]</p>
    </div>

    <ul class="blog-posts" id="post-list">
      <!-- Posts prepended here, newest first -->
    </ul>

    <button id="random-post-btn" class="random-button">랜덤 이야기</button>
  </main>

  <footer>
    <a class="bmc-button" href="https://buymeacoffee.com/lazykoreanpratice" target="_blank" rel="noopener" aria-label="Buy me a coffee">
      <span>buy me a coffee</span>
    </a>
    <span>Powered by <a href="https://bearblog.dev">Bear ʕ•ᴥ•ʔ</a></span>
  </footer>

  <script>
  function randomPost() {
    const blogPosts = document.querySelectorAll('.blog-posts li a');
    if (blogPosts.length > 0) {
      const randomIndex = Math.floor(Math.random() * blogPosts.length);
      window.location.href = blogPosts[randomIndex].href;
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    const randomBtn = document.getElementById('random-post-btn');
    if (randomBtn) randomBtn.addEventListener('click', randomPost);

    // Shuffle post list on load
    const lists = document.querySelectorAll('ul.blog-posts');
    lists.forEach(ul => {
      const items = Array.from(ul.children);
      if (items.length < 2) return;
      ul.style.visibility = 'hidden';
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      items.forEach(li => ul.appendChild(li));
      ul.style.visibility = '';
    });
  });
  </script>

</body>
</html>
```

### 6. Enable GitHub Pages

- Go to repo Settings > Pages
- Source: GitHub Actions
- Save

### 7. Update base URLs

Search all HTML files for `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` and replace with actual values. If using a custom domain (e.g. koreanfiction.com), replace base URL with that instead and add a `CNAME` file to the repo root containing just the domain name.

---

## Infobox components (optional, use in post body)

These styled boxes can be used inside post content. Copy as-is into `POST_BODY_HTML`.

**Info box:**
```html
<div class="infobox-frame">
  <div class="infobox-icon"></div>
  <div class="infobox-text"><p>Your info text here.</p></div>
</div>
```

**Warning box:**
```html
<div class="warningbox-frame">
  <div class="warningbox-icon"></div>
  <div class="warningbox-text"><p>Your warning text here.</p></div>
</div>
```

**Success box:**
```html
<div class="successbox-frame">
  <div class="successbox-icon"></div>
  <div class="successbox-text"><p>Your success text here.</p></div>
</div>
```

---

## Migrating existing posts from bearblog

1. Export CSV from bearblog Settings
2. Run: `pip install pandas pillow requests`
3. Ask Claude Code to write a migration script that reads the CSV and generates one HTML file per post using the post template above, downloading images from bearblog's CDN into `assets/images/`
4. Commit all at once: `git add . && git commit -m "initial migration" && git push`

---

## Notes

- Time zone for dates: use Europe/Lisbon (Portugal)
- Image format preference: webp. If the user provides a jpg/png, convert silently using Pillow before committing
- Slugs with Korean characters: transliterate or use the English portion of the title only
- Do not add any analytics, tracking scripts, or third-party dependencies beyond the Galmuri font CDN and Buy Me a Coffee link already present
- The `<time>` element has `display: none` in CSS — dates are hidden visually but present in markup for semantics

---

## First-time bootstrap prompt

When starting a brand new session with this project, paste this prompt to Claude Code (replace the bracketed values):

```
I'm setting up a new GitHub Pages blog. I've attached two files: CLAUDE.md (project instructions) and style.css (site theme). 

Do the following end-to-end:

1. Read CLAUDE.md fully before doing anything
2. Create a new GitHub repository called [REPO_NAME] — make it [public/private]
3. Scaffold the full project structure as described in CLAUDE.md
4. Place style.css at assets/style.css exactly as provided, do not modify it
5. Create all required files: index.html, .github/workflows/deploy.yml, blog/index.html, micro/index.html
6. Replace all instances of YOUR_GITHUB_USERNAME with [YOUR_GITHUB_USERNAME] and YOUR_REPO_NAME with [REPO_NAME] across all files
7. Commit everything and push to main
8. Enable GitHub Pages via GitHub Actions using the gh CLI

My GitHub username is [YOUR_GITHUB_USERNAME].
```

Requires `gh` CLI installed and authenticated on the VPS (`gh auth login`).

---

## Subsequent post prompt

For every new post, paste this (fill in the brackets):

```
Add a new post to the Korean Through Fiction blog.

Title: [한국어 제목 - English Title [level]]
Slug: [english-slug] (or omit to auto-derive)
Tags: [tag1, tag2] (or omit for defaults)
Image: [attached / path/to/image.jpg]

Body:
[paste full post text here]

Create the post file, process the image, update index.html, commit and push.
```

