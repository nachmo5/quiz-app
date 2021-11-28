import quiz from './quiz.js';
import userAnswer from './userAnswer.js';

export const queries = { ...userAnswer.queries, ...quiz.queries };
export const mutations = { ...userAnswer.mutations, ...quiz.mutations };
