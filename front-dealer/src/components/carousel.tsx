import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import path from "path";

interface EventImage {
  id: number;
  image: string;
  createdAt: string;
  deletedAt?: string | null;
}

interface Event {
  id: number;
  name: string;
  description?: string;
  dateStart: string;
  dateEnd?: string | null;
  createdAt: string;
  deletedAt?: string | null;
  images: EventImage[];
}

const Carousel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/dealer/events");

        if (!response.ok) {
          throw new Error(`[ERROR] HTTP error: ${response.status}`);
        }

        const data = await response.json();

        const fixedData = data.map((event: Event) => ({
          ...event,
          images: event.images.map((img) => ({
            ...img,
            image: `http://localhost:3000/images/public/event/${path.basename(img.image)}`, // Perbaiki jalur gambar
          })),
        }));
        

        setEvents(fixedData);
      } catch (error) {
        console.error("[ERROR] Fetch Error:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
  }, []);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="carousel-container mx-auto mb-8 max-w-screen-xl">
      {loading ? (
        <p className="text-center">Loading events...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : events.length > 0 ? (
        <Slider {...settings}>
          {events.map((event) => {
            const imageUrl = event.images.length > 0 ? event.images[0].image : null;

            return (
              <div key={event.id} className="event-slide relative h-[300px]">
                {imageUrl && isValidUrl(imageUrl) ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imageUrl}
                      alt={event.name}
                      fill // Modern prop to make the image fill its container
                      style={{ objectFit: "cover" }} // CSS-in-JS for object fit
                      className="rounded-lg"
                      priority
                      unoptimized={true} // Remove this line if optimizing images in production
                      onError={() =>
                        console.error("[ERROR] Image failed to load (Next Image):", imageUrl)
                      }
                    />
                  </div>
                ) : (
                  <p className="text-center">No image available</p>
                )}
              </div>
            );
          })}
        </Slider>
      ) : (
        <p className="text-center">No events available</p>
      )}
    </div>
  );
};

export default Carousel;
