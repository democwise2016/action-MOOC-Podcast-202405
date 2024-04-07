let ItemFiltersPreset = {
  betweenTimeMinMax (info, min, max) {
    // console.log(info)
    if (info.duration > (max * 60)) {
      return false
    }
    else if (info.duration < (min * 60)) {
      return false
    }
    return true
  },
  between1minTo10Min (info) {
    return ItemFiltersPreset.betweenTimeMinMax(info, 1, 10)
  },
  between1minTo30Min (info) {
    return ItemFiltersPreset.betweenTimeMinMax(info, 1, 30)
  },
  between3minTo30Min (info) {
    return ItemFiltersPreset.betweenTimeMinMax(info, 3, 30)
  },
  between10minTo60Min (info) {
    return ItemFiltersPreset.betweenTimeMinMax(info, 10, 60)
  },
  between6minTo60Min (info) {
    return ItemFiltersPreset.betweenTimeMinMax(info, 6, 60)
  },
  between30minTo180Min (info) {
    return ItemFiltersPreset.betweenTimeMinMax(info, 30, 180)
  }
}

module.exports = ItemFiltersPreset