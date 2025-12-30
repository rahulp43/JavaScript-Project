const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const TestBase = require('../../Basepage/TestBase');
const LoginPage = require('../../pages/LoginPage');
const { By, until } = require('selenium-webdriver');
const { setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60 * 1000);

// testBase and login will be stored on the Cucumber World (`this`)
console.log('Started');

Given("the login panel is displayed", async function () {
  this.testBase = new TestBase();
  const baseUrl = process.env.BASE_URL || 'https://webplatform-dev.basistechnologies.info/dashboard/#/TQM';
  try {
    console.log('Initializing browser and navigating to', baseUrl);
    await this.testBase.browserInitialization(baseUrl);
    console.log('Browser initialization completed');
    this.login = new LoginPage(this.testBase.getDriver());
    const onPage = await this.login.isOnPage();
    expect(onPage).to.be.true;
  } catch (err) {
    console.error('Error in Given step - browser init or page load failed:', err && err.message);
    // attempt to capture a screenshot if driver exists
    try {
      if (this.testBase && this.testBase.captureBase64Screenshot) {
        const shot = await this.testBase.captureBase64Screenshot();
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
    await this.login.enterCredentialsAndLogin(username, password);
  }
);

When(
  'the user logs on with invalid username {string} {string}',
  async function (username, password) {
    await this.login.enterCredentialsAndLogin(username, password);
  }
);

When(
  'the user logs on with invalid password {string} {string}',
  async function (username, password) {
    await this.login.enterCredentialsAndLogin(username, password);
  }
);

Then(
  'the Dashboard profile displays user initials {string}',
  async function (expected) {
    const driver = (this.login && this.login.driver) ? this.login.driver : (this.testBase && this.testBase.getDriver ? this.testBase.getDriver() : null);
    if (!driver) throw new Error('WebDriver not available to verify initials');

    const xpath = `//*[contains(normalize-space(string(.)), '${expected}')]`;
    try {
      await driver.wait(until.elementLocated(By.xpath(xpath)), 15000);
      const el = await driver.findElement(By.xpath(xpath));
      const actual = await el.getText();
      expect(actual).to.contain(expected);
    } catch (e) {
      // check body text
      try {
        const body = await driver.findElement(By.css('body'));
        const bodyText = await body.getText();
        expect(bodyText).to.contain(expected);
      } catch (err) {
        throw new Error(`Could not verify initials on page: ${err.message}`);
      }
    }
  }
);

Then('Alert displays message {string}', async function (expectedMsg) {
  const actual = await this.login.getLoginErrorMessage();
  expect(actual).to.contain(expectedMsg);
});