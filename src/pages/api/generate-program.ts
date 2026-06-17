/**
 * POST /api/generate-program
 *
 * Тело: { profile: UserProfile }
 * Ответ: { program: TrainingProgram }
 *
 * Вся работа делегируется в programService. Роут — тонкий transport-слой.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { withApi, readJson } from '@/lib/api/withApi';
import { EXERCISES } from '@/lib/exercises/service';
import { generateProgram } from '@/lib/llm/services/programService';
import { validateProfile } from '@/lib/validation/profile';
import type { TrainingProgram, UserProfile } from '@/lib/types';

interface Response {
  program: TrainingProgram;
}

export default withApi<Response>(
  { methods: ['POST'] },
  async (req, res) => {
    const { profile } = readJson<{ profile: UserProfile }>(req);
    validateProfile(profile);

    const program = await generateProgram({
      profile,
      exercises: EXERCISES,
    });

    res.status(200).json({ program });
  },
);
