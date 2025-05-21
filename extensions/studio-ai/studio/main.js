import Studio from 'jsreport-studio'

const AIPanel = (props) => {
  const [instruction, setInstruction] = React.useState('')

  const sendInstruction = async () => {
    const res = await fetch('/api/ai-edit-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction,
        templateName: props.entity.name
      })
    })
    const result = await res.json()
    alert(result.message || 'Änderung durchgeführt')
  }

  return (
    <div className='properties-section'>
      <div className='form-group'>
        <label>Arbeitsanweisung an die KI</label>
        <textarea
          className='form-control'
          rows='4'
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <button onClick={sendInstruction} style={{ marginTop: '10px' }}>Anwenden</button>
      </div>
    </div>
  )
}

Studio.addPropertiesComponent('ai-panel', AIPanel, (entity) => entity.__entitySet === 'templates')

Studio.readyListeners.push(() => {
  console.log('Studio-AI Extension geladen')
})
