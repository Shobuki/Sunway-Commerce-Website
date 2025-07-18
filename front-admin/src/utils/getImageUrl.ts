export function getImageUrl(imagePath?: string) {
  // Cek env
  let baseUrl = process.env.NEXT_PUBLIC_BACKEND_IMAGE_URL;

  // Fallback ke localhost jika env tidak di-set atau kosong/null/undefined
  if (!baseUrl) {
    baseUrl = "http://sunflexstoreindonesia.com:3000";
    //baseUrl = "http://localhost:3000";
  }

  if (!imagePath) return "";
  return `${baseUrl.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
}
