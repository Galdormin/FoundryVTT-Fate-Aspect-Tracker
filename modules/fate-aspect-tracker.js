/* global game, Hooks */

//import * as logger from "./logger.js";
import Socket from "./socket.js";
import {initUiComponents} from "./ui.js";

Hooks.once("ready", async () => {
  Socket.listen();
});

Hooks.on("renderJournalDirectory", async (_app, html, _data) => {
  await initUiComponents(html);
});

Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls.find(x => x.name === "token");
  tileControls.tools.push({
    icon: "fas fa-books",
    name: "fate-aspect-tracker",
    title: game.i18n.localize("FateAspectTracker.aspecttrackerwindow.title"),
    button: true,
    onClick: () => window.aspectTrackerWindow.render(true)
  });
});

Hooks.on("renderApplication", function(control) {
  if (window.aspectTrackerWindow) {
    window.aspectTrackerWindow.render(false);
  }
});

Hooks.once('init', async() => {
  /* Game settings */
  // Border Opacity
  game.settings.register("fate-aspect-tracker", "AspectDrawingBorderOpacity", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.borderOpacity"),
    scope: "world",
    config: false,
    type: Number,
    range: {
        min: 0,
        max: 1,
        step: 0.1,
    },
    default:1
  });

  // Fill Opacity
  game.settings.register("fate-aspect-tracker", "AspectDrawingFillOpacity", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.fillOpacity"),
    scope: "world",
    config: false,
    type: Number,
    range: {
        min: 0,
        max: 1,
        step: 0.1,
    },
    default:1
  });

  // Font Size
  game.settings.register("fate-aspect-tracker", "AspectDrawingFontSize", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.fontSize"),
    hint: game.i18n.localize("FateAspectTracker.settings.drawing.fontSizeDescription"),
    scope: "world",
    config: false,
    type: Number,
    restricted:true,
    default:100
  });

  // Border Width
  game.settings.register("fate-aspect-tracker", "AspectDrawingBorderWidth", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.borderWidth"),
    scope: "world",
    config: false,
    type: Number,
    restricted:true,
    default:2
  });

  // Font Family
  game.settings.register("fate-aspect-tracker", "AspectDrawingFontFamily", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.fontFamily"),
    scope: "world",
    config: false,
    type:String,
    restricted:true,
    choices:CONFIG.fontFamilies,
    default:"Arial",
  });

  // Font Dynamic Color
  game.settings.register("fate-aspect-tracker", "AspectDrawingFontDynamicColor", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.fontDynamicColor"),
    scope: "world",
    config: false,
    type:Boolean,
    restricted:true,
    default:true
  });

  // Font Color
  game.settings.register("fate-aspect-tracker", "AspectDrawingFontColor", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.fontColor"),
    scope: "world",
    config: false,
    type:String,
    restricted:true,
    default:"#000000"
  });

  // Fill Color
  game.settings.register("fate-aspect-tracker", "AspectDrawingFillColor", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.fillColor"),
    scope: "world",
    config: false,
    type:String,
    restricted:true,
    default:"#FFFFFF"
  });

  // Border Color
  game.settings.register("fate-aspect-tracker", "AspectDrawingBorderColor", {
    name: game.i18n.localize("FateAspectTracker.settings.drawing.borderColor"),
    scope: "world",
    config: false,
    type:String,
    restricted:true,
    default:"#000000"
  });

    // Border Opacity
    game.settings.register("fate-aspect-tracker", "global-aspects", {
      name: game.i18n.localize("FateAspectTracker.settings.globalAspects"),
      scope: "world",
      config: false,
      type: String,
      restricted:true,
      default:""
    });
});
