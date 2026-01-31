import React from 'react';
import { Play, Clock, Target, ArrowRight } from 'lucide-react';

const DiagnosticLanding = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-white flex items-start justify-center p-4 pt-16">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900 mb-2">
                        15-Minute Calibration
                    </h1>
                    <p className="text-base text-gray-700 max-w-2xl mx-auto">
                        Before we design your study plan, let's find your starting line.
                        <span className="block text-gray-500 text-sm mt-1">This is not a test—it's a quick check to see what you already know.</span>
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    {/* Time Card */}
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">15 Minutes</h3>
                            <p className="text-xs text-gray-600">Total time</p>
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div className="bg-white border-2 border-green-200 rounded-xl p-4 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">4 Skills</h3>
                            <p className="text-xs text-gray-600">All tested</p>
                        </div>
                    </div>

                    {/* Instant Feedback Card */}
                    <div className="bg-white border-2 border-purple-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                                <ArrowRight className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Instant</h3>
                            <p className="text-xs text-gray-600">Results now</p>
                        </div>
                    </div>

                    {/* Adaptive Card */}
                    <div className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                                <Play className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Adaptive</h3>
                            <p className="text-xs text-gray-600">Your level</p>
                        </div>
                    </div>
                </div>

                {/* XP Reward Badge */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 rounded-xl p-4 mb-5 shadow-md">
                    <div className="flex items-center justify-center gap-3">
                        <div className="text-3xl">🎁</div>
                        <div>
                            <p className="text-amber-700 font-bold text-lg">Earn 500 XP</p>
                            <p className="text-gray-600 text-sm">Guaranteed upon completion</p>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                    <button
                        onClick={onStart}
                        className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-10 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
                    >
                        Start Calibration
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticLanding;
