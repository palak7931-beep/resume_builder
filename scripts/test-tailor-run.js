const fs = require('fs/promises');
const fetch = globalThis.fetch || require('node-fetch');

async function main() {
  const resume = await fs.readFile('./fixtures/sample-resume.txt', 'utf8');
  const jd = await fs.readFile('./fixtures/sample-jd.txt', 'utf8');
  const res = await fetch('http://localhost:3000/api/tailor-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText: resume, jdText: jd }),
  });

  console.log('status', res.status);
  console.log(await res.text());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
