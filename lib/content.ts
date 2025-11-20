import matter from 'gray-matter';
import type { BlogPost } from '@/types/blog';

interface SearchResult {
  posts: BlogPost[];
  hasError?: boolean;
  errorMessage?: string;
}

/**
 * Load all markdown posts from content/posts directory
 * Uses dynamic import to avoid fs at build time
 */
export async function loadPostsFromMarkdown(): Promise<BlogPost[]> {
  try {
    // Dynamic imports - only loaded at runtime
    const fs = (await import('fs')).default;
    const path = (await import('path')).default;
    
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    
    // Handle case where directory doesn't exist
    if (!fs.existsSync(postsDir)) {
      console.warn(`Posts directory not found at ${postsDir}, using fallback`);
      return getStaticFallbackPosts();
    }

    const files = fs.readdirSync(postsDir).filter((file: string) => file.endsWith('.md'));
    
    const posts = files.map((file: string) => {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      // Convert frontmatter to BlogPost
      const post: BlogPost = {
        id: data.slug || file.replace('.md', ''),
        title: data.title || 'Untitled',
        slug: data.slug || file.replace('.md', ''),
        author: data.author || 'Admin',
        featuredImageUrl: data.featuredImageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
        seoTitle: data.title || 'Untitled',
        metaDescription: data.metaDescription || 'Read this blog post',
        keywords: data.keywords || [data.category?.toLowerCase() || 'blog'],
        categories: data.category ? [data.category] : ['Blog'],
        tags: data.tags || [],
        status: 'published',
        publishDate: new Date(data.createdAt).toISOString(),
        createdAt: new Date(data.createdAt).toISOString(),
        updatedAt: new Date(data.updatedAt || data.createdAt).toISOString(),
        content: content,
      };

      return post;
    });

    return posts.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  } catch (error) {
    console.error('Error loading posts from markdown:', error);
    return getStaticFallbackPosts();
  }
}

/**
 * Fallback static posts for build-time guarantee
 */
function getStaticFallbackPosts(): BlogPost[] {
  return [
    {
      id: "getting-started-with-ai-lodi",
      title: "Getting Started with AI LODI",
      slug: "getting-started-with-ai-lodi",
      author: "Admin",
      featuredImageUrl: "https://images.unsplash.com/photo-1677442d019cecf8d10c0e68b60a6378?w=800&h=400&fit=crop",
      seoTitle: "Getting Started with AI LODI - Your Guide",
      metaDescription: "Learn how to get started with AI LODI and begin your journey into artificial intelligence",
      keywords: ["ai", "lodi", "getting started"],
      categories: ["Tutorials"],
      tags: ["AI", "Getting Started"],
      status: "published",
      publishDate: "2024-01-15T10:00:00Z",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      content: "# Getting Started with AI LODI\n\nWelcome to AI LODI!"
    },
    {
      id: "understanding-authentication",
      title: "Understanding Authentication",
      slug: "understanding-authentication",
      author: "Admin",
      featuredImageUrl: "https://images.unsplash.com/photo-1633356122544-f134ef2e00ae?w=800&h=400&fit=crop",
      seoTitle: "Understanding Authentication",
      metaDescription: "Deep dive into authentication mechanisms and best practices",
      keywords: ["authentication", "security"],
      categories: ["Security"],
      tags: ["Security"],
      status: "published",
      publishDate: "2024-01-20T14:30:00Z",
      createdAt: "2024-01-20T14:30:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      content: "# Understanding Authentication\n\nAuthentication is critical for security."
    },
    {
      id: "cloudflare-scalable-apps",
      title: "Building Scalable Apps with Cloudflare",
      slug: "cloudflare-scalable-apps",
      author: "Admin",
      featuredImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
      seoTitle: "Building Scalable Applications with Cloudflare",
      metaDescription: "Learn to build scalable apps with Cloudflare",
      keywords: ["cloudflare", "scalability"],
      categories: ["DevOps"],
      tags: ["Cloudflare"],
      status: "published",
      publishDate: "2024-01-25T09:15:00Z",
      createdAt: "2024-01-25T09:15:00Z",
      updatedAt: "2024-01-25T09:15:00Z",
      content: "# Building Scalable Apps with Cloudflare\n\nCloudflare is powerful!"
    }
  ];
}

export async function getAllContent(): Promise<BlogPost[]> {
  try {
    // Load posts from markdown files
    const posts = await loadPostsFromMarkdown();
    return posts.filter((post: BlogPost) => post.status === 'published')
      .sort((a: BlogPost, b: BlogPost) => 
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
  } catch (error) {
    console.error('Error loading posts:', error);
    return [];
  }
}

export async function getContentBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await getAllContent();
    return posts.find((post) => post.slug === slug) || null;
  } catch (error) {
    console.error('Error loading post:', error);
    return null;
  }
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  try {
    const posts = await getAllContent();
    return posts.filter(post => post.categories.includes(category));
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = normalizeText(str1).split(' ');
  const words2 = normalizeText(str2).split(' ');
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

export async function searchPosts(query: string): Promise<SearchResult> {
  try {
    const posts = await getAllContent();
    
    if (!query.trim()) {
      return {
        posts,
        hasError: false
      };
    }
    
    const normalizedQuery = normalizeText(query);
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    
    const scoredPosts = posts.map(post => {
      let score = 0;
      const normalizedTitle = normalizeText(post.title);
      const normalizedDescription = normalizeText(post.metaDescription);
      const normalizedContent = normalizeText(post.content);
      const normalizedTags = post.tags.map(tag => normalizeText(tag));
      const normalizedCategories = post.categories.map(cat => normalizeText(cat));
      
      // Exact phrase matches
      if (normalizedTitle.includes(normalizedQuery)) score += 100;
      if (normalizedDescription.includes(normalizedQuery)) score += 80;
      if (normalizedContent.includes(normalizedQuery)) score += 40;
      
      // Individual keyword matches
      for (const term of searchTerms) {
        if (term.length < 2) continue;
        
        if (normalizedTitle.includes(term)) score += 20;
        if (normalizedDescription.includes(term)) score += 15;
        if (normalizedTags.some(tag => tag === term)) score += 25;
        if (normalizedTags.some(tag => tag.includes(term))) score += 15;
        if (normalizedCategories.some(cat => cat === term)) score += 25;
        if (normalizedCategories.some(cat => cat.includes(term))) score += 15;
        
        const contentMatches = (normalizedContent.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(contentMatches * 2, 10);
      }
      
      // Fuzzy matching
      const titleSimilarity = calculateSimilarity(normalizedQuery, normalizedTitle);
      const descriptionSimilarity = calculateSimilarity(normalizedQuery, normalizedDescription);
      
      if (titleSimilarity > 0.3) score += titleSimilarity * 30;
      if (descriptionSimilarity > 0.3) score += descriptionSimilarity * 20;
      
      return { post, score };
    });
    
    const filteredPosts = scoredPosts
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ post }) => post);
    
    return {
      posts: filteredPosts,
      hasError: false
    };
  } catch (error) {
    return {
      posts: [],
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function searchPostsLegacy(query: string): Promise<BlogPost[]> {
  const result = await searchPosts(query);
  return result.posts;
}
