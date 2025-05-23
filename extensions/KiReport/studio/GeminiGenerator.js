import React, { useState, useEffect } from 'react';
import Studio from 'jsreport-studio'; // jsreport Studio API

const CodeDisplay = ({ title, code, language }) => {
    if (!code && language !== 'handlebars') return null; // Nur Handlebars immer anzeigen, auch wenn leer (oder Fehlermeldung)
    if (!code && language === 'handlebars') code = "// Kein Handlebars-Code generiert oder Fehler beim Extrahieren.";


    return (
        <div style={{ marginTop: '20px' }}>
            <h3>{title}:</h3>
            <pre style={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                padding: '10px',
                maxHeight: '300px', // Höhe angepasst
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
            }}>
                <code>{code}</code>
            </pre>
        </div>
    );
};

const GeminiGenerator = (props) => {
    const [pdfFile, setPdfFile] = useState(null);
    const [jsonFile, setJsonFile] = useState(null);
    const [additionalPrompt, setAdditionalPrompt] = useState(''); // Neuer State für zusätzlichen Prompt-Text

    const [generatedHandlebars, setGeneratedHandlebars] = useState('');
    const [generatedCss, setGeneratedCss] = useState('');
    const [generatedJs, setGeneratedJs] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePdfChange = (event) => setPdfFile(event.target.files[0]);
    const handleJsonChange = (event) => setJsonFile(event.target.files[0]);
    const handleAdditionalPromptChange = (event) => setAdditionalPrompt(event.target.value);

    const handleSubmit = async () => {
        if (!pdfFile || !jsonFile) {
            setError('Bitte laden Sie sowohl eine PDF- als auch eine JSON-Datei hoch.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedHandlebars('');
        setGeneratedCss('');
        setGeneratedJs('');

        const formData = new FormData();
        formData.append('pdf', pdfFile);
        formData.append('json', jsonFile);
        formData.append('additionalPrompt', additionalPrompt); // Zusätzlichen Prompt-Text hinzufügen

        try {
            const response = await fetch(Studio.resolveUrl('/api/mzw-kireport/generate-template'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); }
                catch (e) { errorData = { message: `Serverfehler: ${response.status} ${response.statusText}` }; }
                throw new Error(errorData.message || errorData.error || `Serverfehler: ${response.status}`);
            }

            const result = await response.json();
            if (result.template || result.css || result.javascript) {
                setGeneratedHandlebars(result.template || "// Kein Handlebars generiert");
                setGeneratedCss(result.css || "// Kein CSS generiert");
                setGeneratedJs(result.javascript || "// Kein JavaScript generiert");
            } else if (result.error) {
                setError(result.error);
            } else {
                setError('Unbekannter Fehler oder leere Antwort vom Server.');
            }
        } catch (err) {
            console.error("Fehler beim Senden an den Server:", err);
            setError(`Fehler: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='custom-extension' style={{ padding: '20px', overflow: 'auto', height: 'auto' }}>
            <h2>Handlebars, CSS & JS mit Gemini AI generieren</h2>
            <p>Laden Sie ein PDF und eine JSON-Datei hoch. Geben Sie optional zusätzliche Anweisungen für den Prompt ein.</p>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="pdfFile" style={{ marginRight: '10px', display: 'block' }}>PDF-Datei:</label>
                <input type="file" id="pdfFile" accept=".pdf" onChange={handlePdfChange} />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="jsonFile" style={{ marginRight: '10px', display: 'block' }}>JSON-Datei:</label>
                <input type="file" id="jsonFile" accept=".json" onChange={handleJsonChange} />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="additionalPrompt" style={{ marginRight: '10px', display: 'block' }}>Zusätzliche Prompt-Anweisungen (optional):</label>
                <textarea
                    id="additionalPrompt"
                    value={additionalPrompt}
                    onChange={handleAdditionalPromptChange}
                    placeholder="z.B. Achte besonders auf responsive Design..."
                    rows={3}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                />
            </div>

            <button onClick={handleSubmit} disabled={isLoading || !pdfFile || !jsonFile}>
                {isLoading ? 'Generiere...' : 'Code generieren'}
            </button>

            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

            <CodeDisplay title="Generiertes Handlebars-Template" code={generatedHandlebars} language="handlebars" />
            <CodeDisplay title="Generierter CSS-Code" code={generatedCss} language="css" />
            <CodeDisplay title="Generierter JavaScript-Code" code={generatedJs} language="javascript" />
        </div>
    );
};

export default GeminiGenerator;