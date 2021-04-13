/* global jQuery, Handlebars, Sortable */
/* global game, loadTemplates, mergeObject, Application, FormApplication, Dialog */

import { Task, TodoList } from "./todo.js";
import { RGBColor } from "./colors.js";

/**
 * Parse handlebar templates included with keikaku.
 * @returns {Promise<Array<Function>>} an array of functions used for rendering the templates
 */
async function preloadTemplates() {
  const templates = [
    "modules/fate-aspect-tracker/templates/aspect-list.hbs",
    "modules/fate-aspect-tracker/templates/aspect-list-item.hbs",
    "modules/fate-aspect-tracker/templates/aspect-item-form.hbs",
  ];

  Handlebars.registerHelper("keikaku_disabled", (value) =>
    !value ? "disabled" : ""
  );

  return loadTemplates(templates);
}

export class TodoListWindow extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "keikaku-todo-list",
      template: "modules/fate-aspect-tracker/templates/aspect-list.hbs",
      width: 400,
      height: 300,
      minimizable: true,
      resizable: true,
      title: game.i18n.localize("keikaku.todolistwindow.title"),
    });
  }

  /**
   * Set up interactivity for the window.
   *
   * @param {JQuery} html is the rendered HTML provided by jQuery
   **/
  activateListeners(html) {
    super.activateListeners(html);

    const listEl = html.find("#keikaku-todo-list").get(0);
    if (listEl) {
      Sortable.create(listEl, {
        onEnd: async (evt) => {
          if (evt.oldIndex == evt.newIndex) return;

          const list = window.todoListWindow.getData();
          await list.moveTask(evt.oldIndex, evt.newIndex);
          window.todoListWindow.render(true);
        },
      });
    }

    html.on("click", "a.todo-control", async function () {
      const index = jQuery(this).data("index");
      const action = jQuery(this).data("action");

      const list = window.todoListWindow.getData();

      switch (action) {
        case "todo-toggle":
          await list.toggleTask(index);
          break;
        case "todo-delete":
          await list.deleteTask(index);
          break;
        case "todo-increase-invoke":
          await list.increaseInvoke(index);
          break;
        case "todo-decrease-invoke":
          await list.decreaseInvoke(index);
          break;
        case "todo-edit":
          new TaskForm(list.tasks[index], index).render(true);
          break;
        default:
          return;
      }

      window.todoListWindow.render(true);
    });

    html.on("click", "button.todo-new", async function () {
      new TaskForm(undefined, undefined).render(true);
    });

    // tags are colored based on the task color
    html.find("#keikaku-todo-list span.tag").each(function () {
      const tag = jQuery(this);

      // we use the computed color if the description
      // this lets use work with tasks that don't have a color
      const desc = tag.siblings("p.todo-description");
      const color = desc.css("color");
      const parsed = RGBColor.parse(color);
      const contrast = parsed.contrastColor();

      tag.css("background-color", parsed.toCSS());
      tag.css("color", contrast.toCSS());

      // we base the border color on the regular text color
      const control = tag.siblings("a.todo-control");
      const borderColor = control.css("color");
      tag.css("border-color", borderColor);
    });
  }

  /**
   * @returns {TodoList}
   */
  getData() {
    return TodoList.load();
  }
}

class TaskForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "keikaku-todo-item-form",
      template: "modules/fate-aspect-tracker/templates/aspect-item-form.hbs",
      width: 400,
      minimizable: false,
      closeOnSubmit: true,
      title: game.i18n.localize("keikaku.taskform.title"),
    });
  }

  /**
   * @param {Task} task is the (optional) task to edit
   * @param {number?} index is the (optional) index in the to-do list
   **/
  constructor(task, index) {
    super();

    this.task = task ?? new Task();
    this.index = index;
  }

  /**
   * Set up interactivity for the form.
   *
   * @param {JQuery} html is the rendered HTML provided by jQuery
   **/
  activateListeners(html) {
    super.activateListeners(html);

    // just to avoid confusion, we disable the color input based on the checkbox
    html.on("change", "input#fieldUseColor", function () {
      jQuery("input#fieldColor").prop(
        "disabled",
        !jQuery(this).prop("checked")
      );
    });
  }

  /** @override */
  getData() {
    return {
      index: this.index,

      task: this.task,
    };
  }

  /** @override */
  async _updateObject(_event, data) {
    const color = data.useColor ? data.color : null;
    const task = new Task(data.description, data.done, data.tag, color);

    const list = TodoList.load();
    if (data.index) await list.updateTask(data.index, task);
    else await list.appendTask(task);

    window.todoListWindow.render(true);
  }
}

/**
 * Setup the to-do list window. Adds a button to the journal directory.
 *
 * @param {JQuery} html is the rendered HTML provided by jQuery
 **/
function setupTodoListWindow(html) {
  window.todoListWindow = new TodoListWindow();
}

/**
 * Show a dialog reminding players of their to-do list.
 * Depending on the `showReminder` setting the reminder is displayed
 * - never
 * - when players have unfinished tasks
 * - always
 */
export function showReminder() {
  const list = TodoList.load();
  const level = game.settings.get("fate-aspect-tracker", "showReminder");

  if (level == "never" || (level == "incomplete" && !list.incomplete)) return;

  const content = list.incomplete
    ? game.i18n.localize("keikaku.reminder.incomplete")
    : game.i18n.localize("keikaku.reminder.complete");

  const hint = game.i18n.localize("keikaku.reminder.hint");

  const reminder = new Dialog({
    title: game.i18n.localize("keikaku.reminder.title"),
    content: `<p>${content}</p><p><small>${hint}</small></p>`,
    buttons: {
      todo: {
        icon: '<i class="fas fa-tasks"></i>',
        label: game.i18n.localize("keikaku.reminder.button"),
        callback: () => window.todoListWindow.render(true),
      },
    },
  });

  reminder.render(true);
}

/**
 * Initialize relevant UI components:
 * - preloads relevant templates
 * - adds trigger button to journal
 *
 * @param {JQuery} html is the rendered HTML provided by jQuery
 **/
export async function initUiComponents(html) {
  await preloadTemplates();

  setupTodoListWindow(html);
}
