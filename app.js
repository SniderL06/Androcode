// AndroCode App Logic

// Default Project Files
const DEFAULT_PROJECT = {
    "index.html": `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Proyecto AndroCode</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <h1>¡Hola desde AndroCode! ⚡</h1>
        <p>Este es un servidor de pruebas local ejecutándose en tu celular.</p>
        <button id="magic-btn">Presiona aquí</button>
        <p id="msg" class="hidden font-mono">¡JavaScript funcionando perfectamente! 🎉</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,

    "style.css": `body {
    background: linear-gradient(135deg, #0f172a, #1e1b4b);
    color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    max-width: 320px;
}

h1 {
    color: #38bdf8;
    font-size: 1.6rem;
    margin-top: 0;
}

button {
    background: #a855f7;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;
}

button:active {
    transform: scale(0.95);
}

.font-mono {
    font-family: monospace;
    color: #4ade80;
    margin-top: 15px;
}

.hidden {
    display: none;
}`,

    "script.js": `// Comportamiento del botón mágico
document.getElementById('magic-btn').addEventListener('click', () => {
    const msg = document.getElementById('msg');
    msg.classList.toggle('hidden');
});`,

    "suma.py": `# Programa simple en Python
def saludar(nombre):
    print(f"¡Hola, {nombre}! Bienvenido a AndroCode Python.")

def sumar(a, b):
    return a + b

saludar("Programador Android")
num1 = 15
num2 = 27
resultado = sumar(num1, num2)
print(f"La suma de {num1} + {num2} es: {resultado}")
`,

    "readme.md": `# AndroCode IDE 🚀

¡Bienvenido a **AndroCode**, tu entorno de programación diseñado para móviles!

## Características principales:
1. **Editor inteligente**: Soporte para múltiples lenguajes (HTML, CSS, JS, Python, Markdown).
2. **Barra de teclado rápido**: Escribe símbolos como \`{ }\`, \`[ ]\`, \`;\` de manera ágil.
3. **Previsualización en tiempo real**: Ejecuta proyectos web al instante.
4. **Asistente IA**: Integra Gemini para resolver dudas o depurar código.

### ¿Cómo probar Python?
Abre \`suma.py\` y pulsa el botón **Ejecutar** arriba a la derecha. Verás una consola interactiva simulando la ejecución de tu script mediante IA.`
};

// State Variables
let projects = {};
let activeProjectName = '';
let projectFiles = {}; // Referencia a projects[activeProjectName].files
let activeFile = '';
let openTabs = [];
let editor = null;
let chatHistory = [];

// DOM Elements
const fileTreeEl = document.getElementById('file-tree');
const openTabsEl = document.getElementById('open-tabs');
const editorContainerEl = document.getElementById('editor-container');
const keyboardBarEl = document.getElementById('keyboard-bar');
const webPreviewEl = document.getElementById('web-preview');
const terminalPreviewEl = document.getElementById('terminal-preview');
const terminalBodyEl = document.getElementById('terminal-body');
const chatMessagesEl = document.getElementById('chat-messages');
const chatInputEl = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const runBtn = document.getElementById('run-btn');
const exportBtn = document.getElementById('export-btn');
const resetBtn = document.getElementById('reset-btn');
const newFileBtn = document.getElementById('new-file-btn');
const reloadPreviewBtn = document.getElementById('reload-preview-btn');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const sidebarEl = document.getElementById('sidebar');

// Project Modal and Selector Elements
const projectSelector = document.getElementById('project-selector');
const newProjectBtn = document.getElementById('new-project-btn');
const newProjectModal = document.getElementById('new-project-modal');
const closeProjectModal = document.getElementById('close-project-modal');
const cancelProjectBtn = document.getElementById('cancel-project-btn');
const confirmProjectBtn = document.getElementById('confirm-project-btn');
const projectNameInput = document.getElementById('project-name-input');

// Template Definitions
const TEMPLATES = {
    web: {
        "index.html": `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Proyecto Web</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <h1>¡Desarrollo Web en AndroCode! ⚡</h1>
        <p>Este es un servidor de pruebas local ejecutándose en tu celular.</p>
        <button id="magic-btn">Presiona aquí</button>
        <p id="msg" class="hidden font-mono">¡JavaScript conectado! 🎉</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
        "style.css": `body {
    background: linear-gradient(135deg, #0f172a, #1e1b4b);
    color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    margin: 0;
}
.card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    max-width: 320px;
}
h1 {
    color: #38bdf8;
    font-size: 1.6rem;
    margin-top: 0;
}
button {
    background: #a855f7;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;
}
button:active {
    transform: scale(0.95);
}
.font-mono {
    font-family: monospace;
    color: #4ade80;
    margin-top: 15px;
}
.hidden {
    display: none;
}`,
        "script.js": `// Comportamiento dinámico
document.getElementById('magic-btn').addEventListener('click', () => {
    const msg = document.getElementById('msg');
    msg.classList.toggle('hidden');
});`,
        "README.md": `# Proyecto Web 🚀

Este proyecto contiene una estructura clásica de desarrollo web:
- \`index.html\`: Estructura del sitio.
- \`style.css\`: Estilos visuales.
- \`script.js\`: Comportamiento.

Presiona el botón **Ejecutar** para ver la vista previa en vivo.`
    },
    python: {
        "main.py": `# Script de Python en AndroCode
def saludar(nombre):
    print(f"¡Hola, {nombre}! Bienvenido a AndroCode Python.")

def calcular_suma(a, b):
    return a + b

saludar("Programador Android")
num1 = 12
num2 = 23
resultado = calcular_suma(num1, num2)
print(f"La suma de {num1} + {num2} es: {resultado}")
`,
        "README.md": `# Proyecto Python 🐍

Este es un entorno virtual para correr Python:
- Edita tu código en \`main.py\`.
- Presiona **Ejecutar** para simular la consola de comandos interactiva.`
    },
    markdown: {
        "notas.md": `# Mis Notas en AndroCode 📝

Aquí puedes escribir apuntes utilizando formato **Markdown**.

## Tareas Pendientes:
- [x] Crear este proyecto Markdown.
- [ ] Aprender sintaxis.
- [ ] Preguntar dudas al Asistente IA.

### Bloque de Código de Ejemplo:
\`\`\`html
<h1>Hola Mundo</h1>
\`\`\`
`,
        "README.md": `# Proyecto Markdown 📄

Soporte nativo para formato de texto Markdown:
- Edita tu archivo \`notas.md\`.
- Haz clic en **Ejecutar** o ve a la pestaña **Vista Previa** para ver el renderizado HTML.`
    }
};

// Initialize IDE
window.addEventListener('DOMContentLoaded', () => {
    initFilesystem();
    initCodeMirror();
    initMobileNav();
    initKeyboardBar();
    initSuggestions();
    
    // Bind Event Listeners
    sendChatBtn.addEventListener('click', handleChatSubmit);
    chatInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit();
        }
    });
    runBtn.addEventListener('click', runProject);
    reloadPreviewBtn.addEventListener('click', runProject);
    exportBtn.addEventListener('click', exportProjectAsZip);
    resetBtn.addEventListener('click', deleteCurrentProject);
    newFileBtn.addEventListener('click', createNewFilePrompt);
    toggleSidebarBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('collapsed');
        sidebarEl.classList.toggle('open');
    });

    // Project Selection and Modal Listeners
    projectSelector.addEventListener('change', (e) => {
        switchProject(e.target.value);
    });
    newProjectBtn.addEventListener('click', showNewProjectModal);
    closeProjectModal.addEventListener('click', hideNewProjectModal);
    cancelProjectBtn.addEventListener('click', hideNewProjectModal);
    confirmProjectBtn.addEventListener('click', createNewProject);

    // Cargar proyecto inicial
    loadActiveProject();
});

