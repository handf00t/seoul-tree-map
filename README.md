# 서울 나무 지도

서울시 보호수, 가로수, 공원수목의 위치와 생태적 편익 정보를 제공하는 인터랙티브 지도 웹 애플리케이션

## 주요 기능

- 서울시 전역의 나무 위치 및 정보 탐색
- 나무 종류별 필터링 (보호수, 가로수, 공원수목)
- 연간 생태적 편익 정보 (빗물 흡수, 에너지 절약, 대기 정화, 탄소 흡수)
- Google 계정 로그인
- 즐겨찾기 및 방문 기록 관리
- 반응형 디자인 (모바일/데스크톱)

## 기술 스택

- React
- TypeScript
- Mapbox GL JS
- Firebase (Authentication, Firestore, Storage)

## 시작하기

### 설치

```bash
git clone [repository-url]
cd seoul-tree-map
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token
REACT_APP_TILESET_ID=your_tileset_id
REACT_APP_TREES_TILESET_ID=your_trees_tileset_id
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

### 빌드

```bash
npm run build
```


