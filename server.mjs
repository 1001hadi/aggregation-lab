import express from "express";
import dotenv from "dotenv";
import db from "./db/connection.mjs";
import gradesRoutes from "./routes/gradesRoutes.mjs";
const app = express();
dotenv.config();
let PORT = process.env.PORT;

// middlewares
app.use(express.json());

// routes
app.use("/", gradesRoutes);

// error middleware
app.use((err, _req, res, next) => {
  res.status(500).send("Seems like we messed up somewhere...");
});
// listener
app.listen(PORT, () => {
  console.log(`Server Run On Port: ${PORT}`);
});
