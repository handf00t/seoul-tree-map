// src/components/Blog/BlogDetail.jsx
// 블로그 포스트 상세 보기 컴포넌트

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import IconButton from '../UI/IconButton';
import { loadMarkdownPost } from '../../utils/markdownLoader';

const BlogDetail = ({ post, onClose }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      const { content: markdownContent } = await loadMarkdownPost(post.contentFile, post.lang || 'ko');
      setContent(markdownContent);
      setIsLoading(false);
    }
    loadContent();
  }, [post.contentFile]);
  const categoryInfo = {
    guide: { name: '가이드', color: '#22C55E' },
    story: { name: '이야기', color: '#F59E0B' },
    update: { name: '업데이트', color: '#3B82F6' },
    community: { name: '커뮤니티', color: '#8B5CF6' }
  };

  const category = categoryInfo[post.category] || categoryInfo.guide;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 인라인 마크다운 파싱 (bold, italic, code, links)
  const parseInlineMarkdown = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // **bold**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index === 0) {
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // *italic*
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch && italicMatch.index === 0) {
        parts.push(<em key={key++}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // `code`
      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch && codeMatch.index === 0) {
        parts.push(
          <code key={key++} style={{
            background: 'var(--surface-variant)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: 'monospace'
          }}>
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // [link text](url)
      const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
      if (linkMatch && linkMatch.index === 0) {
        parts.push(
          <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--primary)',
            textDecoration: 'underline'
          }}>
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // 일반 텍스트
      const nextSpecial = remaining.search(/\*\*|\*|`|\[/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts.length > 0 ? parts : text;
  };

  // Markdown 파싱 (제목, 단락, 리스트, 표, 코드블록, 인용문 등 지원)
  const renderContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];
    let currentListType = null; // 'ul' or 'ol'
    let inCodeBlock = false;
    let codeBlockContent = [];
    let codeBlockLang = '';
    let inBlockquote = false;
    let blockquoteContent = [];
    let inTable = false;
    let tableRows = [];

    const flushList = (index) => {
      if (currentList.length > 0) {
        const ListTag = currentListType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={`list-${index}`} style={{
            marginLeft: '24px',
            marginBottom: '16px',
            lineHeight: '1.8',
            paddingLeft: currentListType === 'ol' ? '0' : undefined
          }}>
            {currentList.map((item, i) => (
              <li key={i} style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{item}</li>
            ))}
          </ListTag>
        );
        currentList = [];
        currentListType = null;
      }
    };

    const flushBlockquote = (index) => {
      if (blockquoteContent.length > 0) {
        elements.push(
          <blockquote key={`quote-${index}`} style={{
            borderLeft: '4px solid var(--primary)',
            paddingLeft: '16px',
            margin: '16px 0',
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}>
            {blockquoteContent.map((line, i) => (
              <p key={i} style={{ margin: '8px 0' }}>{parseInlineMarkdown(line)}</p>
            ))}
          </blockquote>
        );
        blockquoteContent = [];
        inBlockquote = false;
      }
    };

    const flushTable = (index) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(2); // skip header and separator
        elements.push(
          <div key={`table-${index}`} style={{
            overflowX: 'auto',
            margin: '16px 0'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr>
                  {headerRow.map((cell, i) => (
                    <th key={i} style={{
                      padding: '12px',
                      borderBottom: '2px solid var(--divider)',
                      textAlign: 'left',
                      fontWeight: '600',
                      background: 'var(--surface-variant)'
                    }}>
                      {parseInlineMarkdown(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} style={{
                        padding: '12px',
                        borderBottom: '1px solid var(--divider)'
                      }}>
                        {parseInlineMarkdown(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      // 코드블록 시작/끝
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          flushList(index);
          flushBlockquote(index);
          flushTable(index);
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3);
          codeBlockContent = [];
        } else {
          elements.push(
            <pre key={`code-${index}`} style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              margin: '16px 0',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          inCodeBlock = false;
          codeBlockContent = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // 표 감지 (| 로 시작하는 줄)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList(index);
        flushBlockquote(index);
        inTable = true;
        const cells = line.split('|').slice(1, -1);
        // 구분선 (|---|---|) 은 건너뛰기
        if (!cells.every(cell => cell.trim().match(/^[-:]+$/))) {
          tableRows.push(cells);
        } else {
          tableRows.push('separator');
        }
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // 빈 줄
      if (line.trim() === '') {
        flushList(index);
        flushBlockquote(index);
        return;
      }

      // 인용문
      if (line.startsWith('> ')) {
        flushList(index);
        inBlockquote = true;
        blockquoteContent.push(line.slice(2));
        return;
      } else if (inBlockquote) {
        flushBlockquote(index);
      }

      // H1
      if (line.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h1 key={index} style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '20px',
            marginTop: '32px',
            color: 'var(--text-primary)',
            lineHeight: '1.3'
          }}>
            {parseInlineMarkdown(line.replace('# ', ''))}
          </h1>
        );
      }
      // H2
      else if (line.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h2 key={index} style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '16px',
            marginTop: '28px',
            color: 'var(--text-primary)',
            lineHeight: '1.4'
          }}>
            {parseInlineMarkdown(line.replace('## ', ''))}
          </h2>
        );
      }
      // H3
      else if (line.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h3 key={index} style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '12px',
            marginTop: '24px',
            color: 'var(--text-primary)',
            lineHeight: '1.4'
          }}>
            {parseInlineMarkdown(line.replace('### ', ''))}
          </h3>
        );
      }
      // H4
      else if (line.startsWith('#### ')) {
        flushList(index);
        elements.push(
          <h4 key={index} style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            marginTop: '20px',
            color: 'var(--text-primary)',
            lineHeight: '1.4'
          }}>
            {parseInlineMarkdown(line.replace('#### ', ''))}
          </h4>
        );
      }
      // 구분선
      else if (line.trim() === '---') {
        flushList(index);
        elements.push(
          <hr key={index} style={{
            border: 'none',
            borderTop: '1px solid var(--divider)',
            margin: '32px 0'
          }} />
        );
      }
      // iframe (인터랙티브 지도 등)
      else if (line.trim().startsWith('<iframe')) {
        flushList(index);
        const srcMatch = line.match(/src="([^"]+)"/);
        const heightMatch = line.match(/height="([^"]+)"/);
        if (srcMatch) {
          elements.push(
            <div key={index} style={{
              margin: '24px 0',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'var(--surface-variant)'
            }}>
              <iframe
                src={srcMatch[1]}
                width="100%"
                height={heightMatch ? heightMatch[1] : '500'}
                style={{
                  border: 'none',
                  display: 'block'
                }}
                loading="lazy"
                title="Interactive map"
              />
            </div>
          );
        }
      }
      // 이미지 ![alt](src)
      else if (line.trim().match(/^!\[.*\]\(.*\)$/)) {
        flushList(index);
        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          elements.push(
            <figure key={index} style={{ margin: '24px 0', textAlign: 'center' }}>
              <img
                src={imgMatch[2]}
                alt={imgMatch[1]}
                style={{
                  maxWidth: '100%',
                  borderRadius: '8px'
                }}
              />
              {imgMatch[1] && (
                <figcaption style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  {imgMatch[1]}
                </figcaption>
              )}
            </figure>
          );
        }
      }
      // 번호 리스트 (1. item)
      else if (line.match(/^\d+\.\s/)) {
        if (currentListType !== 'ol') {
          flushList(index);
        }
        currentListType = 'ol';
        currentList.push(parseInlineMarkdown(line.replace(/^\d+\.\s/, '')));
      }
      // 비순서 리스트 (- item 또는 * item)
      else if (line.match(/^[-*]\s/)) {
        if (currentListType !== 'ul') {
          flushList(index);
        }
        currentListType = 'ul';
        currentList.push(parseInlineMarkdown(line.replace(/^[-*]\s/, '')));
      }
      // 일반 단락
      else {
        flushList(index);
        elements.push(
          <p key={index} style={{
            fontSize: '16px',
            lineHeight: '1.8',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    });

    // 마지막에 남아있는 요소들 처리
    flushList('final');
    flushBlockquote('final');
    flushTable('final');

    return elements;
  };

  // SEO를 위한 URL 및 이미지 경로
  const siteUrl = window.location.origin;
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.coverImage ? `${siteUrl}${post.coverImage}` : `${siteUrl}/logo.svg`;

  // 공유하기 핸들러
  const handleShare = async () => {
    const shareData = {
      title: post.title,
      url: postUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Web Share API 미지원 시 클립보드에 복사
      try {
        await navigator.clipboard.writeText(postUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": imageUrl,
    "datePublished": new Date(post.publishedAt).toISOString(),
    "dateModified": new Date(post.publishedAt).toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "서울트리맵",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.svg`
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--surface)',
      zIndex: 10000,
      overflowY: 'auto'
    }}>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{post.title} | 서울트리맵</title>
        <meta name="description" content={post.excerpt} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={postUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:site_name" content="서울트리맵" />
        <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />
        <meta property="article:author" content={post.author.name} />
        {post.tags && post.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={postUrl} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={imageUrl} />

        {/* Canonical URL */}
        <link rel="canonical" href={postUrl} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* 헤더 */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--divider)',
        padding: '16px 20px',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <IconButton
            icon="arrow_back"
            onClick={onClose}
            variant="ghost"
            size="medium"
            ariaLabel="뒤로 가기"
          />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: category.color,
            flex: 1
          }}>
            {category.name}
          </span>
          <div style={{ position: 'relative' }}>
            <IconButton
              icon="share"
              onClick={handleShare}
              variant="ghost"
              size="medium"
              ariaLabel={t('common.share') || '공유하기'}
            />
            {showCopied && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                padding: '6px 12px',
                background: 'var(--text-primary)',
                color: 'var(--surface)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                zIndex: 10
              }}>
                링크가 복사되었습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <article style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        paddingBottom: 'calc(40px + env(safe-area-inset-bottom))'
      }}>
        {/* 커버 이미지 */}
        {post.coverImage && (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            paddingBottom: '100%',
            position: 'relative',
            borderRadius: '16px',
            marginBottom: '32px',
            overflow: 'hidden',
            background: 'var(--surface-variant)'
          }}>
            <img
              src={post.coverImage}
              alt={post.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* 메타데이터 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
              }}>
                {post.author.name.charAt(0)}
              </div>
            )}
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              {post.author.name}
            </span>
          </div>

          <time
            dateTime={new Date(post.publishedAt).toISOString()}
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}
          >
            {formatDate(post.publishedAt)}
          </time>

          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>schedule</span>
            {post.readTime}분 읽기
          </span>
        </div>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '32px'
          }}>
            {post.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: 'var(--surface-variant)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 본문 콘텐츠 */}
        <div style={{
          fontSize: '16px',
          lineHeight: '1.8',
          color: 'var(--text-primary)'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              로딩 중...
            </div>
          ) : (
            renderContent(content)
          )}
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
