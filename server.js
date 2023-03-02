const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);
mongoose.connect(DB, () => {
  console.log(
    `MongoDB Connect (0-disconnected; 1-connected; 2-connecting; 3-disconnecting; 4-invalid credentials) STATUS  --> ${mongoose.connection.readyState}`
  );
});

const port = process.env.PORT || 3000;

//start server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// close server when unhandled rejections occur
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
