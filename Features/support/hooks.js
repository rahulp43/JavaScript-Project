const { Before, After, BeforeAll, AfterAll, AfterStep, setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(60 * 1000);

const TestBase = require('../../Basepage/TestBase');

BeforeAll(async function () {
  console.log("BeforeAll Hook Method Running....");
});

Before(async function () {
  console.log("Before Hook Method Running....");
  const browser = process.env.browser || 'chrome';
});

After(async function (testCase) {
  testBase = new TestBase();
  // testCase is the TestCaseHookParameter in modern cucumber.
  // Build a small adapter object with `failed()` and `attach()` methods.
  const scenario = {
    failed: () => testCase && testCase.result && testCase.result.status && testCase.result.status !== 'PASSED',
    attach: typeof this.attach === 'function' ? this.attach.bind(this) : async () => { }
  };

  console.log("After Hook Method Running....");
  if (scenario && scenario.failed()) {
    if (typeof scenario.attach === 'function') {
      try {
        if (this.testBase && typeof this.testBase.captureBase64Screenshot === 'function') {
          const screenshot = await this.testBase.captureBase64Screenshot();
          await scenario.attach(Buffer.from(screenshot, 'base64'), 'image/png');
        } else {
          console.warn('No testBase available to capture screenshot');
        }
      } catch (e) {
        console.warn('Failed to capture or attach screenshot:', e.message);
      }
    }
  }

  if (this.testBase && typeof this.testBase.closeBrowser === 'function') {
    try {
      await this.testBase.closeBrowser();
    } catch (e) {
      console.warn('Error while closing browser:', e.message);
    }
  } else {
    console.log('No testBase instance found on system; nothing to close.');
  }
});

AfterStep(async function () {
  const scenario = {
    attach: typeof this.attach === 'function' ? this.attach.bind(this) : async () => { }
  };

  console.log("AfterStep Hook Method running....");
  try {
    if (typeof scenario.attach === 'function') {
      const screenshot = await this.testBase.captureBase64Screenshot();
      await scenario.attach(Buffer.from(screenshot, 'base64'), 'image/png');
    }
  } catch (e) {
    console.warn('AfterStep screenshot failed:', e.message);
  }
});

AfterAll(async function () {
  console.log("AfterAll Hook Method Running...");
});