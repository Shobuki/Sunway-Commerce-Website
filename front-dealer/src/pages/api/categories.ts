import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { Category } from '../../../types/types';

// Handler function for the categories API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'prisma', 'db.json');

  try {
    // Read the JSON data from the file
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData);

    // Map the raw JSON data to match the Category interface
    const categories: Category[] = data.ProductCategory.map((category: any) => ({
      id: category.id,
      name: category.name,
      parentCategoryId: category.parentCategoryId || null,
      subcategories: category.subcategories || [],
      createdAt: category.createdAt,
      deletedAt: category.deletedAt || null,
    }));

    // Send the mapped categories as a JSON response
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
}
