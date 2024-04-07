const TimeMarkAnalysis = function (description) {
  let output = []

  if (typeof(description) !== 'string') {
    description = JSON.stringify(description)
  }

  description.trim().split('\n').forEach(function (line) {
    line = line.trim()

    if (pattern.test(line) === false) {
      return false
    }

    
    let title = line.replace(pattern, ''); // Removes the pattern
    let titleFirst = title[0]
    if (title.startsWith('｜')) {
      title = title.slice(1)
    }
    title = title.trim()
    let timeString = line.slice(0, line.indexOf(titleFirst))
    let parts = timeString.split(':')

    let time = 0
    parts.reverse().forEach(function (part, i) {
      time = time + (Number(part) * (60 ** i))
    })

    // if (time > 0) {
      output.push({
        time,
        title
      })
    // }
  })

  // console.log({output})
  return output
}

const pattern = /^\d+:\d+/;

module.exports = TimeMarkAnalysis;