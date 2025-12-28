// TestBase.js
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// ensure chromedriver npm binary is loaded so selenium can use it
try {
  require('chromedriver');
} catch (e) {
  console.warn('chromedriver module not found - ensure chromedriver is installed as a dependency');
}

class TestBase {
  constructor() {
    this.driver = null;
    //this.cacheCleared = false;
  }

  // ===== browser initialization (browserInitialization) =====
  async browserInitialization(url) {
    console.log('Launching browser from TestBase');

    const browser = (process.env.browser || 'chrome').toLowerCase();
    const browserVersion = process.env.browserVersion || '';

    // const headless = false;
    // const browser = (process.env.browser || 'chrome').toLowerCase();
    // const browserVersion = process.env.browserVersion || '';

    // switch (browser) {
    //   case 'chrome': {
        // const options = new chrome.Options();

        // // sample of Java code: remote-allow-origins, disable notifications etc.
        // options.addArguments('--remote-allow-origins=*');
        // options.addArguments('--disable-notifications');

        // emulate your Java "headless" and "no-sandbox" flags
        // if (headless) {
        //   options.addArguments('--headless=new');
        //   options.addArguments('--disable-gpu');
        //   options.addArguments('--window-size=1920,1080');
        // }
        // if ((process.env.nosandbox || '').toLowerCase() === 'true') {
        //   options.addArguments('--no-sandbox');
        // }

        // // prefs example – download directory or disable save dialogs
        // const prefs = {
        //   'download.default_directory': process.env.DOWNLOAD_DIR || 'downloads',
        // };
        // options.setUserPreferences(prefs);

        try {
          console.log('Starting WebDriver session for', browser);
          this.driver = await new Builder().forBrowser(browser).build();
          console.log('WebDriver session created');
        } catch (e) {
          console.error('Failed to start WebDriver session:', e && e.message);
          throw e;
        }

    

    //   case 'firefox': {
    //     const options = new firefox.Options();

    //     if (headless) {
    //       options.headless();
    //     }
    //     if ((process.env.nosandbox || '').toLowerCase() === 'true') {
    //       options.addArguments('--no-sandbox');
    //     }

    //     this.driver = await new Builder()
    //       .forBrowser('firefox')
    //       .setFirefoxOptions(options)
    //       .build();

    //     break;
    //   }

    //   default:
    //     throw new Error(`Unsupported browser: ${browser}`);
    // }

    const window = this.driver.manage().window();
    await window.setRect({ width: 1920, height: 1080 });
    console.log(`Browser started: ${browser} ${browserVersion}`);

    // navigate to provided URL (or env BASE_URL) if available
    const navigateTo = url || process.env.BASE_URL;
    if (navigateTo) {
      try {
        console.log('Navigating to', navigateTo);
        await this.openUrl(navigateTo);
        console.log('Navigation complete');
      } catch (e) {
        console.error('Navigation failed:', e && e.message);
        throw e;
      }
    } else {
      console.warn('No URL provided to browserInitialization and BASE_URL is not set.');
    }
  }

  // ===== analyzeLogs(), getBrowserName(), getBrowserVersion() =====
  async analyzeLogs() {
    // Java uses driver.manage().logs().get(...) – JS support is driver.manage().logs()
    try {
      const logs = await this.driver.manage().logs().get('browser');
      logs.forEach((entry) => {
        console.log(`[BROWSER LOG] ${entry.level.name} : ${entry.message}`);
      });
    } catch (e) {
      console.log('Browser logs not available:', e.message);
    }
  }

  async maximizeBrowserWindow() {
    await this.driver.manage().window().maximize();
  }

  async getBrowserName() {
    const caps = await this.driver.getCapabilities();
    return caps.getBrowserName();
  }

  async getBrowserVersion() {
    const caps = await this.driver.getCapabilities();
    return caps.getBrowserVersion
      ? caps.getBrowserVersion()
      : caps.get('browserVersion');
  }

  // ===== navigation helpers (similar to Java openUrl/getUrl) =====
  async openUrl(url) {
    await this.driver.get(url);
  }

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }

  // ===== screenshot (takesScreenshot) =====
  async takeScreenshot(filePath) {
    const image = await this.driver.takeScreenshot();
    const fs = require('fs');
    fs.writeFileSync(filePath, image, 'base64');
    console.log(`Screenshot saved to ${filePath}`);
  }

  // returns base64 screenshot string
  async captureBase64Screenshot() {
    return await this.driver.takeScreenshot();
  }

  // ===== getDriver(), closeBrowser(), clearBrowserCache() =====
  getDriver() {
    return this.driver;
  }

  async closeBrowser() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  async clearBrowserCache() {
    console.log('Clearing browser cache');
    try {
      await this.driver.manage().deleteAllCookies();
    } catch (e) {
      console.error('Error while clearing cookies:', e.message);
    }
  }
}

module.exports = TestBase;