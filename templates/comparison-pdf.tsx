import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { TailoringRun } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.3,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  column: {
    flex: 1,
    paddingRight: 8,
  },
  columnLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletDot: {
    width: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
  footer: {
    marginTop: 16,
    fontSize: 8,
    color: '#666666',
  },
  note: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 10,
  },
  smallText: {
    fontSize: 9,
    color: '#555555',
  },
});

function renderBullet(text: string, index: number) {
  return (
    <View style={styles.bulletRow} key={`cmp-bullet-${index}-${text.slice(0, 20)}`}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

export function ComparisonPdfTemplate({ run }: { run: TailoringRun }) {
  const originalExperience = run.resume.experience;
  const tailoredExperience = run.tailoredResume?.tailoredExperience ?? [];

  const changedBulletCount = tailoredExperience.reduce((count, tailoredEntry, entryIndex) => {
    const originalEntry = originalExperience[entryIndex];
    if (!originalEntry) {
      return count + tailoredEntry.bullets.length;
    }

    return count + tailoredEntry.bullets.reduce((bulletCount, bullet, bulletIndex) => {
      return originalEntry.bullets[bulletIndex] === bullet.tailored ? bulletCount : bulletCount + 1;
    }, 0);
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Comparison Report</Text>
          <Text style={styles.subtitle}>{run.jobDescription.jobTitle}{run.jobDescription.company ? ` · ${run.jobDescription.company}` : ''}</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Original Score: {run.originalMatchScore.overallScore}%</Text>
          <Text style={styles.scoreLabel}>Tailored Score: {run.tailoredMatchScore?.overallScore ?? 0}%</Text>
        </View>

        {changedBulletCount === 0 ? (
          <Text style={styles.note}>No bullet changes were detected. The comparison report still reflects the current tailored resume state.</Text>
        ) : (
          <Text style={styles.note}>{changedBulletCount} bullet change{changedBulletCount !== 1 ? 's' : ''} detected between original and tailored resume.</Text>
        )}

        {originalExperience.map((originalEntry, entryIndex) => {
          const tailoredEntry = tailoredExperience[entryIndex];

          return (
            <View style={styles.comparisonRow} key={`comparison-${entryIndex}`}>
              <View style={styles.column}>
                <Text style={styles.columnLabel}>Original</Text>
                <Text style={styles.note}>{originalEntry.title} · {originalEntry.company}</Text>
                {originalEntry.bullets.map((bullet, bulletIndex) => renderBullet(bullet, bulletIndex))}
              </View>

              <View style={styles.column}>
                <Text style={styles.columnLabel}>Tailored</Text>
                {tailoredEntry ? (
                  <>
                    <Text style={styles.note}>{tailoredEntry.title} · {tailoredEntry.company}</Text>
                    {tailoredEntry.bullets.map((bullet, bulletIndex) => renderBullet(bullet.tailored, bulletIndex))}
                  </>
                ) : (
                  <Text style={styles.smallText}>No tailored content available for this experience item.</Text>
                )}
              </View>
            </View>
          );
        })}

        <Text style={styles.footer}>
          Disclaimer: This report is generated from the latest tailoring run. Verify all tailored content for accuracy before sharing.
        </Text>
      </Page>
    </Document>
  );
}
