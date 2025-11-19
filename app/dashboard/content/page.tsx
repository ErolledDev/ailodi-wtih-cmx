'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, ExternalLink, Copy, Trash2, PlusCircle } from 'lucide-react';
import { useState } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  featuredImageUrl?: string;
  metaDescription: string;
  createdAt: string;
  status: 'published' | 'draft';
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'AI Trends 2025',
    slug: 'ai-trends-2025',
    featuredImageUrl: 'https://images.unsplash.com/photo-1677442d019cecf8171b86426e44675dc527188?w=400&h=300&fit=crop',
    metaDescription: 'Exploring the latest AI trends and breakthroughs in 2025',
    createdAt: '2025-11-15',
    status: 'published',
  },
  {
    id: '2',
    title: 'React Best Practices',
    slug: 'react-best-practices',
    metaDescription: 'Essential best practices for building scalable React applications',
    createdAt: '2025-11-12',
    status: 'published',
  },
  {
    id: '3',
    title: 'Web Security Guide',
    slug: 'web-security-guide',
    metaDescription: 'A comprehensive guide to modern web security practices',
    createdAt: '2025-11-10',
    status: 'draft',
  },
];

export default function ContentPage() {
  const [posts] = useState<Post[]>(mockPosts);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(slug: string) {
    const link = `${window.location.origin}/post/${slug}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Posts</h2>
          <p className="text-muted-foreground mt-1">Manage and edit your blog posts</p>
        </div>

        <Link href="/dashboard/content/create">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>Click on any post to edit or manage it</CardDescription>
        </CardHeader>

        <CardContent>
          {posts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Link href="/dashboard/content/create">
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Image</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {posts.map((post, idx) => (
                    <tr key={post.id} className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      idx === posts.length - 1 ? 'border-0' : ''
                    }`}>
                      {/* Image */}
                      <td className="py-4 px-4">
                        {post.featuredImageUrl ? (
                          <img
                            src={post.featuredImageUrl}
                            alt={post.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground max-w-xs truncate">{post.title}</p>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">{post.metaDescription}</p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/content/${post.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit"
                              className="w-8 h-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Open"
                            onClick={() => window.open(`/post/${post.slug}`, '_blank')}
                            className="w-8 h-8 p-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title={copiedId === post.slug ? 'Copied!' : 'Copy link'}
                            onClick={() => copyLink(post.slug)}
                            className="w-8 h-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            className="w-8 h-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
