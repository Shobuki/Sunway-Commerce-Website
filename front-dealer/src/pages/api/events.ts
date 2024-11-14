import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

interface EventImage {
  id: number;
  image: string;
  createdAt: string; // or Date if you're converting it later
  deletedAt?: string | null; // optional
}

interface Event {
  id: number;
  name: string;
  description?: string;
  dateStart: string; // or Date if you're converting it later
  dateEnd?: string | null; // optional
  createdAt: string; // or Date if you're converting it later
  deletedAt?: string | null; // optional
  images: EventImage[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the file path for db.json
  const filePath = path.join(process.cwd(), 'prisma', 'db.json');
  
  try {
    // Read the file content
    const jsonData = await fs.readFile(filePath, 'utf-8');
    
    // Parse the JSON data
    const data = JSON.parse(jsonData);

    // Get the current date
    const now = new Date();

    // Logging for debugging
    console.log('Current Date:', now);

    // Filter events based on current date
    const activeEvents: Event[] = data.Event.filter((event: Event) => {
      const eventDateStart = new Date(event.dateStart);
      const eventDateEnd = event.dateEnd ? new Date(event.dateEnd) : null; // Handle undefined

      console.log(`Checking Event: ${event.name}`);
      console.log(`  Start: ${eventDateStart}`);
      console.log(`  End: ${eventDateEnd}`);
      console.log(`  Now: ${now}`);

      return eventDateStart <= now && (eventDateEnd === null || eventDateEnd >= now);
    });

    console.log('Active Events:', activeEvents);

    // Include the images for the active events
    const activeEventsWithImages = activeEvents.map(event => ({
      ...event,
      images: event.images || [] // Ensure images is an array
    }));

    // Return the filtered active events
    res.status(200).json(activeEventsWithImages);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
}
