const express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();
const ALLOWED_STATUS = new Set(["todo", "doing", "done"]);
const ALLOWED_CATEGORY = new Set([
  "work",
  "study",
  "exercise",
  "personal",
  "hobby",
]);

function parseDueDate(value) {
  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("dueDate must be a string or null");
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("dueDate is invalid");
  }

  return date;
}

function parseStatus(value) {
  if (!ALLOWED_STATUS.has(value)) {
    throw new Error("status must be todo, doing, or done");
  }
  return value;
}

function parseCategory(value) {
  if (!ALLOWED_CATEGORY.has(value)) {
    throw new Error(
      "category must be work, study, exercise, personal, or hobby"
    );
  }
  return value;
}

function withCompleted(status) {
  return status === "done";
}

// 할일 목록 조회
router.get("/", async (_req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 할일 단건 조회
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 할일 생성
router.post("/", async (req, res) => {
  try {
    const { title, dueDate, status, category, memo } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required" });
    }

    const nextStatus =
      status !== undefined ? parseStatus(status) : "todo";

    const payload = {
      title: title.trim(),
      status: nextStatus,
      completed: withCompleted(nextStatus),
      category:
        category !== undefined ? parseCategory(category) : "personal",
      memo: typeof memo === "string" ? memo.trim() : "",
    };

    if (dueDate !== undefined) {
      payload.dueDate = parseDueDate(dueDate);
    }

    const todo = await Todo.create(payload);
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 할일 수정
router.patch("/:id", async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.title === "string") {
      updates.title = req.body.title.trim();
    }
    if (req.body.dueDate !== undefined) {
      updates.dueDate = parseDueDate(req.body.dueDate);
    }
    if (req.body.category !== undefined) {
      updates.category = parseCategory(req.body.category);
    }
    if (typeof req.body.memo === "string") {
      updates.memo = req.body.memo.trim();
    }
    if (req.body.status !== undefined) {
      updates.status = parseStatus(req.body.status);
      updates.completed = withCompleted(updates.status);
    } else if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
      updates.status = req.body.completed ? "done" : "todo";
    }

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    Object.assign(todo, updates);
    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 할일 삭제
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
