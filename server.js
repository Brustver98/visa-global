const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/check", (req, res) => res.sendFile(path.join(__dirname, "public", "check.html")));
app.get("/healthz", (req,res)=>res.status(200).send("ok"));

app.listen(PORT, () => console.log(`Visa Global running on port ${PORT}`));
