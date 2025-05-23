module.exports = (reporter, definition) => {
  // add new property to templates
    console.log('MZW arrived')
  reporter.documentStore.model.entityTypes.TemplateType.custom = { type: 'Edm.String' }
}