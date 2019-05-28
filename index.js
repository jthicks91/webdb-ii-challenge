const express = require("express");
const knex = require("knex");
const helmet = require("helmet");
const server = express();

const config = {
  client: "sqlite3", // specifying which DBMS we're using
  connection: {
    filename: "./data/lambda.sqlite3" // where to find actual database (path to file)
  },
  useNullAsDefault: true //sqlite3 specific required
};

const db = knex(config);

server.use(express.json());
server.use(helmet());

function logger(req, res, next) {
  const { path } = req;
  const timeStamp = Date.now();
  const log = { path, timeStamp };
  console.log(`${req.method} Request`, log);
  next();
}

server.use(logger);

// endpoints here

server.get("/api/zoos", (req, res) => {
  db("zoos")
    .then(zoo => {
      res.status(200).json(zoo);
    })
    .catch(err => {
      console.log(err);
      res
        .status(400)
        .json({ message: "Something went wrong retrieving this data" });
    });
});

server.post("/api/zoos", (req, res) => {
  // db("zoos")
  //   .insert(req.body, "id")
  //   .then(ids => {
  //     db("zoos");
  //     where({ id: ids[0] })
  //       .first()
  //       .then(zoos => {
  //         res.status(200).json(zoos);
  //       })
  //       .catch(err => {
  //         res.status(500).json(err);
  //       });
  //   })
  //   .catch(err => {
  //     res.status(500).json(err);
  //   });

  const zoo = req.body;
  console.log(zoo);
  db.insert(zoo)
    .into("zoos")
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

server.get("/api/zoos/:id", (req, res) => {
  const { id } = req.params;
  db("zoos")
    .where({ id: id })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: "Could not fetch this zoo with that ID" });
    });
});

server.delete("/api/zoos/:id", (req, res) => {
  const { id } = req.params;
  db("zoos")
    .where({ id })
    .del()
    .then(count => {
      res.status(200).json(count);
    })
    .catch(err => {
      res.status(500).json({ message: "Could not delete this zoo" });
    });
});

server.put("/api/zoos/:id", (req, res) => {
  db("zoos")
    .where({ id: req.params.id })
    .update(req.body)
    .then(count => {
      if (count > 0) {
        res.status(200).json({ message: `${count} records were updated` });
      } else {
        res.status(404).json();
      }
    });
});

// server.put("/api/zoos/:id", (Req, res) => {
//   const { id } = req.params;
//   const changes = req.body;
//   db("zoos").where({ id });
// });

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
