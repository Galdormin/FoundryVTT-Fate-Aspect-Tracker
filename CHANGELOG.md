# Patch Notes:

## Version 1.4.1

* Fix aspect settings related to font #25
* Fix `mergeObject` deprecated

## Version 1.4.0

* Update for V12

## Version 1.3.0

* Remove `_sortable.js` from module dependcy to local dependency #22

## Version 1.2.1

* V11 compatibility (removed packs from module.json)

## Vesrion 1.2.0

* V10 compatibility by @MSAbaddon 
* Global Aspects are now stored in game settings, the _aspect_tracker journal entry is no longer needed by @MSAbaddon 

## Vesrion 1.1.0

* Aspects' description can now be edited directly in the aspect tracker
  * Double left click on the aspect to open the inline editing
  * Press Enter to save the aspect descritpion

## Version 1.0.1

* Fixed a bug of window resizing when aspects were modified.
* Update of macros as a compendium.

## Version 1.0.0

* Add custom drawing settings menu (use the palette icon on top of the window).
* Aspect text box no longer use default drawing settings but custom drawings settings.
* Aspect text box size no longer use canvas size but grid size.
  * This allows to have large battlemaps without having huge text boxes compared to tokens.
  * Text boxes are similar in size to tokens.
* [issue #6] Aspect text box font color can now be based on aspect color.
* **Warning** Missing *Spanish* and *Italian* translation for this update.

## Version 0.6.1

* Hide arrows from input number
* Fix some warnings caused by deprecated functions

## Version 0.6.0

* Fix for 0.8.4

## Version 0.5.1

* [issue #13] Fixed RangeError
* Fixed duplicate html id

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
