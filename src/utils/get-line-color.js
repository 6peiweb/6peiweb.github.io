const opacity = '0.7';

export default function getLineColor(item) {
  return item?.open > item?.close ? `rgba(239, 83, 79, ${opacity})` : `rgba(39, 166, 154, ${opacity})`;
}