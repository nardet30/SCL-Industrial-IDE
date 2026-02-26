# SCL Industrial IDE - IEC 61131-3 Standard

![SCL Industrial IDE](https://img.shields.io/badge/Status-Industrial%20Ready-blue?style=for-the-badge&logo=codetransfer)
![Standard](https://img.shields.io/badge/Compliance-IEC%2061131--3-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

Esta es una SPA (Single Page Application) avanzada diseñada para ingenieros de automatización que trabajan con el lenguaje **SCL (Structured Control Language)**.

## 🚀 Vista Previa
Puedes ver la herramienta en funcionamiento directamente aquí:
> **[Demo en Vivo (GitHub Pages)]** *(Sigue los pasos abajo para activarlo)*

## ✨ Características Principales

### 1. Motor de Validación IEC 61131-3
- **Validación de POUs**: Asegura que el código esté dentro de `FUNCTION`, `FUNCTION_BLOCK` o `PROGRAM`.
- **Detección de Recursividad**: Bloquea llamadas recursivas (prohibidas por la norma en sistemas críticos).
- **Control de Variables Estáticas**: Valida que las `FUNCTION` no declaren `VAR` (sólo `VAR_TEMP`).
- **Mapeo de Hardware**: Advierte si faltan declaraciones `AT %` en programas principales.

### 2. Generador de Patrones Industriales
Incluye plantillas optimizadas bajo criterios de **Safety-by-Design**:
- **State Machine**: Máquina de estados robusta.
- **Factory Pattern**: Gestión modular de actuadores.
- **Pump Control**: Lógica de histéresis con gestión de alarmas.
- **Strategy**: Selección dinámica de modos de operación.

### 3. Biblioteca Estándar (BIE)
Acceso rápido a bloques `TON`, `TOF`, `CTU` y funciones matemáticas con inserción inteligente en el editor.

### 4. Consola de Diagnóstico en Tiempo Real
Proporciona feedback inmediato sobre la conformidad del código y sugiere optimizaciones.

## 📦 Instalación y Uso Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/nardet30/SCL-Industrial-IDE.git
   ```
2. Abre `index.html` en cualquier navegador moderno.

## 🛠️ Tecnologías
- **Tailwind CSS**: Estética premium industrial.
- **Vanilla JS**: Motor de validación ligero y rápido.
- **Lucide Icons**: Iconografía técnica clara.

---
*Desarrollado con un enfoque en sistemas críticos y robustez industrial.* 🏗️📡
