import { createId } from './ids';

describe('createId', () => {
  it('starts with the given prefix', () => {
    expect(createId('group')).toMatch(/^group-\d+-\d+$/);
  });
});
