const jsreport = require('jsreport');

jsreport({
  configFile: './config/jsreport.config.json',
  extensions: {
    express: {
      app: undefined,
      server: undefined
    }
  }
})
  .init()
  .then((reporter) => {
    console.log('jsreport gestartet...');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
