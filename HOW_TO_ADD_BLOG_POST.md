# 📝 블로그 포스트 추가 가이드

블로그 시스템은 마크다운 파일 기반으로 작동합니다. 각 포스트는 독립적인 `.md` 파일로 관리되며, Front Matter를 통해 메타데이터를 설정합니다.

## ⚡ 빠른 시작

새 포스트를 추가하는 방법은 **매우 간단**합니다:

1. `public/posts/ko/`에 한글 마크다운 파일 생성 (예: `2025-01-25-winter-care.md`)
2. 터미널에서 자동 번역: `npm run translate-blog` (영어 자동 생성)
3. 터미널에서 업데이트: `npm run update-blog`
4. 끝! 🎉

**이전 방식 (복잡):**
- ❌ 수동으로 파일 목록 편집
- ❌ 파일 복사 명령 실행
- ❌ 여러 언어 버전 수동 작성
- ❌ 여러 단계 거쳐야 함

**현재 방식 (간단):**
- ✅ 한글 파일만 작성
- ✅ 자동 번역 (영어)
- ✅ 자동 파일 인식
- ✅ 빠르고 쉬움!

---

## 🚀 새 포스트 추가하기 (상세 가이드)

### 1단계: 한글 마크다운 파일 생성

`public/posts/ko/` 디렉토리에 새 마크다운 파일을 생성합니다.

**파일명 규칙:** `YYYY-MM-DD-title-slug.md`

예시:
- `2025-01-25-winter-tree-care.md`
- `2025-02-01-spring-planting-guide.md`

**중요:** 한글로만 작성하면 됩니다! 영어는 자동 번역됩니다.

### 2단계: Front Matter 작성

파일 맨 위에 `---`로 감싼 Front Matter를 추가합니다:

```markdown
---
id: "6"
slug: "winter-tree-care"
title: "겨울철 나무 관리법"
excerpt: "추운 겨울, 나무를 건강하게 지키는 방법을 알아봅니다."
category: "guide"
tags: ["겨울", "관리", "가이드"]
author: "박나무"
avatar: "/logo.svg"
publishedAt: "2025-01-25"
coverImage: "/blog/winter-care.jpg"
readTime: 5
featured: false
---

# 겨울철 나무 관리법

본문 내용을 여기에 작성합니다...
```

### 3단계: 본문 작성

Front Matter 아래에 마크다운 형식으로 본문을 작성합니다:

```markdown
## 소제목

일반 텍스트 단락입니다.

### 작은 소제목

- 리스트 항목 1
- 리스트 항목 2
- 리스트 항목 3

---

구분선을 사용할 수 있습니다.
```

### 4단계: 자동 번역 실행 🌍

터미널에서 자동 번역 명령어를 실행합니다:

```bash
npm run translate-blog
```

이 명령어가 자동으로:
- `public/posts/ko/` 폴더의 모든 `.md` 파일 읽기
- Front Matter (제목, 요약) 영어로 번역
- 본문 내용 영어로 번역
- `public/posts/en/`에 자동 저장

### 5단계: 블로그 업데이트 명령 실행 ⚡

터미널에서 업데이트 명령어를 실행합니다:

```bash
npm run update-blog
```

이 명령어가 자동으로:
- `public/posts/ko/`, `public/posts/en/` 폴더의 모든 `.md` 파일 검색
- `manifest.json` 자동 생성 (언어별 파일 목록 포함)
- 파일 목록 업데이트

### 6단계: 확인

개발 서버가 실행 중이면 자동으로 새로고침됩니다. 브라우저에서 블로그 섹션을 확인하세요!

**다국어 확인:**
- 웹사이트 언어를 한국어, English로 변경하면서 확인
- 각 언어로 번역된 포스트가 자동으로 표시됨

---

## 📋 Front Matter 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | ✅ | 포스트 고유 ID |
| `slug` | string | ✅ | URL에 사용될 영문 slug (SEO 최적화) |
| `title` | string | ✅ | 포스트 제목 |
| `excerpt` | string | ✅ | 포스트 요약 (카드에 표시) |
| `category` | string | ✅ | 카테고리 (guide, story, update, community) |
| `tags` | array | ✅ | 태그 목록 |
| `author` | string | ✅ | 작성자 이름 |
| `avatar` | string | ❌ | 작성자 아바타 이미지 경로 |
| `publishedAt` | string | ✅ | 발행일 (YYYY-MM-DD) |
| `coverImage` | string | ❌ | 커버 이미지 경로 (1:1 비율 권장) |
| `readTime` | number | ✅ | 예상 읽기 시간 (분) |
| `featured` | boolean | ✅ | 추천 포스트 여부 |

## 🎨 카테고리

- **guide** - 가이드 (녹색 `#22C55E`)
- **story** - 이야기 (주황색 `#F59E0B`)
- **update** - 업데이트 (파란색 `#3B82F6`)
- **community** - 커뮤니티 (보라색 `#8B5CF6`)

## ✍️ 지원되는 마크다운 문법

