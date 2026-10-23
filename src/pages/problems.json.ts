import type { APIRoute } from 'astro';
import { getProblems } from '../lib/problems';
import { categories } from '../data/categories';
export const GET: APIRoute = async () => {
  const problems = await getProblems();
  return new Response(JSON.stringify(problems.map(({data})=>({
    ...data,
    categorySlug: categories.find(category=>category.name===data.category)!.slug,
    anchor: `problem-${data.problemId}`,
  })), null, 2), {headers:{'Content-Type':'application/json; charset=utf-8'}});
};
