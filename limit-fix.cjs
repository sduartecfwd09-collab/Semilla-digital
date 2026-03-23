module.exports = (req, res, next) => {
  // json-server 1.x-beta doesn't always set limits correctly for large POSTS
  // This middleware helps ensure we can handle at least a decent size
  next();
};