// 1. Filesystem Logic
function initFilesystem() {
    const savedProjects = localStorage.getItem('androcode_multi_projects');
    const savedActive = localStorage.getItem('androcode_active_project');
    
    if (savedProjects && savedActive) {
        try {
            projects = JSON.parse(savedProjects);
            activeProjectName = savedActive;
        } catch(e) {
            setupDefaultWorkspace();
        }
    } else {
        setupDefaultWorkspace();
    }
    updateProjectSelectorDropdown();
}

function setupDefaultWorkspace() {
    projects = {
        "Mi Primer Proyecto": {
            template: "web",
            files: { ...TEMPLATES.web }
        }
    };
    activeProjectName = "Mi Primer Proyecto";
    saveToLocalStorage();
}

function saveToLocalStorage() {
    localStorage.setItem('androcode_multi_projects', JSON.stringify(projects));
    localStorage.setItem('androcode_active_project', activeProjectName);
}

function updateProjectSelectorDropdown() {
    projectSelector.innerHTML = '';
    Object.keys(projects).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        if (name === activeProjectName) {
            option.selected = true;
        }
        projectSelector.appendChild(option);
    });
}

function loadActiveProject() {
    projectFiles = projects[activeProjectName].files;
    
    // Seleccionar el archivo inicial del proyecto
    const defaultFiles = ['README.md', 'index.html', 'main.py', 'notas.md'];
    let fileToOpen = '';
    for (let f of defaultFiles) {
        if (projectFiles[f]) {
            fileToOpen = f;
            break;
        }
    }
    if (!fileToOpen) {
        fileToOpen = Object.keys(projectFiles)[0];
    }
    
    openTabs = [];
    if (fileToOpen) {
        openFile(fileToOpen);
    } else {
        activeFile = '';
        if (editor) editor.setValue('');
        renderTabs();
    }
    renderFileTree();
}

