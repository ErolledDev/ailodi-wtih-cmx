'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertCircle, CheckCircle, Github } from 'lucide-react';

interface FormData {
  title: string;
  slug: string;
  content: string;
  author: string;
  metaDescription: string;
  category: string;
  featuredImageUrl: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    author: 'Admin',
    metaDescription: '',
    category: 'Blog',
    featuredImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
  });

  const generateSlug = (title: string) => 
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!formData.title || !formData.slug || !formData.content || !formData.metaDescription) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const result = await response.json();
      setSuccess(`✅ Post created: ${result.post.fileName}`);

      setTimeout(() => {
        router.push('/dashboard/content');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/content">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Create New Post</h2>
          <p className="text-muted-foreground mt-1">Fill in the form to create a new blog post</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-900">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <Input
                id="title"
                name="title"
                placeholder="Enter post title"
                value={formData.title}
                onChange={handleTitleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">Slug *</label>
              <Input
                id="slug"
                name="slug"
                placeholder="auto-generated"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium">Author</label>
              <Input
                id="author"
                name="author"
                placeholder="Author name"
                value={formData.author}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              name="content"
              placeholder="Write content (Markdown supported)..."
              value={formData.content}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Markdown syntax supported</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label htmlFor="metaDescription" className="text-sm font-medium">Meta Description *</label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              placeholder="Brief description for search engines"
              value={formData.metaDescription}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{formData.metaDescription.length}/160</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tutorials">Tutorials</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Blog">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="featuredImageUrl" className="text-sm font-medium">Image URL</label>
              <Input
                id="featuredImageUrl"
                name="featuredImageUrl"
                placeholder="https://..."
                value={formData.featuredImageUrl}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub CMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900">
              Post saves as markdown → commits to GitHub → Cloudflare rebuilds your site automatically.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/dashboard/content" className="flex-1">
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Cancel
            </Button>
          </Link>

          <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
            <Github className="w-4 h-4" />
            {isLoading ? 'Creating...' : 'Create & Push'}
          </Button>
        </div>
      </form>
    </div>
  );
}
