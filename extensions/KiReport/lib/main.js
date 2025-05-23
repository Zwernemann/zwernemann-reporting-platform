// ./lib/main.js
require('dotenv').config(); // Am Anfang der Datei
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Stelle sicher, dass dieser Import funktioniert
const Busboy = require('busboy');

// Dein API-Key und Gemini Client Initialisierung
// Diese können außerhalb des reporter.on(...) Blocks bleiben, da sie nicht von 'app' abhängen.
console.log("KIReport Extension: CWD (Current Working Directory):", process.cwd());
console.log("KIReport Extension: GEMINI_API_KEY_KIREPORT from process.env after config:", process.env.GEMINI_API_KEY_KIREPORT);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY_KIREPORT || "NOTFOUND_IN_MAIN_JS";
console.log("KIReport Extension: Final GEMINI_API_KEY value:", GEMINI_API_KEY);
let genAI;
let model;

try {
  console.log("KIReport Extension: Folgender API-Key wird genutzt");
  console.log(GEMINI_API_KEY)
    // Stelle sicher, dass GoogleGenerativeAI ein Konstruktor ist
    if (typeof GoogleGenerativeAI !== 'function') {
        // Versuche den Default-Export, falls der benannte Import nicht klappt (häufig bei ES Modulen in CommonJS)
        const GenAIModule = require('@google/generative-ai');
        if (GenAIModule && typeof GenAIModule.GoogleGenerativeAI === 'function') {
            genAI = new GenAIModule.GoogleGenerativeAI(GEMINI_API_KEY);
        } else if (GenAIModule && GenAIModule.default && typeof GenAIModule.default === 'function') {
            // Manchmal ist der Konstruktor der Default-Export selbst
            genAI = new GenAIModule.default(GEMINI_API_KEY);
        } else if (GenAIModule && GenAIModule.default && typeof GenAIModule.default.GoogleGenerativeAI === 'function') {
            // Oder der Konstruktor ist eine Eigenschaft des Default-Exports
            genAI = new GenAIModule.default.GoogleGenerativeAI(GEMINI_API_KEY);
        } else {
            throw new Error('GoogleGenerativeAI constructor could not be loaded correctly.');
        }
    } else {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    //model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("KIReport Extension: Gemini AI Client initialized successfully.");
} catch (e) {
    console.error("KIReport Extension: FATAL ERROR initializing Gemini AI Client -", e);
    // Du könntest hier entscheiden, die Extension nicht weiter zu laden oder einen Fehler zu werfen,
    // damit jsreport den Fehler beim Start anzeigt.
    // throw new Error(`Failed to initialize Gemini AI Client: ${e.message}`);
}


async function callGeminiApi(pdfBuffer, jsonString, additionalPromptText) {
    if (!model) {
        console.error("KIReport Extension: Gemini model not initialized. Cannot call API.");
        return { error: "Gemini model not initialized." };
    }

        // Integriere den zusätzlichen Text in den Prompt
    const userPromptExtension = additionalPromptText ? `\n\nZusätzliche Anweisungen des Benutzers:\n${additionalPromptText}` : "";

   
    const prompt = `
    Ich stelle dir ein PDF-Dokument (als Binärdaten) und eine JSON-Datei (als Text) zur Verfügung.${userPromptExtension}
    Deine Aufgabe ist es, basierend auf diesen Eingaben Code zu generieren, um das im PDF dargestellte Wartungsprotokoll exakt zu replizieren,
    wobei die dynamischen Daten aus der JSON-Datei stammen.

    Bitte liefere drei separate Code-Blöcke:
    1.  Den HTML-Code (als Handlebars-Template).
    2.  Den gesamten CSS-Code, der für das Styling benötigt wird.
    3.  Jeglichen notwendigen clientseitigen JavaScript-Code (z.B. für Handlebars-Helper oder dynamische Interaktionen, falls erforderlich. Wenn kein JavaScript benötigt wird, liefere einen leeren Block oder einen Kommentar).

    **Output-Formatierung:**
    Bitte gib den Inhalt für jeden Code-Teil in einem separaten, klar markierten Block zurück. Verwende folgende Markierungen:

    --- START OF HANDLEBARS ---
    [Hier der Inhalt für das Handlebars-Template]
    --- END OF HANDLEBARS ---

    --- START OF CSS ---
    [Hier der gesamte CSS-Code]
    --- END OF CSS ---

    --- START OF JAVASCRIPT ---
    [Hier der JavaScript-Code oder ein Kommentar, falls nicht benötigt]
    --- END OF JAVASCRIPT ---

    Stelle sicher, dass das Handlebars-Template auf das CSS und ggf. das JavaScript verweist oder so strukturiert ist, dass sie zusammen funktionieren (z.B. CSS im <style>-Tag oder als separate Datei verlinkt, JavaScript am Ende des Bodys oder als separate Datei verlinkt). Für die getrennte Darstellung ist es am besten, wenn das CSS und JS so geschrieben sind, als wären sie in separaten Dateien.

    Eingabe-JSON:
    \`\`\`json
    ${jsonString}
    \`\`\`
    Das PDF wird als nächster Teil der Anfrage gesendet.
    `;

    try {
        console.log("KIReport Extension: Sending request to Gemini API with structured output request...");
        const result = await model.generateContent([
            prompt, // Der aktualisierte Prompt
            { inlineData: { data: pdfBuffer.toString('base64'), mimeType: 'application/pdf' } }
        ]);
        const response = result.response;
        const rawGeneratedText = response.text();
        console.log("KIReport Extension: Received raw response from Gemini API.");

        // Parse die Antwort, um die drei Teile zu extrahieren
        const handlebarsMatch = rawGeneratedText.match(/--- START OF HANDLEBARS ---\s*([\s\S]*?)\s*--- END OF HANDLEBARS ---/);
        const cssMatch = rawGeneratedText.match(/--- START OF CSS ---\s*([\s\S]*?)\s*--- END OF CSS ---/);
        const javascriptMatch = rawGeneratedText.match(/--- START OF JAVASCRIPT ---\s*([\s\S]*?)\s*--- END OF JAVASCRIPT ---/);

        const handlebarsTemplate = handlebarsMatch ? handlebarsMatch[1].trim() : "Konnte Handlebars-Template nicht extrahieren.";
        const cssCode = cssMatch ? cssMatch[1].trim() : "Konnte CSS-Code nicht extrahieren.";
        const javascriptCode = javascriptMatch ? javascriptMatch[1].trim() : "// Kein JavaScript-Code extrahiert oder generiert.";

        return {
            template: handlebarsTemplate,
            css: cssCode,
            javascript: javascriptCode
        };

    } catch (error) {
        
        return { error: `Gemini API Fehler: ${error.message || error.toString()}`, template: null, css: null, javascript: null };
    }
}

module.exports = (reporter, definition) => {
    console.log(`KIReport Extension '${definition.name}' main.js - module export started.`);

    // Warte auf das 'express-configure' Event, um die Express App Instanz zu bekommen
    reporter.on('express-configure', (app) => {
        console.log("KIReport Extension: 'express-configure' event received. Registering route...");

        app.post('/api/mzw-kireport/generate-template', (req, res, next) => {
            console.log("KIReport Extension: /api/mzw-kireport/generate-template endpoint hit.");

            if (!model) { // Überprüfe erneut, ob das Model initialisiert wurde
                console.error("KIReport Extension: Gemini model not available for POST request.");
                return res.status(500).json({ error: 'Gemini Service nicht initialisiert.' });
            }

            const fields = {};
            const filePromises = [];
            const busboy = Busboy({ headers: req.headers }); // Busboy hier für jeden Request neu initialisieren

            busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
                console.log(`KIReport Extension: Receiving file [${fieldname}]: ${filename}, ${mimeType}`);
                const chunks = [];
                filePromises.push(
                    new Promise((resolveFile, rejectFile) => {
                        file.on('data', (data) => chunks.push(data));
                        file.on('end', () => {
                            fields[fieldname] = Buffer.concat(chunks);
                            console.log(`KIReport Extension: File [${fieldname}] received successfully.`);
                            resolveFile();
                        });
                        file.on('error', (err) => {
                            console.error(`KIReport Extension: Error receiving file [${fieldname}]:`, err);
                            rejectFile(err);
                        });
                    })
                );
            });

            busboy.on('field', (fieldname, val) => { // Hinzufügen, um Textfelder zu parsen
              console.log(`KIReport Extension: Receiving field [${fieldname}]: ${val.substring(0, 50)}...`);
              fields[fieldname] = val;
            });

            busboy.on('finish', async () => {
                try {
                    await Promise.all(filePromises); // Warte auf alle Datei-Uploads

                    // Überprüfe Textfelder und Dateien
                    if (!fields.pdfBuffer || !fields.jsonString) { // Namen müssen konsistent sein
                        // Korrektur: Felder werden anders benannt, nachdem sie als Buffer/String verarbeitet wurden.
                        // Wir prüfen die ursprünglichen Felder, die Busboy setzt, oder die verarbeiteten.
                        // Hier nehmen wir an, dass die Buffer/Strings später gesetzt werden.
                    }


                    // Holen der Daten, die von Busboy geparst wurden
                    const pdfFileBuffer = fields.pdf; // Buffer von 'pdf' Datei-Feld
                    const jsonFileContent = fields.json ? fields.json.toString('utf-8') : null; // String von 'json' Datei-Feld
                    const userAdditionalPrompt = fields.additionalPrompt || ""; // Text von 'additionalPrompt' Feld

                    if (!pdfFileBuffer || !jsonFileContent) {
                        console.warn("KIReport Extension: PDF and/or JSON file content missing in request.");
                        return res.status(400).json({ error: 'PDF und JSON Dateien sind erforderlich.' });
                    }

                    // Rufe callGeminiApi mit dem zusätzlichen Prompt-Text auf
                    const result = await callGeminiApi(pdfFileBuffer, jsonFileContent, userAdditionalPrompt);

                    if (result.error) {
                        return res.status(500).json(result);
                    }
                    return res.status(200).json(result); // Sendet { template, css, javascript }

                } catch (error) {
                    console.error('KIReport Extension: Error processing request in busboy finish:', error);
                    reporter.logger.error(`KIReport Extension: Busboy finish processing error - ${error.stack || error.message}`); // Logge den Fehler
                    // Stelle sicher, dass immer eine Antwort gesendet wird, auch im Fehlerfall
                    if (!res.headersSent) { // Prüfe, ob nicht schon eine Antwort gesendet wurde
                        return res.status(500).json({ error: `Interner Serverfehler beim Verarbeiten der Anfrage: ${error.message || error.toString()}` });
                    }
                }
            });

            busboy.on('error', (err) => {
                console.error('KIReport Extension: Busboy parsing error:', err);
                reporter.logger.error(`KIReport Extension: Busboy parsing error - ${err.stack || err.message}`);
                return res.status(400).json({ error: `Fehler beim Parsen der Formulardaten: ${err.message || err.toString()}` });
            });

            req.pipe(busboy);
        });

        console.log("KIReport Extension: Route /api/mzw-kireport/generate-template registered on app.");
    });

    // Andere Initialisierungen für deine Extension können hier erfolgen
    // z.B. reporter.initializeListeners.add(...)
    // oder reporter.beforeRenderListeners.add(...)

    console.log(`KIReport Extension '${definition.name}' main.js - module export finished.`);
};