function switchProject(projectName) {
    if (activeFile && editor) {
        projectFiles[activeFile] = editor.getValue();
    }
    saveToLocalStorage();
    activeProjectName = projectName;
    loadActiveProject();
}

// Modal Controllers
function showNewProjectModal() {
    projectNameInput.value = '';
    newProjectModal.classList.remove('hidden');
    projectNameInput.focus();
}

function hideNewProjectModal() {
    newProjectModal.classList.add('hidden');
}

function createNewProject() {
    const name = projectNameInput.value.trim();
    if (!name) {
        alert("Por favor, introduce un nombre para el proyecto.");
        return;
    }
    if (projects[name]) {
        alert("Ya existe un proyecto con ese nombre.");
        return;
    }

    const templateRadio = document.querySelector('input[name="project-template"]:checked');
    const templateVal = templateRadio ? templateRadio.value : 'web';

    // Crear archivos basados en la plantilla
    projects[name] = {
        template: templateVal,
        files: { ...TEMPLATES[templateVal] }
    };
    
    activeProjectName = name;
    saveToLocalStorage();
    
    updateProjectSelectorDropdown();
    loadActiveProject();
    hideNewProjectModal();
}

function deleteCurrentProject() {
    if (Object.keys(projects).length <= 1) {
        alert("No puedes eliminar el único proyecto activo. Crea otro primero.");
        return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${activeProjectName}"? Se perderán todos sus archivos.`)) {
        delete projects[activeProjectName];
        activeProjectName = Object.keys(projects)[0];
        saveToLocalStorage();
        updateProjectSelectorDropdown();
        loadActiveProject();
    }
}


