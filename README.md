# Korean Book Search

A plugin for Obsidian that automatically fills in YAML frontmatter with Korean book information based on the note title.  
It uses the [Aladin Open API](https://blog.aladin.co.kr/openapi/popup/6695306) to fetch metadata like title, author, publisher, publication date, cover image, and more.

---

## 🚀 New Features

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

1. Create a new note with the title of a book (e.g. `미움받을 용기`)
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
title: 미움받을 용기
author: 기시미 이치로, 고가 후미타케
publisher: 인플루엔셜
pubDate: 2014-11-07
isbn: 9788996991342
cover: https://image.aladin.co.kr/...
category: 자기계발
myRate: 4.5
status: 읽는 중
startReadDate: 2025-05-13
---
```

## 🙋 Author  
Developed by @lazerfit

## 💡 License  
MIT

---

[🇰🇷 한국어 안내 보기](./README.ko.md)
