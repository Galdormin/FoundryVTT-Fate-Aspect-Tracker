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
   **/
  constructor(description = "", tag = "", color = "#000000", invoke = 0, drawings = []) {
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
    const journal = game.journal.getName("_aspect_tracker");
    const savedAspects = journal.data.content;
    if (!savedAspects) return new Tracker();

    const aspects = JSON.parse(savedAspects).map((aspect) =>
      Object.assign(new Aspect(), aspect)
    );

    return new Tracker(aspects);
  }

  /** Store the current tracker in the database. **/
  async store() {
    const aspects = JSON.stringify(this.aspects);
    let update = {
      "content": aspects
    };

    let journal = game.journal.getName("_aspect_tracker");
    await journal.update(update, {diff: false});

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
    const coordx = (posx - window.innerWidth/2) / game.scenes.viewed._viewPosition.scale + game.scenes.viewed._viewPosition.x;
    const coordy = (posy - window.innerHeight/2) / game.scenes.viewed._viewPosition.scale + game.scenes.viewed._viewPosition.y;
    
    if (coordx > 0 && coordx < game.scenes.viewed.data.width && coordy > 0 && coordy < game.scenes.viewed.data.height) {
      const defaultDrawing = game.settings.get("core", "defaultDrawingConfig");
      
      const text = aspect.description + "  ( " + aspect.invoke + " )";
      const size = game.scenes.viewed.data.width*(1/100);
      const height = size * 2;
      const width = (text.length * size / 1.5);

      const d = await Drawing.create({
        type: CONST.DRAWING_TYPES.RECTANGLE,
        author: game.user.id,
        x: coordx - width/2,
        y: coordy - height/2,
        width: width,
        height: height,
        fillType: CONST.DRAWING_FILL_TYPES.SOLID,
        fillColor: defaultDrawing.fillColor,
        fillAlpha: defaultDrawing.fillAlpha,
        strokeWidth: defaultDrawing.strokeWidth,
        strokeColor: defaultDrawing.strokeColor,
        strokeAlpha: defaultDrawing.strokeAlpha,
        text: text,
        fontSize: size,
        textColor: defaultDrawing.textColor,
        points: []
      }, {parent: game.scenes.viewed});

      aspect.drawings.push(d.data._id);
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

    // Update text and width for text box on the canvas
    aspect.drawings.forEach(id => {
        const drawing = canvas.drawings.get(id);
        if (drawing) {
          newDrawings.push(id);

          const size = game.scenes.viewed.data.width*(1/100);
          const width = (updatedText.length * size / 1.5);

          drawing.update({"text": updatedText, "width": width});
        }
    });

    // Update all other textbox on all other scene
    game.scenes.forEach(scene => {
      if (scene !== game.scenes.viewed) {
        const ds = scene.data.drawings.map(drawing => {
          if (aspect.drawings.includes(drawing._id)) {
            newDrawings.push(drawing._id);

            const size = scene.data.width*(1/100);
            const width = (updatedText.length * size / 1.5);

            drawing.text = updatedText;
            drawing.width = width;
          }
          return drawing;
        });
        scene.update({"drawings":ds});
      }
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
    
    // Delete all textbox on the viewed scene
    aspect.drawings.forEach(id => {
        const drawing = canvas.drawings.get(id);
        if (drawing) {
          drawing.delete();
        }
    });

    // Delete all other textbox on all other scene
    game.scenes.forEach(scene => {
      if (scene !== game.scenes.viewed) {
        const ds = scene.data.drawings.filter(drawing => {
          return !aspect.drawings.includes(drawing._id);
        });

        scene.update({"drawings":ds});
      }
    });
  }
}
