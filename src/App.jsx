import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Trash2, Cpu, Layers, Activity, 
  Database, ArrowRight, Settings, Clock, MemoryStick, Search, 
  Lock, HardDrive, Sparkles, MessageSquare, Loader2
} from 'lucide-react';

// --- Gemini API Configuration ---
const apiKey = "AIzaSyAp7hYxrhDG5m5S1XzWbj2CPz5SrxZfT_A"; // The execution environment provides the key at runtime.

const callGemini = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "无法生成分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 服务暂时不可用，请检查网络或稍后重试。";
  }
};

// --- 样式工具 ---
const cardClass = "bg-white p-6 rounded-xl shadow-sm border border-slate-200";
const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondary = "flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnDanger = "flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors";
const btnMagic = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70";

// --- 模块 1: 进程状态管理 (五态模型) ---
const ProcessStateModule = () => {
  const [processes, setProcesses] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [logs, setLogs] = useState([]);
  const [aiReport, setAiReport] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));

  const createProcess = () => {
    const newProcess = { id: nextId, state: 'NEW', name: `P${nextId}` };
    setProcesses([...processes, newProcess]);
    setNextId(nextId + 1);
    addLog(`进程 P${nextId} 被创建 (NEW)`);
  };

  const changeState = (id, targetState, actionName) => {
    setProcesses(prev => {
      const current = prev.find(p => p.id === id);
      if (!current) return prev;
      
      if (targetState === 'RUNNING') {
        const isAnyRunning = prev.some(p => p.state === 'RUNNING');
        if (isAnyRunning) {
          alert("CPU正忙，请先中断或阻塞当前运行的进程！");
          return prev;
        }
      }

      addLog(`进程 ${current.name}: ${current.state} -> ${targetState} (${actionName})`);
      return prev.map(p => p.id === id ? { ...p, state: targetState } : p);
    });
  };

  const handleAiAnalyze = async () => {
    if (logs.length === 0) {
      setAiReport("系统日志为空，请先进行一些操作。");
      return;
    }
    setIsAiLoading(true);
    const prompt = `你是一个操作系统内核专家。请根据以下最近的系统日志，简要分析当前的系统行为，解释发生了什么调度事件，并指出是否有潜在的效率问题（例如频繁切换）。请用中文回答，风格专业但易懂。\n\nLogs:\n${logs.join('\n')}`;
    
    const result = await callGemini(prompt);
    setAiReport(result);
    setIsAiLoading(false);
  };

  const StateBox = ({ title, stateKey, color, children }) => (
    <div className={`flex-1 min-h-[160px] border-2 rounded-xl p-3 flex flex-col gap-2 ${color} transition-all`}>
      <h3 className="font-bold text-slate-700 text-center border-b pb-2 mb-2 border-slate-300/50">{title}</h3>
      <div className="flex flex-wrap gap-2 content-start justify-center">
        {children}
      </div>
    </div>
  );

  const ProcessItem = ({ p }) => (
    <div className="w-16 h-16 rounded-full bg-white shadow-md flex flex-col items-center justify-center border border-slate-200 text-xs font-bold animate-in zoom-in duration-300">
      <span className="text-lg text-blue-600">{p.name}</span>
      <span className="scale-75 text-slate-400">ID:{p.id}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          进程状态转换模型
        </h2>
        <div className="flex gap-2">
           <button onClick={handleAiAnalyze} disabled={isAiLoading} className={btnMagic}>
             {isAiLoading ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18} />} 
             {isAiLoading ? "分析中..." : "生成内核报告"}
           </button>
           <button onClick={createProcess} className={btnPrimary}>
             <Plus size={18} /> 创建新进程
           </button>
        </div>
      </div>

      {aiReport && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
           <h3 className="text-indigo-800 font-bold flex items-center gap-2 mb-2">
             <MessageSquare size={16}/> 内核分析报告 (Gemini)
           </h3>
           <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 relative">
        <StateBox title="创建态 (New)" stateKey="NEW" color="border-gray-200 bg-gray-50">
          {processes.filter(p => p.state === 'NEW').map(p => (
            <div key={p.id} className="group relative">
              <ProcessItem p={p} />
              <button onClick={() => changeState(p.id, 'READY', '提交')} className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                提交 (Admit)
              </button>
            </div>
          ))}
        </StateBox>

        <StateBox title="就绪态 (Ready)" stateKey="READY" color="border-yellow-200 bg-yellow-50">
           {processes.filter(p => p.state === 'READY').map(p => (
            <div key={p.id} className="group relative">
              <ProcessItem p={p} />
              <button onClick={() => changeState(p.id, 'RUNNING', '调度')} className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                调度 (Dispatch)
              </button>
            </div>
          ))}
        </StateBox>

        <StateBox title="运行态 (Running)" stateKey="RUNNING" color="border-green-200 bg-green-50">
           {processes.filter(p => p.state === 'RUNNING').map(p => (
            <div key={p.id} className="group relative">
              <ProcessItem p={p} />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white p-2 rounded shadow-lg border">
                 <button onClick={() => changeState(p.id, 'READY', '超时')} className="text-[10px] px-2 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded">
                  超时 (Timeout)
                </button>
                <button onClick={() => changeState(p.id, 'BLOCKED', '等待事件')} className="text-[10px] px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded">
                  等待 (Block)
                </button>
                <button onClick={() => changeState(p.id, 'TERMINATED', '完成')} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded">
                  退出 (Exit)
                </button>
              </div>
            </div>
          ))}
        </StateBox>

        <div className="col-start-2">
           <StateBox title="阻塞态 (Blocked)" stateKey="BLOCKED" color="border-red-200 bg-red-50">
             {processes.filter(p => p.state === 'BLOCKED').map(p => (
              <div key={p.id} className="group relative">
                <ProcessItem p={p} />
                <button onClick={() => changeState(p.id, 'READY', '事件发生')} className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  唤醒 (Wakeup)
                </button>
              </div>
            ))}
          </StateBox>
        </div>

        <div className="col-start-3">
          <StateBox title="终止态 (Terminated)" stateKey="TERMINATED" color="border-slate-200 bg-slate-100 opacity-70">
             {processes.filter(p => p.state === 'TERMINATED').map(p => (
              <div key={p.id} className="opacity-50">
                <ProcessItem p={p} />
              </div>
            ))}
          </StateBox>
        </div>
        <div className="absolute top-[80px] left-[32%] text-slate-400"><ArrowRight size={24} /></div>
        <div className="absolute top-[80px] left-[65%] text-slate-400"><ArrowRight size={24} /></div>
      </div>

      <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-32 overflow-y-auto">
        {logs.map((log, i) => <div key={i}>{log}</div>)}
        {logs.length === 0 && <span className="opacity-50">系统日志...</span>}
      </div>
    </div>
  );
};

