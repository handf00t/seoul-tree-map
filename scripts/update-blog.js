#!/usr/bin/env node

/**
 * 블로그 포스트 자동 업데이트 스크립트
 *
 * 실행: npm run update-blog
 *
 * 기능:
 * 1. public/posts/ 디렉토리의 모든 .md 파일 목록 생성
 * 2. manifest.json 생성
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../public/posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'manifest.json');
const LANGUAGES = ['ko', 'en'];

console.log('🚀 블로그 포스트 업데이트 시작...\n');

// public/posts 디렉토리가 없으면 생성
if (!fs.existsSync(POSTS_DIR)) {
  console.log('📁 public/posts 디렉토리 생성 중...');
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// 각 언어별 포스트 목록 가져오기
const postsByLanguage = {};
let totalCount = 0;

LANGUAGES.forEach(lang => {
  const langDir = path.join(POSTS_DIR, lang);

  if (!fs.existsSync(langDir)) {
    console.log(`⚠️  ${lang}/ 디렉토리 없음 - 생성 중...`);
    fs.mkdirSync(langDir, { recursive: true });
    postsByLanguage[lang] = [];
    return;
  }

  const files = fs.readdirSync(langDir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => b.localeCompare(a)); // 최신 파일 먼저

  postsByLanguage[lang] = files;
  totalCount += files.length;

  console.log(`📝 [${lang}] 발견된 포스트: ${files.length}개`);
  files.forEach(file => console.log(`   - ${file}`));
});

// manifest.json 생성
const manifest = {
  languages: LANGUAGES,
  posts: postsByLanguage,
  updatedAt: new Date().toISOString(),
  totalCount: totalCount
};

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

console.log('\n✅ manifest.json 생성 완료!');
console.log(`📍 위치: ${MANIFEST_PATH}`);
console.log(`\n총 ${totalCount}개의 포스트가 준비되었습니다.\n`);
