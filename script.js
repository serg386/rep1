const calculator = {
  currentValue: "0",
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  expression: "",
};

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

function updateDisplay() {
  resultEl.textContent = formatNumber(calculator.currentValue);
  resultEl.classList.toggle("shrink", calculator.currentValue.length > 10);
  expressionEl.textContent = calculator.expression;
}

function formatNumber(value) {
  if (value === "Error") return value;
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  if (value.includes(".") && value.endsWith("0") && !calculator.waitingForOperand) {
    return value;
  }
  if (value.endsWith(".")) return value;
  if (Number.isInteger(num) && !value.includes(".")) {
    return num.toLocaleString("en-US");
  }
  const parts = value.split(".");
  return parseFloat(parts[0]).toLocaleString("en-US") + "." + parts[1];
}

function inputNumber(digit) {
  if (calculator.waitingForOperand) {
    calculator.currentValue = digit;
    calculator.waitingForOperand = false;
    clearActiveOperator();
  } else {
    calculator.currentValue =
      calculator.currentValue === "0" ? digit : calculator.currentValue + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (calculator.waitingForOperand) {
    calculator.currentValue = "0.";
    calculator.waitingForOperand = false;
    clearActiveOperator();
    updateDisplay();
    return;
  }
  if (!calculator.currentValue.includes(".")) {
    calculator.currentValue += ".";
  }
  updateDisplay();
}

function handleOperator(nextOperator) {
  const current = parseFloat(calculator.currentValue);
  const operatorSymbols = { "/": "\u00F7", "*": "\u00D7", "-": "\u2212", "+": "+" };

  if (calculator.operator && !calculator.waitingForOperand) {
    const result = compute(calculator.previousValue, current, calculator.operator);
    calculator.currentValue = String(result);
    calculator.expression = formatNumber(String(result)) + " " + operatorSymbols[nextOperator];
    calculator.previousValue = result;
  } else {
    if (!calculator.waitingForOperand) {
      calculator.expression = formatNumber(calculator.currentValue) + " " + operatorSymbols[nextOperator];
    } else {
      calculator.expression =
        calculator.expression.slice(0, -1) + operatorSymbols[nextOperator];
    }
    calculator.previousValue = current;
  }

  calculator.operator = nextOperator;
  calculator.waitingForOperand = true;
  setActiveOperator(nextOperator);
  updateDisplay();
}

function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? "Error" : a / b;
    default: return b;
  }
}

function handleEquals() {
  if (!calculator.operator) return;

  const current = parseFloat(calculator.currentValue);
  const operatorSymbols = { "/": "\u00F7", "*": "\u00D7", "-": "\u2212", "+": "+" };

  calculator.expression =
    formatNumber(String(calculator.previousValue)) +
    " " +
    operatorSymbols[calculator.operator] +
    " " +
    formatNumber(calculator.currentValue) +
    " =";

  const result = compute(calculator.previousValue, current, calculator.operator);
  calculator.currentValue = String(result);
  calculator.previousValue = null;
  calculator.operator = null;
  calculator.waitingForOperand = true;
  clearActiveOperator();
  updateDisplay();
}

function handleClear() {
  calculator.currentValue = "0";
  calculator.previousValue = null;
  calculator.operator = null;
  calculator.waitingForOperand = false;
  calculator.expression = "";
  clearActiveOperator();
  updateDisplay();
}

function handlePercent() {
  const current = parseFloat(calculator.currentValue);
  calculator.currentValue = String(current / 100);
  updateDisplay();
}

function handleToggleSign() {
  if (calculator.currentValue === "0") return;
  calculator.currentValue = String(-parseFloat(calculator.currentValue));
  updateDisplay();
}

function setActiveOperator(op) {
  clearActiveOperator();
  const btn = document.querySelector(`[data-action="operator"][data-value="${op}"]`);
  if (btn) btn.classList.add("active");
}

function clearActiveOperator() {
  document.querySelectorAll(".btn.operator.active").forEach((b) => b.classList.remove("active"));
}

document.querySelector(".buttons").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      handleOperator(value);
      break;
    case "equals":
      handleEquals();
      break;
    case "clear":
      handleClear();
      break;
    case "percent":
      handlePercent();
      break;
    case "toggle-sign":
      handleToggleSign();
      break;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "+") handleOperator("+");
  else if (e.key === "-") handleOperator("-");
  else if (e.key === "*") handleOperator("*");
  else if (e.key === "/") { e.preventDefault(); handleOperator("/"); }
  else if (e.key === "Enter" || e.key === "=") handleEquals();
  else if (e.key === "Escape") handleClear();
  else if (e.key === "%") handlePercent();
  else if (e.key === "Backspace") {
    if (!calculator.waitingForOperand) {
      calculator.currentValue =
        calculator.currentValue.length > 1
          ? calculator.currentValue.slice(0, -1)
          : "0";
      updateDisplay();
    }
  }
});

updateDisplay();
