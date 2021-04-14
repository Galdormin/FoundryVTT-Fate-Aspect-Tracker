/* global game */

import Socket from "./socket.js";

/** The selection of optional tags. **/
const TAGS = {
  NONE: 0,
  SITUATION: 1,
  BOOST: 2,
  RESOURCES: 3,
};

export class Aspect {
  /**
   * Create a new aspect with the given `description`.
   * @param {string} description is the aspect's description.
   * @param {number} tag is the aspect's optional tag.
   * @param {string | null} color is the aspect's color.
   * @param {number} invoke is the number of free invoke
   **/
  constructor(description = "", tag = TAGS.NONE, color = null, invoke = 0) {
    /** The aspect's description. **/
    this.description = description;
    /** The aspect's tag. */
    this.tag = tag;
    /** The aspect's color. */
    this.color = color;
    /** The aspect's number of free invokes **/
    this.invoke = invoke
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
   * Deletes the aspect at the given `index`.
   * @param {number} index is the index to be deleted
   * @returns {Promise<number>} the number of managed aspects.
   **/
  async deleteAspect(index) {
    this.aspects.splice(index, 1);

    await this.store();

    return this.aspects.length;
  }

  /**
   * Updates the aspect description at the given `index`.
   * @param {number} index is the index to be deleted
   * @param {Aspect} aspect is the updated aspect
   **/
  async updateAspect(index, aspect) {
    this.aspects[index] = aspect;

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

  /** Check whether there are any incomplete aspects. **/
  get incomplete() {
    return this.aspects.some((aspect) => !aspect.done);
  }

  async increaseInvoke(index) {
    const aspect = this.aspects[index];
    aspect.invoke++;

    await this.store();
  }

  async decreaseInvoke(index) {
    const aspect = this.aspects[index];
    if(aspect.invoke > 0)
      aspect.invoke--;

    await this.store();
  }
}
