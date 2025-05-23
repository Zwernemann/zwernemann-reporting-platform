module.exports = {
  name: 'mzw_kireport',
  main: './lib/main.js',
  worker: './lib/worker.js',
  requires: {
    core: '4.x.x',
    studio: '4.x.x'
  },
  dependencies: ["express"]
}