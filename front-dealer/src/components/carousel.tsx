import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import Image from "next/image"; // Import the Image component from Next.js

// Define the types for Event and EventImage
interface EventImage {
  id: number;
  image: string;
  createdAt: string; // or Date if you prefer
  deletedAt?: string | null; // Optional
}

interface Event {
  id: number;
  name: string;
  description?: string;
  dateStart: string; // or Date if you prefer
  dateEnd?: string | null; // Optional
  createdAt: string; // or Date if you prefer
  deletedAt?: string | null; // Optional
  images: EventImage[];
}

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const [events, setEvents] = useState<Event[]>([]); // Use the Event type for state

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        console.log("Fetched Events: ", data); // Log the fetched events
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchActiveEvents();
  }, []);

  return (
    <div className="carousel-container mx-auto mb-8">
      <Slider {...settings}>
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id}>
              {event.images.length > 0 && (
                <Image
                  src={event.images[0].image} // Take the first image
                  alt={event.name}
                  layout="responsive" // Adjusts to the container's width
                  width={500} // Desired width
                  height={300} // Desired height
                  unoptimized={true} // Set to true to avoid optimization if needed
                />
              )}

            </div>
          ))
        ) : (
          <p className="text-center">No events available</p>
        )}
      </Slider>
    </div>
  );
};

export default Carousel;
