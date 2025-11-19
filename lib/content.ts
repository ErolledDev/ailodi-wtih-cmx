import type { BlogPost } from '@/types/blog';

interface SearchResult {
  posts: BlogPost[];
  hasError?: boolean;
  errorMessage?: string;
}

// Static blog posts data - this ensures availability at build time
const staticPosts: BlogPost[] = [
  {
    id: "getting-started-with-ai-lodi",
    title: "Getting Started with AI LODI",
    slug: "getting-started-with-ai-lodi",
    author: "Admin",
    featuredImageUrl: "https://images.unsplash.com/photo-1677442d019cecf8d10c0e68b60a6378?w=800&h=400&fit=crop",
    seoTitle: "Getting Started with AI LODI - Your Guide",
    metaDescription: "Learn how to get started with AI LODI and begin your journey into artificial intelligence",
    keywords: ["ai", "lodi", "getting started", "beginner"],
    categories: ["Tutorials"],
    tags: ["AI", "Getting Started", "Beginner"],
    status: "published",
    publishDate: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    content: "# Getting Started with AI LODI\n\nWelcome to the AI LODI platform! This comprehensive guide will walk you through the essentials.\n\n## What is AI LODI?\n\nAI LODI is a powerful framework designed to help you build intelligent applications with ease.\n\n### Key Features\n\n- **Easy Setup**: Get started in minutes\n- **Flexible**: Works with any tech stack\n- **Scalable**: Handle millions of requests\n\n## Installation\n\n```bash\nnpm install ailodi\n```\n\n## Your First Project\n\nCreate a new project and start building amazing applications."
  },
  {
    id: "understanding-authentication",
    title: "Understanding Authentication",
    slug: "understanding-authentication",
    author: "Admin",
    featuredImageUrl: "https://images.unsplash.com/photo-1633356122544-f134ef2e00ae?w=800&h=400&fit=crop",
    seoTitle: "Understanding Authentication - Security Best Practices",
    metaDescription: "Deep dive into authentication mechanisms and learn security best practices",
    keywords: ["authentication", "security", "password", "tokens"],
    categories: ["Security"],
    tags: ["Security", "Authentication", "Best Practices"],
    status: "published",
    publishDate: "2024-01-20T14:30:00Z",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    content: "# Understanding Authentication\n\nAuthentication is a critical component of any secure application. Let's explore the fundamentals.\n\n## Basic Concepts\n\n### What is Authentication?\n\nAuthentication is the process of verifying the identity of a user or system.\n\n## Authentication Methods\n\n### 1. Password-Based\n\nThe most common form where users provide a secret password.\n\n### 2. Token-Based\n\nUsers receive a token after authentication, which they use for subsequent requests.\n\n### 3. OAuth\n\nDelegated authentication using third-party providers.\n\n## Security Best Practices\n\n- Always use HTTPS\n- Hash passwords securely\n- Implement rate limiting\n- Use secure session cookies"
  },
  {
    id: "cloudflare-scalable-apps",
    title: "Building Scalable Apps with Cloudflare",
    slug: "cloudflare-scalable-apps",
    author: "Admin",
    featuredImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    seoTitle: "Building Scalable Applications with Cloudflare",
    metaDescription: "Learn how to leverage Cloudflare to build scalable, high-performance applications",
    keywords: ["cloudflare", "scalability", "performance", "edge computing"],
    categories: ["DevOps"],
    tags: ["Cloudflare", "Scalability", "Performance"],
    status: "published",
    publishDate: "2024-01-25T09:15:00Z",
    createdAt: "2024-01-25T09:15:00Z",
    updatedAt: "2024-01-25T09:15:00Z",
    content: "# Building Scalable Apps with Cloudflare\n\nCloudflare provides a powerful platform for building globally distributed applications.\n\n## Why Cloudflare?\n\n### Global Infrastructure\n\nCloudflare's network spans across the globe, ensuring low latency for users everywhere.\n\n### Performance Benefits\n\n- Automatic caching\n- Image optimization\n- Code compression\n- DDoS protection\n\n## Cloudflare Pages\n\n### Key Features\n\n1. **Serverless Functions**: Run backend code without servers\n2. **Full Stack**: Deploy frontend and backend together\n3. **Git Integration**: Automatic deployments on push\n\n## Getting Started\n\nConnect your GitHub repository and push your code. Cloudflare will automatically build and deploy your application across their global network."
  }
];

export async function getAllContent(): Promise<BlogPost[]> {
  try {
    // Use static posts for build-time generation
    // Filter for published posts only
    return staticPosts
      .filter((post) => post.status === 'published')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
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
