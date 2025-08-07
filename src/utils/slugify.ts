

import slugify from "slugify"


/**
 * Generates a unique slug based on a given string and checks for uniqueness in the database.
 * @param {string} inputString - The string to generate the slug from (e.g., "John Doe").
 * @param {object} prismaClient - The Prisma client instance.
 * @param {string} modelName - The Prisma model name (e.g., "User", "Project").
 * @param {string} slugField - The field name where the slug is stored (default: "slug").
 * @returns {string} - A unique slug.
 */


const generateUniqueSlug = async (
  inputString: any,
  prismaClient: any,
  modelName: any,
  slugField = 'slug',
) => {
  const baseSlug = slugify(inputString, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1

  // Check if the slug already exists in the database
  while (true) {
    const existingRecord = await prismaClient[modelName].findUnique({
      where: { [slugField]: slug },
    })

    if (!existingRecord) {
      break
    }

    // Append a counter to the slug if it already exists
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export default generateUniqueSlug
