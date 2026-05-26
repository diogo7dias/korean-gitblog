#!/usr/bin/env python3
"""One-shot bearblog CSV -> static site migration."""
import csv, json, re, sys, os, io, datetime, urllib.parse, html
from pathlib import Path
import requests
from PIL import Image
import markdown as md

ROOT = Path(__file__).parent
CSV_PATH = ROOT / "data.csv"
POSTS_DIR = ROOT / "posts"
IMG_DIR = ROOT / "assets" / "images"
INDEX = ROOT / "index.html"

POSTS_DIR.mkdir(exist_ok=True)
IMG_DIR.mkdir(parents=True, exist_ok=True)

csv.field_size_limit(sys.maxsize)

POST_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5">
  <title>{title_esc} | 편안한 한국어 연습 - Korean Through Fiction</title>
  <meta name="description" content="{slug}">
  <meta property="og:title" content="{title_esc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://diogo7dias.github.io/korean-gitblog/posts/{slug}.html">
  <meta property="og:image" content="/korean-gitblog/assets/images/{img_name}">
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
        <a href="https://www.youtube.com/@KoreanThroughFiction" target="_blank" rel="noopener">유튜브</a>
        <a href="https://www.tiktok.com/@korean.through.fiction" target="_blank" rel="noopener">틱톡</a>
        <a href="https://lazykoreanpractice.substack.com" target="_blank" rel="noopener">서브스택</a>
        <a href="https://bearblog.dev/discover/" target="_blank" rel="noopener">발견하다</a>
        <a href="../micro/index.html">寸話</a>
      </p>
    </nav>
  </header>

  <main>
    <h1>{title_esc}</h1>
    <time datetime="{iso_date}">{display_date}</time>

    <div class="content">
{hero_img}
{body_html}
    </div>

    <div id="tags" class="tags">
      <p class="tags">
{tags_html}
      </p>
    </div>
  </main>

  <footer>
    <a class="bmc-button" href="https://buymeacoffee.com/lazykoreanpratice" target="_blank" rel="noopener" aria-label="Buy me a coffee">
      <span>buy me a coffee</span>
    </a>
    <span>Powered by <a href="https://bearblog.dev">Bear ʕ•ᴥ•ʔ</a></span>
  </footer>

</body>
</html>
"""

UA = {"User-Agent": "Mozilla/5.0 (migration script)"}

def fetch_image(url, slug):
    """Download URL, convert to webp, save to assets/images/SLUG.webp. Return filename or None."""
    target = IMG_DIR / f"{slug}.webp"
    if target.exists():
        return target.name
    try:
        r = requests.get(url, headers=UA, timeout=20)
        r.raise_for_status()
        img = Image.open(io.BytesIO(r.content))
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")
        img.save(target, "WEBP", quality=85)
        return target.name
    except Exception as e:
        print(f"  ! image fail {slug}: {e}", file=sys.stderr)
        # Fallback: keep original extension
        try:
            ext = url.split("?")[0].rsplit(".", 1)[-1].lower()
            if ext not in {"jpg","jpeg","png","gif","webp"}:
                ext = "jpg"
            fb = IMG_DIR / f"{slug}.{ext}"
            r = requests.get(url, headers=UA, timeout=20)
            r.raise_for_status()
            fb.write_bytes(r.content)
            return fb.name
        except Exception as e2:
            print(f"  !! fallback also failed: {e2}", file=sys.stderr)
            return None

FIRST_IMG_RE = re.compile(r'!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')

def extract_and_strip_first_image(content):
    """Return (first_image_url_or_None, content_without_first_image)."""
    m = FIRST_IMG_RE.search(content)
    if not m:
        return None, content
    url = m.group(1)
    new_content = content[:m.start()] + content[m.end():]
    return url, new_content.lstrip()

def render_tags(tags_raw):
    try:
        tags = json.loads(tags_raw) if tags_raw else []
    except Exception:
        tags = []
    if not tags:
        tags = ["bilingual","comprehensible input","creative writing","fiction","korean","korean language","learn korean","shortstory"]
    parts = []
    for t in tags:
        enc = urllib.parse.quote(t)
        parts.append(f'        <a href="../blog/index.html?q={enc}">#{html.escape(t)}</a>')
    return "\n".join(parts)

def parse_date(s):
    if not s:
        return datetime.date.today()
    try:
        return datetime.datetime.fromisoformat(s.replace("Z","+00:00")).date()
    except Exception:
        try:
            return datetime.datetime.strptime(s[:10], "%Y-%m-%d").date()
        except Exception:
            return datetime.date.today()

def display_date(d):
    return d.strftime("%d %b, %Y")

def main():
    with open(CSV_PATH, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    posts = [r for r in rows
             if r.get("publish","").lower()=="true"
             and r.get("is page","").lower()=="false"]
    print(f"migrating {len(posts)} posts...")

    li_entries = []  # (date, slug, title)

    for i, r in enumerate(posts, 1):
        slug = r["slug"].strip()
        title = r["title"].strip()
        content = r["content"]
        date = parse_date(r.get("published date") or r.get("first published at"))

        print(f"[{i}/{len(posts)}] {slug}")

        img_url, body_md = extract_and_strip_first_image(content)
        img_name = None
        if img_url:
            img_name = fetch_image(img_url, slug)

        # Convert remaining markdown body to HTML
        body_html = md.markdown(body_md, extensions=["extra","nl2br"])

        hero_img = f'      <img src="../assets/images/{img_name}" alt="{html.escape(title)}">' if img_name else ""

        html_out = POST_TEMPLATE.format(
            title_esc=html.escape(title),
            slug=slug,
            iso_date=date.isoformat(),
            display_date=display_date(date),
            hero_img=hero_img,
            body_html=body_html,
            tags_html=render_tags(r.get("all tags","")),
            img_name=img_name or "",
        )
        (POSTS_DIR / f"{slug}.html").write_text(html_out, encoding="utf-8")
        li_entries.append((date, slug, title))

    # Build post-list HTML, newest first
    li_entries.sort(key=lambda x: x[0], reverse=True)
    lis = []
    for d, slug, title in li_entries:
        lis.append(
            f'      <li>\n'
            f'        <span>{display_date(d)}</span>\n'
            f'        <a href="posts/{slug}.html">{html.escape(title)}</a>\n'
            f'      </li>'
        )
    list_html = "\n".join(lis)

    # Inject into index.html (replace <ul ...> contents)
    idx = INDEX.read_text(encoding="utf-8")
    idx_new = re.sub(
        r'(<ul class="blog-posts" id="post-list">)(.*?)(</ul>)',
        lambda m: f'{m.group(1)}\n{list_html}\n    {m.group(3)}',
        idx, count=1, flags=re.S,
    )
    INDEX.write_text(idx_new, encoding="utf-8")

    # Mirror into blog/index.html
    blog_idx_path = ROOT / "blog" / "index.html"
    bidx = blog_idx_path.read_text(encoding="utf-8")
    # blog list uses relative posts/ from blog/, so swap href prefix
    list_html_blog = list_html.replace('href="posts/', 'href="../posts/')
    bidx_new = re.sub(
        r'(<ul class="blog-posts" id="post-list">)(.*?)(</ul>)',
        lambda m: f'{m.group(1)}\n{list_html_blog}\n    {m.group(3)}',
        bidx, count=1, flags=re.S,
    )
    blog_idx_path.write_text(bidx_new, encoding="utf-8")

    print(f"done. {len(li_entries)} posts written.")

if __name__ == "__main__":
    main()
