export default function getRandomId() {
  return Math.random().toString(16).slice(2, 8);
}