- `# 제목` - H1 (큰 제목)
- `## 제목` - H2 (중간 제목)
- `### 제목` - H3 (작은 제목)
- `- 항목` - 리스트
- `---` - 구분선
- 일반 텍스트 단락

## 🖼️ 이미지 추가

1. 이미지 파일을 `public/blog/` 디렉토리에 저장
2. Front Matter에서 경로 지정:
   ```yaml
   coverImage: "/blog/your-image.jpg"
   ```

## 📁 파일 구조

```
seoul-tree-map/
├── public/
│   └── posts/                         # 📝 마크다운 파일 저장 위치
│       ├── ko/                        # 🇰🇷 한국어 포스트
│       │   └── 2025-11-11-street-trees-hero.md
│       ├── en/                        # 🇺🇸 영어 포스트 (자동 번역)
│       │   └── 2025-11-11-street-trees-hero.md
│       └── manifest.json              # 자동 생성 (수동 수정 X)
├── scripts/
│   ├── translate-blog.js              # 자동 번역 스크립트
│   └── update-blog.js                 # 블로그 업데이트 스크립트
├── src/
│   ├── data/
│   │   └── blogPosts.js               # 카테고리 정의
│   ├── utils/
│   │   └── markdownLoader.js          # Front Matter 파싱 로직
│   └── components/
│       └── Blog/
│           ├── BlogView.jsx           # i18n 언어 감지 통합
│           ├── BlogCard.jsx
│           └── BlogDetail.jsx         # i18n 언어 감지 통합
└── package.json                       # translate-blog, update-blog 스크립트 포함
```

## 🔄 기존 포스트 수정

1. `public/posts/ko/` 디렉토리의 해당 `.md` 파일 열기 (한글 원본 수정)
2. Front Matter 또는 본문 수정
3. 저장 후 `npm run translate-blog` 실행 (번역 업데이트)
4. 브라우저 새로고침으로 확인

**참고:** 영어 파일을 직접 수정하면, 다음 번역 시 덮어씌워집니다!

## 🌍 다국어 지원

### 자동 번역 시스템

블로그는 **한국어, 영어** 2개 언어를 지원합니다.

**작동 방식:**
1. 한국어로만 포스트 작성 (`public/posts/ko/`)
2. Google Translate API로 자동 번역
3. 영어(`en/`) 버전 자동 생성

**번역되는 항목:**
- Front Matter: `title`, `excerpt`
- 본문: 제목, 단락, 리스트 등 모든 텍스트

**번역되지 않는 항목:**
- Front Matter: `id`, `slug`, `category`, `tags`, `author`, `publishedAt`, `coverImage`, `readTime`, `featured`
- 코드 블록, 이미지 경로 등

### 언어 자동 감지

웹사이트의 i18n 시스템과 연동되어:
- 사용자가 언어 변경 시 해당 언어의 포스트 자동 로드
- 한국어 → `public/posts/ko/` 파일 로드
- English → `public/posts/en/` 파일 로드

## ✅ 체크리스트

새 포스트를 추가할 때:

- [ ] `public/posts/ko/`에 `YYYY-MM-DD-title.md` 형식으로 한글 파일 생성
- [ ] Front Matter 작성 (모든 필수 필드 포함, 특히 `slug` 필드!)
- [ ] 본문 작성 (한글 마크다운 형식)
- [ ] `npm run translate-blog` 실행 🌍 (영어 자동 생성)
- [ ] `npm run update-blog` 실행 ⚡ (manifest 업데이트)
- [ ] 브라우저에서 확인 (각 언어별로 확인)

## 💡 팁

- **ID 번호**: 기존 포스트의 가장 큰 ID에 +1
- **Slug 작성**: 영문 소문자, 하이픈(-)으로 단어 구분 (예: `winter-tree-care`, `spring-planting-guide`)
- **읽기 시간**: 약 200-300자/분 기준으로 계산
- **태그**: 2-4개 정도가 적당
- **요약**: 2-3줄 정도의 간단한 설명
- **커버 이미지**: 1:1 정사각형 비율 (1024x1024 권장)

## 🔍 SEO 최적화

블로그 포스트는 다음 SEO 기능이 자동으로 적용됩니다:

### 자동 적용되는 메타 태그
- **Title Tag**: `{제목} | 서울트리맵`
- **Meta Description**: excerpt 필드 사용
- **Canonical URL**: `/blog/{slug}`

### Open Graph (소셜 미디어 공유)
- Facebook, 카카오톡 등에서 미리보기 지원
- 커버 이미지 자동 설정
- 제목, 요약, 작성자 정보 포함

### Twitter Card
- Twitter에서 리치 프리뷰 지원
- Large Image Card 형식

### Structured Data (JSON-LD)
- Google 검색 결과에 리치 스니펫 표시
- Article Schema 자동 생성
- 작성자, 발행일, 이미지 정보 포함

### URL 구조
- **형식**: `/blog/{slug}`
- **예시**: `/blog/street-trees-hero`
- SEO 친화적인 slug 기반 URL
- 검색 엔진이 키워드를 인식할 수 있도록 영문 slug 사용 권장
