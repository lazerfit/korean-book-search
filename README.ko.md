# Korean Book Search

한국 책 정보를 자동으로 불러와 YAML 프론트매터(frontmatter)를 채워주는 Obsidian 플러그인입니다.  
노트의 제목을 기반으로 [알라딘 Open API](https://www.aladin.co.kr/ttb/api/Intro.aspx)를 호출하여  
제목, 저자, 출판사, 출간일, ISBN, 표지 이미지 등의 정보를 자동으로 가져옵니다.

---

## 📚 주요 기능

- 📖 노트 제목 기반 알라딘 책 정보 검색
- ✍️ YAML frontmatter 자동 완성
- 🧩 `myRate`, `status`, `startReadDate` 등의 기본 필드 포함 여부 설정 가능
- 📋 커스텀 필드를 자유롭게 추가
- 🔐 알라딘 API Key 안전하게 저장

---

## 🛠️ 설치 방법

> **커뮤니티 플러그인 등록 후:**

1. `설정 → 커뮤니티 플러그인 → 찾아보기`
2. `Korean Book Search` 검색
3. `설치` 후 `활성화`

> **직접 설치 (수동):**

1. 이 저장소를 클론 또는 다운로드
2. 아래 파일들을 `.obsidian/plugins/korean-book-search/` 폴더에 복사
	- `main.js`
	- `manifest.json`
	- (선택) `styles.css`
3. Obsidian에서 플러그인 활성화

---

## 🔧 설정 방법

1. `설정 → Korean Book Search` 탭 이동
2. 본인의 알라딘 API Key 입력  
   👉 [API Key 발급 링크](https://www.aladin.co.kr/ttb/api/Intro.aspx)
3. 원하는 기본 필드를 켜거나 끄기 (myRate, status 등)
4. 필요한 커스텀 필드를 key-value 형식으로 추가

---

## 🚀 사용 방법

1. 노트를 하나 생성하고 제목에 책 제목을 입력  
   예: `미움받을 용기`
2. 왼쪽 리본 메뉴에서 📖 아이콘 클릭
3. 아래 작업이 자동으로 실행됨:
	- 책 정보 검색
	- YAML frontmatter 작성
	- 파일 이름을 책 제목으로 변경

---

## 🧱 예시 결과

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

## 🙋 게발자 정보
Developed by @lazerfit

## 💡 라이선스
MIT
