module.exports = (reporter, definition) => {
  // change the rendered template based on the custom property submitted
      console.log('MZW arrived2')
  reporter.beforeRenderListeners.add('custom', (req, res) => {
    // do it just for the main content, not for the headers or child templates
    if (!req.context.isChildRequest) {
      req.template.content = `Custom content added: ${req.template.custom} ${req.template.content}`
    }
  })
}