// src/utils/markdownLoader.js
// 마크다운 파일을 로드하고 Front Matter를 파싱하는 유틸리티

/**
 * Front Matter를 파싱합니다
 * @param {string} markdown - 전체 마크다운 텍스트
 * @returns {{metadata: Object, content: string}} 메타데이터와 콘텐츠
 */
function parseFrontMatter(markdown) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontMatterRegex);

  if (!match) {
    return { metadata: {}, content: markdown };
  }

  const [, frontMatter, content] = match;
  const metadata = {};

  // Front Matter 파싱
  frontMatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // 따옴표 제거
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    // 배열 파싱 (tags)
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
    }

    // boolean 파싱
    if (value === 'true') value = true;
    if (value === 'false') value = false;

    // 숫자 파싱
    if (!isNaN(value) && value !== '') {
      value = Number(value);
    }

    metadata[key] = value;
  });

  return { metadata, content };
}

/**
 * 마크다운 파일을 로드하고 파싱합니다
 * @param {string} filename - posts 디렉토리 내의 파일명
 * @returns {Promise<{metadata: Object, content: string}>}
 */
export async function loadMarkdownPost(filename) {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/posts/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    const markdown = await response.text();
    return parseFrontMatter(markdown);
  } catch (error) {
    console.error('Error loading markdown:', error);
    return {
      metadata: {},
      content: '# 콘텐츠를 불러올 수 없습니다\n\n잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 모든 포스트 목록을 로드합니다
 * @returns {Promise<Array>} 포스트 메타데이터 배열
 */
export async function loadAllPosts() {
  // posts 디렉토리의 모든 마크다운 파일 목록
  const postFiles = [
    '2025-01-10-seoul-tree-map-intro.md',
  ];

  const posts = [];

  for (const filename of postFiles) {
    try {
      const { metadata } = await loadMarkdownPost(filename);
      posts.push({
        ...metadata,
        contentFile: filename,
        publishedAt: new Date(metadata.publishedAt),
        author: {
          name: metadata.author,
          avatar: metadata.avatar
        }
      });
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
    }
  }

  // 날짜순 정렬 (최신순)
  return posts.sort((a, b) => b.publishedAt - a.publishedAt);
}
