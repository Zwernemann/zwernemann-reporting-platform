// generate-template-with-gemini.js (jsreport Script Asset)

// Wichtig: Installiere diese Pakete im Root deines jsreport-Projekts
// npm install @google/generative-ai form-data
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises; // Für das Lesen der temporären Dateien
const path = require('path');
const os = require('os');
const Busboy = require('busboy'); // Zum Parsen von multipart/form-data

// Deine Konfiguration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "DEIN_GEMINI_API_KEY"; // API-Key sicher verwalten!

// Initialisiere den Gemini Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); // Oder gemini-pro

async function generateTemplate(pdfBuffer, jsonString) {
    const prompt = `
    Ich stelle dir ein PDF-Dokument (als Binärdaten) und eine JSON-Datei (als Text) zur Verfügung.
    Deine Aufgabe ist es, basierend auf diesen Eingaben ein Handlebars-Template zu generieren.
    Das Handlebars-Template soll verwendet werden, um das im PDF dargestellte Wartungsprotokoll exakt zu replizieren,
    wobei die dynamischen Daten aus der JSON-Datei stammen.

    **Anforderungen an das Handlebars-Template:**
    - Exakte Replikation des PDF-Layouts, der Farben und der Struktur.
    - Implementiere Handlebars-Logik für Schleifen (Tabellen) und bedingte Anzeigen (Checkboxen, Label-Logik basierend auf 'Label*' Feldern im JSON).
    - Das CSS-Styling sollte direkt im Handlebars-Template innerhalb eines <style>-Tags enthalten sein, um die Portabilität zu maximieren,
      oder gib Anweisungen, wie das CSS idealerweise strukturiert sein sollte, wenn es ausgelagert würde.
      Für dieses jsreport-Szenario ist inline CSS im Template wahrscheinlich am einfachsten für die direkte Vorschau.
    - Notwendige Handlebars-Helper (wie ifEquals, formatPlzOrt) sollten als Kommentare im Template vorgeschlagen werden,
      da sie in jsreport separat registriert werden müssen.

    **Output-Formatierung:**
    Bitte gib NUR den reinen Handlebars-Code zurück. Keine zusätzlichen Erklärungen oder Markierungen wie "--- START ---".

    **Eingabe-JSON:**
    \`\`\`json
    ${jsonString}
    \`\`\`

    Das PDF wird als nächster Teil der Anfrage gesendet.
    Konzentriere dich darauf, ein vollständiges, funktionierendes Handlebars-Template zu erstellen.
    `;

    try {
        console.log("Sende Anfrage an Gemini API...");
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: pdfBuffer.toString('base64'), mimeType: 'application/pdf' } }
        ]);
        const response = result.response;
        const handlebarsTemplate = response.text();
        console.log("Antwort von Gemini API erhalten.");
        return { template: handlebarsTemplate };
    } catch (error) {
        console.error("Gemini API Fehler:", error);
        return { error: `Gemini API Fehler: ${error.message}` };
    }
}


// Hauptfunktion, die von jsreport aufgerufen wird, wenn die Route /api/custom-scripts/generate-template-with-gemini aufgerufen wird
// Diese Funktion muss die HTTP-Anfrage parsen, da jsreport Skripte direkt keine Middleware wie multer haben.
async function beforeRender(req, res) {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
        return;
    }

    return new Promise((resolve, reject) => {
        const fields = {};
        const filePromises = [];

        const busboy = Busboy({ headers: req.headers });

        busboy.on('file', (fieldname, file, MimeType) => {
            const chunks = [];
            const promise = new Promise((resolveFile, rejectFile) => {
                file.on('data', (data) => {
                    chunks.push(data);
                });
                file.on('end', () => {
                    fields[fieldname] = Buffer.concat(chunks);
                    resolveFile();
                });
                file.on('error', rejectFile);
            });
            filePromises.push(promise);
        });

        busboy.on('field', (fieldname, val) => {
            // Nützlich, falls neben Dateien noch andere Felder gesendet werden
            // In diesem Fall nicht, da wir nur Dateien senden
        });

        busboy.on('finish', async () => {
            try {
                await Promise.all(filePromises);

                if (!fields.pdf || !fields.json) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'PDF und JSON Dateien sind erforderlich.' }));
                    return resolve(); // Wichtig: Promise auflösen, damit jsreport nicht hängt
                }

                const pdfBuffer = fields.pdf;
                const jsonString = fields.json.toString('utf-8');

                const result = await generateTemplate(pdfBuffer, jsonString);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
                resolve(); // Wichtig: Promise auflösen
            } catch (error) {
                console.error('Fehler in beforeRender (Busboy finish):', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Interner Serverfehler: ${error.message}` }));
                resolve(); // Wichtig: Promise auflösen
            }
        });

        busboy.on('error', (err) => {
            console.error('Busboy Fehler:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Fehler beim Parsen der Formulardaten.' }));
            reject(err); // Promise ablehnen
        });

        req.pipe(busboy);
    });
}

// Wichtig: jsreport erwartet, dass das Skript `beforeRender` (oder andere Lifecycle-Funktionen) exportiert.
// Da wir die Anfrage direkt bearbeiten und nicht wirklich rendern, ist dies ein Weg,
// um eine benutzerdefinierte HTTP-Route zu erstellen.
// Eine "sauberere" Methode wäre eine jsreport Custom Extension, die eine eigene Express-Route registriert.
// Für ein Skript-Asset ist dieser Ansatz jedoch gangbar.
// Stelle sicher, dass das Skript nicht als Teil eines normalen Template-Renderings ausgeführt wird,
// es sei denn, das ist beabsichtigt.
// Wenn du es nur als API-Endpunkt willst, könntest du es als "globales Skript" ohne Template-Zuordnung anlegen.

// Damit das Skript über /api/custom-scripts/... aufgerufen werden kann,
// muss es in jsreport entsprechend konfiguriert sein (z.B. als Asset mit einem Namen).
// Der Name des Assets wird Teil der URL.
// Wenn das Skript z.B. den Namen "geminiTemplateGeneratorScript" hat, wäre die URL
// /api/custom-scripts/geminiTemplateGeneratorScript
// Passe den fetch-Aufruf in der React-Komponente entsprechend an.