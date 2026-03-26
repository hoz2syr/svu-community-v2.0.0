import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { iteData } from './data/ite_data';
import { CourseState } from './types';
import { CourseNode } from './components/CourseNode';
import { getCourseDetails, getDirectPrereqs, getSuccessors, getAvailableCourses, calculateStudentStatus } from './lib/courseUtils';
import { generateInitialElements } from './lib/layoutUtils';
import { BookOpen, GraduationCap, Settings, Info, RefreshCw, X, ChevronDown, Zap, CheckCircle2, LockIcon, UnlockIcon } from 'lucide-react';

const nodeTypes = {
  courseNode: CourseNode,
};

function FlowApp() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [passedCourses, setPassedCourses] = useState<string[]>([]);
  const [simulatorMode, setSimulatorMode] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setCenter, getNode } = useReactFlow();

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = generateInitialElements(selectedSpecialization);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setSelectedCourseId(null);
  }, [selectedSpecialization, setNodes, setEdges]);

  useEffect(() => {
    if (selectedCourseId) {
      const node = getNode(selectedCourseId);
      if (node) {
        const x = node.position.x + (node.measured?.width || 250) / 2;
        const y = node.position.y + (node.measured?.height || 60) / 2;
        setCenter(x, y, { zoom: 1.2, duration: 800 });
      }
    }
  }, [selectedCourseId, getNode, setCenter]);

  const availableCourses = useMemo(() => getAvailableCourses(passedCourses), [passedCourses]);
  const directPrereqs = useMemo(() => selectedCourseId ? getDirectPrereqs(selectedCourseId) : [], [selectedCourseId]);
  const successors = useMemo(() => selectedCourseId ? getSuccessors(selectedCourseId, selectedSpecialization) : [], [selectedCourseId, selectedSpecialization]);
  const studentStatus = useMemo(() => calculateStudentStatus(passedCourses), [passedCourses]);

  const getCourseState = useCallback((code: string): CourseState => {
    if (passedCourses.includes(code)) return 'passed';
    const details = getCourseDetails(code);
    if (availableCourses.includes(code) || (details && details.prereqs.length === 0)) return 'available';
    return 'locked';
  }, [passedCourses, availableCourses]);

  const handleCourseClick = useCallback((code: string) => {
    if (simulatorMode) {
      if (passedCourses.includes(code)) {
        setPassedCourses(prev => {
          let currentPassed = prev.filter(c => c !== code);
          let changed = true;
          while (changed) {
            changed = false;
            const newPassed = currentPassed.filter(c => {
              const details = getCourseDetails(c);
              if (!details) return true;
              return details.prereqs.every(p => currentPassed.includes(p));
            });
            if (newPassed.length !== currentPassed.length) {
              currentPassed = newPassed;
              changed = true;
            }
          }
          return currentPassed;
        });
      } else {
        const details = getCourseDetails(code);
        if (availableCourses.includes(code) || (details && details.prereqs.length === 0)) {
          setPassedCourses(prev => [...prev, code]);
        }
      }
    } else {
      setSelectedCourseId(prev => prev === code ? null : code);
    }
  }, [simulatorMode, passedCourses, availableCourses]);

  const isDimmed = useCallback((code: string) => {
    if (!selectedCourseId) return false;
    if (code === selectedCourseId) return false;
    if (directPrereqs.includes(code)) return false;
    if (successors.includes(code)) return false;
    return true;
  }, [selectedCourseId, directPrereqs, successors]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const code = node.id;
        const state = getCourseState(code);
        const isSelected = selectedCourseId === code;
        const isPrereq = directPrereqs.includes(code);
        const isSuccessor = successors.includes(code);
        const dimmed = isDimmed(code);

        return {
          ...node,
          data: {
            ...node.data,
            state,
            isSelected,
            isPrereq,
            isSuccessor,
            isDimmed: dimmed,
            simulatorMode,
            onClick: handleCourseClick,
          },
        };
      })
    );
  }, [selectedCourseId, passedCourses, simulatorMode, directPrereqs, successors, isDimmed, getCourseState, handleCourseClick, setNodes]);

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const isIncoming = selectedCourseId && edge.target === selectedCourseId;
        const isOutgoing = selectedCourseId && edge.source === selectedCourseId;

        let stroke = '#475569';
        let strokeWidth = 1.5;
        let animated = false;
        let zIndex = 0;

        if (isIncoming) {
          stroke = '#eab308';
          strokeWidth = 2.5;
          animated = true;
          zIndex = 10;
        } else if (isOutgoing) {
          stroke = '#06b6d4';
          strokeWidth = 2.5;
          animated = true;
          zIndex = 10;
        } else if (selectedCourseId) {
          stroke = '#334155';
          strokeWidth = 1;
        }

        return {
          ...edge,
          style: { stroke, strokeWidth },
          animated,
          zIndex,
        };
      })
    );
  }, [selectedCourseId, setEdges]);

  const selectedCourseDetails = selectedCourseId ? getCourseDetails(selectedCourseId) : null;

  return (
    <div className="flex flex-col md:flex-row h-screen text-slate-200 font-sans" dir="rtl">
      {/* Main Flow Area */}
      <div className="flex-1 relative h-[50vh] md:h-full">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 p-3 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pointer-events-none">
          <div className="glass-light px-4 py-3 rounded-2xl pointer-events-auto">
            <h1 className="text-lg md:text-xl font-extrabold flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </span>
              <span className="gradient-text">أسبقيات المواد</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 mr-11">جامعة دمشق الافتراضية - {iteData.meta.term}</p>
          </div>

          <div className="flex flex-wrap gap-2 pointer-events-auto w-full md:w-auto">
            {/* Specialization Selector */}
            <div className="glass-light rounded-xl flex items-center gap-2 px-3 py-2 flex-1 md:flex-none">
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap">الاختصاص:</span>
              <div className="relative flex-1">
                <select
                  className="w-full bg-transparent text-slate-200 text-xs font-medium outline-none appearance-none cursor-pointer pr-1"
                  value={selectedSpecialization || ''}
                  onChange={(e) => setSelectedSpecialization(e.target.value || null)}
                >
                  <option value="" className="bg-slate-800">أساسي فقط</option>
                  {iteData.specializations.map(spec => (
                    <option key={spec.id} value={spec.id} className="bg-slate-800">{spec.name_ar}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Simulator Toggle */}
            <button
              onClick={() => {
                setSimulatorMode(!simulatorMode);
                setSelectedCourseId(null);
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                simulatorMode
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'glass-light text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className={`w-4 h-4 ${simulatorMode ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              {simulatorMode ? 'إيقاف المحاكي' : 'محاكي الطالب'}
            </button>

            {/* Legend Toggle */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="glass-light p-2.5 rounded-xl text-slate-400 hover:text-white transition-all md:hidden"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className={`absolute bottom-4 right-4 z-10 glass-light rounded-xl p-3 transition-all ${showLegend ? 'opacity-100' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
          <div className="flex flex-wrap gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50"></div>
              <span className="text-slate-400">أساسي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50"></div>
              <span className="text-slate-400">عام</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/50"></div>
              <span className="text-slate-400">إنجليزي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50"></div>
              <span className="text-slate-400">مشروع</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/50"></div>
              <span className="text-slate-400">اختصاص</span>
            </div>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.08}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={24} size={1} />
          <Controls className="!left-4 !right-auto !bottom-4 !top-auto hidden md:flex" />
          <MiniMap
            className="!bottom-4 !left-4 !right-auto hidden md:block"
            nodeColor={(n) => {
              const data = n.data as Record<string, unknown>;
              if (data.state === 'passed') return '#10b981';
              if (data.state === 'available') return '#3b82f6';
              if (data.isSelected) return '#6366f1';
              return '#475569';
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
          />
        </ReactFlow>
      </div>

      {/* Side Panel */}
      <div className="w-full md:w-[380px] bg-slate-900/80 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/5 flex flex-col h-[50vh] md:h-full overflow-hidden shrink-0">
        {simulatorMode ? (
          <div className="p-5 md:p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">محاكي الطالب</h2>
                <p className="text-xs text-slate-400">تتبع تقدمك الدراسي</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass rounded-xl p-4">
                <span className="block text-[11px] font-bold text-indigo-300 mb-1">الساعات المنجزة</span>
                <span className="text-2xl font-extrabold text-white">{studentStatus.totalCredits}</span>
              </div>
              <div className="glass rounded-xl p-4">
                <span className="block text-[11px] font-bold text-emerald-300 mb-1">السنة الحالية</span>
                <span className="text-2xl font-extrabold text-white">{studentStatus.currentYear}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="glass rounded-xl p-4">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-indigo-400" />
                  كيفية الاستخدام
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    انقر على المقررات المتاحة (الزرقاء) لاجتيازها
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    المقررات المجتازة تظهر باللون الأخضر
                  </li>
                  <li className="flex items-start gap-2">
                    <LockIcon className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    المقررات المقفلة تحتاج لاجتياز متطلباتها أولاً
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setPassedCourses([])}
                className="w-full py-3 px-4 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm border border-red-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة ضبط المحاكي
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6 flex-1 overflow-y-auto">
            {selectedCourseDetails ? (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-lg mb-2 border border-indigo-500/30">
                      {selectedCourseDetails.code}
                    </span>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {selectedCourseDetails.name_ar}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedCourseId(null)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="glass rounded-xl p-3">
                    <span className="block text-[10px] font-bold text-slate-400 mb-1">عدد الساعات</span>
                    <span className="text-lg font-bold text-white">{selectedCourseDetails.credits}</span>
                  </div>
                  {'year' in selectedCourseDetails && (
                    <div className="glass rounded-xl p-3">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">السنة الدراسية</span>
                      <span className="text-lg font-bold text-white">{(selectedCourseDetails as { year: number }).year}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      المتطلبات السابقة (الأسبقيات)
                    </h4>
                    {selectedCourseDetails.prereqs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCourseDetails.prereqs.map(p => {
                          const pCourse = getCourseDetails(p);
                          return (
                            <button
                              key={p}
                              onClick={() => setSelectedCourseId(p)}
                              className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/20 transition-all text-right"
                            >
                              <span className="text-[11px] font-medium text-slate-200">{pCourse ? pCourse.name_ar : p}</span>
                              <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">{p}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="glass rounded-lg p-3 text-xs text-slate-400 italic text-center">
                        مادة مفتوحة — لا توجد متطلبات سابقة
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-cyan-400 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      يفتح المقررات التالية
                    </h4>
                    {successors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {successors.map(s => {
                          const sCourse = getCourseDetails(s);
                          return (
                            <button
                              key={s}
                              onClick={() => setSelectedCourseId(s)}
                              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-right"
                            >
                              <span className="text-[11px] font-medium text-slate-200">{sCourse ? sCourse.name_ar : s}</span>
                              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">{s}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="glass rounded-lg p-3 text-xs text-slate-400 italic text-center">
                        لا يفتح أي مقررات إضافية
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-400/60" />
                </div>
                <p className="text-base font-bold text-slate-300 mb-2">اختر مقرراً لعرض تفاصيله</p>
                <p className="text-xs text-slate-400 max-w-[250px]">انقر على أي عقدة مقرر في المخطط لرؤية الأسبقيات والمقررات اللاحقة</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  );
}
