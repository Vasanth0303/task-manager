const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE TASK
router.post("/", auth, async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.userId
  });
  res.json(task);
});

// GET TASKS (search + filter + pagination)
router.get("/", auth, async (req, res) => {
  const { search, priority, page = 1, limit = 5 } = req.query;

  const query = { userId: req.userId };

  if (search) query.title = { $regex: search, $options: "i" };
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(tasks);
});

// UPDATE TASK
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(task);
});

// DELETE TASK
router.delete("/:id", auth, async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });
  res.json({ message: "Task deleted" });
});

module.exports = router;
