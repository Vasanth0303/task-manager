import { useState } from "react";
import type { Task } from "../types";

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
  dragHandleProps?: any; // ✅ added only for drag
};

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  dragHandleProps
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.title);

  const handleSave = () => {
    if (!value.trim()) return;
    onEdit(value);
    setEditing(false);
  };

  return (
    <div className="task-card fade-in">
      {editing ? (
        <>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
          <div className="actions">
            <button onClick={handleSave}>Save</button>
            <button
              className="danger"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ✅ DRAG ONLY FROM HEADER */}
          <div
            className="task-header"
            {...dragHandleProps}
            style={{ cursor: "grab" }}
          >
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={onToggle}
              />
              <span
                style={{
                  textDecoration: task.completed
                    ? "line-through"
                    : "none",
                  marginLeft: "6px"
                }}
              >
                {task.title}
              </span>
            </label>

            {/* PRIORITY BADGE */}
            <span className={`badge ${task.priority}`}>
              {task.priority}
            </span>
          </div>

          {/* DATE & TIME */}
          <small>
            Updated:{" "}
            {task.dueAt
              ? new Date(task.dueAt).toLocaleString()
              : "-"}
          </small>

          <div className="actions">
            <button onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="danger" onClick={onDelete}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
