// src/types/blog.ts
// 블로그/콘텐츠 타입 정의

export type BlogCategory = 'guide' | 'story' | 'update' | 'community';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: Date;
  updatedAt?: Date;
  coverImage?: string;
  readTime: number; // 읽는 시간 (분)
  featured?: boolean; // 추천 게시물 여부
}

export interface BlogCategoryInfo {
  id: BlogCategory;
  name: string;
  color: string;
  icon: string;
}
