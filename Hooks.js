const TestBase = require('./TestBase');

class Hooks {
    
    constructor() {
    	this.testBase = new TestBase();
    }

    async beforeAll() {
    	console.log("BeforeAll Hook Method Running....");
    }
    
    async setUp()
    {
      console.log("Before Hook Method Running....");
      const browser = process.env.browser || 'chrome';
      //url is set on cmd-line
      // await this.testBase.browserInitialization(process.env.BASE_URL);
    }
    
    async tearDown(scenario)
    {
    	console.log("After Hook Method Running...."); 
    	if (scenario && scenario.failed()) {
                 if (typeof scenario.attach === 'function') {
                        try {
                            const screenshot = await this.testBase.captureBase64Screenshot();
                            await scenario.attach(Buffer.from(screenshot, 'base64'), 'image/png');
                        } catch (e) {
                            console.warn('Failed to capture or attach screenshot:', e.message);
                        }
                 }
        }
    
        await this.testBase.closeBrowser();
      
    }
    
    async afterAll()
    {
    	console.log("AfterAll Hook Method Running...");
    }
    
    async afterStep(scenario) {
        console.log("AfterStep Hook Method running....");
                try {
                    if (typeof scenario.attach === 'function') {
                        const screenshot = await this.testBase.captureBase64Screenshot();
                        await scenario.attach(Buffer.from(screenshot, 'base64'), 'image/png');
                    }
                } catch (e) {
                    console.warn('AfterStep screenshot failed:', e.message);
                }
    }
}

module.exports = Hooks;