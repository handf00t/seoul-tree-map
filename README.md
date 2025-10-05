# 🌳 서울 나무 지도

서울시 보호수, 가로수, 공원수목의 위치와 생태적 편익 정보를 제공하는 인터랙티브 지도 웹 애플리케이션

## 📋 주요 기능

### 🗺️ 지도 기반 탐색
- Mapbox GL JS 기반 인터랙티브 지도
- 서울시 전역의 나무 위치 표시
- 나무 종류별 필터링 (보호수, 가로수, 공원수목)
- 검색을 통한 나무 찾기

### 🌲 나무 정보
- 나무 종, 높이, 직경 등 기본 정보
- 연간 생태적 편익 정보
  - 빗물 흡수량
  - 에너지 절약량
  - 대기 정화량
  - 탄소 흡수량
  - 편익의 경제적 가치 (원화)

### 👤 사용자 기능
- Google 계정 로그인
- 즐겨찾기 나무 관리
- 나무 방문 기록 (사진, 코멘트)
- 내 방문 기록 조회
- 나무 정보 공유

### 📱 반응형 디자인
- 모바일 최적화 UI
- 데스크톱 지원
- 탭 기반 네비게이션 (모바일)

### ⚡ 성능 최적화
- **Service Worker를 통한 타일 캐싱**
  - Mapbox 지도 타일 자동 캐싱 (7일 유효)
  - 재방문 시 데이터 사용량 대폭 절감
  - 오프라인/불안정한 네트워크 환경 지원
- 캐시 관리 기능 (프로필 메뉴)
  - 캐시 확인: 저장된 타일 개수 확인
  - 캐시 삭제: 수동 캐시 정리

## 🛠️ 기술 스택

### Frontend
- **React** - UI 라이브러리
- **Mapbox GL JS** - 지도 렌더링
- **Material Icons** - 아이콘

### Backend & Services
- **Firebase Authentication** - 사용자 인증
- **Firebase Firestore** - 데이터베이스
- **Firebase Storage** - 이미지 저장

### 개발 도구
- Create React App
- ESLint

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Auth/           # 로그인 관련
│   ├── Map/            # 지도 컴포넌트
│   ├── Popup/          # 나무 정보 팝업
│   │   └── TreePopup/  # 팝업 서브 컴포넌트
│   ├── Navigation/     # 네비게이션
│   │   └── MobileNavPanel/
│   ├── Search/         # 검색 기능
│   ├── Visit/          # 방문 기록
│   ├── UI/             # 재사용 가능한 UI 컴포넌트
│   └── ...
├── contexts/           # React Context
├── hooks/              # Custom Hooks
├── services/           # Firebase 서비스
├── utils/              # 유틸리티 함수
└── App.js              # 메인 앱 컴포넌트
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 14+
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone [repository-url]
cd seoul-tree-map

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 Firebase 설정을 추가하세요:

```env
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

프로덕션 빌드가 `build/` 폴더에 생성됩니다.

## 🎨 주요 컴포넌트

### TreePopup
나무 상세 정보를 표시하는 팝업 컴포넌트 (640줄)
- 모듈화된 서브 컴포넌트 구조
- `BenefitsSection`, `TreeInfoBox`, `PopupHeader`, `TabMenu` 등

### MapContainer
Mapbox 지도를 렌더링하고 나무 데이터를 표시

### MobileNavPanel
모바일 네비게이션 패널
- HomeView, FavoritesView, MyVisitsView, AboutView, ProfileMenu

## 🔧 커스텀 훅

- `useResponsive` - 반응형 화면 크기 감지
- `useDragMinimize` - 드래그 제스처로 팝업 최소화
- `useShareTree` - 나무 정보 공유
- `useFavoriteTree` - 즐겨찾기 관리

## 🎯 최근 개선 사항

- **지도 타일 캐싱 (Service Worker)** - 데이터 사용량 절감 및 오프라인 지원
- TreePopup 컴포넌트 리팩토링 (929줄 → 640줄, 31% 감소)
- BenefitItem 컴포넌트 재사용으로 중복 코드 제거
- useMemo를 활용한 성능 최적화
- 모바일 UX 개선 (탭 네비게이션)

## 📝 개발 가이드

### 코드 스타일
- 함수형 컴포넌트 사용
- Hooks 활용
- 인라인 스타일 (CSS-in-JS)
- CSS 변수 사용 (`var(--primary)` 등)

### 네이밍 컨벤션
- 컴포넌트: PascalCase (예: `TreePopup.jsx`)
- 유틸/서비스: camelCase (예: `treeDataUtils.js`)
- 커스텀 훅: use + PascalCase (예: `useResponsive.js`)

## 📄 라이선스

MIT License

## 👥 기여

이슈와 PR을 환영합니다!
