#!/usr/bin/env node

/**
 * 블로그 포스트 자동 번역 스크립트
 *
 * 실행: npm run translate-blog
 *
 * 기능:
 * 1. public/posts/ko/ 의 마크다운 파일 읽기
 * 2. 영어(en), 일본어(ja)로 자동 번역
 * 3. public/posts/en/, public/posts/ja/ 에 저장
 */

const fs = require('fs');
const path = require('path');
const translate = require('@vitalets/google-translate-api').translate;

const POSTS_DIR = path.join(__dirname, '../public/posts');
const LANGUAGES = {
  en: 'English'
};

console.log('🌍 블로그 포스트 자동 번역 시작...\n');

// Front Matter 파싱
function parseFrontMatter(markdown) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontMatterRegex);

  if (!match) {
    return { metadata: {}, content: markdown };
  }

  const [, frontMatter, content] = match;
  return { frontMatter, content };
}

// Front Matter 재구성
function rebuildMarkdown(frontMatter, content) {
  return `---\n${frontMatter}\n---\n\n${content}`;
}

// 텍스트 번역
async function translateText(text, targetLang) {
  try {
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error(`번역 실패 (${targetLang}):`, error.message);
    return text; // 실패 시 원문 반환
  }
}

// Front Matter 필드별 번역
async function translateFrontMatter(frontMatter, targetLang) {
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
      const quote = value.startsWith('"') ? '"' : '';
      value = value.replace(/^"|"$/g, '');

      console.log(`  번역 중: ${key}...`);
      const translated = await translateText(value, targetLang);
      translatedLines.push(`${key}: ${quote}${translated}${quote}`);
    } else if (key === 'author') {
      // 작성자는 번역하지 않음 (선택사항)
      translatedLines.push(line);
    } else {
      translatedLines.push(line);
    }
  }

  return translatedLines.join('\n');
}

// 마크다운 본문 번역 (단락별)
async function translateContent(content, targetLang) {
  const lines = content.split('\n');
  const translatedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 빈 줄, 구분선, 코드 블록은 번역하지 않음
    if (!line || line === '---' || line.startsWith('```')) {
      translatedLines.push(lines[i]);
      continue;
    }

    // 제목, 리스트, 일반 텍스트 번역
    if (line.startsWith('#') || line.startsWith('-') || line.match(/^[\w가-힣]/)) {
      const prefix = line.match(/^(#{1,6}\s*|-\s*\*\*|\*\*|)/)[0];
      const text = line.replace(prefix, '');

      if (text.trim()) {
        process.stdout.write('.');  // 진행 표시
        const translated = await translateText(text, targetLang);
        translatedLines.push(lines[i].replace(text, translated));
      } else {
        translatedLines.push(lines[i]);
      }
    } else {
      translatedLines.push(lines[i]);
    }
  }

  console.log(''); // 줄바꿈
  return translatedLines.join('\n');
}

// 파일 번역
async function translateFile(filename) {
  const koPath = path.join(POSTS_DIR, 'ko', filename);

  if (!fs.existsSync(koPath)) {
    console.log(`❌ 파일을 찾을 수 없음: ${filename}`);
    return;
  }

  console.log(`\n📄 번역 중: ${filename}`);
  const markdown = fs.readFileSync(koPath, 'utf-8');
  const { frontMatter, content } = parseFrontMatter(markdown);

  for (const [lang, langName] of Object.entries(LANGUAGES)) {
    console.log(`\n🔄 ${langName} 번역 중...`);

    const translatedFrontMatter = await translateFrontMatter(frontMatter, lang);
    const translatedContent = await translateContent(content, lang);
    const translatedMarkdown = rebuildMarkdown(translatedFrontMatter, translatedContent);

    const targetPath = path.join(POSTS_DIR, lang, filename);
    fs.writeFileSync(targetPath, translatedMarkdown, 'utf-8');
    console.log(`✅ 저장: ${targetPath}`);
  }
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

  for (const file of files) {
    await translateFile(file);
  }

  console.log('\n🎉 번역 완료!\n');
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
