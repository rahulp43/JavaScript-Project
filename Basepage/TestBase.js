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
    this.cacheCleared = false;
  }

  // ===== browser initialization (browserInitialization) =====
  async browserInitialization(url) {
    console.log('Launching browser from TestBase');

    const browser = (process.env.browser || 'chrome').toLowerCase();
    const browserVersion = process.env.browserVersion || '';

    try {
      console.log('Starting WebDriver session for', browser);

      //This is not required, I'm adding just to remove warnings from my logs to see cleaner output
      // build with browser-specific options (Chrome options supported)
      let builder = new Builder().forBrowser(browser);
      if (browser === 'chrome') {
        const options = new chrome.Options();
        const headless = (process.env.HEADLESS || 'false').toLowerCase() === 'true';
        options.addArguments('--remote-allow-origins=*');
        options.addArguments('--disable-notifications');
        options.addArguments('--window-size=1920,1080');
        // reduce noisy Google/Chrome background services logs and disable updates
        options.addArguments('--disable-background-networking');
        options.addArguments('--disable-sync');
        options.addArguments('--no-first-run');
        options.addArguments('--disable-extensions');
        options.addArguments('--disable-component-update');
        options.addArguments('--disable-background-timer-throttling');
        options.addArguments('--disable-client-side-phishing-detection');
        options.addArguments('--disable-default-apps');
        // further reduce logging and disable Google push/GCM features
        options.addArguments('--disable-gcm');
        options.addArguments('--disable-push');
        options.addArguments('--disable-push-api');
        options.addArguments('--disable-features=PushMessaging,Translate,MediaRouter');
        options.addArguments('--log-level=3');
        options.addArguments('--disable-breakpad');
        // attempt to reduce verbose driver logs via args (experimental API unsupported here)
        options.addArguments('--disable-logging');
        options.addArguments('--disable-dev-shm-usage');
        if (headless) {
          options.addArguments('--headless=new');
          options.addArguments('--disable-gpu');
        }
        builder = builder.setChromeOptions(options);
      }

      this.driver = await builder.build();
      console.log('WebDriver session created');
    } catch (e) {
      console.error('Failed to start WebDriver session:', e && e.message);
      throw e;
    }

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

  // ===== analyzeLogs() =====
  async analyzeLogs() {
    try {
      const logs = await this.driver.manage().logs().get('browser');
      logs.forEach((entry) => {
        console.log(`[BROWSER LOG] ${entry.level.name} : ${entry.message}`);
      });
    } catch (e) {
      console.log('Browser logs not available:', e.message);
    }
  }

  // ===== maximizeBrowserWindow() =====
  async maximizeBrowserWindow() {
    await this.driver.manage().window().maximize();
  }

  // ===== getBrowserName() =====
  async getBrowserName() {
    const caps = await this.driver.getCapabilities();
    return caps.getBrowserName();
  }

  // ===== getBrowserVersion() =====
  async getBrowserVersion() {
    const caps = await this.driver.getCapabilities();
    return caps.getBrowserVersion
      ? caps.getBrowserVersion()
      : caps.get('browserVersion');
  }

  // ===== openUrl(url) =====
  async openUrl(url) {
    await this.driver.get(url);
  }

  // ===== getCurrentUrl() =====
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

  // ===== getDriver() =====
  getDriver() {
    return this.driver;
  }

  // ===== closeBrowser() =====
  async closeBrowser() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
      console.log("Browser closed successfully.");
    }
  }

  // ===== clearBrowserCache() =====
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