/* global game */

import Socket from "./socket.js";

export class Aspect {
  /**
   * Create a new aspect with the given `description`.
   * @param {string} description is the aspect's description.
   * @param {string} tag is the aspect's optional tag.
   * @param {string} color is the aspect's color.
   * @param {number} invoke is the number of free invoke.
   * @param {Array<string>} drawings is the array of drawing id. 
   * @param {boolean} hidden is the aspect hidden from the player.
   * @param {boolean} edit is the aspect can be inline edited by the GM.
   * @param {boolean} globalScope is the scope of the aspect.
   **/
  constructor(description = "", tag = "", color = "#000000", invoke = 0, drawings = [], hidden = false, edit = false, globalScope = false) {
    /** The aspect's description. **/
    this.description = description;
    /** The aspect's tag. */
    this.tag = tag;
    /** The aspect's color. */
    this.color = color;
    /** The aspect's number of free invokes **/
    this.invoke = invoke
    /** The aspect's array of drawing id**/
    this.drawings = drawings;
    /** The aspect's hidden property **/
    this.hidden = hidden;
    /** The aspect's inline edit property **/
    this.edit = edit;
    /** The aspect's scope **/
    this.globalScope = globalScope;
  }
}

export class Tracker {
  /**
   * Create a tracker from an array of aspects.
   * @param {Array<Aspect>} aspects is the array of aspect in the tracker.
   */
  constructor(aspects = []) {
    this.aspects = aspects;
  }

  /**
   * Load the current tracker (if any) from the database.
   * @return {Tracker} the tracker read from user data
   **/
  static load() {
    let aspects = [];

    // Not Global Aspect
    const sceneAspects = game.scenes.viewed.getFlag("fate-aspect-tracker", "aspects");

    if (sceneAspects) {
      aspects = aspects.concat(JSON.parse(sceneAspects).map((aspect) =>
        Object.assign(new Aspect(), aspect)
      ));
    }

    // Global Aspect
    const globalAspects = game.settings.get("fate-aspect-tracker","global-aspects");

    if (globalAspects) {
      aspects = aspects.concat(JSON.parse(globalAspects).map((aspect) =>
        Object.assign(new Aspect(), aspect)
      ));
    }

    if (aspects.length)
      return new Tracker(aspects);
    else
      return new Tracker();
  }

  /** Store the current tracker in the database. **/
  async store() {
    const globalAspects = `${JSON.stringify(this.aspects.filter(aspect => aspect.globalScope))}`;
    const sceneAspects = this.aspects.filter(aspect => !aspect.globalScope);

    // Global Aspects
    await game.settings.set("fate-aspect-tracker", "global-aspects", globalAspects);

    // Not Global Aspects
    await game.scenes.viewed.setFlag("fate-aspect-tracker", "aspects", JSON.stringify(sceneAspects));

    Socket.refreshTracker();
  }

  /**
   * Add a new aspect with the given `description`.
   * @param {Aspect} aspect is the aspect to append to the list
   * @returns {Promise<number>} the number of managed aspects.
   **/
  async appendAspect(aspect) {
    this.aspects.push(aspect);

    await this.store();

    return this.aspects.length;
  }

  /**
   * Add a new aspect to the tracker from the data.
   * @param {string} description is the aspect's description.
   * @param {string} tag is the aspect's optional tag.
   * @param {string} color is the aspect's color.
   * @param {number} invoke is the number of free invoke.
   * @returns {Promise<number>} the number of managed aspects.
   **/
   async addAspectFromData(description = "", tag = "", color = "#000000", invoke = 0) {
    const aspect = new Aspect(description, tag, color, invoke);
    
    this.aspects.push(aspect);

    await this.store();

    return this.aspects.length;
  }

  /**
   * Deletes the aspect at the given `index`.
   * @param {number} index is the index to be deleted
   * @returns {Promise<number>} the number of managed aspects.
   **/
  async deleteAspect(index) {
    await this.deleteTextAspect(index);
    this.aspects.splice(index, 1);

    await this.store();

    return this.aspects.length;
  }

  /**
   * Updates the aspect description, tag, color or invoke at the given `index`.
   * @param {number} index is the index to be deleted
   * @param {Aspect} aspect is the updated aspect
   **/
  async updateAspect(index, aspect) {
    const drawings = this.aspects[index].drawings;
    aspect.drawings = drawings;

    this.aspects[index] = aspect;
    
    await this.updateTextAspect(index);
    await this.store();
  }

  /**
   * Re-order aspects inside the lists.
   * @param {number} oldIndex is the previous index of the aspect to move.
   * @param {number} newIndex is the new index of the moved aspect.
   **/
  async moveAspect(oldIndex, newIndex) {
    this.aspects.splice(newIndex, 0, this.aspects.splice(oldIndex, 1)[0]);
    await this.store();
  }

  /**
   * Increase the number of free invoke of the aspect at the given 'index'.
   * @param {number} index is the index of the aspect to increase the invoke
   **/
  async increaseInvoke(index) {
    const aspect = this.aspects[index];
    aspect.invoke++;
    
    await this.updateTextAspect(index);
    await this.store();
  }

  /**
   * Decrease the number of free invoke of the aspect at the given 'index'.
   * @param {number} index is the index of the aspect to decrease the invoke
   **/
  async decreaseInvoke(index) {
    const aspect = this.aspects[index];
    if(aspect.invoke > 0)
      aspect.invoke--;

    await this.updateTextAspect(index);
    await this.store();
  }

