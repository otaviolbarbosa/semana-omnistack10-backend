module.exports = function(str) {
  return String(str)
    .split(",")
    .map(item => item.trim());
};
