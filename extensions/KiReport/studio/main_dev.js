// main_dev.js
import Studio from 'jsreport-studio';
import GeminiGenerator from './GeminiGenerator'; // Stelle sicher, dass dieser Pfad korrekt ist

console.log('KIReports Extension script parsing and initializing...');

// Definiere deine Properties-Komponente (diese hat ja funktioniert)
const CustomTemplateProperties = (props) => (
  <div className='properties-section'>
    <div className='form-group'>
      <label>Custom Property (KIReports)</label>
      <input
        type='text'
        placeholder='a custom string for template'
        value={props.entity.customKIField} // Verwende einen eindeutigen Feldnamen
        onChange={(v) => props.onChange({ ...props.entity,  customKIField: v.target.value })}
      />
    </div>
  </div>
);

// 1. Registriere deine funktionierende Properties-Komponente
Studio.addPropertiesComponent('KIReportsCustomProps', CustomTemplateProperties, (entity) => entity.__entitySet === 'templates');
console.log('KIReports CustomTemplateProperties registered.');

// 2. Registriere den GeminiGenerator als Editor-Komponente
// Dies macht ihn verfügbar, um in einem Tab geöffnet zu werden.
Studio.addEditorComponent('GeminiGeneratorTool', GeminiGenerator);
console.log('KIReports GeminiGeneratorTool registered as editor component.');

// 3. Füge einen Button zur Toolbar hinzu, um den GeminiGenerator zu öffnen,
//    analog zum funktionierenden Beispiel in der 'settings' Location.
Studio.addToolbarComponent((props) => ( // props wird von Studio übergeben, enthält ggf. closeMenu
  <div
    className='toolbar-button'
    onClick={() => {
      console.log('Gemini Generator button clicked, opening tab...');
      Studio.openTab({
        key: "mzw_kiReport", 
        editorComponentKey: 'GeminiGeneratorTool', // Muss mit dem oben registrierten Key übereinstimmen
        title: 'Gemini Template Generator',
      });
      // Wenn der Button in einem Menü ist, das sich schließen soll:
      if (props && typeof props.closeMenu === 'function') {
        props.closeMenu();
      }
    }}
    title='Öffnet den Gemini Template Generator' // Tooltip für den Button
  >
    <i className='fa fa-cogs' /> {/* Beispiel Icon */}
    <span> Gemini Gen</span> {/* Kurzer Text für den Button */}
  </div>
), 'settings'); // *** VERWENDE 'settings' ALS LOCATION ***

console.log("KIReports Gemini Generator Toolbar button added to 'settings'.");

// Listener
Studio.initializeListeners.push(async () => {
  console.log('KIReports Studio initialize listener triggered.');
});

Studio.readyListeners.push(async () => {
  console.log('KIReports Studio ready listener triggered.');
  // Das Modal beim Start kann zum Testen nützlich sein, aber später entfernen.
  // Studio.openModal(() => <h1>KIReports Extension Loaded!</h1>);
});

console.log('KIReports Extension script fully parsed and initialized.');