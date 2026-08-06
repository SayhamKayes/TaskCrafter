import { useState } from "react";
import { Calculator as CalcIcon, Delete, Equal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CGPACalculator from "@/components/calculator/CGPACalculator";

type CalcMode = "basic" | "scientific" | "cgpa";

export default function CalculatorPage() {
  const [mode, setMode] = useState<CalcMode>("basic");
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isNewNumber, setIsNewNumber] = useState(true);
  



  // Basic/Scientific calculator functions
  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setIsNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
      setIsNewNumber(false);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setIsNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setIsNewNumber(true);
    }
  };

  const handleEquals = () => {
    try {
      const fullEquation = equation + display;
      // Safe evaluation using Function constructor
      const sanitized = fullEquation.replace(/[^0-9+\-*/.() ]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      setDisplay(String(result));
      setEquation("");
      setIsNewNumber(true);
    } catch {
      setDisplay("Error");
      setIsNewNumber(true);
    }
  };

  const handleScientific = (func: string) => {
    try {
      const num = parseFloat(display);
      let result: number;
      
      switch (func) {
        case "sin": result = Math.sin(num * Math.PI / 180); break;
        case "cos": result = Math.cos(num * Math.PI / 180); break;
        case "tan": result = Math.tan(num * Math.PI / 180); break;
        case "log": result = Math.log10(num); break;
        case "ln": result = Math.log(num); break;
        case "sqrt": result = Math.sqrt(num); break;
        case "square": result = num * num; break;
        case "cube": result = num * num * num; break;
        case "1/x": result = 1 / num; break;
        case "factorial": 
          result = 1;
          for (let i = 2; i <= num; i++) result *= i;
          break;
        case "pi": result = Math.PI; break;
        case "e": result = Math.E; break;
        default: result = num;
      }
      
      setDisplay(String(result));
      setIsNewNumber(true);
    } catch {
      setDisplay("Error");
    }
  };




  const BasicButton = ({ children, onClick, variant = "default", className = "" }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "operator" | "action";
    className?: string;
  }) => (
    <Button
      onClick={onClick}
      variant="outline"
      className={cn(
        "h-14 text-lg font-medium transition-all duration-150",
        variant === "operator" && "bg-calc-bg text-calc hover:bg-calc hover:text-white",
        variant === "action" && "bg-muted text-foreground",
        className
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-calc-bg">
            <CalcIcon className="w-6 h-6 text-calc" />
          </div>
          Calculator
        </h1>
        <p className="text-muted-foreground mt-1">Basic, scientific, and CGPA calculator</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as CalcMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="scientific">Scientific</TabsTrigger>
          <TabsTrigger value="cgpa">CGPA</TabsTrigger>
        </TabsList>

        {/* Basic Calculator */}
        <TabsContent value="basic" className="mt-6">
          <Card className="max-w-sm mx-auto">
            <CardContent className="pt-6">
              {/* Display */}
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="text-sm text-muted-foreground h-6 text-right">{equation}</div>
                <div className="text-4xl font-mono-display text-right truncate">{display}</div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <BasicButton onClick={handleClear} variant="action">C</BasicButton>
                <BasicButton onClick={() => handleOperator("/")} variant="operator">÷</BasicButton>
                <BasicButton onClick={() => handleOperator("*")} variant="operator">×</BasicButton>
                <BasicButton onClick={handleBackspace} variant="action">
                  <Delete className="w-5 h-5" />
                </BasicButton>

                {[7, 8, 9].map((n) => (
                  <BasicButton key={n} onClick={() => handleNumber(String(n))}>{n}</BasicButton>
                ))}
                <BasicButton onClick={() => handleOperator("-")} variant="operator">−</BasicButton>

                {[4, 5, 6].map((n) => (
                  <BasicButton key={n} onClick={() => handleNumber(String(n))}>{n}</BasicButton>
                ))}
                <BasicButton onClick={() => handleOperator("+")} variant="operator">+</BasicButton>

                {[1, 2, 3].map((n) => (
                  <BasicButton key={n} onClick={() => handleNumber(String(n))}>{n}</BasicButton>
                ))}
                <BasicButton 
                  onClick={handleEquals} 
                  className="row-span-2 gradient-calc text-white border-0 hover:opacity-90"
                >
                  <Equal className="w-5 h-5" />
                </BasicButton>

                <BasicButton onClick={() => handleNumber("0")} className="col-span-2">0</BasicButton>
                <BasicButton onClick={handleDecimal}>.</BasicButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scientific Calculator */}
        <TabsContent value="scientific" className="mt-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              {/* Display */}
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="text-sm text-muted-foreground h-6 text-right">{equation}</div>
                <div className="text-4xl font-mono-display text-right truncate">{display}</div>
              </div>

              {/* Scientific Functions */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                {["sin", "cos", "tan", "log", "ln"].map((func) => (
                  <BasicButton key={func} onClick={() => handleScientific(func)} variant="action" className="text-sm">
                    {func}
                  </BasicButton>
                ))}
                {["sqrt", "x²", "x³", "1/x", "n!"].map((func, i) => (
                  <BasicButton 
                    key={func} 
                    onClick={() => handleScientific(["sqrt", "square", "cube", "1/x", "factorial"][i])} 
                    variant="action" 
                    className="text-sm"
                  >
                    {func === "sqrt" ? "√" : func}
                  </BasicButton>
                ))}
                <BasicButton onClick={() => handleScientific("pi")} variant="action" className="text-sm">π</BasicButton>
                <BasicButton onClick={() => handleScientific("e")} variant="action" className="text-sm">e</BasicButton>
                <BasicButton onClick={() => handleNumber("(")} variant="action" className="text-sm">(</BasicButton>
                <BasicButton onClick={() => handleNumber(")")} variant="action" className="text-sm">)</BasicButton>
                <BasicButton onClick={() => handleOperator("%")} variant="action" className="text-sm">%</BasicButton>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-4 gap-2">
                <BasicButton onClick={handleClear} variant="action">C</BasicButton>
                <BasicButton onClick={() => handleOperator("/")} variant="operator">÷</BasicButton>
                <BasicButton onClick={() => handleOperator("*")} variant="operator">×</BasicButton>
                <BasicButton onClick={handleBackspace} variant="action">
                  <Delete className="w-5 h-5" />
                </BasicButton>

                {[7, 8, 9].map((n) => (
                  <BasicButton key={n} onClick={() => handleNumber(String(n))}>{n}</BasicButton>
                ))}
                <BasicButton onClick={() => handleOperator("-")} variant="operator">−</BasicButton>

                {[4, 5, 6].map((n) => (
                  <BasicButton key={n} onClick={() => handleNumber(String(n))}>{n}</BasicButton>
                ))}
                <BasicButton onClick={() => handleOperator("+")} variant="operator">+</BasicButton>

                {[1, 2, 3].map((n) => (
                  <BasicButton key={n} onClick={() => handleNumber(String(n))}>{n}</BasicButton>
                ))}
                <BasicButton 
                  onClick={handleEquals} 
                  className="row-span-2 gradient-calc text-white border-0 hover:opacity-90"
                >
                  <Equal className="w-5 h-5" />
                </BasicButton>

                <BasicButton onClick={() => handleNumber("0")} className="col-span-2">0</BasicButton>
                <BasicButton onClick={handleDecimal}>.</BasicButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CGPA Calculator */}
        <TabsContent value="cgpa" className="mt-6">
          <CGPACalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
