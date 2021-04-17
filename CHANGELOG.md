# Patch Notes:

## Version 0.5.0

* Aspect can now be stored in scene flag. This cause aspect to be loaded only when you are on the right scene.
* `Show Player` button on the header show the Fate Aspect Tracker window to the players
* Hide Aspect button now hide text box link to the aspect
* Fix Tex box are now correctly updated on the players view
* Fix Drag & Drop in scene with padding

## Version 0.4.1

* Fix tooltip for hide aspect and decrease aspect

## Version 0.4

* Aspect can now be hidden from player.
* A macro folder has beed added.
  * `Weather to Aspect` macro add an aspect with the weather from the module `Calendar/Weather`.
* Translation of the module
  * French by @Galdormin
  * Italian by @smoothingplane

## Version 0.3

* Aspect text box now use default drawing settings.
* Tags are now be customizable.
* Multi-tag can be written in csv format: `zone,situation,scene`.

## Version 0.2

* Control button are now hidden in the player view.
* GM can drag'n'drop aspects on the canvas to create a text box.
* Text box from every scene are updated when the aspect is changed.
* Text box are deleted when the aspect is deleted from the tracker.

## Version 0.1

* GM can create, edit and delete aspect
* GM can change the number of free invoke without editing the aspect.
* Add 3 different tags on aspect (situation, boost & resources).
* Player is updated when GM changes something (through socket).