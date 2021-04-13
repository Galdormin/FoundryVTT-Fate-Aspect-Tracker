export default class Socket {
    static refreshTracker() {
        window.todoListWindow.render(false, window.todoListWindow.options);
        game.socket.emit("module.fate-aspect-tracker", {
            type: "aspectTrackerRefresh"
        })
    }

    static listen() {
        game.socket.on("module.fate-aspect-tracker", data => {
            if (data.type === "aspectTrackerRefresh") {
                window.todoListWindow.render(false, window.todoListWindow.options);
                return;
            }
        })
    }
}