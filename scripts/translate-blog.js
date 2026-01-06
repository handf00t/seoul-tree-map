#!/usr/bin/env node

/**
 * 블로그 포스트 자동 번역 스크립트 (Claude API)
 *
 * 실행: npm run translate-blog
 *
 * 환경변수:
 * - ANTHROPIC_API_KEY: Claude API 키
 *
 * 기능:
 * 1. public/posts/ko/ 의 마크다운 파일 읽기
 * 2. Claude API로 자연스러운 영어 번역
 * 3. public/posts/en/ 에 저장
 * 4. manifest.json 자동 업데이트
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

const POSTS_DIR = path.join(__dirname, '../public/posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'manifest.json');

// API 키 확인
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  console.log('\n설정 방법:');
  console.log('  export ANTHROPIC_API_KEY="your-api-key"');
  console.log('  npm run translate-blog');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

console.log('🌍 블로그 포스트 자동 번역 시작 (Claude API)...\n');

// Front Matter 파싱
function parseFrontMatter(markdown) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: '', content: markdown };
  }

  const [, frontMatter, content] = match;
  return { frontMatter, content };
}

// Front Matter 재구성
function rebuildMarkdown(frontMatter, content) {
  return `---\n${frontMatter}\n---\n\n${content}`;
}

// Claude API로 번역
async function translateWithClaude(text, context = 'blog post') {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a professional translator specializing in Korean to English translation for blog content about urban trees and forestry.

Translate the following Korean ${context} to natural, engaging English.
- Keep the same markdown formatting (headings, lists, bold, etc.)
- Maintain the friendly, educational tone
- Keep technical terms accurate (tree species names, forestry terms)
- Do not translate or modify URLs, file paths, or code blocks
- For tree species, use the common English name if available

Korean text to translate:
${text}

Provide only the translated text, no explanations.`
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error(`번역 실패:`, error.message);
    throw error;
  }
}

// Front Matter 번역
async function translateFrontMatter(frontMatter) {
  const lines = frontMatter.split('\n');
  const translatedLines = [];

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      translatedLines.push(line);
      continue;
    }

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // 번역이 필요한 필드
    if (['title', 'excerpt'].includes(key)) {
      // 따옴표 제거
      const hasQuote = value.startsWith('"');
      value = value.replace(/^"|"$/g, '');

      console.log(`  📝 ${key} 번역 중...`);
      const translated = await translateWithClaude(value, `blog ${key}`);
      translatedLines.push(`${key}: "${translated.trim()}"`);
    } else if (key === 'tags') {
      // 태그 번역
      console.log(`  🏷️  tags 번역 중...`);
      const tagMatch = value.match(/\[(.*)\]/);
      if (tagMatch) {
        const tags = tagMatch[1].split(',').map(t => t.trim().replace(/"/g, ''));
        const translatedTags = await translateWithClaude(tags.join(', '), 'keywords/tags');
        const formattedTags = translatedTags.split(',').map(t => `"${t.trim()}"`).join(', ');
        translatedLines.push(`tags: [${formattedTags}]`);
      } else {
        translatedLines.push(line);
      }
    } else if (key === 'author' && value.includes('서울트리맵')) {
      translatedLines.push('author: "Seoul Tree Map"');
    } else {
      translatedLines.push(line);
    }
  }

  return translatedLines.join('\n');
}

// 마크다운 본문 번역
async function translateContent(content) {
  console.log('  📄 본문 번역 중...');

  // 전체 콘텐츠를 한 번에 번역 (문맥 유지)
  const translated = await translateWithClaude(content, 'blog article body');
  return translated;
}

// 파일 번역
async function translateFile(filename) {
  const koPath = path.join(POSTS_DIR, 'ko', filename);
  const enPath = path.join(POSTS_DIR, 'en', filename);

  if (!fs.existsSync(koPath)) {
    console.log(`❌ 파일을 찾을 수 없음: ${filename}`);
    return false;
  }

  // 이미 영어 버전이 있는지 확인
  if (fs.existsSync(enPath)) {
    const koStat = fs.statSync(koPath);
    const enStat = fs.statSync(enPath);

    if (enStat.mtime >= koStat.mtime) {
      console.log(`⏭️  스킵 (이미 최신): ${filename}`);
      return true;
    }
  }

  console.log(`\n📄 번역 중: ${filename}`);
  const markdown = fs.readFileSync(koPath, 'utf-8');
  const { frontMatter, content } = parseFrontMatter(markdown);

  try {
    const translatedFrontMatter = await translateFrontMatter(frontMatter);
    const translatedContent = await translateContent(content);
    const translatedMarkdown = rebuildMarkdown(translatedFrontMatter, translatedContent);

    // en 디렉토리 확인
    const enDir = path.join(POSTS_DIR, 'en');
    if (!fs.existsSync(enDir)) {
      fs.mkdirSync(enDir, { recursive: true });
    }

    fs.writeFileSync(enPath, translatedMarkdown, 'utf-8');
    console.log(`✅ 저장 완료: ${enPath}`);
    return true;
  } catch (error) {
    console.error(`❌ 번역 실패: ${filename}`, error.message);
    return false;
  }
}

// manifest.json 업데이트
function updateManifest(translatedFiles) {
  let manifest = { languages: ['ko', 'en'], posts: { ko: [], en: [] } };

  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }

  // ko 포스트 목록 갱신
  const koDir = path.join(POSTS_DIR, 'ko');
  manifest.posts.ko = fs.readdirSync(koDir)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => b.localeCompare(a)); // 최신순

  // en 포스트 목록 갱신
  const enDir = path.join(POSTS_DIR, 'en');
  if (fs.existsSync(enDir)) {
    manifest.posts.en = fs.readdirSync(enDir)
      .filter(f => f.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)); // 최신순
  }

  manifest.updatedAt = new Date().toISOString();
  manifest.totalCount = manifest.posts.ko.length + manifest.posts.en.length;

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('\n📋 manifest.json 업데이트 완료');
}

// 메인 실행
async function main() {
  const koDir = path.join(POSTS_DIR, 'ko');

  if (!fs.existsSync(koDir)) {
    console.error('❌ public/posts/ko/ 디렉토리가 없습니다.');
    process.exit(1);
  }

  const files = fs.readdirSync(koDir).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('⚠️  번역할 포스트가 없습니다.');
    return;
  }

  console.log(`총 ${files.length}개의 포스트를 번역합니다.\n`);

  const translatedFiles = [];
  for (const file of files) {
    const success = await translateFile(file);
    if (success) {
      translatedFiles.push(file);
    }
  }

  // manifest.json 업데이트
  updateManifest(translatedFiles);

  console.log('\n🎉 번역 완료!\n');
  console.log(`📊 결과: ${translatedFiles.length}/${files.length} 파일 번역됨`);
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
