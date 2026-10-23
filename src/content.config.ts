import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { categories } from './data/categories';

const problems = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/problems' }),
  schema: z.object({
    problemId: z.number().int().positive(),
    title: z.string().min(1),
    category: z.string().refine(value => categories.some(category => category.name === value), '未知分类'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    order: z.number().int().min(1).max(100),
    leetcode: z.url().refine(value => /^https:\/\/leetcode\.cn\/problems\/[a-z0-9-]+\/$/.test(value), '请使用力扣官方题目地址'),
    status: z.enum(['unstarted', 'assisted', 'independent', 'review']),
    noteReady: z.boolean().default(false),
    lastReviewed: z.string().optional(),
  }),
});

export const collections = { problems };
