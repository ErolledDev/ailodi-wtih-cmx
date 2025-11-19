import type { BlogPost } from '@/types/blog';

interface SearchResult {
  posts: BlogPost[];
  hasError?: boolean;
  errorMessage?: string;
}

export async function getAllContent(): Promise<BlogPost[]> {
  try {
    // Read from public JSON file
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/cms/data/posts.json`,
      {
        cache: 'force-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch posts:', response.statusText);
      return [];
    }

    const posts: BlogPost[] = await response.json();

    // Filter for published posts only
    return posts
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
