// LoginPage.js
const { By, until } = require('selenium-webdriver');

class LoginPage {
  /**
   * @param {WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    // locators
    this.header = By.xpath("//span[contains(text(),'Login')]");
    this.system = By.css("span[id*='LOGIN--system-arrow']");
    this.userNameField = By.css("input[id*='user-inner']");
    this.passwordField = By.css("input[id*='password-inner']");
    this.loginButton = By.css("button[id$='login']");
    this.acText = By.xpath("//span[text()='ActiveControl']");
    this.errorMessage = By.xpath("//div[contains(@id, 'error')]//span[contains(@id,'text')]"); // adjust to your real locator
  }

  // ===== helper: select an option from a dropdown-like system selector =====
  async selectSystemOption(systemName) {
    if (!systemName) return;
    await this.driver.wait(until.elementLocated(this.system), 10000);
    const select = await this.driver.findElement(this.system);
    await select.click();
    // adjust the xpath below to match your actual option elements
    await select.findElement(By.xpath("//li[contains(@id,'system-2')]")).click();
  }

  // ===== helper to map field name -> By (Java: getBy(String name)) =====
  getBy(name) {
    let by = null;

    switch (name) {
      case 'header':
        by = this.header;
        break;
      case 'system':
        by = this.system;
        break;
      case 'userNameField':
        by = this.userNameField;
        break;
      case 'passwordField':
        by = this.passwordField;
        break;
      case 'loginButton':
        by = this.loginButton;
        break;
      case 'acText':
        by = this.acText;
        break;
      case 'errorMessage':
        by = this.errorMessage;
        break;
      default:
        console.log(`Unknown locator name: ${name}`);
    }

    return by;
  }

  // ===== method: attempt login with given credentials (Java: enterCredentialsLogin) =====
  async enterCredentialsAndLogin(...args) {
    // supports either (username, password) OR (systemName, username, password)
    let systemName = null;
    let username;
    let password;

    if (args.length === 3) {
      [systemName, username, password] = args;
    } else if (args.length === 2) {
      [username, password] = args;
    } else {
      throw new Error('enterCredentialsAndLogin expects 2 or 3 arguments');
    }

    console.log(`Attempting login with system=${systemName}, username=${username}`);

    // if a system selector was provided, try to set it but skip if not interactable
    // if (systemName != null) {
    //   try {
    //     await this.driver.wait(until.elementLocated(this.system), 5000);
    //     const sysEl = await this.driver.findElement(this.system);
    //     const isDisplayed = await sysEl.isDisplayed().catch(() => false);
    //     const isEnabled = await sysEl.isEnabled().catch(() => false);
    //     if (isDisplayed && isEnabled) {
    //       await sysEl.sendKeys(String(systemName));
    //     } else {
    //       console.warn('System selector found but not interactable; skipping setting system');
    //     }
    //   } catch (e) {
    //     console.warn('System selector not present or could not be set:', e.message);
    //   }
    // }

    if (!username) throw new Error('username is required');
    if (!password) throw new Error('password is required');

    await this.driver.wait(until.elementLocated(this.userNameField), 20000);
    const userEl = await this.driver.findElement(this.userNameField);
    await userEl.clear();
    await userEl.sendKeys(String(username));

    await this.driver.wait(until.elementLocated(this.passwordField), 20000);
    const passEl = await this.driver.findElement(this.passwordField);
    await passEl.clear();
    await passEl.sendKeys(String(password));

    await this.driver.wait(until.elementLocated(this.loginButton), 10000);
    await this.driver.findElement(this.loginButton).click();
    // after clicking login, wait for either logout (successful login) or an error message
    try {
      await this.driver.wait(until.elementLocated(this.acText), 15000);
      console.log('ActiveControl text detected - login likely successful');
    } catch (e) {
      console.warn('ActiveControl text not found after login click; checking for error message');
      try {
        await this.driver.wait(until.elementLocated(this.errorMessage), 5000);
        console.warn('Login error message detected');
      } catch (e2) {
        console.warn('Neither logout nor error message detected after login click');
      }
    }
  }

  // ===== method: isOnPage() (Java: isOnPage) =====
  async isOnPage() {
    try {
      // first try the header
      await this.driver.wait(until.elementLocated(this.header), 20000);
      return true;
    } catch (e1) {
      // fallback: look for username field which is a reliable indicator of the login panel
      try {
        await this.driver.wait(until.elementLocated(this.userNameField), 20000);
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  // ===== method: getLoginErrorMsg() (Java: getLoginMsgError) =====
  async getLoginErrorMessage() {
    await this.driver.wait(until.elementLocated(this.errorMessage), 10000);
    const el = await this.driver.findElement(this.errorMessage);
    return await el.getText();
  }
}

module.exports = LoginPage;