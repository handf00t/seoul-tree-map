// src/components/Blog/BlogCard.jsx
// Vercel 스타일 블로그 카드 컴포넌트

import React from 'react';

const BlogCard = ({ post, onClick, featured = false }) => {
  const categoryInfo = {
    guide: { name: '가이드', color: '#22C55E' },
    story: { name: '이야기', color: '#F59E0B' },
    update: { name: '업데이트', color: '#3B82F6' },
    community: { name: '커뮤니티', color: '#8B5CF6' }
  };

  const category = categoryInfo[post.category] || categoryInfo.guide;

  const formatDate = (date) => {
    const d = new Date(date);
    const month = d.toLocaleDateString('ko-KR', { month: 'short' });
    const day = d.getDate();
    return `${month} ${day}`;
  };

  return (
    <article
      onClick={() => onClick(post)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--outline)',
        borderRadius: featured ? '20px' : '16px',
        padding: featured ? '28px' : '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--outline)';
      }}
    >
      {/* 커버 이미지 */}
      {post.coverImage && (
        <div style={{
          width: '100%',
          height: featured ? '200px' : '160px',
          borderRadius: '12px',
          background: 'var(--surface-variant)',
          overflow: 'hidden'
        }}>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 메타데이터 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '12px',
          background: `${category.color}15`,
          color: category.color,
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {category.name}
        </span>

        <span style={{
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          {formatDate(post.publishedAt)}
        </span>

        <span style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span className="material-icons" style={{ fontSize: '14px' }}>schedule</span>
          {post.readTime}분
        </span>
      </div>

      {/* 제목 */}
      <h3 style={{
        margin: 0,
        fontSize: featured ? '24px' : '18px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {post.title}
      </h3>

      {/* 요약 */}
      <p style={{
        margin: 0,
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
        display: '-webkit-box',
        WebkitLineClamp: featured ? 3 : 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1
      }}>
        {post.excerpt}
      </p>

      {/* 작성자 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: 'auto',
        paddingTop: '12px',
        borderTop: '1px solid var(--divider)'
      }}>
        {post.author.avatar ? (
          <img
            src={post.author.avatar}
            alt={post.author.name}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white'
          }}>
            {post.author.name.charAt(0)}
          </div>
        )}
        <span style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontWeight: '500'
        }}>
          {post.author.name}
        </span>
      </div>
    </article>
  );
};

export default BlogCard;
