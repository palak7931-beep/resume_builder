import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { TailoringRun } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 2,
    color: '#333333',
  },
  section: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  smallText: {
    fontSize: 9,
    color: '#555555',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletDot: {
    width: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
  },
  itemHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: '#666666',
  },
});

function renderBullet(text: string, index: number) {
  return (
    <View style={styles.bulletRow} key={`bullet-${index}-${text.slice(0, 20)}`}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function joinContact(contact: TailoringRun['resume']['contact']) {
  if (!contact) {
    return '';
  }

  const parts = [contact.email, contact.phone, contact.location].filter(Boolean);
  return parts.join(' · ');
}

export function TailoredResumePdfTemplate({ run }: { run: TailoringRun }) {
  const { resume, tailoredResume, jobDescription } = run;
  const tailoredSkills = tailoredResume?.tailoredSkills ?? [];
  const tailoredExperience = tailoredResume?.tailoredExperience ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{jobDescription.jobTitle}</Text>
          {jobDescription.company && <Text style={styles.subtitle}>{jobDescription.company}</Text>}
          {resume.contact && <Text style={styles.smallText}>{joinContact(resume.contact)}</Text>}
        </View>

        {tailoredResume?.tailoredSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Summary</Text>
            <Text>{tailoredResume.tailoredSummary}</Text>
          </View>
        )}

        {tailoredSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Skills</Text>
            <Text>{tailoredSkills.join(' · ')}</Text>
          </View>
        )}

        {tailoredExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Experience</Text>
            {tailoredExperience.map((entry, entryIndex) => (
              <View key={`exp-${entryIndex}`}>
                <Text style={styles.itemHeader}>{entry.title} · {entry.company}</Text>
                {(entry.startDate || entry.endDate) && (
                  <Text style={styles.smallText}>
                    {[entry.startDate, entry.endDate].filter(Boolean).join(' — ')}
                  </Text>
                )}
                {entry.bullets.map((bullet, bulletIndex) => renderBullet(bullet.tailored, bulletIndex))}
              </View>
            ))}
          </View>
        )}

        {resume.projects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Projects</Text>
            {resume.projects.map((project, projectIndex) => (
              <View key={`project-${projectIndex}`}>
                <Text style={styles.itemHeader}>{project.name}</Text>
                {project.description && <Text style={styles.smallText}>{project.description}</Text>}
                {project.bullets.map((bullet, bulletIndex) => renderBullet(bullet, bulletIndex))}
              </View>
            ))}
          </View>
        )}

        {resume.education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Education</Text>
            {resume.education.map((education, index) => (
              <View key={`edu-${index}`}>
                <Text style={styles.itemHeader}>{education.institution}</Text>
                <Text style={styles.smallText}>
                  {[education.degree, education.field, education.graduationDate].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {resume.certifications?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Certifications</Text>
            {resume.certifications.map((cert, index) => (
              <View key={`cert-${index}`}>
                <Text style={styles.itemHeader}>{cert.name}</Text>
                {cert.issuer && <Text style={styles.smallText}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</Text>}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Generated by Resume Shapeshifter — please verify accuracy before sharing.
        </Text>
      </Page>
    </Document>
  );
}
