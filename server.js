const app = require('./app');
const port = 3000;

//start server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
