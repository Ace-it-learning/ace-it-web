import React from 'react';
import { X, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Default PolyU subject weightings (from JS3060 sample PDF)
// In production, this should come from the programme detail API
const DEFAULT_POLYU_WEIGHTINGS = [
  { subjectEn: 'Biology', subjectZh: '生物', weight: 7 },
  { subjectEn: 'Business, Accounting and Financial Studies', subjectZh: '企業、會計與財務概論', weight: 7 },
  { subjectEn: 'Chemistry', subjectZh: '化學', weight: 7 },
  { subjectEn: 'Chinese History', subjectZh: '中國歷史', weight: 7 },
  { subjectEn: 'Chinese Language', subjectZh: '中國語文', weight: 7 },
  { subjectEn: 'Chinese Literature', subjectZh: '中國文學', weight: 5 },
  { subjectEn: 'Combined Science: Biology + Chemistry', subjectZh: '組合科學：生物+化學', weight: 7 },
  { subjectEn: 'Combined Science: Biology + Physics', subjectZh: '組合科學：生物+物理', weight: 10 },
  { subjectEn: 'Combined Science: Physics + Chemistry', subjectZh: '組合科學：物理+化學', weight: 5 },
  { subjectEn: 'Design and Applied Technology', subjectZh: '設計與應用科技', weight: 7 },
  { subjectEn: 'Economics', subjectZh: '經濟', weight: 5 },
  { subjectEn: 'English Language', subjectZh: '英國語文', weight: 7 },
  { subjectEn: 'Ethics and Religious Studies', subjectZh: '倫理與宗教', weight: 5 },
  { subjectEn: 'Geography', subjectZh: '地理', weight: 7 },
  { subjectEn: 'Health Management and Social Care', subjectZh: '健康管理與社會關懷', weight: 7 },
  { subjectEn: 'History', subjectZh: '歷史', weight: 10 },
  { subjectEn: 'Information and Communication Technology', subjectZh: '資訊及通訊科技', weight: 7 },
  { subjectEn: 'Integrated Science', subjectZh: '綜合科學', weight: 7 },
  { subjectEn: 'Literature in English', subjectZh: '英國文學', weight: 5 },
  { subjectEn: 'Mathematics', subjectZh: '數學', weight: 5 },
  { subjectEn: 'Mathematics (M1)', subjectZh: '數學延伸部分（單元一）', weight: 7 },
  { subjectEn: 'Mathematics (M2)', subjectZh: '數學延伸部分（單元二）', weight: 5 },
  { subjectEn: 'Music', subjectZh: '音樂', weight: 5 },
  { subjectEn: 'Physical Education', subjectZh: '體育', weight: 5 },
  { subjectEn: 'Physics', subjectZh: '物理', weight: 5 },
  { subjectEn: 'Technology and Living', subjectZh: '科技與生活', weight: 5 },
  { subjectEn: 'Tourism and Hospitality Studies', subjectZh: '旅遊與款待', weight: 5 },
  { subjectEn: 'Visual Arts', subjectZh: '視覺藝術', weight: 5 },
];

const WeightingsModal = ({ isOpen, onClose, programme, language }) => {
  if (!isOpen || !programme) return null;

  const isZh = language === 'zh';
  const weightings = programme.weightings || DEFAULT_POLYU_WEIGHTINGS;

  // Sort by weight descending
  const sortedWeightings = [...weightings].sort((a, b) => b.weight - a.weight);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isZh ? '科目比重表' : 'Subject Weightings'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {programme.code} &mdash; {isZh ? programme.nameZh : programme.nameEn}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-slate-500 mb-4">
                {isZh
                  ? '以下為各科目在入學計分時的比重。比重越高，該科目對總分的影響越大。'
                  : 'The following table shows how each subject is weighted in the admission score calculation. Higher weight means greater impact on the total score.'}
              </p>

              {/* Weightings Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                        {isZh ? '科目' : 'Subject'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-500 w-24">
                        {isZh ? '比重' : 'Weight'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500 w-32">
                        {isZh ? '影響程度' : 'Impact'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedWeightings.map((item, index) => {
                      const impact = item.weight >= 7 ? 'high' : item.weight >= 5 ? 'medium' : 'low';
                      const impactColors = {
                        high: 'bg-rose-100 text-rose-700',
                        medium: 'bg-amber-100 text-amber-700',
                        low: 'bg-slate-100 text-slate-600',
                      };
                      const impactLabels = {
                        high: isZh ? '高' : 'High',
                        medium: isZh ? '中' : 'Medium',
                        low: isZh ? '低' : 'Low',
                      };

                      return (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 text-slate-700">
                            <span className="font-medium">{isZh ? item.subjectZh : item.subjectEn}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-black text-sm">
                              {item.weight}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${impactColors[impact]}`}>
                              {impactLabels[impact]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  {isZh
                    ? '注意：科目比重可能因應每年的收生安排而調整。請參閱理大官方網站獲取最新資訊。'
                    : 'Note: Subject weightings may be adjusted for each admissions exercise. Please refer to the PolyU official website for the latest information.'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeightingsModal;
