import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
    }),
});



const courses = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    language: z.string(),
    gallery: z.array(z.object({
      type: z.string(),
      src: image(),
      alt: z.string(),
    })),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
    cta: z.string().url(),
    teaser: z.string().url().optional(),
  }),
});

const designs = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    imagesRight: z.boolean().default(false),
    images: z.array(z.object({
      src: image(),
      alt: z.string(),
    })).min(1),
    tech: z.array(z.string()).min(1).max(5), // New required field
  }),
});

export const collections = { blog, courses, designs };