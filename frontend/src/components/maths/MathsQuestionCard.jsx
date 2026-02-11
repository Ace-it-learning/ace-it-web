import React from 'react';
import { QuestionCard } from '../shared';

/**
 * Maths Question Card
 * Wrapper around QuestionCard with LaTeX rendering enabled by default
 */
const MathsQuestionCard = (props) => {
    return <QuestionCard {...props} renderMath={true} />;
};

export default MathsQuestionCard;
