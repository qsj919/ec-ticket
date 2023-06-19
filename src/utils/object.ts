function values(obj: object) {
  return Object.keys(obj).map(key => obj[key])
}

function findKey(obj, value, compare = (a, b) => a === b) {
  return Object.keys(obj).find(k => compare(obj[k], value))
}

// function cleanEmptyProps(obj) {
//   for (const propName in obj) {
//     if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
//       delete obj[propName]
//     }
//   }
//   return obj
// }

export default {
  values,
  findKey
  // cleanEmptyProps
}
