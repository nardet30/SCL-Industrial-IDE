// Initialize modules
const validator = new IECValidator();
const editor = document.getElementById('scl-editor');
const consoleOutput = document.getElementById('console-output');
const lineNumbers = document.getElementById('line-numbers');
const diagStat = document.getElementById('diagnostic-stat');
const analysisOutput = document.getElementById('analysis-output');
const tabConsole = document.getElementById('tab-console');
const tabAnalysis = document.getElementById('tab-analysis');

// Event Listeners
editor.addEventListener('input', () => {
    updateLineNumbers();
});

editor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
    }
});

// Tab Switching Logic
tabConsole.addEventListener('click', () => switchTab('console'));
tabAnalysis.addEventListener('click', () => switchTab('analysis'));

function switchTab(tab) {
    if (tab === 'console') {
        consoleOutput.classList.remove('hidden');
        analysisOutput.classList.add('hidden');
        tabConsole.classList.add('text-industrial-accent', 'border-industrial-accent');
        tabConsole.classList.remove('text-slate-500', 'border-transparent');
        tabAnalysis.classList.remove('text-industrial-accent', 'border-industrial-accent');
        tabAnalysis.classList.add('text-slate-500', 'border-transparent');
    } else {
        consoleOutput.classList.add('hidden');
        analysisOutput.classList.remove('hidden');
        tabAnalysis.classList.add('text-industrial-accent', 'border-industrial-accent');
        tabAnalysis.classList.remove('text-slate-500', 'border-transparent');
        tabConsole.classList.remove('text-industrial-accent', 'border-industrial-accent');
        tabConsole.classList.add('text-slate-500', 'border-transparent');
    }
}

function updateLineNumbers() {
    const lines = editor.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
}

function logToConsole(msg, type = 'info') {
    const div = document.createElement('div');
    const colors = {
        info: 'text-slate-500',
        error: 'text-industrial-error font-bold',
        warning: 'text-industrial-warning',
        success: 'text-industrial-success'
    };

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    div.className = `${colors[type]} py-0.5 border-b border-white/5`;
    div.innerHTML = `<span class="opacity-50">[${timestamp}]</span> [${type.toUpperCase()}] ${msg}`;
    consoleOutput.prepend(div);
}

// Global functions for UI
window.generateFromPattern = function () {
    const selected = document.getElementById('pattern-selector').value;
    if (SCL_TEMPLATES[selected]) {
        editor.value = SCL_TEMPLATES[selected];
        updateLineNumbers();
        logToConsole(`Patrón '${selected}' cargado correctamente.`, 'success');
        validateSCL();
    }
};

async function validateSCL() {
    const code = editor.value;
    if (!code.trim()) {
        logToConsole("El editor está vacío.", "warning");
        return;
    }

    logToConsole("Iniciando validación IEC 61131-3...", "info");

    // Simulate processing delay for "Wow" effect
    diagStat.innerHTML = '<span class="animate-pulse">Validando...</span>';

    setTimeout(() => {
        try {
            const results = validator.validate(code);

            consoleOutput.innerHTML = ''; // Clear for fresh report

            if (results.valid && results.warnings.length === 0) {
                logToConsole("Código 100% conforme a norma (Safety-by-Design OK).", "success");
                diagStat.textContent = "Estado: Conforme";
            } else {
                results.errors.forEach(err => logToConsole(`Línea ${err.line}: ${err.msg}`, 'error'));
                results.warnings.forEach(warn => logToConsole(`Línea ${warn.line}: ${warn.msg}`, 'warning'));

                const totalIssues = results.errors.length + results.warnings.length;
                diagStat.textContent = `Estado: ${totalIssues} incidencias detectadas`;
            }

            if (results.errors.length === 0) {
                logToConsole("Validación estructural completa. Sin errores críticos.", "success");
            } else {
                logToConsole("Se han encontrado errores críticos que impiden la compilación.", "error");
            }

            updateAnalysisView(results);

        } catch (err) {
            console.error("Validation Error:", err);
            logToConsole("Error crítico en el motor: " + err.message, "error");
            diagStat.textContent = "Estado: Error interno";
        }
    }, 600);
}

