/* global game, Hooks */

import * as logger from "./logger.js";
import Socket from "./socket.js";
import { initUiComponents, showReminder } from "./ui.js";

/** Register Keikaku settings */
function registerSettings() {
  game.settings.register("fate-aspect-tracker", "showReminder", {
    name: game.i18n.localize("keikaku.settings.reminder.name"),
    hint: game.i18n.localize("keikaku.settings.reminder.hint"),
    scope: "client",
    config: true,
    type: String,
    choices: {
      never: game.i18n.localize("keikaku.settings.reminder.choice.never"),
      incomplete: game.i18n.localize(
        "keikaku.settings.reminder.choice.incomplete"
      ),
      always: game.i18n.localize("keikaku.settings.reminder.choice.always"),
    },
    default: "always",
  });
}

Hooks.once("setup", async () => {
  registerSettings();
});

Hooks.once("ready", async () => {
  Socket.listen();
});

Hooks.on("renderJournalDirectory", async (_app, html, _data) => {
  await initUiComponents(html);
});

Hooks.once("renderJournalDirectory", async (_app, _html, _data) => {
  showReminder();
});

Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls.find(x => x.name === "token");
  tileControls.tools.push({
    icon: "fas fa-book",
    name: "fate-aspect-tracker",
    title: "Tracker d'Aspects",
    button: true,
    onClick: () => window.todoListWindow.render(true)
  });
});
