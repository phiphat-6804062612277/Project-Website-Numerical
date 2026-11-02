'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { KaTeXMath } from '@/components/KaTeXMath';
import { SolutionType, SolutionResult, StepLog } from '@/lib/oop/types';
import { LinearSystemProblem } from '@/lib/oop/LinearSystemProblem';
import { SolverFactory } from '@/lib/oop/SolverFactory';
import { MatrixUtils } from '@/lib/oop/MatrixUtils';
import { 
  Calculator, 
  BookOpen, 
  History, 
  Sparkles, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Share2, 
  Layers, 
  Cpu, 
  Database,
  ArrowRight
} from 'lucide-react';

// Preset configurations
const PRESETS: Record<string, { name: string; dim: number; A: number[][]; b: number[]; desc: string }> = {
  default3: {
    name: '📌 โจทย์ 3×3 ทั่วไป (คำตอบลงตัว)',
    dim: 3,
    A: [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ],
    b: [8, -11, -3],
    desc: 'ระบบสมการ 3 ตัวแปรมาตรฐาน มีคำตอบ x1 = 2, x2 = 3, x3 = -1'
  },
  circuit3: {
    name: '⚡ วงจรไฟฟ้า 3 Loop (Kirchhoff Law)',
    dim: 3,
    A: [
      [10, -5, 0],
      [-5, 15, -6],
      [0, -6, 12]
    ],
    b: [20, 0, -10],
    desc: 'การวิเคราะห์กระแสในวงจรไฟฟ้า 3 Loop แบบ Mesh Analysis'
  },
  eng4: {
    name: '🏗️ ระบบสมการวิศวกรรม 4×4',
    dim: 4,
    A: [
      [4, -1, -1, 0],
      [-1, 4, 0, -1],
      [-1, 0, 4, -1],
      [0, -1, -1, 4]
    ],
    b: [100, 100, 200, 200],
    desc: 'การกระจายแรงหรือการถ่ายเทความร้อนในแผ่นระนาบแบบ 4 จุด'
  },
  singular: {
    name: '⚠️ กรณีไม่มีคำตอบ (Singular Det = 0)',
    dim: 3,
    A: [
      [1, 2, 3],
      [2, 4, 6],
      [3, 1, -1]
    ],
    b: [6, 12, 4],
    desc: 'แถวที่ 2 เป็นผลคูณแถวที่ 1 ทำให้ det(A) = 0 ไม่สามารถหาคำตอบเดียวได้'
  }
};

