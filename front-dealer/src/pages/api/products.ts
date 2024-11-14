import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the file path for db.json
  const filePath = path.join(process.cwd(), 'prisma', 'db.json');
  
  // Read the file content
  const jsonData = await fs.readFile(filePath, 'utf-8');
  
  // Parse the JSON data
  const data = JSON.parse(jsonData);

  // Return the product data
  res.status(200).json(data.Product);
}



