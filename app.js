const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(
  "mongodb+srv://manish9427:manish9427@project.hwbxf7p.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const Image = mongoose.model("Image", {
  data: Buffer,
  contentType: String,
});

const UserInfo = mongoose.model("UserInfo", {
  age: Number,
  name: String,
  profession: String,
});

app.get("/allImages", async (req, res) => {
  try {
    const allImages = await Image.find();

    if (!allImages || allImages.length === 0) {
      return res.status(404).json({ error: "No images found" });
    }

    const imageArray = allImages.map((image) => ({
      _id: image._id,
      contentType: image.contentType,
      data: image.data.toString("base64"),
    }));

    res.json(imageArray);
  } catch (error) {
    console.error("Error retrieving images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/download/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.set("Content-Type", image.contentType);
    res.set("Content-Disposition", 'attachment; filename="image.jpg"');
    res.send(image.data);
  } catch (error) {
    console.error("Error downloading image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/addUserInfo", express.json(), async (req, res) => {
  try {
    const { age, name, profession } = req.body;

    if (!age || !name || !profession) {
      return res
        .status(400)
        .json({ error: "Please provide age, name, and profession" });
    }

    const userInfo = new UserInfo({
      age,
      name,
      profession,
    });

    await userInfo.save();

    res.status(201).json({ message: "User information added successfully" });
  } catch (error) {
    console.error("Error adding user information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/allUserInfo", async (req, res) => {
  try {
    const allUserInfo = await UserInfo.find();

    if (!allUserInfo || allUserInfo.length === 0) {
      return res.status(404).json({ error: "No user information found" });
    }

    res.json(allUserInfo);
  } catch (error) {
    console.error("Error retrieving user information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const image = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await image.save();

    res.status(201).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
