const fs = require('fs');
const path = require('path');
const reporter = require('cucumber-html-reporter');

const reportsDir = path.resolve(__dirname, '..', 'reports');
const latestJson = path.join(reportsDir, 'latest.json');

(async function main() {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    if (!fs.existsSync(latestJson)) {
      console.error('No JSON report found at', latestJson);
      process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const historyDir = path.join(reportsDir, 'history');
    if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

    const archived = path.join(historyDir, `report-${timestamp}.json`);
    fs.copyFileSync(latestJson, archived);

    const reportHtml = path.join(reportsDir, `report-${timestamp}.html`);
    const config = {
      theme: 'bootstrap',
      jsonFile: latestJson,
      output: reportHtml,
      reportSuiteAsScenarios: true,
      launchReport: false,
      metadata: {
        'Test Environment': process.env.NODE_ENV || 'dev',
        'Run Timestamp': timestamp,
      },
    };

    reporter.generate(config);
    // also update a stable report file
    const stableReport = path.join(reportsDir, 'report.html');
    fs.copyFileSync(reportHtml, stableReport);

    console.log('Generated report:', reportHtml);
    console.log('Stable report updated at:', stableReport);
  } catch (e) {
    console.error('Failed to generate report:', e && e.message);
    process.exit(2);
  }
})();