// --- 模块 2 & 3: IPC & 信号量 (生产者-消费者) - 修复版 ---
const IPCModule = () => {
  const BUFFER_SIZE = 8;
  const [buffer, setBuffer] = useState([]);
  const [mutex, setMutex] = useState(1);
  const [empty, setEmpty] = useState(BUFFER_SIZE);
  const [full, setFull] = useState(0);
  const [activeActor, setActiveActor] = useState(null); // 'PRODUCER' | 'CONSUMER' | null
  const [speed, setSpeed] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); // 新增：状态提示信息

  // 使用 ref 来追踪定时器，以便 Reset 时能彻底清除
  const timerRef = useRef(null);       // 自动运行的 interval
  const animationRef = useRef(null);   // 动画的 timeout

  const produce = () => {
    if (full >= BUFFER_SIZE) {
        setStatusMsg("缓冲区已满！生产者被阻塞 (Blocked)");
        setTimeout(() => setStatusMsg(""), 1500);
        return;
    }
    
    setActiveActor('PRODUCER');
    setStatusMsg("正在写入缓冲区...");
    
    // 记录 timeout ID
    animationRef.current = setTimeout(() => {
        setBuffer(prev => [...prev, { id: Date.now(), color: 'bg-blue-500' }]);
        setFull(f => f + 1);
        setEmpty(e => e - 1);
        setActiveActor(null);
        setStatusMsg("");
        animationRef.current = null;
    }, speed * 0.5);
  };

  const consume = () => {
    if (full <= 0) {
        setStatusMsg("缓冲区为空！消费者被阻塞 (Blocked)");
        setTimeout(() => setStatusMsg(""), 1500);
        return;
    }

    setActiveActor('CONSUMER');
    setStatusMsg("正在读取缓冲区...");

    animationRef.current = setTimeout(() => {
        setBuffer(prev => prev.slice(1));
        setFull(f => f - 1);
        setEmpty(e => e + 1);
        setActiveActor(null);
        setStatusMsg("");
        animationRef.current = null;
    }, speed * 0.5);
  };

  // 修复 Reset 逻辑：彻底清除所有未完成的动作
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationRef.current) clearTimeout(animationRef.current); // 关键修复：清除动画
    
    setBuffer([]);
    setEmpty(BUFFER_SIZE);
    setFull(0);
    setIsRunning(false);
    setActiveActor(null);
    setStatusMsg("系统已重置");
    setTimeout(() => setStatusMsg(""), 1000);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const choice = Math.random();
        if (full === 0) produce();
        else if (full === BUFFER_SIZE) consume();
        else {
           if (choice > 0.5) produce();
           else consume();
        }
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => {
        clearInterval(timerRef.current);
        if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isRunning, full, empty, speed]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-500" />
          进程通信与同步 (生产者-消费者)
        </h2>
        <div className="flex items-center gap-4">
           {/* 状态消息条 */}
           <div className={`text-sm font-bold transition-all ${statusMsg.includes("阻塞") ? "text-red-500 animate-pulse" : "text-slate-500"}`}>
             {statusMsg}
           </div>

           <div className="h-6 w-px bg-slate-300"></div>

           <div className="flex items-center gap-2 text-sm text-slate-600">
             <Clock size={16} /> 速度:
             <input type="range" min="200" max="2000" step="200" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24 accent-blue-600" />
           </div>
           <button onClick={() => setIsRunning(!isRunning)} className={isRunning ? btnDanger : btnPrimary}>
             {isRunning ? <Pause size={18} /> : <Play size={18} />} {isRunning ? "停止模拟" : "自动模拟"}
           </button>
           <button onClick={handleReset} className={btnSecondary}>
             <RotateCcw size={18} /> 重置
           </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <div className="text-sm text-slate-500 font-mono">Mutex (互斥)</div>
            <div className={`text-2xl font-bold transition-colors duration-300 ${activeActor ? 'text-red-500' : 'text-green-500'}`}>
                {activeActor ? 0 : 1}
            </div>
            <div className="text-xs text-slate-400 mt-1">{activeActor ? "Locked (锁定)" : "Unlocked (空闲)"}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <div className="text-sm text-slate-500 font-mono">Empty (空槽)</div>
            <div className="text-2xl font-bold text-blue-600">{empty}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <div className="text-sm text-slate-500 font-mono">Full (已占用)</div>
            <div className="text-2xl font-bold text-purple-600">{full}</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-12 py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 relative">
        
        {/* 生产者 - 修复了透明度逻辑 */}
        <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${activeActor === 'CONSUMER' ? 'opacity-30 blur-[1px]' : 'opacity-100'} ${activeActor === 'PRODUCER' ? 'scale-110' : ''}`}>
           <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition-colors duration-300 ${activeActor === 'PRODUCER' ? 'bg-blue-100 border-blue-500' : 'bg-white border-slate-200'}`}>
              <Plus size={32} className={activeActor === 'PRODUCER' ? 'text-blue-600' : 'text-slate-400'} />
           </div>
           <span className={`font-bold ${activeActor === 'PRODUCER' ? 'text-blue-700' : 'text-slate-500'}`}>生产者</span>
           <button onClick={produce} disabled={isRunning} className="text-xs px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">手动生产</button>
        </div>

        {/* 缓冲区管道 */}
        <div className="relative w-[400px] h-24 bg-slate-200 rounded-lg border-4 border-slate-300 flex items-center px-2 shadow-inner overflow-hidden">
           <div className="absolute top-0 left-0 bg-slate-300 text-[10px] px-2 py-1 rounded-br text-slate-600 font-bold z-10">共享缓冲区</div>
           <div className="flex gap-2 w-full z-0">
              {buffer.map((item) => (
                  <div key={item.id} className="h-16 flex-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-md border border-blue-300 animate-in slide-in-from-left duration-300 flex items-center justify-center text-white/80 font-mono text-xs">
                      Data
                  </div>
              ))}
              {Array.from({ length: BUFFER_SIZE - buffer.length }).map((_, i) => (
                  <div key={i} className="h-16 flex-1 border-2 border-dashed border-slate-400/30 rounded" />
              ))}
           </div>
           {/* 锁图标 - 当 mutex 锁定时显示 */}
           {activeActor && (
               <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-20 animate-in fade-in duration-200">
                   <Lock size={48} className="text-red-500 drop-shadow-lg" />
               </div>
           )}
        </div>

        {/* 消费者 - 修复了透明度逻辑 */}
        <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${activeActor === 'PRODUCER' ? 'opacity-30 blur-[1px]' : 'opacity-100'} ${activeActor === 'CONSUMER' ? 'scale-110' : ''}`}>
           <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition-colors duration-300 ${activeActor === 'CONSUMER' ? 'bg-green-100 border-green-500' : 'bg-white border-slate-200'}`}>
              <Trash2 size={32} className={activeActor === 'CONSUMER' ? 'text-green-600' : 'text-slate-400'} />
           </div>
           <span className={`font-bold ${activeActor === 'CONSUMER' ? 'text-green-700' : 'text-slate-500'}`}>消费者</span>
           <button onClick={consume} disabled={isRunning} className="text-xs px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">手动消费</button>
        </div>

      </div>
    </div>
  );
};

