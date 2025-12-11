// src/components/Blog/BlogDetail.jsx
// 블로그 포스트 상세 보기 컴포넌트

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import IconButton from '../UI/IconButton';
import { loadMarkdownPost } from '../../utils/markdownLoader';

const BlogDetail = ({ post, onClose }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 현재 언어 가져오기 (ko, en, ja 중 하나)
  const currentLanguage = i18n.language.split('-')[0]; // 'ko-KR' -> 'ko'

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      const { content: markdownContent } = await loadMarkdownPost(post.contentFile, currentLanguage);
      setContent(markdownContent);
      setIsLoading(false);
    }
    loadContent();
  }, [post.contentFile, currentLanguage]);
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

  // 간단한 Markdown 파싱 (제목, 단락, 리스트만 지원)
  const renderContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];
    let inList = false;

    lines.forEach((line, index) => {
      // 빈 줄
      if (line.trim() === '') {
        if (inList && currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{
              marginLeft: '24px',
              marginBottom: '16px',
              lineHeight: '1.8'
            }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        return;
      }

      // H1
      if (line.startsWith('# ')) {
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
      // 구분선
      else if (line.trim() === '---') {
        elements.push(
          <hr key={index} style={{
            border: 'none',
            borderTop: '1px solid var(--divider)',
            margin: '32px 0'
          }} />
        );
      }
      // 리스트
      else if (line.startsWith('- ')) {
        inList = true;
        currentList.push(parseInlineMarkdown(line.replace('- ', '')));
      }
      // 일반 단락
      else {
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

    // 마지막에 리스트가 남아있으면 추가
    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" style={{
          marginLeft: '24px',
          marginBottom: '16px',
          lineHeight: '1.8'
        }}>
          {currentList.map((item, i) => (
            <li key={i} style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  // SEO를 위한 URL 및 이미지 경로
  const siteUrl = window.location.origin;
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.coverImage ? `${siteUrl}${post.coverImage}` : `${siteUrl}/logo.svg`;

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
            color: category.color
          }}>
            {category.name}
          </span>
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
