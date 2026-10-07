// lib/outbox.ts
// Mock for Offline Readiness (F3 Prep)
// This will later be replaced by idb or similar offline-first queue mechanism

export interface OutboxTask {
  id: string;
  type: "SYNC_SESSION" | "SYNC_SET" | "DELETE_SET";
  payload: Record<string, unknown>;
  createdAt: number;
  status: "pending" | "processing" | "failed";
  retryCount: number;
}

class OutboxQueue {
  private tasks: OutboxTask[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("camini_outbox");
      if (stored) {
        try {
          this.tasks = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse outbox tasks", e);
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("camini_outbox", JSON.stringify(this.tasks));
    }
  }

  enqueue(type: OutboxTask["type"], payload: Record<string, unknown>) {
    const task: OutboxTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      type,
      payload,
      createdAt: Date.now(),
      status: "pending",
      retryCount: 0
    };
    this.tasks.push(task);
    this.saveToStorage();
    console.log(`[Outbox] Task ${task.id} of type ${type} enqueued.`);
  }

  getPendingTasks() {
    return this.tasks.filter(t => t.status === "pending" || t.status === "failed");
  }

  markAsProcessing(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = "processing";
      this.saveToStorage();
    }
  }

  markAsCompleted(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveToStorage();
    console.log(`[Outbox] Task ${taskId} completed and removed.`);
  }

  markAsFailed(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = "failed";
      task.retryCount += 1;
      this.saveToStorage();
      console.log(`[Outbox] Task ${taskId} failed (Attempt ${task.retryCount}).`);
    }
  }
}

export const outbox = typeof window !== "undefined" ? new OutboxQueue() : null;
