const CalculateParagraphInterval = function (srtObject) {
  let intervalList = [];

  let lastEnd = false
  for (let i = 0; i < srtObject.length; i++) {
    let {start, duration} = srtObject[i]

    if (!lastEnd) {
      lastEnd = start + duration
      continue
    }

    intervalList.push(start - lastEnd) 
    lastEnd = start + duration
  }

  return calculateMeanPlusOneStd(intervalList)
}

function calculateQ(arr, q = 3) {
  const sortedArr = arr.slice().sort((a, b) => a - b); // Create a sorted copy of the array
  const n = sortedArr.length;

  const position = (q * (n + 1)) / 4;
  const lowerIndex = Math.floor(position) - 1;
  const upperIndex = Math.ceil(position) - 1;

  if (lowerIndex === upperIndex) {
    return sortedArr[lowerIndex];
  } else {
    const lowerValue = sortedArr[lowerIndex];
    const upperValue = sortedArr[upperIndex];
    const interpolationFactor = position - lowerIndex - 1;
    return lowerValue + (upperValue - lowerValue) * interpolationFactor;
  }
}

function calculateMean(array) {
  const sum = array.reduce((total, value) => total + value, 0);
  return sum / array.length;
}

function calculateStandardDeviation(array, mean) {
  const squaredDifferences = array.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((total, value) => total + value, 0) / array.length;
  return Math.sqrt(variance);
}

function calculateMeanPlusOneStd(array) {
  const mean = calculateQ(array, 2);
  const stdDeviation = calculateStandardDeviation(array, mean);
  return mean + stdDeviation;
}

module.exports = CalculateParagraphInterval;