function renderFileTree() {
    fileTreeEl.innerHTML = '';
    Object.keys(projectFiles).sort().forEach(filename => {
        const item = document.createElement('div');
        item.className = `file-item ${filename === activeFile ? 'active' : ''}`;
        
        const ext = filename.split('.').pop().toLowerCase();
        let iconClass = 'fa-file-code';
        if (ext === 'html') iconClass = 'fa-brands fa-html5';
        else if (ext === 'css') iconClass = 'fa-brands fa-css3-alt';
        else if (ext === 'js') iconClass = 'fa-brands fa-js';
        else if (ext === 'py') iconClass = 'fa-brands fa-python';
        else if (ext === 'md') iconClass = 'fa-regular fa-file-markdown';

        item.innerHTML = `
            <div class="file-name">
                <i class="${iconClass}"></i>
                <span>${filename}</span>
            </div>
            <button class="file-delete-btn" title="Eliminar archivo">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        item.addEventListener('click', (e) => {
            if (e.target.closest('.file-delete-btn')) {
                deleteFile(filename);
            } else {
                openFile(filename);
                if (window.innerWidth <= 900) {
                    sidebarEl.classList.add('collapsed');
                    sidebarEl.classList.remove('open');
                }
            }
        });

        fileTreeEl.appendChild(item);
    });
}

function openFile(filename) {
    if (activeFile && projectFiles[activeFile] !== undefined) {
        // Guardar contenido actual
        projectFiles[activeFile] = editor.getValue();
        saveToLocalStorage();
    }

    activeFile = filename;
    
    // Configurar pestañas
    if (!openTabs.includes(filename)) {
        openTabs.push(filename);
    }
    renderTabs();

    // Actualizar editor
    editor.setValue(projectFiles[filename] || '');
    
    // Cambiar modo del editor
    const ext = filename.split('.').pop().toLowerCase();
    let mode = 'text/plain';
    if (ext === 'html') mode = 'htmlmixed';
    else if (ext === 'css') mode = 'css';
    else if (ext === 'js') mode = 'javascript';
    else if (ext === 'py') mode = 'python';
    else if (ext === 'md') mode = 'markdown';
    editor.setOption('mode', mode);

    renderFileTree();
}

function renderTabs() {
    openTabsEl.innerHTML = '';
    openTabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `editor-tab ${tab === activeFile ? 'active' : ''}`;
        tabEl.innerHTML = `
            <span>${tab}</span>
            <button class="close-tab-btn"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        tabEl.addEventListener('click', (e) => {
            if (e.target.closest('.close-tab-btn')) {
                e.stopPropagation();
                closeTab(tab);
            } else {
                openFile(tab);
            }
        });
        openTabsEl.appendChild(tabEl);
    });
}

function closeTab(filename) {
    openTabs = openTabs.filter(t => t !== filename);
    if (activeFile === filename) {
        if (openTabs.length > 0) {
            openFile(openTabs[openTabs.length - 1]);
        } else {
            activeFile = '';
            editor.setValue('');
            renderFileTree();
        }
    }
    renderTabs();
}

function createNewFilePrompt() {
    const filename = prompt("Introduce el nombre del nuevo archivo (ej: app.js, index.html):");
    if (!filename) return;
    
    const cleanName = filename.trim();
    if (projectFiles[cleanName] !== undefined) {
        alert("El archivo ya existe.");
        return;
    }

    projectFiles[cleanName] = "";
    saveToLocalStorage();
    renderFileTree();
    openFile(cleanName);
}

function deleteFile(filename) {
    if (Object.keys(projectFiles).length <= 1) {
        alert("El proyecto debe tener al menos un archivo.");
        return;
    }
    if (confirm(`¿Estás seguro de que quieres eliminar "${filename}"?`)) {
        delete projectFiles[filename];
        openTabs = openTabs.filter(t => t !== filename);
        saveToLocalStorage();
        
        if (activeFile === filename) {
            openFile(Object.keys(projectFiles)[0]);
        } else {
            renderFileTree();
            renderTabs();
        }
    }
}

function restoreDefaultProject() {
    if (confirm("¿Quieres restaurar el proyecto predeterminado? Se perderán tus cambios locales.")) {
        projectFiles = { ...DEFAULT_PROJECT };
        saveToLocalStorage();
        openTabs = [];
        initFilesystem();
        openFile('readme.md');
    }
}

// 2. CodeMirror Initialization
function initCodeMirror() {
    editor = CodeMirror(editorContainerEl, {
        value: "",
        mode: "javascript",
        theme: "material-ocean",
        lineNumbers: true,
        autoCloseBrackets: true,
        tabSize: 4,
        indentUnit: 4,
        viewportMargin: Infinity
    });

    // Auto-guardar mientras se escribe
    editor.on('change', () => {
        if (activeFile) {
            projectFiles[activeFile] = editor.getValue();
            saveToLocalStorage();
        }
    });
}

// 3. Mobile Navigation Layout
function initMobileNav() {
    const tabBtns = document.querySelectorAll('.tab-nav-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetId = btn.getAttribute('data-target');
            document.querySelectorAll('.panel-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
            
            // Refrescar CodeMirror si el editor se vuelve visible
            if (targetId === 'editor-panel' && editor) {
                editor.refresh();
            }
        });
    });
}

// 4. Mobile Keyboard Accessory Bar
function initKeyboardBar() {
    const keys = keyboardBarEl.querySelectorAll('.key-btn');
    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (!editor) return;
            
            const value = key.getAttribute('data-val');
            const doc = editor.getDoc();
            const cursor = doc.getCursor();
            
            if (value === 'Tab') {
                doc.replaceRange("    ", cursor);
            } else {
                doc.replaceRange(value, cursor);
            }
            
            editor.focus();
        });
    });
}

