# Korean Book Search

한국 책 정보를 자동으로 불러와 YAML 프론트매터(frontmatter)를 채워주는 Obsidian 플러그인입니다.  
노트의 제목을 기반으로 [YES24 Open API](https://developers.yes24.com)를 호출하여  
제목, 저자, 출판사, 출간일, ISBN, 표지 이미지 등의 정보를 자동으로 가져옵니다.

---

## 📚 주요 기능

- 📖 노트 제목 기반 YES24 책 정보 검색
- ✍️ YAML frontmatter 자동 완성
- 🧩 `myRate`, `status`, `startReadDate` 등의 기본 필드 포함 여부 설정 가능
- 📋 커스텀 필드를 자유롭게 추가
- 🔐 YES24 API Key 안전하게 저장

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
2. 본인의 YES24 Open API Key 입력  
   👉 [developers.yes24.com](https://developers.yes24.com)에 YES24 계정으로 로그인해 신청하면 즉시 발급됩니다 (기본 플랜 무료)
3. 원하는 기본 필드를 켜거나 끄기 (myRate, status 등)
4. 필요한 커스텀 필드를 key-value 형식으로 추가

---

## 🚀 사용 방법

1. 노트를 하나 생성하고 제목에 책 제목을 입력  
   예: `소년이 온다`
2. 왼쪽 리본 메뉴에서 📖 아이콘 클릭
3. 아래 작업이 자동으로 실행됨:
	- 책 정보 검색
	- YAML frontmatter 작성
	- 파일 이름을 책 제목으로 변경

---

## 🧱 예시 결과

```yaml
---
title: 소년이 온다
author: 한강
publisher: 창비
pages: 216
pubDate: 2014-05-19
isbn: 9788936434120
cover: https://image.yes24.com/...
link: https://www.yes24.com/product/goods/...
myRate: 5
status: 읽는 중
startReadDate: 2025-05-13
finishReadDate: 2025-05-13
---
```

## 🌐 네트워크 사용

명령 실행 시 노트 제목과 API Key를 `apis.yes24.com`으로 보냅니다. 그 외에는 어떤 데이터도 전송하지 않습니다.  
도서 정보 제공: [YES24](https://www.yes24.com). 이 플러그인은 YES24와 제휴 관계가 없습니다.

## 🙋 개발자 정보
Developed by @lazerfit

## 💡 라이선스
MIT
