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
    title: '출근길 매일 보는 나무, 알고 보니 도시의 히어로였다',
    excerpt: '매일 지나치는 가로수, 그냥 나무가 아닙니다. 운전자 안전부터 공기 정화까지, 가로수가 하는 놀라운 일들을 알아봅니다.',
    contentFile: '2025-11-11-street-trees-hero.md',
    category: 'story',
    tags: ['가로수', '도시숲', '환경', '도시'],
    author: {
      name: '서울트리맵',
      avatar: '/logo.svg'
    },
    publishedAt: new Date('2025-11-11'),
    coverImage: '/blog/street-trees-hero.jpg',
    readTime: 5,
    featured: true
  },

];
