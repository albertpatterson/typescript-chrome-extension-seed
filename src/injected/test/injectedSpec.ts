import 'mocha';

import {assert, expect} from 'chai';

describe('injected module', () => {
  it('should have a passing get', () => {
    expect(document).not.to.be.undefined;
  });
});
