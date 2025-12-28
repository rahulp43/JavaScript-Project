const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const TestBase = require('../../TestBase');
const LoginPage = require('../../LoginPage');
const { setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60*1000);

let testBase;
let login;
console.log('Started');

Given("the login panel is displayed", async function () {
  testBase = new TestBase();
  // If you want to hardcode the app URL for local runs, change the fallback below.
  const baseUrl = process.env.BASE_URL || 'https://acpg2.bti.local/dashboard/';
  try {
    console.log('Initializing browser and navigating to', baseUrl);
    await testBase.browserInitialization(baseUrl);
    console.log('Browser initialization completed');
    login = new LoginPage(testBase.getDriver());
    const onPage = await login.isOnPage();
    expect(onPage).to.be.true;
  } catch (err) {
    console.error('Error in Given step - browser init or page load failed:', err && err.message);
    // attempt to capture a screenshot if driver exists
    try {
      if (testBase && testBase.captureBase64Screenshot) {
        const shot = await testBase.captureBase64Screenshot();
        const fs = require('fs');
        fs.writeFileSync('last_error_screenshot.png', Buffer.from(shot, 'base64'));
        console.log('Saved last_error_screenshot.png');
      }
    } catch (e) {
      console.warn('Failed to write screenshot:', e.message);
    }
    throw err;
  }
});

When(
  'the user logs on with valid credentials {string} {string}',
  async function (username, password) {
    await login.enterCredentialsAndLogin('system1', username, password);
  }
);

When(
  'the user logs on with invalid username {string} {string}',
  async function (username, password) {
    await login.enterCredentialsAndLogin('system1', username, password);
  }
);

When(
  'the user logs on with invalid password {string} {string}',
  async function (username, password) {
    await login.enterCredentialsAndLogin('system1', username, password);
  }
);

Then(
  'the Dashboard profile displays user initials {string}',
  async function (expected) {
    const actual = await /* dashboardPage.getInitials() */
    expect(actual).to.contain(expected);
  }
);

Then('Alert displays message {string}', async function (expectedMsg) {
  const actual = await login.getLoginErrorMessage();
  expect(actual).to.contain(expectedMsg);
});