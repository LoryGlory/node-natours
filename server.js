const dotenv = require('dotenv');
const app = require('./app');
const port = 3000;

dotenv.config({ path: './config.env' });

// get environment where we're in
console.log(process.env);

//start server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
