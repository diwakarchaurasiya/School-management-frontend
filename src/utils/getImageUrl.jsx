export function getImageUrl(path) {
  if (!path) return "/no-photo.png";
  return `http://localhost:5002/${path.replace(/\\/g, "/")}`;
}
