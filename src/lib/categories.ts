import { siteConfig, CategoryConfig } from './site-config';

export type Category = CategoryConfig;

export const CATEGORIES: Category[] = siteConfig.categories;

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}
