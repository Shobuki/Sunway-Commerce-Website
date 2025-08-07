"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Define the path to the JSON database
        const filePath = path_1.default.join(process.cwd(), 'prisma', 'db.json');
        try {
            // Read the JSON file
            const jsonData = yield fs_1.promises.readFile(filePath, 'utf-8');
            const data = JSON.parse(jsonData);
            // Check if the Event data is available in the JSON file
            if (!data.Event) {
                res.status(400).json({ error: 'Event data is missing in the file' });
                return;
            }
            // Format the events data for response
            const events = data.Event.map((event) => ({
                id: event.id,
                name: event.name,
                description: event.description,
                dateStart: event.dateStart,
                dateEnd: event.dateEnd,
                createdAt: event.createdAt,
                deletedAt: event.deletedAt,
                images: event.images.map((image) => ({
                    id: image.id,
                    image: `http://localhost:3000/images/public/event/${path_1.default.basename(image.image)}`, // Updated to use the correct public path
                    createdAt: image.createdAt,
                    deletedAt: image.deletedAt,
                })),
            }));
            // Send back the formatted events
            res.status(200).json(events);
        }
        catch (error) {
            console.error('Error fetching events:', error);
            // Handle different types of errors
            if (error instanceof SyntaxError) {
                res.status(400).json({ error: 'Invalid JSON format in the database file' });
            }
            else if (error.code === 'ENOENT') {
                res.status(404).json({ error: 'Database file not found' });
            }
            else {
                res.status(500).json({ error: 'Error fetching events' });
            }
        }
    });
}
