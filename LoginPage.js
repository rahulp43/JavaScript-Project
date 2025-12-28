// LoginPage.js
const { By, until } = require('selenium-webdriver');

class LoginPage {
  /**
   * @param {WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    // Java: private By header = By.xpath("...");
    this.header = By.xpath("//h1[contains(text(),'Login')]");
    this.system = By.xpath("//select[@id='system']");
    this.userNameField = By.xpath("//input[@id='username']");
    this.passwordField = By.xpath("//input[@id='password']");
    this.loginButton = By.xpath("//button[@id='login']");
    this.logoutButton = By.xpath("//a[@id='logout']");
    this.errorMessage = By.css(".login-error"); // adjust to your real locator

    // add other By locators from the Java file similarly
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
      case 'logoutButton':
        by = this.logoutButton;
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
  async enterCredentialsAndLogin(systemName, username, password) {
    console.log(
      `Attempting login with system=${systemName}, username=${username}`
    );

    await this.driver.wait(until.elementLocated(this.system), 20000);
    await this.driver.findElement(this.system).sendKeys(systemName);

    await this.driver.findElement(this.userNameField).clear();
    await this.driver.findElement(this.userNameField).sendKeys(username);

    await this.driver.findElement(this.passwordField).clear();
    await this.driver.findElement(this.passwordField).sendKeys(password);

    await this.driver.findElement(this.loginButton).click();
  }

  // ===== method: isOnPage() (Java: isOnPage) =====
  async isOnPage() {
    try {
      // first try the header
      await this.driver.wait(until.elementLocated(this.header), 8000);
      return true;
    } catch (e1) {
      // fallback: look for username field which is a reliable indicator of the login panel
      try {
        await this.driver.wait(until.elementLocated(this.userNameField), 8000);
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  // ===== method: getLoginErrorMsg() (Java: getLoginMsgError) =====
  async getLoginErrorMessage() {
    const el = await this.driver.findElement(this.errorMessage);
    return el.getText();
  }
}

module.exports = LoginPage;