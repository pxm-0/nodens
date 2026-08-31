import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entries = defineCollection({
  loader: glob({ base: './src/content/entries', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['engineering', 'writing', 'coffee', 'audio']),
    kind: z.enum(['note', 'essay', 'log', 'review', 'fragment', 'field-record']),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    relatedProjects: z.array(reference('projects')).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    status: z.enum(['concept', 'active', 'paused', 'archived']),
    phase: z.string().optional(),
    year: z.string(),
    stageLabel: z.string(),
    featureRank: z.number().int().positive().optional(),
    recordState: z.enum(['maintenance', 'published']).default('maintenance'),
    summary: z.string(),
    caveat: z.string().optional(),
    stack: z.array(z.string()).default([]),
    links: z
      .array(
        z.object({
          kind: z.enum(['live', 'portfolio', 'source']),
          href: z.url(),
        }),
      )
      .default([]),
  }),
});

export const collections = { entries, projects };