// --- 模块 4: CPU 调度 ---
const SchedulerModule = () => {
  const [processes, setProcesses] = useState([
    { id: 1, name: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
    { id: 2, name: 'P2', arrivalTime: 1, burstTime: 8, priority: 2 },
    { id: 3, name: 'P3', arrivalTime: 2, burstTime: 3, priority: 3 },
  ]);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [results, setResults] = useState(null);
  const [ganttData, setGanttData] = useState([]);
  const [newP, setNewP] = useState({ name: 'P4', arrivalTime: 0, burstTime: 5, priority: 1 });
  
  // AI
  const [aiAdvice, setAiAdvice] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const addProcess = () => {
    setProcesses([...processes, { ...newP, id: Date.now() }]);
    setNewP({ ...newP, name: `P${processes.length + 2}` });
  };
  const removeProcess = (id) => setProcesses(processes.filter(p => p.id !== id));

  const handleAiAdvice = async () => {
    if (processes.length === 0) return;
    setIsAiLoading(true);
    
    const procStr = processes.map(p => `${p.name}(Arrival:${p.arrivalTime}, Burst:${p.burstTime})`).join(', ');
    const prompt = `你是一个操作系统CPU调度专家。给定以下进程列表：[${procStr}]。请简要分析哪种调度算法（FCFS, SJF, RR）可能给出最短的平均等待时间，并解释为什么。用中文回答，不超过100字。`;
    
    const result = await callGemini(prompt);
    setAiAdvice(result);
    setIsAiLoading(false);
  };

  const runSimulation = () => {
    let timeline = [];
    let currentTime = 0;
    let completed = [];
    let workingProcs = processes.map(p => ({ ...p, remainingTime: p.burstTime, waitingTime: 0, turnAroundTime: 0, startTime: -1 }));
    
    workingProcs.sort((a, b) => a.arrivalTime - b.arrivalTime);

    if (algorithm === 'FCFS') {
      for (let p of workingProcs) {
        if (currentTime < p.arrivalTime) currentTime = p.arrivalTime;
        const start = currentTime;
        const end = start + p.burstTime;
        timeline.push({ name: p.name, start, end, type: 'run' });
        p.turnAroundTime = end - p.arrivalTime;
        p.waitingTime = p.turnAroundTime - p.burstTime;
        currentTime = end;
        completed.push(p);
      }
    } 
    else if (algorithm === 'SJF') {
      let count = 0;
      let n = workingProcs.length;
      let isCompleted = new Array(n).fill(false);
      while (count < n) {
        let idx = -1;
        let minBurst = Infinity;
        for (let i = 0; i < n; i++) {
          if (!isCompleted[i] && workingProcs[i].arrivalTime <= currentTime) {
            if (workingProcs[i].burstTime < minBurst) {
              minBurst = workingProcs[i].burstTime;
              idx = i;
            }
          }
        }
        if (idx !== -1) {
          const p = workingProcs[idx];
          const start = currentTime;
          const end = start + p.burstTime;
          timeline.push({ name: p.name, start, end, type: 'run' });
          p.turnAroundTime = end - p.arrivalTime;
          p.waitingTime = p.turnAroundTime - p.burstTime;
          currentTime = end;
          isCompleted[idx] = true;
          completed.push(p);
          count++;
        } else {
          currentTime++;
        }
      }
    }
    else if (algorithm === 'RR') {
      let n = workingProcs.length;
      let rrProcs = JSON.parse(JSON.stringify(workingProcs));
      let time = 0;
      let arrivalIndex = 0;
      let readyQueue = [];
      while(arrivalIndex < n && rrProcs[arrivalIndex].arrivalTime <= time) {
          readyQueue.push(rrProcs[arrivalIndex]);
          arrivalIndex++;
      }
      while (readyQueue.length > 0 || arrivalIndex < n) {
          if (readyQueue.length === 0) {
              time++;
              while(arrivalIndex < n && rrProcs[arrivalIndex].arrivalTime <= time) {
                readyQueue.push(rrProcs[arrivalIndex]);
                arrivalIndex++;
              }
              continue;
          }
          const currentP = readyQueue.shift();
          const execTime = Math.min(quantum, currentP.remainingTime);
          timeline.push({ name: currentP.name, start: time, end: time + execTime, type: 'run' });
          time += execTime;
          currentP.remainingTime -= execTime;
          while(arrivalIndex < n && rrProcs[arrivalIndex].arrivalTime <= time) {
            readyQueue.push(rrProcs[arrivalIndex]);
            arrivalIndex++;
          }
          if (currentP.remainingTime > 0) readyQueue.push(currentP);
          else {
              currentP.turnAroundTime = time - currentP.arrivalTime;
              currentP.waitingTime = currentP.turnAroundTime - currentP.burstTime;
              completed.push(currentP);
          }
      }
    }

    const avgWait = completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length;
    const avgTurn = completed.reduce((sum, p) => sum + p.turnAroundTime, 0) / completed.length;

    setResults({ 
        avgWait: avgWait.toFixed(2), 
        avgTurn: avgTurn.toFixed(2),
        timestamp: new Date().toLocaleTimeString() 
    });
    setGanttData(timeline);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-orange-500" />
            CPU 调度算法模拟
            </h2>
            <p className="text-sm text-slate-500 mt-1">支持 FCFS (先来先服务), SJF (短作业优先), RR (时间片轮转)</p>
         </div>
         <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-lg border">
            <button onClick={handleAiAdvice} disabled={isAiLoading || processes.length === 0} className={`${btnMagic} text-xs`}>
               {isAiLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />}
               {isAiLoading ? "思考中..." : "AI 建议"}
            </button>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="p-2 border rounded text-sm font-bold text-slate-700">
                <option value="FCFS">FCFS (先来先服务)</option>
                <option value="SJF">SJF (短作业优先-非抢占)</option>
                <option value="RR">RR (时间片轮转)</option>
            </select>
            {algorithm === 'RR' && (
                <div className="flex items-center gap-2 text-sm">
                    <span>Q:</span>
                    <input type="number" value={quantum} onChange={e => setQuantum(Number(e.target.value))} className="w-12 border rounded p-1" />
                </div>
            )}
            <button onClick={runSimulation} className={btnPrimary}><Play size={16} /> 运行模拟</button>
         </div>
      </div>

      {aiAdvice && (
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-sm text-purple-900 flex gap-3 animate-in fade-in slide-in-from-top-1">
           <Sparkles className="shrink-0 text-purple-600 mt-0.5" size={16} />
           <p>{aiAdvice}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-4">
             <div className="bg-white border rounded-lg overflow-hidden">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-600">
                         <tr>
                             <th className="p-2">进程</th>
                             <th className="p-2">到达</th>
                             <th className="p-2">运行</th>
                             <th className="p-2">操作</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y">
                         {processes.map(p => (
                             <tr key={p.id}>
                                 <td className="p-2 font-medium">{p.name}</td>
                                 <td className="p-2">{p.arrivalTime}</td>
                                 <td className="p-2">{p.burstTime}</td>
                                 <td className="p-2">
                                     <button onClick={() => removeProcess(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                                 </td>
                             </tr>
                         ))}
                         <tr className="bg-slate-50">
                             <td className="p-2"><input className="w-12 border rounded px-1" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} /></td>
                             <td className="p-2"><input type="number" className="w-12 border rounded px-1" value={newP.arrivalTime} onChange={e => setNewP({...newP, arrivalTime: Number(e.target.value)})} /></td>
                             <td className="p-2"><input type="number" className="w-12 border rounded px-1" value={newP.burstTime} onChange={e => setNewP({...newP, burstTime: Number(e.target.value)})} /></td>
                             <td className="p-2"><button onClick={addProcess} className="bg-blue-100 text-blue-600 p-1 rounded hover:bg-blue-200"><Plus size={14} /></button></td>
                         </tr>
                     </tbody>
                 </table>
             </div>
         </div>

         <div className="lg:col-span-2 space-y-6">
             <div className="bg-white border p-4 rounded-lg overflow-x-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-500">甘特图 (Gantt Chart)</h3>
                    {results?.timestamp && <span className="text-xs text-slate-400">上次计算: {results.timestamp}</span>}
                 </div>
                 {ganttData.length > 0 ? (
                     <div className="flex h-16 w-full min-w-[500px]">
                         {ganttData.map((item, idx) => {
                             const totalDuration = ganttData[ganttData.length-1].end;
                             const widthPct = ((item.end - item.start) / totalDuration) * 100;
                             const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];
                             const color = colors[item.name.replace(/\D/g,'') % colors.length] || 'bg-slate-400';
                             
                             return (
                                 <div key={idx} style={{ width: `${widthPct}%` }} className={`relative h-full ${color} border-r border-white/50 flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-90`}>
                                     {item.name}
                                     <span className="absolute bottom-[-20px] left-0 text-slate-500 font-normal scale-90">{item.start}</span>
                                     {idx === ganttData.length - 1 && <span className="absolute bottom-[-20px] right-0 text-slate-500 font-normal scale-90">{item.end}</span>}
                                 </div>
                             )
                         })}
                     </div>
                 ) : (
                     <div className="h-16 bg-slate-50 border border-dashed rounded flex items-center justify-center text-slate-400 text-sm">点击运行模拟以生成甘特图</div>
                 )}
             </div>

             {results && (
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-blue-50 p-4 rounded border border-blue-100 text-center">
                         <div className="text-sm text-blue-600">平均等待时间</div>
                         <div className="text-2xl font-bold text-blue-800">{results.avgWait}</div>
                     </div>
                     <div className="bg-green-50 p-4 rounded border border-green-100 text-center">
                         <div className="text-sm text-green-600">平均周转时间</div>
                         <div className="text-2xl font-bold text-green-800">{results.avgTurn}</div>
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

// --- 模块 5: 内存管理 & 页面置换 ---
const MemoryModule = () => {
    const [algo, setAlgo] = useState('FIFO');
    const [frameCount, setFrameCount] = useState(3);
    const [refString, setRefString] = useState("7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1");
    const [steps, setSteps] = useState([]);
    const [summary, setSummary] = useState(null);

    const runMemorySim = () => {
        const pages = refString.split(',').map(s => s.trim()).filter(s => s !== '');
        let frames = [];
        let history = [];
        let hitCount = 0;
        let lruMap = new Map();

        pages.forEach((page, timeIndex) => {
            let isHit = false;
            if (frames.includes(page)) {
                isHit = true;
                hitCount++;
                if (algo === 'LRU') lruMap.set(page, timeIndex);
            } else {
                if (frames.length < frameCount) {
                    frames.push(page);
                } else {
                    if (algo === 'FIFO') {
                        frames.shift();
                        frames.push(page);
                    } else if (algo === 'LRU') {
                        let minIndex = Infinity;
                        let pageToRemove = -1;
                        frames.forEach(p => {
                           const lastIdx = lruMap.get(p);
                           if (lastIdx < minIndex) {
                               minIndex = lastIdx;
                               pageToRemove = p;
                           }
                        });
                        frames = frames.filter(p => p !== pageToRemove);
                        frames.push(page);
                    }
                }
                if (algo === 'LRU') lruMap.set(page, timeIndex);
            }
            history.push({ page, frames: [...frames], isHit });
        });

        setSteps(history);
        setSummary({
            total: pages.length,
            hits: hitCount,
            misses: pages.length - hitCount,
            ratio: ((hitCount / pages.length) * 100).toFixed(1)
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MemoryStick className="w-6 h-6 text-pink-500" />
                        内存页面置换 (FIFO/LRU)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">可视化展示动态内存缺页中断过程</p>
                </div>
                <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-slate-600">算法:</span>
                         <select value={algo} onChange={e => setAlgo(e.target.value)} className="p-2 border rounded text-sm">
                            <option value="FIFO">FIFO (先进先出)</option>
                            <option value="LRU">LRU (最近最少使用)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-600">页框数:</span>
                        <input type="number" min="1" max="6" value={frameCount} onChange={e => setFrameCount(Number(e.target.value))} className="w-16 p-2 border rounded text-sm" />
                    </div>
                    <button onClick={runMemorySim} className={btnPrimary}><Play size={16} /> 生成模拟</button>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-4">
                 <div className="mb-4">
                     <label className="text-sm font-bold text-slate-700 block mb-1">页面引用串 (逗号分隔):</label>
                     <input value={refString} onChange={e => setRefString(e.target.value)} className="w-full p-2 border rounded bg-slate-50 font-mono text-sm" />
                 </div>

                 {steps.length > 0 && (
                     <div className="overflow-x-auto pb-4">
                         <div className="flex gap-2 min-w-max">
                             <div className="flex flex-col gap-2 w-20 sticky left-0 bg-white z-10 border-r pr-2">
                                 <div className="h-8 flex items-center justify-end font-bold text-sm text-slate-500">访问页面</div>
                                 {Array.from({length: frameCount}).map((_, i) => (
                                     <div key={i} className="h-10 flex items-center justify-end font-mono text-xs text-slate-400">Frame {i}</div>
                                 ))}
                                 <div className="h-8 flex items-center justify-end font-bold text-sm text-slate-500">状态</div>
                             </div>
                             {steps.map((step, idx) => (
                                 <div key={idx} className="flex flex-col gap-2 w-10">
                                     <div className="h-8 flex items-center justify-center font-bold bg-slate-100 rounded text-slate-700">{step.page}</div>
                                     {Array.from({length: frameCount}).map((_, i) => {
                                         const val = step.frames[i];
                                         return (
                                             <div key={i} className={`h-10 border rounded flex items-center justify-center font-bold text-sm transition-all ${val ? 'bg-white border-slate-300' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                                                 {val !== undefined ? val : '-'}
                                             </div>
                                         )
                                     })}
                                     <div className={`h-8 flex items-center justify-center rounded text-[10px] font-bold text-white ${step.isHit ? 'bg-green-500' : 'bg-red-400'}`}>
                                         {step.isHit ? 'HIT' : 'MISS'}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {summary && (
                     <div className="mt-4 flex gap-6 border-t pt-4">
                         <div className="flex flex-col">
                             <span className="text-xs text-slate-500 uppercase">Total Access</span>
                             <span className="text-xl font-bold">{summary.total}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs text-slate-500 uppercase">Hits (命中)</span>
                             <span className="text-xl font-bold text-green-600">{summary.hits}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs text-slate-500 uppercase">Misses (缺页)</span>
                             <span className="text-xl font-bold text-red-500">{summary.misses}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs text-slate-500 uppercase">Hit Ratio</span>
                             <span className="text-xl font-bold text-blue-600">{summary.ratio}%</span>
                         </div>
                     </div>
                 )}
            </div>
        </div>
    )
}

// --- (新增) 模块 6: 银行家算法 (死锁避免) ---
const BankerModule = () => {
    // 初始状态：5个进程，3类资源 (A, B, C)
    const [available, setAvailable] = useState([3, 3, 2]); // 当前可用
    const [allocation, setAllocation] = useState([
        [0, 1, 0], // P0
        [2, 0, 0], // P1
        [3, 0, 2], // P2
        [2, 1, 1], // P3
        [0, 0, 2]  // P4
    ]);
    const [max, setMax] = useState([
        [7, 5, 3], // P0 Max
        [3, 2, 2], // P1 Max
        [9, 0, 2], // P2 Max
        [2, 2, 2], // P3 Max
        [4, 3, 3]  // P4 Max
    ]);
    const [safeSequence, setSafeSequence] = useState([]);
    const [isSafe, setIsSafe] = useState(null);
    const [request, setRequest] = useState({ pid: 1, res: [1, 0, 2] });

    // 计算需求矩阵 Need = Max - Allocation
    const getNeed = () => {
        return max.map((row, i) => row.map((val, j) => val - allocation[i][j]));
    };

    const checkSafety = () => {
        let work = [...available];
        let finish = new Array(5).fill(false);
        let seq = [];
        let need = getNeed();

        let found = true;
        while (found && seq.length < 5) {
            found = false;
            for (let i = 0; i < 5; i++) {
                if (!finish[i]) {
                    // 检查 Need[i] <= Work
                    let canProceed = true;
                    for (let j = 0; j < 3; j++) {
                        if (need[i][j] > work[j]) {
                            canProceed = false;
                            break;
                        }
                    }
                    if (canProceed) {
                        // Work = Work + Allocation[i]
                        for (let j = 0; j < 3; j++) work[j] += allocation[i][j];
                        finish[i] = true;
                        seq.push(`P${i}`);
                        found = true;
                    }
                }
            }
        }

        if (seq.length === 5) {
            setSafeSequence(seq);
            setIsSafe(true);
        } else {
            setSafeSequence([]);
            setIsSafe(false);
        }
    };

    const handleRequest = () => {
        // 1. Check Request <= Need
        const need = getNeed();
        for (let j=0; j<3; j++) {
            if (request.res[j] > need[request.pid][j]) {
                alert("请求非法：超过最大需求！");
                return;
            }
        }
        // 2. Check Request <= Available
        for (let j=0; j<3; j++) {
             if (request.res[j] > available[j]) {
                alert("请求非法：当前资源不足，需等待！");
                return;
            }
        }

        // 3. 试探性分配
        const newAvail = [...available];
        const newAlloc = allocation.map(row => [...row]);
        const newNeed = need.map(row => [...row]); // 其实不需要更新Need，因为Need是算出来的，但为了逻辑清晰

        for (let j=0; j<3; j++) {
            newAvail[j] -= request.res[j];
            newAlloc[request.pid][j] += request.res[j];
        }

        // 4. 安全性检查 (由于这是Demo，这里只是改变状态，用户需要点击"检查安全性"来验证)
        setAvailable(newAvail);
        setAllocation(newAlloc);
        setIsSafe(null); // 重置状态
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-teal-600" />
                        银行家算法 (死锁避免)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">展示资源请求、试探性分配与系统安全状态检测</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={checkSafety} className={btnPrimary}>检测当前状态安全性</button>
                    <button onClick={() => {
                        setAvailable([3, 3, 2]);
                        setAllocation([[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]]);
                        setIsSafe(null);
                    }} className={btnSecondary}><RotateCcw size={16}/> 重置</button>
                </div>
            </div>

            {/* 资源视图 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-bold text-slate-700 mb-2">系统资源矩阵</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead className="bg-slate-100 text-slate-600">
                                <tr>
                                    <th className="p-2">Process</th>
                                    <th className="p-2 bg-blue-50">Allocation (A B C)</th>
                                    <th className="p-2 bg-orange-50">Max (A B C)</th>
                                    <th className="p-2 bg-green-50">Need (A B C)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {allocation.map((row, i) => (
                                    <tr key={i}>
                                        <td className="p-2 font-bold">P{i}</td>
                                        <td className="p-2 bg-blue-50/30 font-mono">{row.join(' ')}</td>
                                        <td className="p-2 bg-orange-50/30 font-mono">{max[i].join(' ')}</td>
                                        <td className="p-2 bg-green-50/30 font-mono text-slate-400">
                                            {max[i].map((m, idx) => m - row[idx]).join(' ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex gap-4 items-center bg-slate-50 p-2 rounded">
                        <span className="font-bold text-sm">Available Resources (A B C):</span>
                        <div className="flex gap-2">
                            {available.map((a, i) => (
                                <span key={i} className="bg-slate-200 px-2 py-1 rounded font-mono font-bold">{a}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-bold text-slate-700 mb-2">发起资源请求</h3>
                        <div className="flex items-end gap-2 text-sm">
                            <div>
                                <label className="block text-xs mb-1">进程</label>
                                <select className="border p-2 rounded" value={request.pid} onChange={e => setRequest({...request, pid: Number(e.target.value)})}>
                                    {[0,1,2,3,4].map(i => <option key={i} value={i}>P{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">资源A</label>
                                <input type="number" className="border p-2 rounded w-16" value={request.res[0]} onChange={e => {const n = [...request.res]; n[0]=Number(e.target.value); setRequest({...request, res: n})}} />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">资源B</label>
                                <input type="number" className="border p-2 rounded w-16" value={request.res[1]} onChange={e => {const n = [...request.res]; n[1]=Number(e.target.value); setRequest({...request, res: n})}} />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">资源C</label>
                                <input type="number" className="border p-2 rounded w-16" value={request.res[2]} onChange={e => {const n = [...request.res]; n[2]=Number(e.target.value); setRequest({...request, res: n})}} />
                            </div>
                            <button onClick={handleRequest} className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-bold">提交请求</button>
                        </div>
                     </div>

                     <div className={`p-4 rounded-lg border-2 ${isSafe === true ? 'bg-green-50 border-green-200' : isSafe === false ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className="font-bold mb-2">检测结果</h3>
                        {isSafe === true && (
                            <div className="text-green-700">
                                <div className="font-bold text-lg mb-1">Safe State (安全)</div>
                                <div className="text-sm">安全序列: {safeSequence.join(' -> ')}</div>
                            </div>
                        )}
                        {isSafe === false && (
                            <div className="text-red-700">
                                <div className="font-bold text-lg mb-1">Unsafe State (不安全)</div>
                                <div className="text-sm">系统可能发生死锁，拒绝该资源分配请求。</div>
                            </div>
                        )}
                        {isSafe === null && <div className="text-slate-400 text-sm">等待检测...</div>}
                     </div>
                </div>
            </div>
        </div>
    )
}

// --- (新增) 模块 7: 磁盘调度 (SSTF/SCAN) ---
const DiskModule = () => {
    const [head, setHead] = useState(50);
    const [requests, setRequests] = useState([82, 170, 43, 140, 24, 16, 190]);
    const [history, setHistory] = useState([50]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentReqIndex, setCurrentReqIndex] = useState(-1);

    const runSSTF = async () => {
        setIsSimulating(true);
        let currentHead = head;
        let queue = [...requests];
        let path = [currentHead];
        
        // 简单的动画延时循环
        while (queue.length > 0) {
            // 找最近的
            let minDistance = Infinity;
            let closestIndex = -1;
            
            for (let i = 0; i < queue.length; i++) {
                const dist = Math.abs(queue[i] - currentHead);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = i;
                }
            }
            
            // 移动磁头
            await new Promise(r => setTimeout(r, 600));
            currentHead = queue[closestIndex];
            path.push(currentHead);
            setHistory([...path]);
            setHead(currentHead);
            
            // 移除已访问
            queue.splice(closestIndex, 1);
        }
        setIsSimulating(false);
    };

    const reset = () => {
        setHead(50);
        setRequests([82, 170, 43, 140, 24, 16, 190]);
        setHistory([50]);
        setIsSimulating(false);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <HardDrive className="w-6 h-6 text-indigo-600" />
                        磁盘调度 (SSTF)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">最短寻道时间优先算法演示</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={runSSTF} disabled={isSimulating || requests.length === 0} className={btnPrimary}>
                         {isSimulating ? "寻道中..." : "开始调度"}
                     </button>
                     <button onClick={reset} className={btnSecondary}><RotateCcw size={16}/> 重置</button>
                </div>
            </div>

            <div className="bg-white border rounded-lg p-6 relative min-h-[300px]">
                {/* 磁道刻度 */}
                <div className="w-full h-12 border-b-2 border-slate-300 relative mb-8">
                    {[0, 50, 100, 150, 200].map(tick => (
                        <div key={tick} className="absolute bottom-0 h-4 border-l border-slate-400 text-xs text-slate-500 pl-1" style={{left: `${tick/2}%`}}>
                            {tick}
                        </div>
                    ))}
                    {/* 磁头 */}
                    <div 
                        className="absolute bottom-[-8px] w-4 h-8 bg-indigo-500 rounded-t-full transition-all duration-500 ease-in-out z-10 shadow-lg border-2 border-white"
                        style={{left: `${head/2}%`, transform: 'translateX(-50%)'}}
                    >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600">{head}</div>
                    </div>
                </div>

                {/* 请求点展示 */}
                <div className="relative h-48 w-full bg-slate-50 rounded border inner-shadow">
                     {/* 历史轨迹线 (SVG) */}
                     <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <polyline 
                            points={history.map((h, i) => `${(h/2)}%,${(i * 30 + 20)}`).join(' ')}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            strokeDasharray="4"
                        />
                     </svg>

                     {/* 初始位置 */}
                     <div className="absolute w-2 h-2 bg-slate-400 rounded-full" style={{left: `${history[0]/2}%`, top: '20px', transform: 'translateX(-50%)'}}></div>

                     {/* 待访问点 */}
                     {requests.map((req, i) => (
                         <div key={i} className="absolute w-3 h-3 bg-red-400 rounded-full shadow border border-white" style={{left: `${req/2}%`, top: '50%', transform: 'translate(-50%, -50%)'}} title={`Track ${req}`}></div>
                     ))}

                     {/* 已访问点 (历史) */}
                     {history.slice(1).map((h, i) => (
                         <div key={i} className="absolute w-4 h-4 bg-green-500 rounded-full shadow border-2 border-white z-10 flex items-center justify-center text-[8px] text-white font-bold" 
                              style={{left: `${h/2}%`, top: `${(i+1)*30 + 20}px`, transform: 'translate(-50%, -50%)'}}>
                            {i+1}
                         </div>
                     ))}
                </div>
                
                <div className="mt-4 text-sm text-slate-500">
                    当前待处理请求队列: <span className="font-mono text-slate-700">{requests.join(', ')}</span>
                </div>
            </div>
        </div>
    );
};


// --- 主程序入口 ---
export default function App() {
  const [activeTab, setActiveTab] = useState('process');

  const tabs = [
    { id: 'process', label: '进程管理', icon: Activity },
    { id: 'ipc', label: '通信与同步', icon: Database },
    { id: 'schedule', label: 'CPU 调度', icon: Cpu },
    { id: 'memory', label: '内存管理', icon: MemoryStick },
    { id: 'banker', label: '死锁避免', icon: Lock },     // 新增
    { id: 'disk', label: '磁盘调度', icon: HardDrive },   // 新增
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Layers className="text-blue-600" />
                <h1 className="text-lg font-bold hidden md:block">OS Lab Platform <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full ml-2">v1.3 AI 增强版</span></h1>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-blue-50 text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        <div className={cardClass}>
            {activeTab === 'process' && <ProcessStateModule />}
            {activeTab === 'ipc' && <IPCModule />}
            {activeTab === 'schedule' && <SchedulerModule />}
            {activeTab === 'memory' && <MemoryModule />}
            {activeTab === 'banker' && <BankerModule />}
            {activeTab === 'disk' && <DiskModule />}
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
            <p>操作系统综合实验演示平台 | Designed for OS Course</p>
        </div>
      </main>
    </div>
  );
}