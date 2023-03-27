import { z, defineCollection } from "astro:content";

// blog collection
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.string(),
    heroImage: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
