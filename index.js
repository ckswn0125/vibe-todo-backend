const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const todosRouter = require("./routes/todos");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("환경변수 MONGO_URI 를 불러오지 못했습니다. .env 파일을 확인하세요.");
  process.exit(1);
}

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/todos", todosRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const frontendDist = path.join(__dirname, "../todo-react/dist");
app.use(express.static(frontendDist));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("연결 성공");

    app.listen(PORT, () => {
      console.log(`Todo 앱 실행 중: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB 연결 실패:", error.message);
    process.exit(1);
  }
}

startServer();
