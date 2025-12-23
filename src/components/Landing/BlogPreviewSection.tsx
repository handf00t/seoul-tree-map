// src/components/Landing/BlogPreviewSection.tsx
// 최신 블로그 글 미리보기 섹션
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { loadAllPosts } from '../../utils/markdownLoader';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail?: string;
}

interface BlogPreviewSectionProps {
  onViewAll: () => void;
}

const BlogPreviewSection: React.FC<BlogPreviewSectionProps> = ({ onViewAll }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const lang = i18n.language === 'ko' ? 'ko' : 'en';
        let allPosts = await loadAllPosts(lang);

        // 영어 포스트가 없으면 한국어로 fallback
        if (allPosts.length === 0 && lang === 'en') {
          allPosts = await loadAllPosts('ko');
        }

        // 최신 3개 포스트만 사용
        const latestPosts = allPosts.slice(0, 3).map((post: any) => ({
          id: post.contentFile?.replace('.md', '') || post.id,
          title: post.title,
          date: post.publishedAt?.toISOString() || post.date,
          excerpt: post.excerpt || '',
          thumbnail: post.coverImage || post.thumbnail
        }));

        setPosts(latestPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [i18n.language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section style={{ padding: '80px 24px', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          {t('common.loading', '로딩 중...')}
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section style={{
      padding: '80px 24px',
      background: '#FFFFFF',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 섹션 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--on-surface)',
              marginBottom: '8px'
            }}>
              {t('landing.blogTitle', '최신 이야기')}
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--on-surface-variant)',
              margin: 0
            }}>
              {t('landing.blogSubtitle', '서울 나무에 대한 흥미로운 분석과 이야기')}
            </p>
          </div>
          <button
            onClick={onViewAll}
            style={{
              background: 'none',
              border: '2px solid var(--outline)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--on-surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--outline)';
              e.currentTarget.style.color = 'var(--on-surface)';
            }}
          >
            {t('landing.viewAllPosts', '전체 보기')}
            <span className="material-icons" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
        </div>

        {/* 블로그 카드 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/blog/${post.id}`)}
              style={{
                background: 'var(--surface-variant)',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px var(--shadow-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* 썸네일 */}
              {post.thumbnail && (
                <div style={{
                  height: '180px',
                  background: `url(${post.thumbnail}) center/cover no-repeat`,
                  backgroundColor: 'var(--surface-dim)'
                }} />
              )}
              {!post.thumbnail && (
                <div style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-icons" style={{ fontSize: '48px', color: 'white', opacity: 0.5 }}>
                    article
                  </span>
                </div>
              )}

              {/* 콘텐츠 */}
              <div style={{ padding: '24px' }}>
                <time style={{
                  fontSize: '13px',
                  color: 'var(--on-surface-variant)',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {formatDate(post.date)}
                </time>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  marginBottom: '8px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--on-surface-variant)',
                  lineHeight: 1.5,
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewSection;