// 5. Code Runner / Live Preview
function runProject() {
    if (activeFile) {
        // Asegurar que el código actual se guarde
        projectFiles[activeFile] = editor.getValue();
        saveToLocalStorage();
    }

    const ext = activeFile.split('.').pop().toLowerCase();
    
    // Switch to Preview Panel on mobile
    if (window.innerWidth <= 900) {
        const previewTabNav = document.querySelector('.tab-nav-btn[data-target="preview-panel"]');
        if (previewTabNav) previewTabNav.click();
    }

    if (ext === 'html' || ext === 'css' || ext === 'js' || projectFiles['index.html']) {
        // Ejecución Web (Iframe)
        webPreviewEl.classList.remove('hidden');
        terminalPreviewEl.classList.add('hidden');
        
        let htmlContent = projectFiles['index.html'] || `
            <!DOCTYPE html>
            <html>
            <head><title>AndroCode Preview</title></head>
            <body>
                <h3>Vista Previa</h3>
                <p>Crea un archivo <strong>index.html</strong> para previsualizar tu diseño web.</p>
            </body>
            </html>
        `;

        // Inyectar el CSS del proyecto dentro de la página
        if (projectFiles['style.css']) {
            const cssTag = `<style>${projectFiles['style.css']}</style>`;
            if (htmlContent.includes('</head>')) {
                htmlContent = htmlContent.replace('</head>', `${cssTag}</head>`);
            } else {
                htmlContent = cssTag + htmlContent;
            }
        }

        // Inyectar el script del proyecto dentro de la página
        if (projectFiles['script.js']) {
            const jsTag = `<script>${projectFiles['script.js']}</script>`;
            if (htmlContent.includes('</body>')) {
                htmlContent = htmlContent.replace('</body>', `${jsTag}</body>`);
            } else {
                htmlContent = htmlContent + jsTag;
            }
        }

        // Cargar en el iframe
        const blob = new Blob([htmlContent], { type: 'text/html' });
        webPreviewEl.src = URL.createObjectURL(blob);

    } else if (ext === 'py') {
        // Ejecución Python (Consola Simulada con Gemini/Ejecutor)
        webPreviewEl.classList.add('hidden');
        terminalPreviewEl.classList.remove('hidden');
        
        runPythonConsole(projectFiles[activeFile]);

    } else if (ext === 'md') {
        // Ejecución Markdown
        webPreviewEl.classList.remove('hidden');
        terminalPreviewEl.classList.add('hidden');
        
        const mdHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
                <style>
                    body { padding: 20px; font-family: sans-serif; background: #FFF; color: #333; }
                </style>
            </head>
            <body class="markdown-body">
                ${marked.parse(editor.getValue())}
            </body>
            </html>
        `;
        const blob = new Blob([mdHtml], { type: 'text/html' });
        webPreviewEl.src = URL.createObjectURL(blob);
    } else {
        alert("Abre un archivo HTML, CSS, JS, Python o Markdown para ejecutar.");
    }
}

// Simulated Python Console Execution using AI for complex logic or standard simulation for prints
async function runPythonConsole(code) {
    terminalBodyEl.innerHTML = '<div class="terminal-line system-line">> Inicializando entorno Python virtual...</div>';
    
    // Intenta un parseo local rápido para prints simples
    const lines = code.split('\n');
    let hasComplexLogic = false;
    let simpleOutputs = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('print(') && line.endsWith(')')) {
            const content = line.substring(6, line.length - 1).trim();
            // Si es un print de string simple
            if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
                simpleOutputs.push(content.substring(1, content.length - 1));
            } else {
                hasComplexLogic = true;
            }
        } else if (line !== '' && !line.startsWith('#')) {
            hasComplexLogic = true;
        }
    }

    if (!hasComplexLogic && simpleOutputs.length > 0) {
        terminalBodyEl.innerHTML += '<div class="terminal-line system-line">> Ejecución completada localmente:</div>';
        simpleOutputs.forEach(out => {
            terminalBodyEl.innerHTML += `<div class="terminal-line">${out}</div>`;
        });
        return;
    }

    // Si tiene lógica compleja, le pedimos a Gemini que simule la salida de la consola python. Esto es increíblemente premium!
    terminalBodyEl.innerHTML += '<div class="terminal-line system-line">> Código complejo detectado. Simulando consola vía Gemini...</div>';
    
    try {
        const promptSimulacion = `Actúa como un intérprete interactivo de Python 3.
Quiero que ejecutes mentalmente el siguiente código y que me devuelvas ÚNICAMENTE la salida de consola (stdout/stderr) exacta que produciría este programa.
No agregues explicaciones, no agregues formato de código de markdown. Simplemente devuelve la salida de la consola.
Si hay un error de sintaxis o de ejecución, devuélvelo en el formato estándar de errores de Python.

Código a ejecutar:
${code}`;

        const output = await askGemini(promptSimulacion, [], '', '');
        terminalBodyEl.innerHTML += '<div class="terminal-line system-line">> Salida de ejecución:</div>';
        
        // Formatear líneas
        const outLines = output.split('\n');
        outLines.forEach(l => {
            if (l.trim()) {
                const isError = l.toLowerCase().includes('traceback') || l.toLowerCase().includes('error:');
                terminalBodyEl.innerHTML += `<div class="terminal-line ${isError ? 'error-line' : ''}">${l}</div>`;
            }
        });

    } catch (err) {
        terminalBodyEl.innerHTML += `<div class="terminal-line error-line">> Error de simulación: ${err.message}</div>`;
    }
}

// 6. Gemini Chat Assistant Integration
async function handleChatSubmit() {
    const text = chatInputEl.value.trim();
    if (!text) return;

    // Agregar mensaje del usuario a la pantalla
    appendChatMessage('user', text);
    chatInputEl.value = '';
    
    // Auto-scroll
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

    // Agregar spinner de carga del asistente
    const loadingId = appendChatLoading();
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

    try {
        const currentCode = activeFile ? editor.getValue() : '';
        const currentFileName = activeFile || '';
        
        // Llamar a Gemini con el historial
        const aiResponse = await askGemini(text, chatHistory, currentCode, currentFileName);
        
        // Eliminar spinner y agregar respuesta
        removeChatLoading(loadingId);
        appendChatMessage('assistant', aiResponse);
        
        // Guardar en el historial local
        chatHistory.push({ role: 'user', text: text });
        chatHistory.push({ role: 'assistant', text: aiResponse });
        
        // Limitar tamaño del historial para optimizar tokens
        if (chatHistory.length > 16) {
            chatHistory = chatHistory.slice(chatHistory.length - 16);
        }

    } catch (err) {
        removeChatLoading(loadingId);
        appendChatMessage('assistant', `❌ **Error al comunicar con la IA:** ${err.message}`);
    }
    
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function appendChatMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    
    const icon = role === 'assistant' ? 'fa-robot' : 'fa-user';
    const parsedText = role === 'assistant' ? marked.parse(text) : escapeHTML(text);

    msg.innerHTML = `
        <div class="avatar"><i class="fa-solid ${icon}"></i></div>
        <div class="msg-bubble">${parsedText}</div>
    `;
    
    chatMessagesEl.appendChild(msg);
}

function appendChatLoading() {
    const id = 'loading-' + Date.now();
    const msg = document.createElement('div');
    msg.className = `chat-msg assistant`;
    msg.id = id;
    msg.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="msg-bubble">
            <span class="neon-purple-text"><i class="fa-solid fa-circle-notch fa-spin"></i> Pensando...</span>
        </div>
    `;
    chatMessagesEl.appendChild(msg);
    return id;
}

function removeChatLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function initSuggestions() {
    const chips = document.querySelectorAll('.suggestion-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            chatInputEl.value = prompt;
            handleChatSubmit();
        });
    });
}

// 7. Zip Exporter
function exportProjectAsZip() {
    const zip = new JSZip();
    
    // Agregar archivos del proyecto
    Object.keys(projectFiles).forEach(filename => {
        zip.file(filename, projectFiles[filename]);
    });
    
    zip.generateAsync({ type: "blob" }).then(function (content) {
        // Disparar la descarga del archivo ZIP
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "androcode_project.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Utils
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
