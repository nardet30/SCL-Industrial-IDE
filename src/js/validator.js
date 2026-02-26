class IECValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.standardTypes = ['BOOL', 'INT', 'REAL', 'TIME', 'BYTE', 'WORD', 'DWORD', 'STRING'];
        this.varBlocks = ['VAR_INPUT', 'VAR_OUTPUT', 'VAR_IN_OUT', 'VAR', 'VAR_TEMP', 'VAR_GLOBAL'];
    }

    validate(code) {
        this.errors = [];
        this.warnings = [];
        this.checkPOU(code);
        this.checkVariables(code);
        this.checkRecursion(code);
        this.checkHardwareMapping(code);

        return {
            valid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    checkPOU(code) {
        const hasPOU = /FUNCTION_BLOCK|FUNCTION|PROGRAM/i.test(code);
        if (!hasPOU) {
            this.errors.push({
                line: 1,
                msg: "Falta definición de POU (FUNCTION, FUNCTION_BLOCK o PROGRAM).",
                type: 'error'
            });
        }

        // Check if FUNCTION contains static VAR (not allowed in IEC 61131-3)
        if (/FUNCTION\s+\w+/i.test(code) && /\bVAR\b(?!_INPUT|_OUTPUT|_IN_OUT|_TEMP)/i.test(code)) {
            this.errors.push({
                line: 0,
                msg: "Las FUNCIONES no pueden contener variables estáticas (VAR). Use VAR_TEMP.",
                type: 'error'
            });
        }
    }

    checkVariables(code) {
        // Simple check for data types (case insensitive)
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            if (line.includes(':') && !line.includes(':=') && !line.trim().startsWith('//')) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const typePart = parts[1].replace(';', '').trim().toUpperCase();
                    const isValidType = this.standardTypes.some(t => typePart.includes(t)) || typePart.startsWith('FB_');
                    if (!isValidType && typePart !== '') {
                        this.warnings.push({
                            line: index + 1,
                            msg: `Tipo de dato '${typePart}' detectado. Asegúrese de que sea un UDT o instancia de FB válida.`,
                            type: 'warning'
                        });
                    }
                }
            }
        });
    }

    checkRecursion(code) {
        // Recursive calls are forbidden in IEC 61131-3
        const pouMatch = code.match(/(FUNCTION_BLOCK|FUNCTION)\s+(\w+)/i);
        if (pouMatch) {
            const name = pouMatch[2];
            const regex = new RegExp(`\\b${name}\\s*\\(`, 'gi');
            const matches = code.match(regex);
            // First match is the declaration if it's a call inside another block, 
            // but here we check for internal calls.
            const body = code.substring(code.indexOf(name) + name.length);
            if (new RegExp(`\\b${name}\\s*\\(`, 'gi').test(body)) {
                this.errors.push({
                    line: 0,
                    msg: `Recursividad detectada en '${name}'. Prohibido según IEC 61131-3.`,
                    type: 'error'
                });
            }
        }
    }

    checkHardwareMapping(code) {
        if (code.includes('PROGRAM') && !code.includes('AT %')) {
            this.warnings.push({
                line: 0,
                msg: "Falta declaración AT para variables de hardware (%I, %Q, %M) en bloque PROGRAM.",
                type: 'warning'
            });
        }
    }
}
