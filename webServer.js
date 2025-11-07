/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

/**
 * Simple static server + MongoDB API for Project 6.
 * Start:  node webServer.js
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const async = require("async");
const express = require("express");
const app = express();

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// IMPORTANT: No modelData import — app must run only on database.
// const models = require("./modelData/photoApp.js").models;

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve files from the project directory (images, bundle, etc.)
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * /test/info  and  /test/counts   (DB-backed helpers)
 */
app.get("/test/:p1", function (request, response) {
  const param = request.params.p1 || "info";

  if (param === "info") {
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        console.error("Error in /test/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        response.status(500).send("Missing SchemaInfo");
        return;
      }
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    response.status(400).send("Bad param " + param);
  }
});

// Utility: strict ObjectId validation
const ObjectId = mongoose.Types.ObjectId;
function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/**
 * GET /user/list  -> minimal user fields for sidebar
 */
app.get("/user/list", async function (request, response) {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    response.status(200).send(users);
  } catch (err) {
    console.error("Error fetching user list:", err);
    response.status(500).send({ message: "Error fetching user list" });
  }
});

/**
 * GET /user/:id  -> detailed user info for UserDetail
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id;

  if (!isValidObjectId(id)) {
    response.status(400).send("Invalid user id");
    return;
  }

  try {
    const user = await User.findById(
      id,
      "_id first_name last_name location description occupation"
    ).lean();

    if (!user) {
      response.status(400).send("User not found");
      return;
    }
    response.status(200).send(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    response.status(500).send({ message: "Error fetching user" });
  }
});

/**
 * GET /photosOfUser/:id  -> photos + comments with minimal embedded user
 * Each photo:   { _id, user_id, file_name, date_time, comments }
 * Each comment: { _id, comment, date_time, user: { _id, first_name, last_name } }
 */
app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;

  if (!isValidObjectId(id)) {
    response.status(400).send("Invalid user id");
    return;
  }

  try {
    // Spec: 400 if something other than the id of a User is provided
    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      response.status(400).send("User not found");
      return;
    }

    // Pull only the fields needed by the UI/spec
    const photos = await Photo.find(
      { user_id: id },
      "_id user_id file_name date_time comments"
    ).lean();

    if (!photos || photos.length === 0) {
      response.status(200).send([]);
      return;
    }

    // Collect unique commenter IDs
    const commenterIds = new Set();
    photos.forEach((p) => {
      (p.comments || []).forEach((c) => {
        if (c.user_id && isValidObjectId(String(c.user_id))) {
          commenterIds.add(String(c.user_id));
        }
      });
    });

    // Load all commenters in one query
    const commenters = await User.find(
      { _id: { $in: Array.from(commenterIds) } },
      "_id first_name last_name"
    ).lean();
    const commenterMap = new Map(commenters.map((u) => [String(u._id), u]));

    // Assemble response to match frontend expectations
    const apiPhotos = photos.map((p) => {
      const apiComments = (p.comments || []).map((c) => {
        const u = commenterMap.get(String(c.user_id));
        return {
          _id: c._id,
          comment: c.comment,
          date_time: c.date_time,
          user: u
            ? { _id: u._id, first_name: u.first_name, last_name: u.last_name }
            : { _id: c.user_id, first_name: "Unknown", last_name: "" },
        };
      });

      return {
        _id: p._id,
        user_id: p.user_id,
        file_name: p.file_name,
        date_time: p.date_time,
        comments: apiComments,
      };
    });

    response.status(200).send(apiPhotos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(500).send({ message: "Error fetching photos" });
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" + port + " exporting the directory " + __dirname
  );
});
