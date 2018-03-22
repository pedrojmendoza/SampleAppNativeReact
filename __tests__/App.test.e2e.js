import wd from 'wd';
import config from '../e2e-config';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const PORT = 4723;
const driver = wd.promiseChainRemote('localhost', PORT);

describe('Simple Appium Example', () => {
  beforeAll(async () => await driver.init(config));
  afterAll(async () => await driver.quit());

  it('should render the form', async () => {
    await driver.sleep(5000);
    expect(await driver.hasElementByAccessibilityId('form_view')).toBe(true);
    expect(await driver.hasElementByAccessibilityId('submit_button')).toBe(true);
  });
});
