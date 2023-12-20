// create web server

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// set template engine
app.set('view engine', 'ejs');

// use static file
app.use(express.static('public'));

// use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect to database
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'comment';
const client = new MongoClient(url, { useNewUrlParser: true });

// connect to database
client.connect(function(err) {
  console.log('connected to database');

  // select database
  const db = client.db(dbName);

  // insert document to collection
  app.post('/comments', function(req, res) {
    db.collection('comments').insertOne(req.body, function(err, result) {
      if (err) return console.log(err);

      console.log('saved to database');
      res.redirect('/');
    });
  });

  // get all documents from collection
  app.get('/', function(req, res) {
    db.collection('comments')
      .find()
      .toArray(function(err, result) {
        if (err) return console.log(err);

        res.render('index.ejs', { comments: result });
      });
  });

  // update document in collection
  app.put('/comments', function(req, res) {
    db.collection('comments').findOneAndUpdate(
      { name: 'test' },
      {
        $set: {
          name: req.body.name,
          comment: req.body.comment
        }
      },
      { sort: { _id: -1 }, upsert: true },
      function(err, result) {
        if (err) return res.send(err);

        res.send(result);
      }
    );
  });

  // delete document from collection
  app.delete('/comments', function(req, res) {
    db.collection('comments').findOneAndDelete(
      { name: req.body.name },
      function(err, result) {
        if (err) return res.send(500, err);

        res.send('A comment got deleted');
      }
    );
  });
});

app.listen(port, () => console.log(`listening on port ${port}`));
