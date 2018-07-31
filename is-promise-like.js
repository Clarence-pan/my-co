module.exports = function isPromiseLike(x){
  return x && typeof x.then === 'function'
}
