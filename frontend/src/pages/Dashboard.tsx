import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import type { Task } from "../types";

const STORAGE_KEY = "taskflow_tasks";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"all" | "pending" | "completed">("all");
  const [priority, setPriority] =
    useState<"Low" | "Medium" | "High">("Medium");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "high" | "low"
  >("newest");

  /* LOAD TASKS */
  const loadTasks = async () => {
    const res = await API.get("/tasks");
    const saved: Task[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const merged = res.data.map((t: Task) => {
      const local = saved.find(s => s._id === t._id);
      return local
        ? { ...t, dueAt: local.dueAt, priority: local.priority }
        : { ...t, priority: "Medium" };
    });

    setTasks(merged);
  };

  const persist = (list: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  /* ADD TASK */
  const addTask = async () => {
    if (!title.trim()) {
      toast.warning("Task title required");
      return;
    }

    const res = await API.post("/tasks", { title });
    const now = new Date().toISOString();

    const updated = [
      ...tasks,
      {
        ...res.data,
        dueAt: now,
        priority
      }
    ];

    setTasks(updated);
    persist(updated);
    setTitle("");
    setPriority("Medium");

    toast.success("Task added");
  };

  /* TOGGLE */
  const toggleTask = async (task: Task) => {
    const now = new Date().toISOString();

    await API.put(`/tasks/${task._id}`, {
      completed: !task.completed
    });

    const updated = tasks.map(t =>
      t._id === task._id
        ? {
            ...t,
            completed: !t.completed,
            dueAt: now
          }
        : t
    );

    setTasks(updated);
    persist(updated);
  };

  /* DELETE WITH UNDO */
  const deleteTask = async (id: string) => {
    const deleted = tasks.find(t => t._id === id);
    if (!deleted) return;

    await API.delete(`/tasks/${id}`);

    const updated = tasks.filter(t => t._id !== id);
    setTasks(updated);
    persist(updated);

    toast.error(
      <div>
        Task deleted
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            const restored = [...updated, deleted];
            setTasks(restored);
            persist(restored);
            toast.dismiss();
          }}
        >
          UNDO
        </button>
      </div>,
      { autoClose: 4000 }
    );
  };

  /* EDIT TASK */
  const editTask = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    await API.put(`/tasks/${id}`, { title: newTitle });
    const now = new Date().toISOString();

    const updated = tasks.map(t =>
      t._id === id
        ? { ...t, title: newTitle, dueAt: now }
        : t
    );

    setTasks(updated);
    persist(updated);

    toast.info("Task updated");
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* FILTER + SEARCH + SORT */
  const visibleTasks = tasks
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(t =>
      filter === "all"
        ? true
        : filter === "completed"
        ? t.completed
        : !t.completed
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.dueAt || "").getTime() -
          new Date(a.dueAt || "").getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.dueAt || "").getTime() -
          new Date(b.dueAt || "").getTime()
        );
      }

      const order = { High: 3, Medium: 2, Low: 1 };

      if (sortBy === "high") {
        return order[b.priority] - order[a.priority];
      }

      if (sortBy === "low") {
        return order[a.priority] - order[b.priority];
      }

      return 0;
    });

  /* SUMMARY COUNTS */
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const highPriority = tasks.filter(
    t => t.priority === "High"
  ).length;

  /* DRAG END */
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setTasks(items);
    persist(items);
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2 className="dashboard-title">My Tasks</h2>

        {/* SUMMARY */}
        <div className="summary-bar">
          <div>Total: <b>{total}</b></div>
          <div>Pending: <b>{pending}</b></div>
          <div>Completed: <b>{completed}</b></div>
          <div>High Priority: <b>{highPriority}</b></div>
        </div>

        {/* TOP BAR */}
        <div className="top-bar">
          <input
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <select
            value={priority}
            onChange={e =>
              setPriority(e.target.value as "Low" | "Medium" | "High")
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button onClick={addTask}>Add</button>

          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={e =>
              setSortBy(
                e.target.value as
                  | "newest"
                  | "oldest"
                  | "high"
                  | "low"
              )
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="high">Priority: High → Low</option>
            <option value="low">Priority: Low → High</option>
          </select>

          <div className="filters">
            <button onClick={() => setFilter("all")}>All</button>
            <button onClick={() => setFilter("pending")}>
              Pending
            </button>
            <button onClick={() => setFilter("completed")}>
              Completed
            </button>
          </div>
        </div>

        {/* TASK GRID */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {provided => (
              <div
                className="task-grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {visibleTasks.map((task, index) => (
                  <Draggable
                    key={task._id}
                    draggableId={task._id}
                    index={index}
                  >
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard
                          task={task}
                          onToggle={() => toggleTask(task)}
                          onDelete={() => deleteTask(task._id)}
                          onEdit={value =>
                            editTask(task._id, value)
                          }
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
}
