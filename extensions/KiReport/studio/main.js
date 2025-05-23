/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module) => {

module.exports = Studio;

/***/ }),
/* 1 */,
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jsreport_studio__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
/* harmony import */ var jsreport_studio__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jsreport_studio__WEBPACK_IMPORTED_MODULE_1__);

 // jsreport Studio API

const CodeDisplay = _ref => {
  let {
    title,
    code,
    language
  } = _ref;
  if (!code && language !== 'handlebars') return null; // Nur Handlebars immer anzeigen, auch wenn leer (oder Fehlermeldung)
  if (!code && language === 'handlebars') code = "// Kein Handlebars-Code generiert oder Fehler beim Extrahieren.";
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginTop: '20px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", null, title, ":"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("pre", {
    style: {
      backgroundColor: '#f5f5f5',
      border: '1px solid #ccc',
      padding: '10px',
      maxHeight: '300px',
      // Höhe angepasst
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, code)));
};
const GeminiGenerator = props => {
  const [pdfFile, setPdfFile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [jsonFile, setJsonFile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [additionalPrompt, setAdditionalPrompt] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''); // Neuer State für zusätzlichen Prompt-Text

  const [generatedHandlebars, setGeneratedHandlebars] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [generatedCss, setGeneratedCss] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [generatedJs, setGeneratedJs] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const handlePdfChange = event => setPdfFile(event.target.files[0]);
  const handleJsonChange = event => setJsonFile(event.target.files[0]);
  const handleAdditionalPromptChange = event => setAdditionalPrompt(event.target.value);
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
      const response = await fetch(jsreport_studio__WEBPACK_IMPORTED_MODULE_1___default().resolveUrl('/api/mzw-kireport/generate-template'), {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            message: `Serverfehler: ${response.status} ${response.statusText}`
          };
        }
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "custom-extension",
    style: {
      padding: '20px',
      overflow: 'auto',
      height: 'auto'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", null, "Handlebars, CSS & JS mit Gemini AI generieren"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Laden Sie ein PDF und eine JSON-Datei hoch. Geben Sie optional zus\xE4tzliche Anweisungen f\xFCr den Prompt ein."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    htmlFor: "pdfFile",
    style: {
      marginRight: '10px',
      display: 'block'
    }
  }, "PDF-Datei:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "file",
    id: "pdfFile",
    accept: ".pdf",
    onChange: handlePdfChange
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    htmlFor: "jsonFile",
    style: {
      marginRight: '10px',
      display: 'block'
    }
  }, "JSON-Datei:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "file",
    id: "jsonFile",
    accept: ".json",
    onChange: handleJsonChange
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    htmlFor: "additionalPrompt",
    style: {
      marginRight: '10px',
      display: 'block'
    }
  }, "Zus\xE4tzliche Prompt-Anweisungen (optional):"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("textarea", {
    id: "additionalPrompt",
    value: additionalPrompt,
    onChange: handleAdditionalPromptChange,
    placeholder: "z.B. Achte besonders auf responsive Design...",
    rows: 3,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '8px'
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: handleSubmit,
    disabled: isLoading || !pdfFile || !jsonFile
  }, isLoading ? 'Generiere...' : 'Code generieren'), error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      color: 'red',
      marginTop: '15px'
    }
  }, error), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(CodeDisplay, {
    title: "Generiertes Handlebars-Template",
    code: generatedHandlebars,
    language: "handlebars"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(CodeDisplay, {
    title: "Generierter CSS-Code",
    code: generatedCss,
    language: "css"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(CodeDisplay, {
    title: "Generierter JavaScript-Code",
    code: generatedJs,
    language: "javascript"
  }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GeminiGenerator);

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = Studio.libraries['react'];

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jsreport_studio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsreport_studio__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _GeminiGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
// main_dev.js

 // Stelle sicher, dass dieser Pfad korrekt ist

console.log('KIReports Extension script parsing and initializing...');

// Definiere deine Properties-Komponente (diese hat ja funktioniert)
const CustomTemplateProperties = props => /*#__PURE__*/React.createElement("div", {
  className: "properties-section"
}, /*#__PURE__*/React.createElement("div", {
  className: "form-group"
}, /*#__PURE__*/React.createElement("label", null, "Custom Property (KIReports)"), /*#__PURE__*/React.createElement("input", {
  type: "text",
  placeholder: "a custom string for template",
  value: props.entity.customKIField // Verwende einen eindeutigen Feldnamen
  ,
  onChange: v => props.onChange({
    ...props.entity,
    customKIField: v.target.value
  })
})));

// 1. Registriere deine funktionierende Properties-Komponente
jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default().addPropertiesComponent('KIReportsCustomProps', CustomTemplateProperties, entity => entity.__entitySet === 'templates');
console.log('KIReports CustomTemplateProperties registered.');

// 2. Registriere den GeminiGenerator als Editor-Komponente
// Dies macht ihn verfügbar, um in einem Tab geöffnet zu werden.
jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default().addEditorComponent('GeminiGeneratorTool', _GeminiGenerator__WEBPACK_IMPORTED_MODULE_1__["default"]);
console.log('KIReports GeminiGeneratorTool registered as editor component.');

// 3. Füge einen Button zur Toolbar hinzu, um den GeminiGenerator zu öffnen,
//    analog zum funktionierenden Beispiel in der 'settings' Location.
jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default().addToolbarComponent(props =>
/*#__PURE__*/
// props wird von Studio übergeben, enthält ggf. closeMenu
React.createElement("div", {
  className: "toolbar-button",
  onClick: () => {
    console.log('Gemini Generator button clicked, opening tab...');
    jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default().openTab({
      key: "mzw_kiReport",
      editorComponentKey: 'GeminiGeneratorTool',
      // Muss mit dem oben registrierten Key übereinstimmen
      title: 'Gemini Template Generator'
    });
    // Wenn der Button in einem Menü ist, das sich schließen soll:
    if (props && typeof props.closeMenu === 'function') {
      props.closeMenu();
    }
  },
  title: "\xD6ffnet den Gemini Template Generator" // Tooltip für den Button
}, /*#__PURE__*/React.createElement("i", {
  className: "fa fa-cogs"
}), " ", /*#__PURE__*/React.createElement("span", null, " Gemini Gen"), " "), 'settings'); // *** VERWENDE 'settings' ALS LOCATION ***

console.log("KIReports Gemini Generator Toolbar button added to 'settings'.");

// Listener
jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default().initializeListeners.push(async () => {
  console.log('KIReports Studio initialize listener triggered.');
});
jsreport_studio__WEBPACK_IMPORTED_MODULE_0___default().readyListeners.push(async () => {
  console.log('KIReports Studio ready listener triggered.');
  // Das Modal beim Start kann zum Testen nützlich sein, aber später entfernen.
  // Studio.openModal(() => <h1>KIReports Extension Loaded!</h1>);
});
console.log('KIReports Extension script fully parsed and initialized.');
})();

/******/ })()
;