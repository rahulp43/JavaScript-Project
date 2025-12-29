const { Before, After, BeforeAll, AfterAll, AfterStep, setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(60 * 1000);

const HooksClass = require('../../Hooks');
const hooks = new HooksClass();

BeforeAll(async function () {
  if (hooks.beforeAll) await hooks.beforeAll();
});

Before(async function () {
  if (hooks.setUp) await hooks.setUp();
});

After(async function (testCase) {
  // testCase is the TestCaseHookParameter in modern cucumber.
  // Build a small adapter object with `failed()` and `attach()` used by your Hooks.tearDown
  const scenario = {
    failed: () => testCase && testCase.result && testCase.result.status && testCase.result.status !== 'PASSED',
    attach: typeof this.attach === 'function' ? this.attach.bind(this) : async () => {}
  };

  if (hooks.tearDown) await hooks.tearDown(scenario);
});

AfterStep(async function () {
  const scenario = {
    attach: typeof this.attach === 'function' ? this.attach.bind(this) : async () => {}
  };
  if (hooks.afterStep) await hooks.afterStep(scenario);
});

AfterAll(async function () {
  if (hooks.afterAll) await hooks.afterAll();
});
