'use server';

// @ts-ignore - Buffer and process are available in Node.js runtime
import type { BlogPost } from '@/types/blog';

const GITHUB_API = 'https://api.github.com';
// @ts-ignore
const GITHUB_USER = process.env.GITHUB_USER ?? '';
// @ts-ignore
const GITHUB_REPO = process.env.GITHUB_REPO ?? '';
// @ts-ignore
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? '';
// @ts-ignore
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? 'main';
// @ts-ignore
const CONTENT_PATH = process.env.GITHUB_CONTENT_PATH ?? 'content/posts';

// Utility functions for base64 encoding/decoding
// @ts-ignore - Buffer is available in Node.js runtime
function base64Encode(str: string): string {
  // @ts-ignore
  return Buffer.from(str).toString('base64');
}

// @ts-ignore - Buffer is available in Node.js runtime
function base64Decode(str: string): string {
  // @ts-ignore
  return Buffer.from(str, 'base64').toString('utf-8');
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  content?: string;
}

class GitHubContentManager {
  private auth: string;

  constructor() {
    this.auth = `token ${GITHUB_TOKEN}`;
  }

  private async apiCall(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${GITHUB_API}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.auth,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Lodi-Admin',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API Error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    return response;
  }

  /**
   * List all post files from GitHub
   */
  async listPosts(): Promise<GitHubFile[]> {
    try {
      const response = await this.apiCall(
        `/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CONTENT_PATH}?ref=${GITHUB_BRANCH}`,
        { method: 'GET' }
      );
      
      const files = await response.json();
      
      if (!Array.isArray(files)) {
        console.error('Unexpected response format from GitHub');
        return [];
      }

      return files.filter(file => file.name.endsWith('.md'));
    } catch (error) {
      console.error('Error listing posts from GitHub:', error);
      return [];
    }
  }

  /**
   * Get a single post file content
   */
  async getPost(slug: string): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await this.apiCall(
        `/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CONTENT_PATH}/${slug}.md?ref=${GITHUB_BRANCH}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      
      // Decode base64 content
      // @ts-ignore
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      return {
        content,
        sha: data.sha,
      };
    } catch (error) {
      console.error(`Error fetching post ${slug}:`, error);
      return null;
    }
  }

  /**
   * Create a new post
   */
  async createPost(slug: string, content: string, message: string = `Add post: ${slug}`): Promise<boolean> {
    try {
      // @ts-ignore
      const encodedContent = Buffer.from(content).toString('base64');

      await this.apiCall(
        `/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CONTENT_PATH}/${slug}.md`,
        {
          method: 'PUT',
          body: JSON.stringify({
            message,
            content: encodedContent,
            branch: GITHUB_BRANCH,
          }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Error creating post ${slug}:`, error);
      return false;
    }
  }

  /**
   * Update an existing post
   */
  async updatePost(slug: string, content: string, sha: string, message: string = `Update post: ${slug}`): Promise<boolean> {
    try {
      // @ts-ignore
      const encodedContent = Buffer.from(content).toString('base64');

      await this.apiCall(
        `/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CONTENT_PATH}/${slug}.md`,
        {
          method: 'PUT',
          body: JSON.stringify({
            message,
            content: encodedContent,
            sha,
            branch: GITHUB_BRANCH,
          }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Error updating post ${slug}:`, error);
      return false;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(slug: string, sha: string, message: string = `Delete post: ${slug}`): Promise<boolean> {
    try {
      await this.apiCall(
        `/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CONTENT_PATH}/${slug}.md`,
        {
          method: 'DELETE',
          body: JSON.stringify({
            message,
            sha,
            branch: GITHUB_BRANCH,
          }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Error deleting post ${slug}:`, error);
      return false;
    }
  }
}

export const gitHubManager = new GitHubContentManager();

/**
 * Parse markdown frontmatter and content
 */
export function parseMarkdown(content: string): { metadata: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, body: content };
  }

  const [, frontmatterStr, body] = match;
  const metadata: Record<string, any> = {};

  frontmatterStr.split('\n').forEach(line => {
    if (!line.trim()) return;
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      metadata[key.trim()] = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''));
    } else if (value === 'true' || value === 'false') {
      metadata[key.trim()] = value === 'true';
    } else {
      metadata[key.trim()] = value.replace(/['"]/g, '');
    }
  });

  return { metadata, body };
}

/**
 * Create markdown content from BlogPost data
 */
export function createMarkdown(post: Partial<BlogPost>): string {
  const frontmatter = `---
id: ${post.id}
title: ${post.title}
slug: ${post.slug}
author: ${post.author || 'Anonymous'}
status: ${post.status || 'draft'}
publishDate: ${post.publishDate || new Date().toISOString()}
createdAt: ${post.createdAt || new Date().toISOString()}
updatedAt: ${post.updatedAt || new Date().toISOString()}
metaDescription: ${post.metaDescription}
seoTitle: ${post.seoTitle || post.title}
keywords: [${post.keywords?.map(k => `"${k}"`).join(', ') || ''}]
categories: [${post.categories?.map(c => `"${c}"`).join(', ') || ''}]
tags: [${post.tags?.map(t => `"${t}"`).join(', ') || ''}]
featuredImageUrl: ${post.featuredImageUrl || ''}
---

${post.content || ''}`;

  return frontmatter;
}

/**
 * Convert markdown file to BlogPost object
 */
export function markdownToBlogPost(slug: string, content: string): BlogPost | null {
  const { metadata, body } = parseMarkdown(content);

  if (!metadata.id || !metadata.title) {
    return null;
  }

  return {
    id: metadata.id,
    title: metadata.title,
    slug: metadata.slug || slug,
    content: body.trim(),
    author: metadata.author || 'Anonymous',
    status: metadata.status || 'draft',
    publishDate: metadata.publishDate || new Date().toISOString(),
    createdAt: metadata.createdAt || new Date().toISOString(),
    updatedAt: metadata.updatedAt || new Date().toISOString(),
    metaDescription: metadata.metaDescription || '',
    seoTitle: metadata.seoTitle || metadata.title,
    keywords: metadata.keywords || [],
    categories: metadata.categories || [],
    tags: metadata.tags || [],
    featuredImageUrl: metadata.featuredImageUrl || undefined,
  };
}
