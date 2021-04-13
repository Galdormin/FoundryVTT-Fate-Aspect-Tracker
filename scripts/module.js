Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls.find(x => x.name === "token");
  tileControls.tools.push({
    icon: "fas fa-book",
    name: "fate-aspect-tracker",
    title: game.i18n.localize("FateAspectTracker.OpenTrackerWindow"),
    button: true,
    onClick: () => true
  });
});