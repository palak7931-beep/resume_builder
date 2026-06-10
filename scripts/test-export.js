const fs = require('fs/promises');

async function main() {
  const resume = await fs.readFile('./fixtures/sample-resume.txt', 'utf8');
  const jd = await fs.readFile('./fixtures/sample-jd.txt', 'utf8');

  let res = await fetch('http://localhost:3000/api/tailor-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText: resume, jdText: jd }),
  });

  console.log('tailor-run status', res.status);
  const run = await res.json();
  console.log('tailor-run error?', run.error || 'none');

  if (!res.ok) {
    console.error('Tailor run failed, aborting export test');
    return;
  }

  res = await fetch('http://localhost:3000/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'tailored', tailoringRun: run }),
  });

  console.log('export status', res.status);
  console.log([...res.headers.entries()]);
  const text = await res.text();
  console.log('export body length', text.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});