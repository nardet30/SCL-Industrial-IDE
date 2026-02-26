const SCL_TEMPLATES = {
    'state-machine': `FUNCTION_BLOCK FB_StateMachine
VAR_INPUT
    xStart : BOOL;
    xReset : BOOL;
END_VAR
VAR_OUTPUT
    xDone : BOOL;
    iCurrentState : INT;
END_VAR
VAR
    iState : INT := 0; // 0: IDLE, 10: INIT, 20: RUNNING, 99: ERROR
    fbTimer : TON;
END_VAR

CASE iState OF
    0: // IDLE
        IF xStart THEN
            iState := 10;
        END_IF;
        
    10: // INIT
        // Inicialización de periféricos
        iState := 20;
        
    20: // RUNNING
        IF xReset THEN
            iState := 0;
        END_IF;
        
    99: // ERROR
        // Manejo de fallos críticos
END_CASE;

iCurrentState := iState;
END_FUNCTION_BLOCK`,

    'pump-control': `FUNCTION_BLOCK FB_PumpControl
VAR_INPUT
    rPressureSensor : REAL; // Bar
    rSetPoint : REAL := 5.0;
    rHysteresis : REAL := 0.5;
END_VAR
VAR_OUTPUT
    xPumpCmd : BOOL;
    xAlarmHigh : BOOL;
END_VAR
VAR
    rMaxSafePressure : REAL := 8.0;
END_VAR

// Lógica de histéresis (Safety-by-Design)
IF rPressureSensor < (rSetPoint - rHysteresis) THEN
    xPumpCmd := TRUE;
ELSIF rPressureSensor > (rSetPoint + rHysteresis) THEN
    xPumpCmd := FALSE;
END_IF;

// Lógica de Alarmas
xAlarmHigh := rPressureSensor > rMaxSafePressure;

END_FUNCTION_BLOCK`,

    'factory': `PROGRAM PLC_PRG
VAR
    fbConveyor_1 : FB_MotorControl;
    fbConveyor_2 : FB_MotorControl;
    xEmergencyStop : BOOL AT %I0.0;
    xSystemReady : BOOL;
END_VAR

// Implementación de Factory Pattern para gestión de motores
fbConveyor_1(xEnable := xSystemReady AND NOT xEmergencyStop);
fbConveyor_2(xEnable := xSystemReady AND NOT xEmergencyStop);

END_PROGRAM`,

    'strategy': `FUNCTION FC_GetControlStrategy : INT
VAR_INPUT
    iMode : INT; // 1: Economy, 2: Performance, 3: Safety
END_VAR
VAR_TEMP
    iResult : INT;
END_VAR

// Strategy Pattern Implementation
CASE iMode OF
    1: iResult := 100; // Low PWM
    2: iResult := 255; // Full PWM
    3: iResult := 50;  // Safe Mode
ELSE
    iResult := 0;
END_CASE;

FC_GetControlStrategy := iResult;
END_FUNCTION`
};
