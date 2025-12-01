// File: webServer.js
/**
 * Simple static server + MongoDB API for Project 6.
 * Start:  node webServer.js
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const async = require("async");
const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js"); 
const passwordUtils = require("./password.js");







// IMPORTANT: No modelData import — app must run only on database.
//const models = require("./modelData/photoApp.js").models;

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Finally you need to add the express-session and body-parser middleware to 
// express with the Express use like so:

app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// Serve files from the project directory (images, bundle, etc.)
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});
function requireLogin(request, response, next) {
  if (!request.session.user) {
    response.status(401).send({ message: "Unauthorized" });
    return;
  }
  next(); 
}

//regist new user
app.post("/user", async (request, response) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation
  } = request.body;
  

  if (!login_name || !password || !first_name || !last_name) {
    response.status(400).send({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if username is taken
    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      response.status(400).send({ message: "Login name already exists" });
      return;
    }

    const { salt, hash } = passwordUtils.makePasswordEntry(password);

    // Create new user
    const newUser = new User({
      login_name,
      password_digest: hash,
      salt,
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    await newUser.save();

    // Automatically log them in after registration
    request.session.user = newUser;

    response.status(200).send({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      login_name: newUser.login_name
    });
  } catch (err) {
    console.error("Registration error:", err);
    response.status(500).send({ message: "Error registering user" });
  }
});


//  login endpoint
app.post("/admin/login", async function (request, response) {
  const { login_name, password } = request.body;

  if(!login_name || !password) {
    response.status(400).send({ message: "Missing login_name or password" });
    return;
  }

  let user = await User.findOne({ login_name : login_name });

  if(!user){
    response.status(400).send({ message: "Invalid login credentials" });
    return;
  }

  const validPassword = passwordUtils.doesPasswordMatch(
    user.password_digest,
    user.salt,
    password
  ); 
  
  if(!validPassword){
    response.status(400).send({ message: "Invalid login credentials" });
    return;
  }

  // Set session user
  request.session.user = user;
  
  response.status(200).send(user);
});

app.post("/admin/logout", async function (request, response) {
  if(!request.session.user){
    response.status(400).send({ message: "No user is currently logged in" });
    return;
  }

  // Destroy session
  request.session.destroy((err) => {
    if(err){
      response.status(500).send({ message: "Error logging out" });
      return;
    }
    response.status(200).send({ message: "Logout successful" });
  });

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
app.get("/user/list", requireLogin,async function (request, response) {
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
app.get("/user/:id", requireLogin,async function (request, response) {
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
app.get("/photosOfUser/:id", requireLogin,async function (request, response) {
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

    // Fetch only required fields
    const photosDb = await Photo.find(
      { user_id: id },
      "_id user_id file_name date_time comments"
    );

    // Deep clone Mongoose docs (why: avoid schema mutation behavior)
    const photos = JSON.parse(JSON.stringify(photosDb));

    if (!photos || photos.length === 0) {
      response.status(200).send([]);
      return;
    }

    // Collect unique commenter IDs across all photos
    const commenterIds = new Set();
    photos.forEach((p) => {
      (p.comments || []).forEach((c) => {
        if (c.user_id && isValidObjectId(String(c.user_id))) {
          commenterIds.add(String(c.user_id));
        }
      });
    });

    // Bulk fetch minimal commenter info
    const commenters = await User.find(
      { _id: { $in: Array.from(commenterIds) } },
      "_id first_name last_name"
    ).lean();

    const commenterMap = new Map(
      commenters.map((u) => [String(u._id), u])
    );

    // Assemble response using async (assignment asks for async)
    async.map(
      photos,
      (p, cb) => {
        try {
          const apiComments = (p.comments || []).map((c) => {
            const u = commenterMap.get(String(c.user_id));
            return {
              _id: c._id,
              comment: c.comment,
              date_time: c.date_time,
              user: u
                ? { _id: u._id, first_name: u.first_name, last_name: u.last_name }
                : null, // why: preserve shape if dataset has a dangling ref
            };
          });

          const out = {
            _id: p._id,
            user_id: String(p.user_id), // why: tests compare strictly to string id
            file_name: p.file_name,
            date_time: p.date_time,
            comments: apiComments,
          };

          cb(null, out);
        } catch (e) {
          cb(e);
        }
      },
      (err, assembled) => {
        if (err) {
          console.error("Error assembling photos:", err);
          response.status(500).send({ message: "Error fetching photos" });
          return;
        }
        response.status(200).send(assembled);
      }
    );
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(500).send({ message: "Error fetching photos" });
  }
});

app.post("/commentsOfPhoto/:photo_id", requireLogin, async (request, response) => {
  const { photo_id } = request.params;
  const text = (request.body && request.body.comment) || "";
  const comment = typeof text === "string" ? text.trim() : "";

  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    response.status(400).send("Invalid photo id");
    return;
  }
  if (!comment) {
    response.status(400).send("Empty comment");
    return;
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      response.status(400).send("Photo not found");
      return;
    }

    const newComment = {
      comment,
      user_id: request.session.user._id,
      date_time: new Date(),
    };
    photo.comments.push(newComment);
    await photo.save();

    const saved = photo.comments[photo.comments.length - 1];
    response.status(200).send({
      _id: saved._id,
      comment: saved.comment,
      date_time: saved.date_time,
      user: {
        _id: request.session.user._id,
        first_name: request.session.user.first_name,
        last_name: request.session.user.last_name,
      },
    });
  } catch (e) {
    console.error("Error adding comment:", e);
    response.status(500).send({ message: "Error adding comment" });
  }
});

const processFormBody = multer({ storage: multer.memoryStorage() }).single("uploadedphoto");

app.post("/photos/new", function (request, response) {
  if (!request.session.user) {
    response.status(401).send({ message: "Unauthorized" });
    return;
  }

  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      response.status(400).send({ message: "No file uploaded" });
      return;
    }

    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, (err1) => {
      if (err1) {
        response.status(500).send({ message: "Error saving file" });
        return;
      }

      const newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.user._id,
        comments: []
      });

      newPhoto.save((err2) => {
        if (err2) {
          response.status(500).send({ message: "Failed to save photo" });
        } else {
          response.status(200).send({ message: "Photo uploaded successfully" });
        }
      });
    });
  });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" + port + " exporting the directory " + __dirname
  );
});