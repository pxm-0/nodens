import type { CollectionEntry } from 'astro:content';

export const sectionMeta = {
  engineering: {
    label: 'Engineer',
    title: 'Systems that remember, route, observe, and persist.',
    description:
      'Software, infrastructure, automation, and the long route from an idea to something that survives contact with reality.',
  },
  writing: {
    label: 'Writer',
    title: 'Language used as an instrument of precision.',
    description:
      'Essays, fragments, fiction, correspondence, and attempts to make interior machinery legible.',
  },
  coffee: {
    label: 'Coffee',
    title: 'A small ritual with too many variables.',
    description:
      'Brew records, methods, beans, and the pursuit of clarity without thinness.',
  },
  audio: {
    label: 'Audio',
    title: 'Recorded sound arranged until the equipment disappears.',
    description:
      'Listening notes, equipment chains, comparisons, and whatever survives repeated attention.',
  },
} as const;

export type SectionKey = keyof typeof sectionMeta;

export function sortEntries(entries: CollectionEntry<'entries'>[]) {
  return [...entries].sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}

export function entryHref(entry: CollectionEntry<'entries'>) {
  return `/${entry.data.section}/${entry.id}/`;
}

export function projectHref(project: CollectionEntry<'projects'>) {
  return `/engineering/projects/${project.id}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
