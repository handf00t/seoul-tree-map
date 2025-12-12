// src/components/Blog/BlogView.jsx
// Vercel 블로그 스타일의 메인 뷰

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BlogCard from './BlogCard';
import BlogDetail from './BlogDetail';
import IconButton from '../UI/IconButton';
import { BLOG_CATEGORIES } from '../../data/blogPosts';
import { loadAllPosts } from '../../utils/markdownLoader';

const BlogView = ({ onClose }) => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { t } = useTranslation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      const loadedPosts = await loadAllPosts();
      setPosts(loadedPosts);
      setIsLoading(false);
    }
    fetchPosts();
  }, []);

  // URL 파라미터로 포스트 선택 (slug 기반)
  useEffect(() => {
    if (postId && posts.length > 0) {
      // slug로 포스트 찾기
      const post = posts.find(p => p.slug === postId);
      setSelectedPost(post || null);
    } else {
      setSelectedPost(null);
    }
  }, [postId, posts]);

  const featuredPosts = selectedCategory
    ? posts.filter(post => post.featured && post.category === selectedCategory)
    : posts.filter(post => post.featured);

  const regularPosts = selectedCategory
    ? posts.filter(post => !post.featured && post.category === selectedCategory)
    : posts.filter(post => !post.featured);

  // 필터된 포스트 (카테고리 선택 시에는 이미 regularPosts가 필터링되어 있음)
  const filteredPosts = regularPosts;

  // 포스트 클릭 핸들러 (slug 사용)
  const handlePostClick = (post) => {
    navigate(`/blog/${post.slug}`);
  };

  // 포스트 상세에서 뒤로가기
  const handleClosePost = () => {
    navigate('/blog');
  };

  // 상세 보기가 열려있으면 상세 화면만 표시
  if (selectedPost) {
    return (
      <BlogDetail
        post={selectedPost}
        onClose={handleClosePost}
      />
    );
  }

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
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <IconButton
            icon="arrow_back"
            onClick={onClose}
            variant="ghost"
            size="medium"
            ariaLabel={t('common.back')}
          />
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            {t('blog.title')}
          </h1>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom))'
      }}>
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-secondary)'
          }}>
            <span className="material-icons" style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.5
            }}>
              article
            </span>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {t('blog.loading')}
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: selectedCategory === null ? 'none' : '1px solid var(--outline)',
                  background: selectedCategory === null ? 'var(--primary)' : 'var(--surface)',
                  color: selectedCategory === null ? 'white' : 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== null) {
                    e.target.style.background = 'var(--surface-variant)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== null) {
                    e.target.style.background = 'var(--surface)';
                  }
                }}
              >
                {t('blog.all')}
              </button>

              {BLOG_CATEGORIES.filter(category =>
                posts.some(post => post.category === category.id)
              ).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '24px',
                    border: selectedCategory === category.id ? 'none' : '1px solid var(--outline)',
                    background: selectedCategory === category.id ? category.color : 'var(--surface)',
                    color: selectedCategory === category.id ? 'white' : 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.target.style.background = 'var(--surface-variant)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.target.style.background = 'var(--surface)';
                    }
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>
                    {category.icon}
                  </span>
                  {t(`blog.${category.id}`)}
                </button>
              ))}
            </div>

            {selectedCategory ? (
              <section>
                {featuredPosts.length === 0 && regularPosts.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span className="material-icons" style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>
                      article
                    </span>
                    <p style={{
                      margin: 0,
                      fontSize: '16px'
                    }}>
                      {t('blog.noCategoryPosts')}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                    justifyContent: 'start'
                  }}>
                    {featuredPosts.map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        onClick={handlePostClick}
                      />
                    ))}
                    {regularPosts.map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        onClick={handlePostClick}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <div>
                {featuredPosts.length > 0 && (
                  <section style={{ marginBottom: '48px' }}>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      marginBottom: '20px',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span className="material-icons" style={{ fontSize: '24px', color: 'var(--primary)' }}>
                        star
                      </span>
                      {t('blog.featuredPosts')}
                    </h2>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '24px',
                      justifyContent: 'start'
                    }}>
                      {featuredPosts.map((post) => (
                        <BlogCard
                          key={post.id}
                          post={post}
                          onClick={handlePostClick}
                          featured={true}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '20px',
                    color: 'var(--text-primary)'
                  }}>
                    {t('blog.recentPosts')}
                  </h2>

                  {filteredPosts.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: 'var(--text-secondary)'
                    }}>
                      <span className="material-icons" style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                        opacity: 0.5
                      }}>
                        article
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '16px'
                      }}>
                        {t('blog.noPosts')}
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '24px',
                      justifyContent: 'start'
                    }}>
                      {filteredPosts.map((post) => (
                        <BlogCard
                          key={post.id}
                          post={post}
                          onClick={handlePostClick}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogView;
