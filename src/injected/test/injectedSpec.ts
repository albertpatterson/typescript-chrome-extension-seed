import 'mocha';

import {assert, expect} from 'chai';

describe('injected module', () => {
  it('should have a passing test', () => {
    expect(document).not.to.be.undefined;
  });
});
