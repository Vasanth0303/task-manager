export type Task = {
  _id: string;
  title: string;
  completed: boolean;
  dueAt?: string;
  priority: "Low" | "Medium" | "High";
};
