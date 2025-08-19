# Korean Book Search

A plugin for Obsidian that automatically fills in YAML frontmatter with Korean book information based on the note title.  
It uses the [Aladin Open API](https://blog.aladin.co.kr/openapi/popup/6695306) to fetch metadata like title, author, publisher, publication date, cover image, and more.

---

## 🚀 New Features

- v1.3.0:
	- Added 'pages' to frontmatter fields     	

- v1.1.0:
  - Added split subtitle and subtitle into separate fields
  - Add Korean language support for UI localization

---

## 📚 Features

- 📖 Automatically fetch book data using Aladin Open API
- ✍️ Fills YAML frontmatter with title, author, publisher, ISBN, publication date, etc.
- 🧩 Toggle default fields like `myRate`, `status`, `startReadDate`, `finishReadDate`
- 📋 Add custom frontmatter fields via settings UI
- 🔐 API key is stored securely

---

## 🛠️ Installation

> **Community Plugin (once accepted):**
1. Go to `Settings → Community Plugins → Browse`
2. Search for **Korean Book Search**
3. Click **Install** and then **Enable**

> **Manual Installation (before registration):**
1. Clone or download this repository
2. Copy the following files to your `.obsidian/plugins/korean-book-search/` directory:
	- `main.js`
	- `manifest.json`
	- *(optional)* `styles.css`
3. Enable the plugin in Obsidian

---

## 🔧 Setup

1. Go to `Settings → Korean Book Search`
2. Enter your [Aladin TTB API key](https://blog.aladin.co.kr/openapi/popup/6695306)
3. (Optional) Toggle the default frontmatter fields you want to include
4. (Optional) Add any custom key-value pairs you want to include in frontmatter

---

## 🚀 Usage

1. Create a new note with the title of a book (e.g. `소년이 온다`)
2. Click the book icon 📖 in the left ribbon
3. The plugin will:
	- Query the book via Aladin API
	- Fetch metadata
	- Insert a YAML frontmatter block
	- Rename the file to match the book title

---

## 🧱 Example Output

```yaml
---
title: 소년이 온다
subTitle: 2024 노벨문학상 수상작가
author: 한강 (지은이)
publisher: 창비
pages: 216
pubDate: 2014-05-19
isbn: 9788936434120
cover: https://image.aladin.co.kr/...
category: 소설/시/희곡
myRate: 5
status: 읽는 중
startReadDate: 2025-05-13
finishReadDate: 2025-05-13
---
```

## 🙋 Author  
Developed by @lazerfit

## 💡 License  
MIT

---

[🇰🇷 한국어 안내 보기](https://11oz.tistory.com/m/entry/Obsidian-plugin-%EC%98%B5%EC%8B%9C%EB%94%94%EC%96%B8-%EB%8F%84%EC%84%9C-%EC%A0%95%EB%B3%B4-%EC%9E%90%EB%8F%99-%EC%9E%85%EB%A0%A5%EA%B8%B0-Korean-Book-Search)