document.getElementById('validate-btn').addEventListener('click', validateSCL);

document.getElementById('optimize-btn').addEventListener('click', () => {
    let code = editor.value;
    if (!code) return;

    logToConsole("Optimizando código SCL...", "info");

    // Simple optimization: trim spaces, fix casing of keywords
    const keywords = ['FUNCTION', 'FUNCTION_BLOCK', 'PROGRAM', 'VAR', 'VAR_INPUT', 'VAR_OUTPUT', 'END_VAR', 'END_FUNCTION', 'END_FUNCTION_BLOCK', 'CASE', 'OF', 'END_CASE', 'IF', 'THEN', 'ELSIF', 'ELSE', 'END_IF', 'TRUE', 'FALSE'];

    keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        code = code.replace(regex, kw);
    });

    editor.value = code;
    logToConsole("Optimización (Normalización de keywords) finalizada.", "success");
});

// Library drag-drop simulation (click-to-add for simplicity in this SPA)
document.querySelectorAll('#library-list [draggable="true"]').forEach(item => {
    item.addEventListener('click', () => {
        const blockName = item.textContent.trim().split(' ')[1];
        const instName = `inst${blockName}_1`;
        const snippet = `\n// Instancia de ${blockName}\n${instName} : ${blockName};\n${instName}(CLK := , ...);\n`;

        const cursorP = editor.selectionStart;
        editor.value = editor.value.slice(0, cursorP) + snippet + editor.value.slice(cursorP);
        updateLineNumbers();
        logToConsole(`Módulo ${blockName} insertado en posición del cursor.`, 'info');
    });
});

// Initial Setup
updateLineNumbers();
logToConsole("SCL Engine v2.4 listo para producción.", "success");

function updateAnalysisView(results) {
    analysisOutput.innerHTML = '';

    if (results.errors.length === 0 && results.warnings.length === 0) {
        analysisOutput.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-industrial-success opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                <h3 class="font-bold">Análisis de Seguridad: PASADO</h3>
                <p class="text-[11px]">No se detectaron violaciones de la norma IEC 61131-3.</p>
            </div>
        `;
        return;
    }

    const container = document.createElement('div');
    container.className = 'space-y-4';

    const header = document.createElement('div');
    header.className = 'border-b border-slate-800 pb-2 mb-4';
    header.innerHTML = `<h3 class="text-xs font-bold text-slate-400">INFORME DE CUMPLIMIENTO GLOBAL</h3>`;
    container.appendChild(header);

    // Group issues
    [...results.errors, ...results.warnings].forEach(issue => {
        const item = document.createElement('div');
        const color = issue.type === 'error' ? 'border-industrial-error/30 bg-industrial-error/5' : 'border-industrial-warning/30 bg-industrial-warning/5';
        const labelColor = issue.type === 'error' ? 'text-industrial-error' : 'text-industrial-warning';

        item.className = `p-3 rounded border ${color} mb-3`;
        item.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-black uppercase ${labelColor}">${issue.type}</span>
                <span class="text-[10px] text-slate-500 font-mono">LÍNEA: ${issue.line || 'GLOBAL'}</span>
            </div>
            <p class="text-[11px] text-slate-300">${issue.msg}</p>
            <div class="mt-2 text-[9px] text-slate-500 italic">
                Sugerencia: ${getSuggestion(issue.msg)}
            </div>
        `;
        container.appendChild(item);
    });

    analysisOutput.appendChild(container);
}

function getSuggestion(msg) {
    if (msg.includes('Recursividad')) return "Utilice una estructura de iteración (FOR/WHILE) o una máquina de estados externa.";
    if (msg.includes('variables estáticas')) return "Mueva estas variables a un Bloque Funcional (FB) o use VAR_TEMP si no necesitan persistencia.";
    if (msg.includes('AT %')) return "Defina la dirección física (ej. %I0.0) para que el compilador mapee la variable al hardware real.";
    if (msg.includes('POU')) return "Encapsule el código en FUNCTION_BLOCK, FUNCTION o PROGRAM según el estándar.";
    return "Consulte la documentación técnica para asegurar la conformidad con Safety Integrity Level (SIL).";
}
