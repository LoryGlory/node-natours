const express = require('express');
const app = express();
const port = 3000;

//http method and root directory
app.get('/', (req, res) => {
  res.status(200).send('Hello from the server side!');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
