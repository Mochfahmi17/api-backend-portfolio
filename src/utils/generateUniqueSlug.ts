import slugify from "slugify";
import db from "../lib/db";

export default async function generateUniqueSlug(title: string) {
  const originalSlug = slugify(title, { lower: true, strict: true });

  let unqiueSlug = originalSlug;
  let counter = 1;

  while (await db.project.findUnique({ where: { slug: unqiueSlug } })) {
    unqiueSlug = slugify(`${originalSlug} ${counter}`, { lower: true, strict: true });

    counter++;
  }

  return unqiueSlug;
}
