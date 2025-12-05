// Simple in-memory storage for fragments
const fragments = new Map();
const fragmentData = new Map();

// write fragment metadata to memory
async function writeFragment(id, fragment) {
  if (!id || !fragment) {
    throw new Error('ID and fragment object are required');
  }

  // Store the fragment metadata with created timestamp
  fragments.set(id, {
    ...fragment,
    created: fragment.created || new Date().toISOString(),
    updated: new Date().toISOString(),
  });
}

// read fragment metadata from memory
async function readFragment(ownerId, id) {
  if (!id) {
    throw new Error('ID is required');
  }
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  return fragments.get(id) || null;
}

// write fragment data as a Buffer
async function writeFragmentData(ownerId, id, data) {
  if (!id) {
    throw new Error('ID is required');
  }

  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  if (!Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer');
  }

  fragmentData.set(id, Buffer.from(data));
}

// read fragment data from memory
async function readFragmentData(ownerId, id) {
  if (!id) {
    throw new Error('ID is required');
  }
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  return fragmentData.get(id) || null;
}

// list all fragment IDs for a given ownerId
async function listFragments(ownerId) {
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  const userFragments = [];
  for (const [id, fragment] of fragments.entries()) {
    if (fragment.ownerId === ownerId) {
      userFragments.push(id);
    }
  }

  return userFragments;
}

// delete fragment and its data
async function deleteFragment(ownerId, id) {
  if (!id) {
    throw new Error('ID is required');
  }

  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  const deleted = fragments.delete(id);
  fragmentData.delete(id);

  return deleted;
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
