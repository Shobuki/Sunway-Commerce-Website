import { Request, Response } from 'express';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req: Request, res: Response): Promise<void> {
  // Define the path to the JSON database
  const filePath = path.join(process.cwd(), 'prisma', 'db.json');

  try {
    // Read the JSON file
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData);

    // Check if the Event data is available in the JSON file
    if (!data.Event) {
      res.status(400).json({ error: 'Event data is missing in the file' });
      return;
    }

    // Format the events data for response
    const events = data.Event.map((event: any) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      dateStart: event.dateStart,
      dateEnd: event.dateEnd,
      createdAt: event.createdAt,
      deletedAt: event.deletedAt,
      images: event.images.map((image: any) => ({
        id: image.id,
        image: `http://localhost:3000/images/public/event/${path.basename(image.image)}`, // Updated to use the correct public path
        createdAt: image.createdAt,
        deletedAt: image.deletedAt,
      })),
    }));

    // Send back the formatted events
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON format in the database file' });
    } else if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ error: 'Database file not found' });
    } else {
      res.status(500).json({ error: 'Error fetching events' });
    }
  }
}
