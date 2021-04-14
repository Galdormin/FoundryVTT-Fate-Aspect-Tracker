/* global game, Hooks */

import * as logger from "./logger.js";
import Socket from "./socket.js";
import {initUiComponents} from "./ui.js";

Hooks.once("ready", async () => {
  Socket.listen();

  // Create _aspect_tracker journalEntry if not already exists
  const journal = game.journal.getName("_aspect_tracker");
  if (journal == undefined) {
    JournalEntry.create({
      author: game.user.id,
      name: "_aspect_tracker"
    })
  }
});

Hooks.on("renderJournalDirectory", async (_app, html, _data) => {
  await initUiComponents(html);
});

Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls.find(x => x.name === "token");
  tileControls.tools.push({
    icon: "fas fa-book",
    name: "fate-aspect-tracker",
    title: game.i18n.localize("FateAspectTracker.aspecttrackerwindow.title"),
    button: true,
    onClick: () => window.aspectTrackerWindow.render(true)
  });
});
