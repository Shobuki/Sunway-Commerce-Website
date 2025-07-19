export function getImageUrl(imagePath?: string) {
  // Cek env
  let baseUrl = process.env.NEXT_PUBLIC_BACKEND_IMAGE_URL;

 
  if (!baseUrl) {
    baseUrl = "https://sunflexstoreindonesia.com";
   // baseUrl = "http://localhost:3000";
  }

  if (!imagePath) return "";
  return `${baseUrl.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
}
