/**
 * POST /api/analyze-workout
 *
 * Тело: WorkoutAnalysisInput
 * Ответ: { analysis: WorkoutAnalysis }
 */
import { withApi, readJson } from '@/lib/api/withApi';
import { analyzeWorkout } from '@/lib/llm/services/analysisService';
import { validateAnalysisInput } from '@/lib/validation/profile';
import type { WorkoutAnalysis, WorkoutAnalysisInput } from '@/lib/types';

interface Response {
  analysis: WorkoutAnalysis;
}

export default withApi<Response>(
  { methods: ['POST'] },
  async (req, res) => {
    const input = readJson<WorkoutAnalysisInput>(req);
    validateAnalysisInput(input);

    const analysis = await analyzeWorkout(input);
    res.status(200).json({ analysis });
  },
);
