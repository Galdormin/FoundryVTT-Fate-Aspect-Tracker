/* global game */

import Socket from "./socket.js";

/** The selection of optional tags. **/
const TAGS = {
  NONE: 0,
  IMPORTANT: 1,
  OPTIONAL: 2,
};

export class Task {
  /**
   * Create a new task with the given `description`.
   * @param {string} description is the task's description.
   * @param {boolean} done is the task's completion state.
   * @param {number} tag is the task's optional tag.
   * @param {string | null} color is the task's color.
   * @param {number} invoke is the number of free invoke
   **/
  constructor(description = "", done = false, tag = TAGS.NONE, color = null, invoke = 0) {
    /** The task's description. **/
    this.description = description;
    /** The task's state of completion. **/
    this.done = done;
    /** The task's tag. */
    this.tag = tag;
    /** The task's color. */
    this.color = color;
    /** The aspect's number of free invokes **/
    this.invoke = invoke
  }
}

export class TodoList {
  /**
   * Create a to-do list from an array of tasks.
   * @param {Array<Task>} tasks is the array of tasks in the to-do list.
   */
  constructor(tasks = []) {
    this.tasks = tasks;
  }

  /**
   * Load the current user's to-do list (if any) from the database.
   * @return {TodoList} the to-do list read from user data
   **/
  static load() {
    //const savedTasks = game.scenes.viewed.getFlag("fate-aspect-tracker", "tasks");
    const journal = game.journal.getName("_aspect_tracker");
    const savedTasks = journal.data.content;
    if (!savedTasks) return new TodoList();

    const tasks = JSON.parse(savedTasks).map((task) =>
      Object.assign(new Task(), task)
    );

    return new TodoList(tasks);
  }

  /** Store the current user's to-do list in the database. **/
  async store() {
    const tasks = JSON.stringify(this.tasks);
    let update = {
      "content": tasks
    };

    let journal = game.journal.getName("_aspect_tracker");
    await journal.update(update, {diff: false});

    Socket.refreshTracker();
  }

  /**
   * Add a new task with the given `description`.
   * @param {Task} task is the task to append to the list
   * @returns {Promise<number>} the number of managed tasks.
   **/
  async appendTask(task) {
    this.tasks.push(task);

    await this.store();

    return this.tasks.length;
  }

  /**
   * Deletes the task at the given `index`.
   * @param {number} index is the index to be deleted
   * @returns {Promise<number>} the number of managed tasks.
   **/
  async deleteTask(index) {
    this.tasks.splice(index, 1);

    await this.store();

    return this.tasks.length;
  }

  /**
   * Updates the task description at the given `index`.
   * @param {number} index is the index to be deleted
   * @param {Task} task is the updated task
   **/
  async updateTask(index, task) {
    this.tasks[index] = task;

    await this.store();
  }

  /**
   * Toggle the completion state of the task at the given `index`
   * @param {number} index
   **/
  async toggleTask(index) {
    const task = this.tasks[index];
    task.done = !task.done;

    await this.store();
  }

  /**
   * Re-order tasks inside the lists.
   * @param {number} oldIndex is the previous index of the task to move.
   * @param {number} newIndex is the new index of the moved task.
   **/
  async moveTask(oldIndex, newIndex) {
    this.tasks.splice(newIndex, 0, this.tasks.splice(oldIndex, 1)[0]);
    await this.store();
  }

  /** Check whether there are any incomplete tasks. **/
  get incomplete() {
    return this.tasks.some((task) => !task.done);
  }

  async increaseInvoke(index) {
    const task = this.tasks[index];
    task.invoke++;

    await this.store();
  }

  async decreaseInvoke(index) {
    const task = this.tasks[index];
    if(task.invoke > 0)
      task.invoke--;

    await this.store();
  }
}
