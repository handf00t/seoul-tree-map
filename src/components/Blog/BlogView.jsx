// src/components/Blog/BlogView.jsx
// Vercel 블로그 스타일의 메인 뷰

import React, { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import BlogDetail from './BlogDetail';
import IconButton from '../UI/IconButton';
import { BLOG_CATEGORIES } from '../../data/blogPosts';
import { loadAllPosts } from '../../utils/markdownLoader';

const BlogView = ({ onClose }) => {
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

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  // 필터된 포스트
  const filteredPosts = selectedCategory
    ? regularPosts.filter(post => post.category === selectedCategory)
    : regularPosts;

  // 상세 보기가 열려있으면 상세 화면만 표시
  if (selectedPost) {
    return (
      <BlogDetail
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
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
            ariaLabel="뒤로 가기"
          />
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            블로그
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
              포스트를 불러오는 중...
            </p>
          </div>
        ) : (
          <>
        {/* 카테고리 필터 */}
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
            전체
          </button>

          {BLOG_CATEGORIES.map((category) => (
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
              {category.name}
            </button>
          ))}
        </div>

        {/* 추천 포스트 (카테고리 필터 없을 때만) */}
        {!selectedCategory && featuredPosts.length > 0 && (
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
              추천 글
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {featuredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onClick={setSelectedPost}
                  featured={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* 일반 포스트 */}
        <section>
          {!selectedCategory && (
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text-primary)'
            }}>
              최근 글
            </h2>
          )}

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
                해당 카테고리의 글이 없습니다
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onClick={setSelectedPost}
                />
              ))}
            </div>
          )}
        </section>
        </>
        )}
      </div>
    </div>
  );
};

export default BlogView;
