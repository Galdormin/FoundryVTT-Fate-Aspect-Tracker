const description = document.getElementById("calendar-weather-precip").innerHTML;
const tag = "weather"
const color = "#43B43B"

const tracker = window.aspectTrackerWindow.getData().tracker;
tracker.addAspectFromData(description, tag, color);