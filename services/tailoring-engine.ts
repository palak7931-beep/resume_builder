import { TailoredResumeSchema, BulletRewriteSchema } from '@/lib/schemas';
import { completeStructured } from '@/llm/structured-output';
import { BULLET_REWRITER_SYSTEM, BULLET_REWRITER_USER } from '@/prompts/bullet-rewriter';
import { applyTruthfulnessGuardrails, verifySkillReorder } from '@/lib/truthfulness';
import type { TailoredResume, ResumeProfile, JobDescriptionProfile, BulletRewrite } from '@/lib/types';

export async function tailorResume(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile
): Promise<TailoredResume> {
  console.time('tailoring_engine_total');
  // Collect all JD requirements for context
  const allRequirements = [
    ...jobDescription.requiredSkills,
    ...jobDescription.preferredSkills,
    ...jobDescription.tools,
    ...jobDescription.keywords,
  ];

  let rewriteBudget = 3;
  const unchangedBullet = (bullet: string): BulletRewrite => ({
    original: bullet,
    tailored: bullet,
    changeReason: 'Left unchanged to keep processing within timeout limits.',
    keywordsAddressed: [],
    confidence: 'low',
  });
  
  // Tailor experience bullets
  console.time('tailoring_engine_experience');
  const tailoredExperience = await Promise.all(
    resume.experience.map(async (exp) => {
      const bullets = await Promise.all(
        exp.bullets.map(async (bullet) => {
          if (rewriteBudget <= 0) {
            return unchangedBullet(bullet);
          }

          rewriteBudget -= 1;
          return await rewriteBullet(
            bullet,
            `${exp.title} at ${exp.company}`,
            allRequirements,
            resume
          );
        })
      );

      return {
        company: exp.company,
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bullets,
      };
    })
  );
  console.timeEnd('tailoring_engine_experience');
  
  // Tailor project bullets (if any)
  let tailoredProjects;
  if (resume.projects.length > 0) {
    console.time('tailoring_engine_projects');
    tailoredProjects = await Promise.all(
      resume.projects.map(async (proj) => {
        const bullets = await Promise.all(
          proj.bullets.map(async (bullet) => {
            if (rewriteBudget <= 0) {
              return unchangedBullet(bullet);
            }

            rewriteBudget -= 1;
            return await rewriteBullet(
              bullet,
              `Project: ${proj.name}`,
              allRequirements,
              resume
            );
          })
        );
        
        return {
          name: proj.name,
          description: proj.description,
          bullets,
          technologies: proj.technologies,
        };
      })
    );
    console.timeEnd('tailoring_engine_projects');
  } else {
    tailoredProjects = undefined;
  }
  
  // Reorder skills to prioritize JD-relevant ones (without adding new skills)
  let tailoredSkills = [...resume.skills].sort((a, b) => {
    const aPriority = allRequirements.includes(a) ? 1 : 0;
    const bPriority = allRequirements.includes(b) ? 1 : 0;
    return bPriority - aPriority;
  });

  if (!verifySkillReorder(tailoredSkills, resume)) {
    console.warn('Tailored skill reorder introduced a new skill; preserving original resume skills.');
    tailoredSkills = resume.skills;
  }
  // Optional: rewrite summary if present
  let tailoredSummary = resume.summary;
  // For Phase 2, we'll keep the original summary
  // In Phase 4, we could add LLM-based summary rewriting
  
  const result = {
    tailoredSummary,
    tailoredSkills,
    tailoredExperience,
    tailoredProjects,
  };

  console.timeEnd('tailoring_engine_total');
  return result;
}

async function rewriteBullet(
  originalBullet: string,
  jobContext: string,
  jdRequirements: string[],
  resume: ResumeProfile
): Promise<BulletRewrite> {
  console.time('tailoring_engine_rewrite_bullet');
  // Select relevant JD requirements for this bullet
  const relevantRequirements = jdRequirements.filter(req =>
    originalBullet.toLowerCase().includes(req.toLowerCase()) ||
    req.length < 20 // Include short common terms
  ).slice(0, 5); // Limit to top 5 relevant requirements
  
  const result = await completeStructured(
    BULLET_REWRITER_SYSTEM,
    BULLET_REWRITER_USER(originalBullet, jobContext, relevantRequirements),
    BulletRewriteSchema,
    { model: process.env.GROQ_MODEL, maxTokens: 512, stage: 'tailorResume.rewriteBullet' }
  );
  console.timeEnd('tailoring_engine_rewrite_bullet');
  
  return applyTruthfulnessGuardrails(originalBullet, result, resume);
}