export default function MatrixSolverPage() {
  const [activeTab, setActiveTab] = useState<'solver' | 'oop' | 'history'>('solver');
  const [dimension, setDimension] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>(PRESETS.default3.A);
  const [vectorB, setVectorB] = useState<number[]>(PRESETS.default3.b);
  const [selectedMethod, setSelectedMethod] = useState<SolutionType>('GAUSS_JORDAN');
  
  // Solution state
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Run initial calculation on page load
  useEffect(() => {
    executeSolve(PRESETS.default3.A, PRESETS.default3.b, 'GAUSS_JORDAN');
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
  const executeSolve = async (A: number[][], b: number[], method: SolutionType) => {
    try {
      // Client-side instant OOP execution
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

  // Change matrix dimensions
  const handleDimensionChange = (newDim: number) => {
    setDimension(newDim);
    if (newDim === 2) {
      const newA = [[3, 2], [1, 4]];
      const newB = [12, 9];
      setMatrixA(newA);
      setVectorB(newB);
      executeSolve(newA, newB, selectedMethod);
    } else if (newDim === 3) {
      setMatrixA(PRESETS.default3.A);
      setVectorB(PRESETS.default3.b);
      executeSolve(PRESETS.default3.A, PRESETS.default3.b, selectedMethod);
    } else if (newDim === 4) {
      setMatrixA(PRESETS.eng4.A);
      setVectorB(PRESETS.eng4.b);
      executeSolve(PRESETS.eng4.A, PRESETS.eng4.b, selectedMethod);
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

  // Presets
  const handlePresetSelect = (presetKey: string) => {
    const p = PRESETS[presetKey];
    if (p) {
      setDimension(p.dim);
      setMatrixA(p.A);
      setVectorB(p.b);
      executeSolve(p.A, p.b, selectedMethod);
    }
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
    executeSolve(newA, newB, selectedMethod);
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
    executeSolve(newA, newB, selectedMethod);
  };

  // Copy shareable link
  const handleShareLink = () => {
    const shareData = btoa(JSON.stringify({ A: matrixA, b: vectorB, m: selectedMethod }));
    const url = `${window.location.origin}${window.location.pathname}?state=${shareData}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-mono font-bold text-lg">
              [A]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">NumeriCraft</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Matrix Solver Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ระบบแก้สมการเชิงเส้น Step-by-Step • สถาปัตยกรรมเชิงวัตถุ (OOP)</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('solver')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'solver'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>หน้าคำนวณ (Solver)</span>
            </button>
            <button
              onClick={() => setActiveTab('oop')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'oop'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>โครงสร้าง OOP สำหรับรายงาน</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
        {/* TAB 1: SOLVER & STEP-BY-STEP VIEW */}
        {/* ==================================================== */}
        {activeTab === 'solver' && (
          <div className="space-y-6">

            {/* Input Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>กำหนดขนาดและป้อนค่าระบบสมการ <KaTeXMath math="Ax = b" /></span>
                  </h2>
                  <p className="text-xs text-slate-400">เลือกขนาดมิติ ป้อนค่า หรือเลือกโจทย์ตัวอย่างมาตรฐาน</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Dimension selector */}
                  <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 px-2 font-medium">มิติ:</span>
                    {[2, 3, 4].map(dim => (
                      <button
                        key={dim}
                        onClick={() => handleDimensionChange(dim)}
                        className={`px-3 py-1 rounded-lg font-mono transition ${
                          dimension === dim
                            ? 'bg-indigo-600 text-white font-semibold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {dim}×{dim}
                      </button>
                    ))}
                  </div>

                  {/* Preset selector */}
                  <select
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    defaultValue="default3"
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {Object.entries(PRESETS).map(([key, p]) => (
                      <option key={key} value={key}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {/* Fast Action Buttons */}
                  <button
                    onClick={handleRandomize}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition"
                    title="สุ่มตัวเลข"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>สุ่มโจทย์</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition"
                    title="ล้างค่าเป็นเมทริกซ์เอกลักษณ์"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>ล้างค่า</span>
                  </button>
                </div>
              </div>

              {/* Matrix Form & Solver Selector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Matrix Inputs */}
                <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 shadow-inner">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2.5">
                    <span className="text-[11px] font-semibold text-indigo-300 font-mono tracking-wider uppercase">
                      [ สัมประสิทธิ์ A ] × [ ตัวแปร x ] = [ เวกเตอร์ b ]
                    </span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                      isSingular 
                        ? 'bg-rose-950/80 border-rose-800 text-rose-300 font-semibold' 
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}>
                      {isSingular ? 'det(A) = 0 (Singular)' : `det(A) = ${detPreview.toFixed(2)}`}
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
                              className="w-14 h-9 bg-slate-900 border border-slate-700/80 rounded-lg text-center font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs text-slate-400 font-mono">
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
                          className="w-14 h-9 bg-indigo-950/70 border border-indigo-600/80 rounded-lg text-center font-mono text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Method Options & Solve Button */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      เลือกวิธีคำนวณ (Numerical Method):
                    </label>

                    <div className="space-y-2">
                      <label 
                        onClick={() => setSelectedMethod('GAUSS_JORDAN')}
                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                          selectedMethod === 'GAUSS_JORDAN'
                            ? 'border-indigo-500/60 bg-indigo-950/30'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
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
                          <span className="text-xs font-semibold text-white block">Gauss-Jordan Elimination</span>
                          <span className="text-[11px] text-slate-400">แปลงสู่ Reduced Row Echelon Form (RREF)</span>
                        </div>
                      </label>

                      <label 
                        onClick={() => setSelectedMethod('GAUSS')}
                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                          selectedMethod === 'GAUSS'
                            ? 'border-indigo-500/60 bg-indigo-950/30'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
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
                          <span className="text-xs font-semibold text-white block">Gauss Elimination</span>
                          <span className="text-[11px] text-slate-400">สามเหลี่ยมบน + แทนค่าย้อนกลับ (Back-substitution)</span>
                        </div>
                      </label>

                      <label 
                        onClick={() => setSelectedMethod('CRAMER')}
                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                          selectedMethod === 'CRAMER'
                            ? 'border-indigo-500/60 bg-indigo-950/30'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
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
                          <span className="text-xs font-semibold text-white block">Cramer's Rule</span>
                          <span className="text-[11px] text-slate-400">อัตราส่วน Determinant: x_i = det(A_i) / det(A)</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => executeSolve(matrixA, vectorB, selectedMethod)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold rounded-2xl shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2 transform active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>คำนวณและแสดงขั้นตอนวิธีทำ (Solve)</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Results & Stepper Card */}
            {result && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur space-y-6">
                
                {/* Result Summary Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border ${
                      result.isSingular
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {result.isSingular ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">คำตอบของระบบสมการ (Solutions)</h3>
                      <p className="text-[11px] text-slate-400">
                        วิธี: {result.solverType} • เวลาคำนวณ: {result.executionTimeMs?.toFixed(2)} ms
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {result.isSingular ? (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                        ⚠️ ระบบสมการไม่มีคำตอบเอกลักษณ์ (Determinant = 0)
                      </div>
                    ) : (
                      result.answers.map((ans, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/40 flex items-center gap-2 shadow-sm"
                        >
                          <span className="text-xs text-indigo-300 font-mono">x{idx + 1} =</span>
                          <span className="text-sm font-bold text-cyan-300 font-mono">{ans}</span>
                        </div>
                      ))
                    )}

                    <button
                      onClick={handleShareLink}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition ml-2"
                      title="คัดลอกลิงก์แชร์โจทย์"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'คัดลอกแล้ว!' : 'แชร์ลิงก์'}</span>
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Stepper Display */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                        🔍 ขั้นตอนวิธีทำ (Step-by-Step Walkthrough)
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        ขั้นตอนที่ {activeStepIdx + 1} / {result.steps.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                        disabled={activeStepIdx === 0}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>ย้อนกลับ</span>
                      </button>
                      <button
                        onClick={() => setActiveStepIdx(Math.min(result.steps.length - 1, activeStepIdx + 1))}
                        disabled={activeStepIdx === result.steps.length - 1}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
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
                        <div className="text-indigo-300 font-semibold text-xs sm:text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          <span>{result.steps[activeStepIdx].title}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {result.steps[activeStepIdx].description}
                        </p>
                      </div>

                      {/* Formula KaTeX display if present */}
                      {result.steps[activeStepIdx].latexFormula && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs overflow-x-auto text-cyan-300">
                          <KaTeXMath math={result.steps[activeStepIdx].latexFormula!} block={true} />
                        </div>
                      )}

                      {/* Matrix Representation */}
                      <div className="inline-block bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 shadow-inner">
                        <div className="space-y-1.5 font-mono text-xs">
                          {result.steps[activeStepIdx].matrix.map((row, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-2">
                              <span className="text-slate-500 text-[10px] w-5">R{rIdx + 1}</span>
                              <span className="text-slate-500">[</span>
                              {row.map((val, cIdx) => {
                                const isResultCol = cIdx === row.length - 1;
                                const formatted = Math.abs(val) < 1e-9 ? '0.00' : val.toFixed(2);
                                return (
                                  <span
                                    key={cIdx}
                                    className={`w-14 text-right py-0.5 px-1 rounded ${
                                      isResultCol
                                        ? 'text-cyan-400 font-bold border-l border-slate-800 pl-2 bg-indigo-950/20'
                                        : 'text-slate-200'
                                    }`}
                                  >
                                    {formatted}
                                  </span>
                                );
                              })}
                              <span className="text-slate-500">]</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: OOP ARCHITECTURE BLUEPRINT (FOR REPORT CH. 2) */}
        {/* ==================================================== */}
        {activeTab === 'oop' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur space-y-6">
            
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">โครงสร้างการออกแบบเชิงวัตถุ (OOP Architecture)</h2>
                  <p className="text-xs text-slate-400">
                    ข้อมูลและหลักการเชิงวัตถุตามเกณฑ์รายงาน บทที่ 2 วิชา 040613204 Object-Oriented Programming (KMUTNB)
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Pillars Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>1. Inheritance &amp; Abstract</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  คลาสแม่ <code className="text-indigo-300">LinearSystemSolver</code> เป็น Abstract Class กำหนด method <code className="text-white">solve(): SolutionResult</code> ให้คลาสลูก <code className="text-cyan-300">GaussJordanSolver</code>, <code className="text-cyan-300">GaussEliminationSolver</code>, และ <code className="text-cyan-300">CramerSolver</code> สืบทอดและ Override
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>2. Polymorphism</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  ผ่าน <code className="text-cyan-300">SolverFactory.createSolver()</code> ผู้เรียกใช้สามารถสั่ง <code className="text-white">solver.solve()</code> บนอินสแตนซ์ใดก็ได้ ระบบจะทำงานตามขั้นตอนของคลาสลูกนั้นๆ และส่งผลลัพธ์ในรูปแบบมาตรฐานเดียวกัน
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>3. Composition (has-a)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  คลาส <code className="text-emerald-300">LinearSystemSolver</code> มี Attribute ภายในเป็น <code className="text-white">problem: LinearSystemProblem</code> โดย Solver ทำหน้าที่แก้ปัญหาที่มีโจทย์เป็นส่วนประกอบ แยก Data Model ออกจาก Execution Logic
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>4. Encapsulation</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  ข้อมูลเมทริกซ์และเวกเตอร์ภายใน <code className="text-amber-300">LinearSystemProblem</code> ถูกตั้งเป็น <code className="text-white">private</code> และเปิดให้เข้าถึงผ่าน Getter Methods และ Validation เท่านั้น ป้องกันการแก้ไขตรง
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>5. Constructor &amp; Super</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  คลาสลูกทุกคลาสส่งค่าอาร์กิวเมนต์ผ่าน Constructor และเรียก <code className="text-rose-300">super(problem, 'GAUSS_JORDAN')</code> เพื่อส่งต่อไปยังคลาสแม่ในการกำหนดคุณลักษณะพื้นฐาน
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <Database className="w-4 h-4" />
                  <span>6. Algorithm (RREF &amp; Pivoting)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  มีอัลกอริทึม Partial Pivoting สลับแถวเพื่อไม่ให้ Pivot เป็น 0 ลด Round-off error และเก็บบันทึก Row Operations ทีละสเต็ปสำหรับการเรนเดอร์กราฟิก
                </p>
              </div>

            </div>

            {/* Code mapping snippet */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 overflow-x-auto space-y-2">
              <div className="text-slate-500">// ผังโค้ดจริงที่ใช้ขับเคลื่อนระบบนี้ (นำไปแปะในรายงาน บทที่ 2 ได้ทันที)</div>
              <div className="text-indigo-400">export abstract class <span className="text-cyan-300">LinearSystemSolver</span> &#123;</div>
              <div className="pl-4 text-slate-400">protected problem: LinearSystemProblem; // Composition</div>
              <div className="pl-4 text-slate-400">protected steps: StepLog[] = [];</div>
              <div className="pl-4 text-emerald-400">abstract solve(): SolutionResult; // Polymorphic method</div>
              <div className="text-indigo-400">&#125;</div>
              <br />
              <div className="text-indigo-400">export class <span className="text-white">GaussJordanSolver</span> extends <span className="text-cyan-300">LinearSystemSolver</span> &#123;</div>
              <div className="pl-4 text-slate-400">// ทำ Partial Pivoting + Row Operations (RREF)</div>
              <div className="text-indigo-400">&#125;</div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: MONGODB HISTORY VIEW */}
        {/* ==================================================== */}
        {activeTab === 'history' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">ประวัติการคำนวณที่บันทึก (MongoDB Database)</h2>
                  <p className="text-xs text-slate-400">รายการโจทย์ที่เคยคำนวณ คลิกเพื่อโหลดกลับมาคำนวณใหม่ได้ทันที</p>
                </div>
              </div>
              <button
                onClick={fetchHistory}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
              >
                รีเฟรช
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-10 text-xs text-slate-500">กำลังโหลดข้อมูลจากฐานข้อมูล...</div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                ยังไม่มีประวัติการคำนวณในระบบ ลองกด "คำนวณ" ในหน้าแรกเพื่อบันทึกรายการแรก
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
                      setActiveTab('solver');
                      executeSolve(item.matrixA, item.vectorB, item.method);
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-indigo-300">
                        ขนาด {item.dimension}×{item.dimension} • {item.method}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleTimeString('th-TH')}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500">คำตอบ:</span>
                      {item.answers?.map((ans: number, aIdx: number) => (
                        <span key={aIdx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          x{aIdx + 1}={ans}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-indigo-400 group-hover:underline flex items-center gap-1 pt-1">
                      <span>โหลดโจทย์นี้</span>
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
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <p>NumeriCraft • วิชา 040613204 Object-Oriented Programming (KMUTNB)</p>
        <p className="text-[11px] text-slate-600 mt-1">Full-Stack Web App: Next.js • TypeScript • Tailwind CSS • MongoDB • Vercel</p>
      </footer>

    </div>
  );
}
