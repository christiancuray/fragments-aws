const memory = require('../../src/model/data/memory/index');
const Fragment = require('../../src/model/fragments');

describe('Fragment class', () => {
  test('Constructor should work properly', () => {
    const fragments = new Fragment({
      id: '1234',
      ownerId: '2002',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'type1',
      size: 20,
    });

    expect(fragments.id).toBe('1234');
    expect(fragments.ownerId).toBe('2002');
    expect(fragments.type).toBe('type1');
    expect(fragments.size).toBe(20);
    expect(fragments.created).toBeDefined();
    expect(fragments.updated).toBeDefined();
  });

  test('Constructor should generate id, size, created, and updated if not provided', () => {
    const fragments = new Fragment({
      ownerId: '2002',
      type: 'type1',
    });

    expect(fragments.id).toBeDefined();
    expect(fragments.created).toBeDefined();
    expect(fragments.updated).toBeDefined();
    expect(fragments.size).toBe(0);
  });

  test('byUser() should return all fragments for a user', async () => {
    const ownerId = '3003';
    const fragment1 = new Fragment({ ownerId, type: 'type1', id: 'f1' });
    const fragment2 = new Fragment({ ownerId, type: 'type2', id: 'f2' });
    await memory.writeFragment('f1', fragment1);
    await memory.writeFragment('f2', fragment2);

    const res = await Fragment.byUser(ownerId);
    expect(res.length).toBe(2);
  });

  test('byUser() should throw an error if ownerId is not provided', async () => {
    await expect(Fragment.byUser()).rejects.toThrow('Owner ID is required');
  });

  test('byId() should return the correct fragment by ID', async () => {
    const fragment = new Fragment({ ownerId: '4004', type: 'type1', id: '9999abc' });
    await memory.writeFragment('9999abc', fragment);

    const res = await Fragment.byId('9999abc');
    expect(res).toBeInstanceOf(Fragment);
    expect(res.id).toBe('9999abc');
    expect(res.ownerId).toBe('4004');
    expect(res.type).toBe('type1');
  });

  test('byId() should return null if fragment does not exist', async () => {
    const res = await Fragment.byId('nonexistent');
    expect(res).toBeNull();
  });

  test('save() should update the fragment in memory', async () => {
    const fragment = new Fragment({ ownerId: '5005', type: 'type1', id: 'saveTest123' });
    await fragment.save();

    const res = await memory.readFragment('saveTest123');
    expect(res.id).toBe('saveTest123');
    expect(res.ownerId).toBe('5005');
    expect(res.type).toBe('type1');
    expect(res.created).toBeDefined();
    expect(res.updated).toBeDefined();
  });

  test('save() should update the updated timestamp', async () => {
    const fragment = new Fragment({ ownerId: '6006', type: 'type1', id: 'updateTest123' });
    const originalUpdated = fragment.updated;
    // Wait a second to ensure the timestamp will be different
    await new Promise((r) => setTimeout(r, 1000));
    await fragment.save();
    expect(fragment.updated).not.toBe(originalUpdated);
    expect(fragment.updated).toBeDefined();
  });

  test('getData() and setData() should work correctly', async () => {
    const fragment = new Fragment({ ownerId: '777', type: 'type1', id: '12345678' });
    const buffer = Buffer.from('This is some test data');
    // Set the data for the fragment
    await fragment.setData(buffer);
    // Get the data back from the fragment
    const data = await fragment.getData();
    expect(data).toEqual(buffer);
    // Verify the size is updated
    const res = await memory.readFragment('12345678');
    expect(res.size).toBe(buffer.length);
  });

  test('setData() should throw an error if data is not a Buffer', async () => {
    const fragment = new Fragment({ ownerId: '888', type: 'type1', id: 'exp123' });
    await expect(fragment.setData('not a buffer')).rejects.toThrow('Data must be a Buffer');
  });

  test('delete() should delete the fragment and its data', async () => {
    const fragment = new Fragment({ ownerId: '1abc', type: 'type1', id: 'exp999' });
    const buffer = Buffer.from('Data to be deleted');
    await memory.writeFragment('exp999', fragment);
    await memory.writeFragmentData('exp999', buffer);

    const res = await fragment.delete();
    expect(res).toBe(true);
    const frag = await memory.readFragment('exp999');
    expect(frag).toBeNull();
    const data = await memory.readFragmentData('exp999');
    expect(data).toBeNull();
  });

  test('delete() should return false if fragment does not exist', async () => {
    const fragment = new Fragment({ ownerId: '2abc', type: 'type1', id: 'nonexistent' });
    const res = await fragment.delete();
    expect(res).toBe(false);
  });

  test('isSupportedType() should validate supported types', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
  });
});
