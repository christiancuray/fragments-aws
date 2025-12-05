const memory = require('../../src/model/data/memory/index');

const fakeFragment = {
  id: '1234',
  ownerId: '2002',
  type: 'type1',
  size: 20,
};

describe('fragments database calls using in memory database', () => {
  test('readFragment() and writeFragment() should should work correctly', async () => {
    // write the fake fragment to the db
    await memory.writeFragment('2002', fakeFragment);
    // read the fragment back from the db
    const res = await memory.readFragment('1234', '2002');
    expect(res.id).toBe('1234');
    expect(res.ownerId).toBe('2002');
    expect(res.type).toBe('type1');
    expect(res.size).toBe(20);
    expect(res.created).toBeDefined();
    expect(res.updated).toBeDefined();
  });

  test('readFragment() should be null when the fragment does not exist', async () => {
    const res = await memory.readFragment('1234', '9999');
    expect(res).toBeNull();
  });

  test('readFragmentData() and writeFragmentData() should should work correctly', async () => {
    const buffer = Buffer.from('This is some test data');
    // write some data to the db
    await memory.writeFragmentData('owner1', '3003', buffer);
    // read the data back from the db
    const res = await memory.readFragmentData('owner1', '3003');
    expect(res).toEqual(buffer);
  });

  test('readFragmentData() should be null when the data does not exist', async () => {
    const res = await memory.readFragmentData('owner1', '7777');
    expect(res).toBeNull();
  });

  test('listFragments() should return a list of fragment ids of existing owner', async () => {
    // write some fake fragments to the db
    const ownerId = '55255';
    const fragment1 = { ...fakeFragment, ownerId: ownerId };
    const fragment2 = { ...fakeFragment, ownerId: ownerId };
    const fragment3 = { ...fakeFragment, ownerId: ownerId };
    await memory.writeFragment('f1', fragment1);
    await memory.writeFragment('f2', fragment2);
    await memory.writeFragment('f3', fragment3);

    const res = await memory.listFragments('55255');
    expect(res).toEqual(['f1', 'f2', 'f3']);
  });

  test('listFragments() should return empty list for non-existing owner', async () => {
    const res = await memory.listFragments('00000');
    expect(res).toEqual([]);
  });

  test('deleteFragment() should delete the fragment and its data', async () => {
    // write a fake fragment and its data to the db
    const ownerId = '44444';
    const fragmentId = '12121212';
    const fragment = { ...fakeFragment, ownerId: ownerId, id: fragmentId };
    const buffer = Buffer.from('Data to be deleted');
    await memory.writeFragment(fragmentId, fragment);
    await memory.writeFragmentData(ownerId, fragmentId, buffer);

    // delete the fragment
    await memory.deleteFragment(ownerId, fragmentId);

    // try to read the fragment and its data back from the db
    const fragRes = await memory.readFragment(ownerId, fragmentId);
    const dataRes = await memory.readFragmentData(ownerId, fragmentId);
    expect(fragRes).toBeNull();
    expect(dataRes).toBeNull();
  });

  test('deleteFragment() should handle deleting non-existing fragment gracefully', async () => {
    await expect(memory.deleteFragment('11111', '22222')).resolves.toBe(false);
  });
});
