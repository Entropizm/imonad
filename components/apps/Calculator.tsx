"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";

interface CalculatorProps {
  onClose: () => void;
}

export default function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    if (previousValue !== null && operation && !resetDisplay) {
      calculate();
    } else {
      setPreviousValue(current);
    }
    setOperation(op);
    setResetDisplay(true);
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;
    
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case "+":
        result = previousValue + current;
        break;
      case "-":
        result = previousValue - current;
        break;
      case "×":
        result = previousValue * current;
        break;
      case "÷":
        result = previousValue / current;
        break;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  return (
    <div className="w-full h-full bg-black flex flex-col">
      <AppHeader title="Calculator" onClose={onClose} />

      {/* Display */}
      <div className="px-4 py-8 text-right">
        <div className="text-white text-6xl font-light overflow-hidden overflow-ellipsis">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-1 p-2 grid grid-rows-5 gap-2">
        {buttons.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            {row.map((btn) => {
              const isOperation = ["÷", "×", "-", "+", "="].includes(btn);
              const isZero = btn === "0";
              const isSpecial = ["C", "±", "%"].includes(btn);

              return (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === "=") calculate();
                    else if (btn === "C") handleClear();
                    else if (isOperation) handleOperation(btn);
                    else handleNumber(btn);
                  }}
                  className={`
                    ${isZero ? "col-span-2" : ""}
                    ${isOperation ? "bg-orange-500" : isSpecial ? "bg-gray-500" : "bg-gray-700"}
                    text-white text-2xl font-light rounded-full active:opacity-70 transition-opacity
                    ${isZero ? "text-left pl-8" : ""}
                  `}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

