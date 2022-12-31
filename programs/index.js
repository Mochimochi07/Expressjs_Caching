const express = require('express');
const app = express();
const cache = require('memory-cache'); 
const mysql = require('mysql2'); 


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
});


function cacheMiddleware(req, res, next) {
  const key = `__express__${req.originalUrl}`;
  const cachedBody = cache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
    return;
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      cache.put(key, body, 3600 * 1000); 
      res.sendResponse(body);
    }
    next();
  }
}


app.get('/data', cacheMiddleware, (req, res) => {
  pool.query('SELECT * FROM data', (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching data from database");
    } else {
      res.send(result);
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
