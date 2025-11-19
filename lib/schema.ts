import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  metaDescription: z.string().min(1, 'Meta description is required').max(160, 'Meta description must be less than 160 characters'),
  seoTitle: z.string().min(1, 'SEO title is required').max(60, 'SEO title must be less than 60 characters'),
  keywords: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featuredImageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  status: z.enum(['published', 'draft']).default('draft'),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
