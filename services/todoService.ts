import connectDB from "@/lib/mongodb";
import Todo from "@/models/Todo";
import { ITodo } from "@/lib/types";

export class TodoService {
  static async getUserTodos(userId: string): Promise<ITodo[]> {
    await connectDB();
    const todos = await Todo.find({ user: userId })
      .sort({ completed: 1, createdAt: -1 })
      .lean();

    return todos as unknown as ITodo[];
  }

  static async createTodo(
    userId: string,
    text: string,
    attachments: string[] = []
  ): Promise<ITodo> {
    await connectDB();

    const todo = await Todo.create({
      user: userId,
      text: text.trim(),
      completed: false,
      attachments,
    });

    return todo.toObject() as unknown as ITodo;
  }

  static async toggleTodo(
    userId: string,
    todoId: string,
    completed?: boolean
  ): Promise<ITodo | null> {
    await connectDB();

    const todoDoc = await Todo.findOne({ _id: todoId, user: userId });
    if (!todoDoc) return null;

    const nextCompleted = typeof completed === "boolean" ? completed : !todoDoc.completed;
    todoDoc.completed = nextCompleted;
    todoDoc.completedAt = nextCompleted ? new Date() : (null as any);
    await todoDoc.save();

    return todoDoc.toObject() as unknown as ITodo;
  }

  static async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    await connectDB();
    const res = await Todo.deleteOne({ _id: todoId, user: userId });
    return res.deletedCount > 0;
  }
}

export default TodoService;
