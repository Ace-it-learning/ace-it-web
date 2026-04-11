import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { SafeInlineMath, SafeBlockMath } from './SafeMath';

const tutorialData = {
  "tutorial_id": "onboarding_wysiwyg_01",
  "dummy_question": "Welcome! Let's learn how to use the editor. Solve the equation $2x = 6$.",
  "dummy_question_zh": "歡迎！讓我們學習如何使用編輯器。請解方程 $2x = 6$。",
  "ui_script": [
    {
      "step_order": 1,
      "action_required": "highlight_top_bar",
      "instruction_en": "Welcome to the Math Lab! If you ever forget how to use the editor, you can always click the 'Tutorial' button on the top bar.",
      "instruction_zh": "歡迎來到數學實驗室！如果你忘記如何使用編輯器，可以隨時點擊頂部欄的「教學」按鈕。"
    },
    {
      "step_order": 2,
      "action_required": "type_text",
      "instruction_en": "First, type your explanation in the text area. Type: 'Divide both sides by 2'",
      "instruction_zh": "首先，在文本區輸入你的解釋。請輸入：'兩邊除以 2'"
    },
    {
      "step_order": 3,
      "action_required": "click_equation_button",
      "instruction_en": "Great! Now, click the purple 'EQUATION' button to insert a math node.",
      "instruction_zh": "太棒了！現在，點擊紫色的「EQUATION」按鈕插入一個數學節點。"
    },
    {
      "step_order": 4,
      "action_required": "type_math",
      "expected_latex": "x = 3",
      "instruction_en": "Inside the new math box, type your answer: $x = 3$. You can use the virtual keyboard for special symbols.",
      "instruction_zh": "在新的數學方塊中，輸入你的答案：$x = 3$。你可以使用虛擬鍵盤輸入特殊符號。"
    },
    {
      "step_order": 5,
      "action_required": "submit",
      "instruction_en": "Perfect! Click Submit to complete the tutorial.",
      "instruction_zh": "完美！點擊提交以完成教學。"
    }
  ]
};

const TutorialOverlay = ({ onClose, isChinese }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = tutorialData.ui_script;
    const currentData = steps[currentStep];

    const instruction = isChinese ? currentData.instruction_zh : currentData.instruction_en;
    
    // Split the instruction to render math safely
    const renderInstructionText = (text) => {
        const parts = text.split(/(\$[\s\S]*?\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                return <SafeInlineMath key={i} math={part.slice(1, -1)} className="mx-1 text-purple-600" />;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-purple-100 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center shadow-inner text-white">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-black mb-2 opacity-90 drop-shadow-sm">Interactive Tutorial</h3>
                    <p className="text-sm font-medium text-purple-100 italic">
                        {isChinese ? tutorialData.dummy_question_zh : tutorialData.dummy_question}
                    </p>
                </div>
                
                <div className="p-8 pb-4 flex-1">
                    <div className="w-full flex justify-center mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                        <img 
                            src="/math_editor_demo.webp" 
                            alt="Math Editor Interactive Demo" 
                            className="max-h-48 w-full object-cover object-top" 
                        />
                    </div>
                
                    <div className="mb-6 min-h-[80px] flex items-center justify-center text-center">
                        <p className="text-lg leading-relaxed text-slate-700 font-medium">
                            {renderInstructionText(instruction)}
                        </p>
                    </div>

                    <div className="flex gap-1.5 justify-center mb-8">
                        {steps.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-purple-600' : 'w-2 bg-slate-200'}`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-4 -mx-8 -mb-4 border-t border-slate-100">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentStep === 0} 
                            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all text-sm ${currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-white hover:text-purple-600 hover:shadow-sm'}`}
                        >
                            <ArrowLeft className="w-4 h-4" /> {isChinese ? '返回' : 'Back'}
                        </button>
                        
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 text-white flex items-center gap-2 text-sm shadow-md shadow-purple-600/30 hover:bg-purple-700 transition-all hover:scale-105 active:scale-95"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>{isChinese ? '完成' : 'Finish'} <CheckCircle className="w-4 h-4" /></>
                            ) : (
                                <>{isChinese ? '繼續' : 'Next'} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
