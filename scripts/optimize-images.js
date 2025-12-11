#!/usr/bin/env node
/**
 * 나뭇잎 이미지 최적화 스크립트
 * - PNG 압축
 * - WebP 변환 (고품질 유지하면서 용량 30-50% 감소)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/images/trees');
const STATS = {
  total: 0,
  success: 0,
  failed: 0,
  originalSize: 0,
  optimizedSize: 0
};

async function optimizeImage(filePath) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = path.parse(fileName).name;
  const webpPath = path.join(INPUT_DIR, `${fileNameWithoutExt}.webp`);

  try {
    // 원본 파일 크기
    const originalStats = fs.statSync(filePath);
    STATS.originalSize += originalStats.size;

    console.log(`\n🔄 ${fileName} 변환 중...`);

    // WebP 변환 (품질 85, 압축 효율 좋음)
    await sharp(filePath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);

    // 변환된 파일 크기
    const webpStats = fs.statSync(webpPath);
    STATS.optimizedSize += webpStats.size;

    const reduction = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
    const originalMB = (originalStats.size / 1024 / 1024).toFixed(2);
    const webpMB = (webpStats.size / 1024 / 1024).toFixed(2);

    console.log(`  ✅ ${originalMB}MB → ${webpMB}MB (${reduction}% 감소)`);

    STATS.success++;
  } catch (error) {
    console.error(`  ❌ 실패: ${error.message}`);
    STATS.failed++;
  }
}

async function main() {
  console.log('🌳 나뭇잎 이미지 최적화 시작\n');
  console.log('=' .repeat(60));

  // PNG 파일 찾기
  const files = fs.readdirSync(INPUT_DIR)
    .filter(file => file.endsWith('.png'))
    .map(file => path.join(INPUT_DIR, file));

  STATS.total = files.length;
  console.log(`총 ${STATS.total}개의 PNG 이미지 발견\n`);

  // 순차 처리 (병렬 처리 시 메모리 부족 가능)
  for (const file of files) {
    await optimizeImage(file);
  }

  // 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 최적화 결과:');
  console.log(`  총 파일: ${STATS.total}개`);
  console.log(`  성공: ${STATS.success}개`);
  console.log(`  실패: ${STATS.failed}개`);
  console.log(`  원본 크기: ${(STATS.originalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  최적화 후: ${(STATS.optimizedSize / 1024 / 1024).toFixed(2)}MB`);

  const totalReduction = ((1 - STATS.optimizedSize / STATS.originalSize) * 100).toFixed(1);
  console.log(`  총 감소량: ${totalReduction}% 🎉`);

  console.log('\n✅ 최적화 완료!');
  console.log(`\n💡 이제 treeImages.ts에서 .png를 .webp로 변경하세요.`);
}

main().catch(console.error);
