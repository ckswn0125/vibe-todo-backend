const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "할일을 입력해주세요."],
      trim: true,
      maxlength: [200, "할일은 200자 이하여야 합니다."],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["todo", "doing", "done"],
      default: "todo",
    },
    category: {
      type: String,
      enum: ["work", "study", "exercise", "personal", "hobby"],
      default: "personal",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    memo: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "메모는 500자 이하여야 합니다."],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Todo", todoSchema);
