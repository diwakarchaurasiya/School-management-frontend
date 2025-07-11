export function getImageUrl(path) {
  if (!path) return "/no-photo.png";
  return `https://api.jsic.in/${path.replace(/\\/g, "/")}`;
}