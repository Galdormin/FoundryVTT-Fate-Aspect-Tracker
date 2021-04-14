export default class Socket {
    static refreshTracker() {
        window.aspectTrackerWindow.render(false, window.aspectTrackerWindow.options);
        game.socket.emit("module.fate-aspect-tracker", {
            type: "aspectTrackerRefresh"
        })
    }

    static listen() {
        game.socket.on("module.fate-aspect-tracker", data => {
            if (data.type === "aspectTrackerRefresh") {
                window.aspectTrackerWindow.render(false, window.aspectTrackerWindow.options);
                return;
            }
        })
    }
}