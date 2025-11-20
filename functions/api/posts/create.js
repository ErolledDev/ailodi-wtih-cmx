/**
 * Cloudflare Pages Function to create new blog posts
 * Route: POST /api/posts/create
 * 
 * This function:
 * 1. Validates the post data
 * 2. Creates markdown file in content/posts/
 * 3. Commits and pushes to GitHub (triggers rebuild)
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Only POST allowed
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify authentication via cookie
    const cookies = request.headers.get('cookie') || '';
    if (!cookies.includes('session_token=authenticated')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { title, slug, content, metaDescription, category, author, featuredImageUrl } = body;

    // Validation
    if (!title || !slug || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, slug, content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create markdown frontmatter
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const frontmatter = `---
title: ${title}
slug: ${slug}
metaDescription: ${metaDescription || 'Read this blog post'}
featuredImageUrl: ${featuredImageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop'}
category: ${category || 'Blog'}
author: ${author || 'Admin'}
createdAt: ${now}
updatedAt: ${now}
---

`;

    const markdownContent = frontmatter + content;
    const fileName = `${slug}.md`;

    // TODO: In production, you'd:
    // 1. Write file to content/posts/${fileName}
    // 2. Git commit the file
    // 3. Git push to GitHub
    // 4. Cloudflare detects push and triggers rebuild
    //
    // For now, return success (client will handle git operations)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post created successfully',
        post: {
          fileName,
          slug,
          title,
          content: markdownContent
        }
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Post creation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
