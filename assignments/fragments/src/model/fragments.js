const crypto = require('crypto');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/index');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  // get all fragments for a user
  // returns promise<Fragment[]>
  static async byUser(ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const fragmentIds = await listFragments(ownerId);
    const fragments = [];

    for (const id of fragmentIds) {
      const fragmentData = await readFragment(ownerId, id);
      if (fragmentData) {
        fragments.push(new Fragment(fragmentData));
      }
    }

    return fragments;
  }

  // Get a fragment by ID
  static async byId(ownerId, id) {
    if (!id) {
      throw new Error('ID is required');
    }
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const fragmentData = await readFragment(ownerId, id);
    return fragmentData ? new Fragment(fragmentData) : null;
  }

  // Save the fragment metadata to the database
  // returns promise<void>
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this.id, {
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    });
  }

  // Get the fragment data from the database
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  //Set the fragment data in the database
  // returns promise
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();

    await writeFragmentData(this.ownerId, this.id, data);
    await this.save(); // Update metadata with new size and timestamp
  }

  // Delete the fragment and its data
  // returns promise<boolean>
  async delete() {
    return await deleteFragment(this.ownerId, this.id);
  }

  // Check if a content type is supported
  // returns boolean
  static isSupportedType(type) {
    const supportedTypes = ['application/json', 'text/plain', 'text/markdown', 'text/html'];
    return supportedTypes.includes(type);
  }
}

module.exports = Fragment;
