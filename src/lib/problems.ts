import { getCollection } from 'astro:content';
export async function getProblems() {
  return (await getCollection('problems')).sort((a, b) => a.data.order - b.data.order);
}
