'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface FormData {
  title: string;
  slug: string;
  content: string;
  author: string;
  metaDescription: string;
  seoTitle: string;
  keywords: string;
  categories: string;
  tags: string;
  featuredImageUrl: string;
  status: 'published' | 'draft';
}

export default function CreatePostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    author: 'Anonymous',
    metaDescription: '',
    seoTitle: '',
    keywords: '',
    categories: '',
    tags: '',
    featuredImageUrl: '',
    status: 'draft',
  });

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seoTitle: title.length > 60 ? title.substring(0, 60) : title,
    }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.content || !formData.metaDescription) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Call API to create post (to be implemented)
      // const response = await fetch('/api/content', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // For now, just show success
      router.push('/dashboard/content');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  }

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

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Title, slug, and author details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter post title"
                value={formData.title}
                onChange={handleTitleChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Max 200 characters</p>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium text-foreground">
                Slug *
              </label>
              <Input
                id="slug"
                name="slug"
                placeholder="auto-generated-slug"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">URL-friendly identifier (auto-generated from title)</p>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium text-foreground">
                Author
              </label>
              <Input
                id="author"
                name="author"
                placeholder="Author name"
                value={formData.author}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Information */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Information</CardTitle>
            <CardDescription>Optimize for search engines</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* SEO Title */}
            <div className="space-y-2">
              <label htmlFor="seoTitle" className="text-sm font-medium text-foreground">
                SEO Title *
              </label>
              <Input
                id="seoTitle"
                name="seoTitle"
                placeholder="Title for search engines"
                value={formData.seoTitle}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={60}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                {formData.seoTitle.length}/60 characters (recommended)
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <label htmlFor="metaDescription" className="text-sm font-medium text-foreground">
                Meta Description *
              </label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                placeholder="Brief description for search engines"
                value={formData.metaDescription}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={160}
                rows={3}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                {formData.metaDescription.length}/160 characters (recommended)
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label htmlFor="keywords" className="text-sm font-medium text-foreground">
                Keywords
              </label>
              <Input
                id="keywords"
                name="keywords"
                placeholder="keyword1, keyword2, keyword3"
                value={formData.keywords}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Separate with commas</p>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Write your post content in Markdown</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <Textarea
              name="content"
              placeholder="Write your post content here... (Markdown supported)"
              value={formData.content}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={12}
              className="bg-muted/50 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Markdown syntax is supported</p>
          </CardContent>
        </Card>

        {/* Media & Categorization */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Categorization</CardTitle>
            <CardDescription>Add featured image and categorize your post</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Featured Image */}
            <div className="space-y-2">
              <label htmlFor="featuredImageUrl" className="text-sm font-medium text-foreground">
                Featured Image URL
              </label>
              <Input
                id="featuredImageUrl"
                name="featuredImageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.featuredImageUrl}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label htmlFor="categories" className="text-sm font-medium text-foreground">
                Categories
              </label>
              <Input
                id="categories"
                name="categories"
                placeholder="AI, Web Development, Python"
                value={formData.categories}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Separate with commas</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium text-foreground">
                Tags
              </label>
              <Input
                id="tags"
                name="tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Separate with commas</p>
            </div>
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Choose when to publish this post</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (Save for later)</SelectItem>
                  <SelectItem value="published">Published (Live immediately)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.status === 'published'
                  ? 'This post will be published immediately when saved'
                  : 'This post will be saved as a draft and can be published later'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/dashboard/content" className="flex-1">
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Cancel
            </Button>
          </Link>

          <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {isLoading ? 'Creating...' : `Save as ${formData.status}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
