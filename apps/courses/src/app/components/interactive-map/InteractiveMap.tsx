import { useState, useMemo, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, ReactFlowProvider, useReactFlow, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { iteData } from './data/ite_data';
import { CourseState } from './types';
import { CourseNode } from './components/CourseNode';
import { getCourseDetails, getDirectPrereqs, getSuccessors, getAvailableCourses, calculateStudentStatus } from './lib/courseUtils';
import { generateInitialElements } from './lib/layoutUtils';
import { BookOpen, GraduationCap, Settings, Info, RefreshCw } from 'lucide-react';

const nodeTypes = {
  courseNode: CourseNode,
};

function FlowApp() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [passedCourses, setPassedCourses] = useState<string[]>([]);
  const [simulatorMode, setSimulatorMode] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
        
        let stroke = '#cbd5e1';
        let strokeWidth = 2;
        let animated = false;
        let zIndex = 0;

        if (isIncoming) {
          stroke = '#eab308';
          strokeWidth = 3;
          animated = true;
          zIndex = 10;
        } else if (isOutgoing) {
          stroke = '#06b6d4';
          strokeWidth = 3;
          animated = true;
          zIndex = 10;
        } else if (selectedCourseId) {
          stroke = '#f1f5f9';
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
    <div className="flex flex-col md:flex-row h-full bg-gray-50 text-gray-900 font-sans" dir="rtl">
      <div className="flex-1 relative h-[60vh] md:h-full">
        <div className="absolute top-0 left-0 right-0 z-10 p-2 md:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 pointer-events-auto">
            <h1 className="text-xl md:text-2xl font-black text-indigo-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
              أسبقيات ITE
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">جامعة دمشق - {iteData.meta.term}</p>
          </div>

          <div className="flex flex-wrap gap-2 pointer-events-auto w-full md:w-auto">
            <div className="bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 flex-1 md:flex-none">
              <span className="text-xs md:text-sm font-bold text-gray-700 px-1 md:px-2 whitespace-nowrap">الاختصاص:</span>
              <select 
                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs md:text-sm rounded-md md:rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 md:p-2 outline-none w-full"
                value={selectedSpecialization || ''}
                onChange={(e) => setSelectedSpecialization(e.target.value || null)}
              >
                <option value="">بدون اختصاص (أساسي فقط)</option>
                {iteData.specializations.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name_ar}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSimulatorMode(!simulatorMode);
                setSelectedCourseId(null);
              }}
              className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all shadow-sm text-xs md:text-base flex-1 md:flex-none ${
                simulatorMode 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-100' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Settings className={`w-4 h-4 md:w-5 md:h-5 ${simulatorMode ? 'animate-spin-slow' : ''}`} />
              {simulatorMode ? 'إيقاف المحاكي' : 'وضع المحاكي'}
            </button>
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
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={20} size={2} />
          <Controls className="bg-white shadow-md border-gray-100 rounded-lg !left-4 !right-auto hidden md:flex" />
          <MiniMap
            className="!bg-white !shadow-lg !border-gray-100 !rounded-xl !left-4 !right-auto hidden md:block" 
            nodeColor={(n) => {
              const data = n.data as Record<string, unknown>;
              if (data.state === 'passed') return '#22c55e';
              if (data.state === 'available') return '#3b82f6';
              if (data.isSelected) return '#4f46e5';
              return '#cbd5e1';
            }}
          />
        </ReactFlow>
      </div>

      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-r border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl z-20 flex flex-col h-[40vh] md:h-full overflow-hidden shrink-0">
        {simulatorMode ? (
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Settings className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-gray-900">محاكي الطالب</h2>
                <p className="text-xs md:text-sm text-gray-500">تتبع تقدمك الدراسي</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 md:p-4 rounded-2xl border border-indigo-100">
                <span className="block text-xs md:text-sm font-bold text-indigo-900 mb-1">الساعات المنجزة</span>
                <span className="text-2xl md:text-3xl font-black text-indigo-600">{studentStatus.totalCredits}</span>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 md:p-4 rounded-2xl border border-emerald-100">
                <span className="block text-xs md:text-sm font-bold text-emerald-900 mb-1">السنة الحالية</span>
                <span className="text-2xl md:text-3xl font-black text-emerald-600">{studentStatus.currentYear}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <Info className="w-4 h-4 text-gray-400" />
                  كيفية الاستخدام
                </h3>
                <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2 list-disc list-inside">
                  <li>انقر على المقررات المتاحة (الزرقاء) لاجتيازها.</li>
                  <li>المقررات المجتازة تظهر باللون الأخضر.</li>
                  <li>المقررات المقفلة (الرمادية) تحتاج لاجتياز متطلباتها أولاً.</li>
                </ul>
              </div>

              <button
                onClick={() => setPassedCourses([])}
                className="w-full py-2.5 md:py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة ضبط المحاكي
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            {selectedCourseDetails ? (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <span className="inline-block px-2 md:px-3 py-1 bg-indigo-100 text-indigo-800 text-[10px] md:text-xs font-bold rounded-lg mb-2 md:mb-3">
                      {selectedCourseDetails.code}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                      {selectedCourseDetails.name_ar}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100">
                    <span className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">عدد الساعات</span>
                    <span className="text-base md:text-lg font-bold text-gray-900">{selectedCourseDetails.credits}</span>
                  </div>
                  {'year' in selectedCourseDetails && (
                    <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100">
                      <span className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">السنة الدراسية</span>
                      <span className="text-base md:text-lg font-bold text-gray-900">{(selectedCourseDetails as { year: number }).year}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="pt-3 md:pt-4 border-t border-gray-100">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      المتطلبات السابقة (الأسبقيات):
                    </h4>
                    {selectedCourseDetails.prereqs.length > 0 ? (
                      <ul className="space-y-1.5 md:space-y-2">
                        {selectedCourseDetails.prereqs.map(p => {
                          const pCourse = getCourseDetails(p);
                          return (
                            <li key={p} className="flex items-center justify-between p-2 bg-yellow-50/50 rounded-lg border border-yellow-100/50">
                              <span className="text-xs md:text-sm font-medium text-gray-700">{pCourse ? pCourse.name_ar : p}</span>
                              <span className="text-[10px] md:text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md">{p}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="p-2 md:p-3 bg-gray-50 rounded-lg text-xs md:text-sm text-gray-500 italic text-center">
                        لا يوجد متطلبات سابقة
                      </div>
                    )}
                  </div>

                  <div className="pt-3 md:pt-4 border-t border-gray-100">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      يفتح المقررات التالية:
                    </h4>
                    {successors.length > 0 ? (
                      <ul className="space-y-1.5 md:space-y-2">
                        {successors.map(s => {
                          const sCourse = getCourseDetails(s);
                          return (
                            <li key={s} className="flex items-center justify-between p-2 bg-cyan-50/50 rounded-lg border border-cyan-100/50">
                              <span className="text-xs md:text-sm font-medium text-gray-700">{sCourse ? sCourse.name_ar : s}</span>
                              <span className="text-[10px] md:text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-md">{s}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="p-2 md:p-3 bg-gray-50 rounded-lg text-xs md:text-sm text-gray-500 italic text-center">
                        لا يفتح أي مقررات
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3 md:space-y-4">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2 md:mb-4">
                  <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                </div>
                <p className="text-base md:text-lg font-medium text-gray-500">اختر مقرراً لعرض تفاصيله</p>
                <p className="text-xs md:text-sm px-4">انقر على أي عقدة مقرر في المخطط لرؤية الأسبقيات والمقررات اللاحقة.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveMap() {
  return (
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  );
}
