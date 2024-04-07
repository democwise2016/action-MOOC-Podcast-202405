function numberToRGBColorCode(number) {
  // Extract the red, green, and blue components
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  // Convert the components to hexadecimal
  const hex = ((red << 16) | (green << 8) | blue).toString(16).padStart(6, '0');

  // Return the RGB color code
  return `${hex}`;
}
module.exports = function (str) {
  let sum = 0

  for (let i = 0; i < str.length; i++) {
    sum = sum + str.charCodeAt(i)
  }

  sum = sum % (16777216)
  return numberToRGBColorCode(sum)
}