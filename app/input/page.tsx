'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ResumeInput } from '@/components/ResumeInput';
import { JDInput } from '@/components/JDInput';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, UploadCloud } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function InputPage() {
  const router = useRouter();
  const { resumeText, jdText, setResumeText, setJdText, setTailoringRun, setIsLoading, setStep, ui, setError } = useAppStore();
  const [resumeSource, setResumeSource] = useState<'paste' | 'upload'>('paste');
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isParsingUpload, setIsParsingUpload] = useState(false);

  useEffect(() => {
    setStep('input');
  }, [setStep]);

  const handleAnalyze = async () => {
    if (resumeText.length < 100 || jdText.length < 100) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tailor-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jdText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setTailoringRun(data);
      router.push(ROUTES.analyze);
    } catch (error: any) {
      setError(error.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          return reject(new Error('Failed to read file.'));
        }
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });

  const handleParseResumeUpload = async (file: File) => {
    setUploadError(null);
    setUploadWarnings([]);
    setIsParsingUpload(true);

    try {
      const fileBase64 = await readFileAsBase64(file);
      const response = await fetch('/api/parse/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileName: file.name }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse uploaded resume');
      }

      setResumeText(data.resume.rawText ?? '');
      setUploadName(file.name);
      setUploadWarnings(data.warnings ?? []);
      setResumeSource('upload');
    } catch (error: any) {
      setUploadError(error.message || 'File upload failed');
    } finally {
      setIsParsingUpload(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleParseResumeUpload(file);
  };

  const handleTrySample = async () => {
    setIsLoading(true);
    setError(null);

    // Load sample data from fixtures
    const sampleResume = `ALEX RIVERA
alex.rivera@email.example | (555) 010-2244 | Portland, OR

SUMMARY
Backend-focused software engineer with 3 years of experience building REST APIs, data pipelines, and cloud-deployed services. Comfortable with Python, TypeScript, SQL, and Docker.

SKILLS
Python, TypeScript, Node.js, PostgreSQL, Redis, Docker, Git, REST APIs, unit testing, CI/CD

EXPERIENCE

Northline Analytics — Software Engineer
Jan 2022 – Present | Portland, OR
- Built Python FastAPI services handling 2M+ daily requests with PostgreSQL and Redis caching.
- Designed ETL jobs that reduced reporting latency from hours to under 15 minutes.
- Collaborated with product and QA to ship features using GitHub Actions CI/CD pipelines.
- Wrote unit and integration tests that increased backend coverage from 58% to 81%.

BrightCart Labs — Junior Backend Developer
Jun 2020 – Dec 2021 | Remote
- Implemented REST endpoints in Node.js/Express for an e-commerce admin dashboard.
- Optimized SQL queries and added indexes that improved checkout API response times by 30%.
- Participated in code reviews and on-call rotation for production incidents.

EDUCATION
State University — B.S. Computer Science
2016 – 2020

CERTIFICATIONS
AWS Certified Cloud Practitioner — 2023`;

    const sampleJD = `Backend Software Engineer
Northline Analytics — Portland, OR (Hybrid)

About the role
We are looking for a Backend Software Engineer to help design, build, and maintain scalable API services and data workflows supporting our analytics platform.

Responsibilities
- Design and implement RESTful APIs using Python and modern web frameworks.
- Build reliable data pipelines and background jobs for reporting and ingestion.
- Optimize PostgreSQL queries, schema design, and caching strategies with Redis.
- Collaborate with frontend, product, and QA teams in an agile environment.
- Participate in code reviews, incident response, and CI/CD improvements.
- Write automated tests and contribute to engineering best practices.

Required qualifications
- 2+ years of professional backend development experience.
- Strong proficiency in Python and SQL.
- Experience with PostgreSQL and production API services.
- Familiarity with Docker and cloud deployment workflows.
- Understanding of automated testing and version control with Git.
- Ability to communicate clearly and work cross-functionally.

Preferred qualifications
- Experience with FastAPI or similar Python frameworks.
- Exposure to Redis, message queues, or event-driven architectures.
- Experience with TypeScript/Node.js services.
- AWS or other cloud provider experience.
- CI/CD tooling such as GitHub Actions.

Keywords
Python, FastAPI, PostgreSQL, Redis, Docker, REST, APIs, backend, data pipelines, CI/CD, Git, AWS, TypeScript

Seniority
Mid-level`;

    setResumeText(sampleResume);
    setJdText(sampleJD);

    try {
      const response = await fetch('/api/tailor-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: sampleResume,
          jdText: sampleJD,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setTailoringRun(data);
      router.push(ROUTES.analyze);
    } catch (error: any) {
      setError(error.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = resumeText.length >= 100 && jdText.length >= 100;

  return (
    <>
      <StepIndicator />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Input Resume & Job Description</h1>
          <p className="text-muted-foreground">
            Paste your resume and the job description you want to tailor for.
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={resumeSource === 'paste' ? 'secondary' : 'outline'}
                  onClick={() => setResumeSource('paste')}
                >
                  Paste resume text
                </Button>
                <Button
                  type="button"
                  variant={resumeSource === 'upload' ? 'secondary' : 'outline'}
                  onClick={() => setResumeSource('upload')}
                >
                  Upload resume file
                </Button>
              </div>

              {resumeSource === 'upload' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume-file" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <UploadCloud className="h-4 w-4" />
                      Upload a PDF or DOCX resume file.
                    </Label>
                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf,.docx"
                      className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                      onChange={handleFileChange}
                      disabled={isParsingUpload}
                    />
                  </div>

                  {isParsingUpload && (
                    <div className="text-sm text-muted-foreground">Parsing uploaded resume…</div>
                  )}

                  {uploadName && (
                    <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                      Parsed file: <span className="font-medium">{uploadName}</span>
                    </div>
                  )}

                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  {uploadWarnings.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        <div className="font-medium">Extraction warnings</div>
                        <ul className="list-disc pl-5">
                          {uploadWarnings.map((warning) => (
                            <li key={warning} className="text-sm text-muted-foreground">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <ResumeInput value={resumeText} onChange={setResumeText} />
        </div>

        <JDInput value={jdText} onChange={setJdText} />
      </div>

      <Card>
        <CardContent className="pt-6">
          {ui.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{ui.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleAnalyze} 
              disabled={!isValid || ui.isLoading}
              size="lg"
            >
              {ui.isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                'Analyze'
              )}
            </Button>
            <Button 
              onClick={handleTrySample} 
              variant="outline"
              disabled={ui.isLoading}
            >
              Try Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