  /**
   * Create a drawing text box with the description and the number of free invoke of the aspect.
   * @param {number} index is the index of the aspect
   * @param {number} posx is the position x of the cursor
   * @param {number} posy is the position y of the cursor
   **/
  async creatTextAspect(index, posx, posy) {
    const aspect = this.aspects[index];

    // Compute cursor position on the canvas from canvas position and cursor position on the screen (posx, posy)
    const s_pos = game.scenes.viewed._viewPosition; 
    const coordx = (posx - window.innerWidth/2) / s_pos.scale + s_pos.x;
    const coordy = (posy - window.innerHeight/2) / s_pos.scale + s_pos.y;
    
    if (coordx > 0 && coordx < canvas.dimensions.width && coordy > 0 && coordy < canvas.dimensions.height) {      
      const text = aspect.description + "  ( " + aspect.invoke + " )";

      const gridsize = game.scenes.viewed.grid.size;
      const size = gridsize*game.settings.get("fate-aspect-tracker","AspectDrawingFontSize")/100;
            
      const fontsize = Math.min(256, Math.max(8, Math.round(size/2)));
      const height = size;
      const width = (text.length * fontsize / 1.5);

      let color = aspect.color;
      if(!game.settings.get("fate-aspect-tracker","AspectDrawingFontDynamicColor")){
        color = game.settings.get("fate-aspect-tracker","AspectDrawingFontColor");
      }

      const drawing = {
        type: foundry.data.ShapeData.TYPES.RECTANGLE,
        author: game.user.id,
        x: coordx - width/2,
        y: coordy - height/2,
        shape:{
            width: width,
            height: height,
        },
        fillType: CONST.DRAWING_FILL_TYPES.SOLID,
        fillColor: game.settings.get("fate-aspect-tracker","AspectDrawingFillColor"),
        fillAlpha: game.settings.get("fate-aspect-tracker","AspectDrawingFillOpacity"),
        strokeWidth: game.settings.get("fate-aspect-tracker","AspectDrawingBorderWidth"),
        strokeColor: game.settings.get("fate-aspect-tracker","AspectDrawingBorderColor"),
        strokeAlpha: game.settings.get("fate-aspect-tracker","AspectDrawingBorderOpacity"),
        text: text,
        fontSize: fontsize,
        fontFamily: CONFIG.fontDefinitions[game.settings.get("fate-aspect-tracker","AspectDrawingFontFamily")],
        textColor: color,
        points: []
      };

	  const d = await game.scenes.viewed.createEmbeddedDocuments('Drawing', [drawing]);

      d.forEach( drawing => aspect.drawings.push(drawing.id));
      await this.store();
    } else {
      ui.notifications.warn(game.i18n.localize("FateAspectTracker.aspectText.error"));
    }
  }

  /**
   * Update all drawing text box of the aspect.
   * @param {number} index is the index of the aspect
   **/
  async updateTextAspect(index) {
    const aspect = this.aspects[index];
    
    let newDrawings = [];

    // New Text
    const updatedText = aspect.description + "  ( " + aspect.invoke + " )";
	
    // Update all textbox on all scene
    game.scenes.forEach(scene => {
        const drawings = scene.getEmbeddedCollection("Drawing").map(drawing => {
          if(aspect.drawings.includes(drawing.id)) {
            const gridsize = drawing.parent.grid.size
            const size = gridsize*game.settings.get("fate-aspect-tracker","AspectDrawingFontSize")/100;

            const fontsize = Math.min(256, Math.max(8, Math.round(size/2)));
            const height = size;
            const width = (updatedText.length * fontsize / 1.5);

            return { _id: drawing.id, text: updatedText, width: width, height: height, fontSize: fontsize}
          } else {
            return null
          }
        }).filter(d => d != null);

        scene.updateEmbeddedDocuments('Drawing', drawings);
		newDrawings = newDrawings.concat(drawings.map(drawing => drawing._id));
    });

    // Replace drawings with existing textbox (i.e. Remove from list deleted textbox)
    aspect.drawings = newDrawings;
  }

  /**
   * Delete all drawing text box of the aspect.
   * @param {number} index is the index of the aspect
   **/
  async deleteTextAspect(index) {
    const aspect = this.aspects[index];
    
    // Delete all other textbox on all other scene
    game.scenes.forEach(scene => {
        const ds = scene.getEmbeddedCollection("Drawing").filter(drawing => {
          return aspect.drawings.includes(drawing.id);
        });

        scene.deleteEmbeddedDocuments('Drawing', ds.map(drawing => drawing.id));
    });
  }

  /**
   * Toggle visibility of the aspect given by its index
  * @param {number} index is the index of the aspect
   **/
  async toggleVisibility(index) {
    const aspect = this.aspects[index];

    aspect.hidden = !aspect.hidden;

    await this.toggleVisibilityTextAspect(index);
    await this.store();
  }

  /**
   * Toggle visibility of all text box related the aspect given by its index
  * @param {number} index is the index of the aspect
   **/
   async toggleVisibilityTextAspect(index) {
    const aspect = this.aspects[index];
    
    // Hide all textbox on all scene
    game.scenes.forEach(scene => {
        const drawings = scene.getEmbeddedCollection("Drawing").map(drawing => {
          if(aspect.drawings.includes(drawing.id))
            return { _id: drawing.id, hidden: aspect.hidden }
          else
            return null
        }).filter(d => d != null);

        scene.updateEmbeddedDocuments('Drawing', drawings);
    });
  }

  /**
   * Toggle inline editing of the aspect given by its index
  * @param {number} index is the index of the aspect
   **/
   async toggleEditing(index) {
    const aspect = this.aspects[index];

    aspect.edit = !aspect.edit;

    await this.store();
  }
}
