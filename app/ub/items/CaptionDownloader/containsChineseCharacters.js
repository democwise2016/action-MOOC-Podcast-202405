function containsChineseCharacters(str) {
  const chineseRegex = /[\u4e00-\u9fa5]/; // Range for Chinese characters in Unicode
  return chineseRegex.test(str);
}

module.exports = containsChineseCharacters;