const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;

// get environment where we're in
// console.log(process.env);

//start server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
