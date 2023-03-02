// function to wrap async functions for error handling
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // catch function that ends up in global error handling middleware
  };
};
