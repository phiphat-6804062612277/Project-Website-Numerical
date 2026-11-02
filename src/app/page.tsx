'use client';

import React, { useState, useEffect } from 'react';
import { KaTeXMath } from '@/components/KaTeXMath';
import { SolutionType, SolutionResult } from '@/lib/oop/types';
import { LinearSystemProblem } from '@/lib/oop/LinearSystemProblem';
import { SolverFactory } from '@/lib/oop/SolverFactory';
import { MatrixUtils } from '@/lib/oop/MatrixUtils';
import { 
  Calculator, 
  History, 
  Sparkles, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const METHOD_NAMES: Record<SolutionType, string> = {
  GAUSS_JORDAN: 'Gauss-Jordan',
  GAUSS: 'Gauss Elimination',
  CRAMER: 'Cramer',
};

export default function MatrixSolverPage() {
  const [activeTab, setActiveTab] = useState<'solver' | 'history'>('solver');
  const [pageView, setPageView] = useState<'input' | 'result'>('input');
  
  // Matrix dimensions & inputs
  const [dimension, setDimension] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2]
  ]);
  const [vectorB, setVectorB] = useState<number[]>([8, -11, -3]);
  const [selectedMethod, setSelectedMethod] = useState<SolutionType>('GAUSS_JORDAN');
  
  // Solution state
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch recent calculations from MongoDB
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistoryList(data.history);
      }
    } catch (e) {
      console.warn('Could not fetch history from API:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Execute solver using OOP classes
  const executeSolve = (A: number[][], b: number[], method: SolutionType) => {
    try {
      const problem = new LinearSystemProblem(A, b);
      const solver = SolverFactory.createSolver(problem, method);
      const solution = solver.solve();
      setResult(solution);
      setActiveStepIdx(0);

      // Save to MongoDB asynchronously via Next.js API
      fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrixA: A, vectorB: b, method }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetchHistory();
          }
        })
        .catch(err => console.warn('Saved background note:', err));
    } catch (err: any) {
      console.error('Solve error:', err);
    }
  };

  // Solve button clicked -> calculate and navigate to Result page
  const handleSolveClick = () => {
    executeSolve(matrixA, vectorB, selectedMethod);
    setPageView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Change matrix dimensions
  const handleDimensionChange = (newDim: number) => {
    setDimension(newDim);
    if (newDim === 2) {
      setMatrixA([[3, 2], [1, 4]]);
      setVectorB([12, 9]);
    } else if (newDim === 3) {
      setMatrixA([
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2]
      ]);
      setVectorB([8, -11, -3]);
    } else if (newDim === 4) {
      setMatrixA([
        [4, -1, -1, 0],
        [-1, 4, 0, -1],
        [-1, 0, 4, -1],
        [0, -1, -1, 4]
      ]);
      setVectorB([100, 100, 200, 200]);
    }
  };

  // Handle cell input change
  const handleCellChange = (r: number, c: number, value: string) => {
    const val = parseFloat(value) || 0;
    const newA = matrixA.map((row, ri) => 
      row.map((col, ci) => (ri === r && ci === c ? val : col))
    );
    setMatrixA(newA);
  };

  const handleVectorChange = (r: number, value: string) => {
    const val = parseFloat(value) || 0;
    const newB = vectorB.map((bVal, ri) => (ri === r ? val : bVal));
    setVectorB(newB);
  };

  // Randomize values
  const handleRandomize = () => {
    const newA: number[][] = [];
    const newB: number[] = [];
    for (let i = 0; i < dimension; i++) {
      const row: number[] = [];
      for (let j = 0; j < dimension; j++) {
        row.push(Math.floor(Math.random() * 15) - 5);
      }
      newA.push(row);
      newB.push(Math.floor(Math.random() * 20) - 5);
    }
    setMatrixA(newA);
    setVectorB(newB);
  };

  // Clear values (Identity matrix)
  const handleClear = () => {
    const newA: number[][] = [];
    const newB: number[] = [];
    for (let i = 0; i < dimension; i++) {
      const row: number[] = [];
      for (let j = 0; j < dimension; j++) {
        row.push(i === j ? 1 : 0);
      }
      newA.push(row);
      newB.push(0);
    }
    setMatrixA(newA);
    setVectorB(newB);
  };

  // Determinant calculation preview
  const detPreview = React.useMemo(() => {
    try {
      return MatrixUtils.calculateDeterminant(matrixA);
    } catch {
      return 0;
    }
  }, [matrixA]);

  const isSingular = Math.abs(detPreview) < 1e-9;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200/90 bg-white/80 backdrop-blur sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center">
            <h1 
              onClick={() => {
                setActiveTab('solver');
                setPageView('input');
              }}
              className="text-xl font-bold text-slate-900 tracking-tight cursor-pointer hover:text-indigo-600 transition"
            >
              Linear System
            </h1>
          </div>

          {/* Tab Navigation */}
          <nav className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => {
                setActiveTab('solver');
                setPageView('input');
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition ${
                activeTab === 'solver'
                  ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>คำนวณ</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติ ({historyList.length})</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ==================================================== */}
        {/* TAB 1: SOLVER VIEW */}
        {/* ==================================================== */}
        {activeTab === 'solver' && (
          <div className="space-y-6">

            {/* ------------------------------------------------ */}
            {/* VIEW 1: INPUT PAGE (หน้ากรอกโจทย์) */}
            {/* ------------------------------------------------ */}
            {pageView === 'input' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                
                {/* Controls bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>กำหนดขนาดและป้อนค่าระบบสมการ <KaTeXMath math="Ax = b" /></span>
                    </h2>
                    <p className="text-xs text-slate-500">เลือกขนาดมิติและป้อนค่าตัวเลขของระบบสมการ</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Dimension selector */}
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 px-2 font-medium">มิติ:</span>
                      {[2, 3, 4].map(dim => (
                        <button
                          key={dim}
                          onClick={() => handleDimensionChange(dim)}
                          className={`px-3 py-1 rounded-lg font-mono transition ${
                            dimension === dim
                              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {dim}×{dim}
                        </button>
                      ))}
                    </div>

                    {/* Fast Action Buttons */}
                    <button
                      onClick={handleRandomize}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs flex items-center gap-1 transition shadow-2xs"
                      title="สุ่มตัวเลข"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>สุ่มโจทย์</span>
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs flex items-center gap-1 transition shadow-2xs"
                      title="ล้างค่าเป็นเมทริกซ์เอกลักษณ์"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>ล้างค่า</span>
                    </button>
                  </div>
                </div>

                {/* Matrix Form & Solver Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Matrix Inputs */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
                      <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-wider">
                        เมทริกซ์สัมประสิทธิ์ A × ตัวแปร x = เวกเตอร์ b
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        isSingular 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold' 
                          : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                      }`}>
                        {isSingular ? 'det(A) = 0' : `det(A) = ${detPreview.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="space-y-3 overflow-x-auto py-1">
                      {matrixA.map((row, r) => (
                        <div key={r} className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-[11px] text-slate-500 font-mono w-6 text-right">R{r + 1}</span>
                          {row.map((val, c) => (
                            <React.Fragment key={c}>
                              <input
                                type="number"
                                step="any"
                                value={val}
                                onChange={(e) => handleCellChange(r, c, e.target.value)}
                                className="w-14 h-9 bg-white border border-slate-300 rounded-lg text-center font-mono text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                              />
                              <span className="text-xs text-slate-500 font-mono">
                                x{c + 1}{c < dimension - 1 ? ' +' : ''}
                              </span>
                            </React.Fragment>
                          ))}
                          <span className="text-slate-400 font-mono font-bold mx-1">=</span>
                          <input
                            type="number"
                            step="any"
                            value={vectorB[r] ?? 0}
                            onChange={(e) => handleVectorChange(r, e.target.value)}
                            className="w-14 h-9 bg-indigo-50 border border-indigo-300 rounded-lg text-center font-mono text-xs text-indigo-700 font-bold focus:outline-none focus:border-indigo-600 shadow-2xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Method Options & Solve Button */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-700 tracking-wider">
                        เลือกวิธีคำนวณ
                      </label>

                      <div className="space-y-2">
                        <label 
                          onClick={() => setSelectedMethod('GAUSS_JORDAN')}
                          className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                            selectedMethod === 'GAUSS_JORDAN'
                              ? 'border-indigo-500 bg-white ring-1 ring-indigo-500 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="solver_type"
                            value="GAUSS_JORDAN"
                            checked={selectedMethod === 'GAUSS_JORDAN'}
                            onChange={() => setSelectedMethod('GAUSS_JORDAN')}
                            className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="ml-3">
                            <span className="text-xs font-semibold text-slate-900 block">Gauss-Jordan Elimination</span>
                            <span className="text-[11px] text-slate-500">แปลงเป็นเมทริกซ์ลดรูปขั้นบันไดแถว</span>
                          </div>
                        </label>

                        <label 
                          onClick={() => setSelectedMethod('GAUSS')}
                          className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                            selectedMethod === 'GAUSS'
                              ? 'border-indigo-500 bg-white ring-1 ring-indigo-500 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="solver_type"
                            value="GAUSS"
                            checked={selectedMethod === 'GAUSS'}
                            onChange={() => setSelectedMethod('GAUSS')}
                            className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="ml-3">
                            <span className="text-xs font-semibold text-slate-900 block">Gauss Elimination</span>
                            <span className="text-[11px] text-slate-500">แปลงเป็นเมทริกซ์สามเหลี่ยมบนแล้วแทนค่าย้อนกลับ</span>
                          </div>
                        </label>

                        <label 
                          onClick={() => setSelectedMethod('CRAMER')}
                          className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                            selectedMethod === 'CRAMER'
                              ? 'border-indigo-500 bg-white ring-1 ring-indigo-500 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="solver_type"
                            value="CRAMER"
                            checked={selectedMethod === 'CRAMER'}
                            onChange={() => setSelectedMethod('CRAMER')}
                            className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="ml-3">
                            <span className="text-xs font-semibold text-slate-900 block">Cramer's Rule</span>
                            <span className="text-[11px] text-slate-500">หาคำตอบด้วยอัตราส่วนดีเทอร์มิแนนต์</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSolveClick}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-semibold rounded-2xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 transform active:scale-[0.99]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>คำนวณและแสดงขั้นตอนวิธีทำ</span>
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW 2: RESULT PAGE (หน้าแสดงคำตอบและขั้นตอน) */}
            {/* ------------------------------------------------ */}
            {pageView === 'result' && result && (
              <div className="space-y-5">
                
                {/* Back to Edit Button & Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setPageView('input');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-2xs transition self-start"
                  >
                    <ArrowLeft className="w-4 h-4 text-indigo-600" />
                    <span>ย้อนกลับไปแก้ไขโจทย์</span>
                  </button>

                  <div className="text-xs text-slate-500 font-mono">
                    มิติ <span className="font-semibold text-slate-800">{dimension}×{dimension}</span> • วิธี <span className="font-semibold text-indigo-600">{METHOD_NAMES[result.solverType]}</span> • เวลา <span className="font-semibold text-slate-800">{result.executionTimeMs?.toFixed(2)} ms</span>
                  </div>
                </div>

                {/* Results Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                  
                  {/* Result Summary Bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border ${
                        result.isSingular
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {result.isSingular ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">คำตอบของระบบสมการ</h3>
                        <p className="text-[11px] text-slate-500">
                          {result.isSingular ? 'ระบบสมการนี้ไม่มีคำตอบชุดเดียว' : 'คำตอบของตัวแปรทั้งหมด'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {result.isSingular ? (
                        <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                          ระบบสมการไม่มีคำตอบชุดเดียว ดีเทอร์มิแนนต์เท่ากับ 0
                        </div>
                      ) : (
                        result.answers.map((ans, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-indigo-200 flex items-center gap-2 shadow-2xs"
                          >
                            <span className="text-xs text-slate-500 font-mono">x{idx + 1} =</span>
                            <span className="text-sm font-bold text-indigo-600 font-mono">{ans}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Step-by-Step Stepper Display */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 tracking-wider">
                          ขั้นตอนวิธีทำ
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                          ขั้นตอนที่ {activeStepIdx + 1} / {result.steps.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                          disabled={activeStepIdx === 0}
                          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>ย้อนกลับ</span>
                        </button>
                        <button
                          onClick={() => setActiveStepIdx(Math.min(result.steps.length - 1, activeStepIdx + 1))}
                          disabled={activeStepIdx === result.steps.length - 1}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span>ถัดไป</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Active Step Content */}
                    {result.steps[activeStepIdx] && (
                      <div className="space-y-4">
                        
                        <div className="space-y-1">
                          <div className="text-indigo-900 font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            <span>{result.steps[activeStepIdx].title}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {result.steps[activeStepIdx].description}
                          </p>
                        </div>

                        {/* Formula KaTeX display if present */}
                        {result.steps[activeStepIdx].latexFormula && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs overflow-x-auto text-indigo-950 shadow-2xs">
                            <KaTeXMath math={result.steps[activeStepIdx].latexFormula!} block={true} />
                          </div>
                        )}

                        {/* Matrix Representation */}
                        <div className="inline-block bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                          <div className="space-y-1.5 font-mono text-xs">
                            {result.steps[activeStepIdx].matrix.map((row, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-2">
                                <span className="text-slate-400 text-[10px] w-5">R{rIdx + 1}</span>
                                <span className="text-slate-400">[</span>
                                {row.map((val, cIdx) => {
                                  const isResultCol = cIdx === row.length - 1;
                                  const formatted = Math.abs(val) < 1e-9 ? '0.00' : val.toFixed(2);
                                  return (
                                    <span
                                      key={cIdx}
                                      className={`w-14 text-right py-0.5 px-1 rounded ${
                                        isResultCol
                                          ? 'text-indigo-700 font-bold border-l border-slate-200 pl-2 bg-indigo-50/60'
                                          : 'text-slate-800'
                                      }`}
                                    >
                                      {formatted}
                                    </span>
                                  );
                                })}
                                <span className="text-slate-400">]</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>

                {/* Bottom Action: Calculate New Problem */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setPageView('input');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition active:scale-[0.99]"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>คำนวณโจทย์ใหม่</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: MONGODB HISTORY VIEW */}
        {/* ==================================================== */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">ประวัติการคำนวณ</h2>
                  <p className="text-xs text-slate-500">รายการโจทย์ที่เคยคำนวณ คลิกเพื่อโหลดกลับมาดูผลลัพธ์ได้ทันที</p>
                </div>
              </div>
              <button
                onClick={fetchHistory}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 border border-slate-200 transition shadow-2xs"
              >
                รีเฟรช
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-10 text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                ยังไม่มีประวัติการคำนวณในระบบ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {historyList.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    onClick={() => {
                      setDimension(item.dimension);
                      setMatrixA(item.matrixA);
                      setVectorB(item.vectorB);
                      setSelectedMethod(item.method);
                      executeSolve(item.matrixA, item.vectorB, item.method);
                      setActiveTab('solver');
                      setPageView('result');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-white hover:shadow-sm cursor-pointer transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-indigo-600">
                        ขนาด {item.dimension}×{item.dimension} • {METHOD_NAMES[item.method as SolutionType] || item.method}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString('th-TH')}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-700 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400">คำตอบ:</span>
                      {item.answers?.map((ans: number, aIdx: number) => (
                        <span key={aIdx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-indigo-700 font-semibold">
                          x{aIdx + 1}={ans}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-indigo-600 group-hover:underline flex items-center gap-1 pt-1 font-medium">
                      <span>เปิดดูผลลัพธ์</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>Linear System • วิชา 040613204 Object-Oriented Programming (KMUTNB)</p>
      </footer>

    </div>
  );
}
