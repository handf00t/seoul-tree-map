// src/data/blogPosts.js
// 블로그 포스트 메타데이터
// 실제 콘텐츠는 src/data/posts/ 디렉토리의 마크다운 파일에 저장됩니다.

export const BLOG_CATEGORIES = [
  { id: 'guide', name: '가이드', color: '#22C55E', icon: 'menu_book' },
  { id: 'story', name: '이야기', color: '#F59E0B', icon: 'auto_stories' },
  { id: 'update', name: '업데이트', color: '#3B82F6', icon: 'new_releases' },
  { id: 'community', name: '커뮤니티', color: '#8B5CF6', icon: 'groups' }
];

// 포스트 메타데이터
// contentFile: src/data/posts/ 내의 마크다운 파일 이름
export const BLOG_POSTS = [
  {
    id: '1',
    title: '서울 나무 지도를 소개합니다',
    excerpt: '서울시 전체 나무를 한눈에 볼 수 있는 인터랙티브 지도 서비스가 출시되었습니다. 25개 자치구의 나무 데이터를 실시간으로 탐색하고, 각 나무가 제공하는 생태적 편익을 확인해보세요.',
    contentFile: '2025-01-10-seoul-tree-map-intro.md',
    category: 'update',
    tags: ['출시', '소개'],
    author: {
      name: '서울 나무 지도 팀',
      avatar: '/logo.svg'
    },
    publishedAt: new Date('2025-01-10'),
    coverImage: '/blog/launch.jpg',
    readTime: 3,
    featured: true
  },

];
