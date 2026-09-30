import jsPDF from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';

export const exportAtsResumePdf = (resumeData) => {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 45;

  const checkPageBreak = (neededHeight = 25) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 45;
    }
  };

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text(resumeData.candidateName || 'Candidate Name', margin, y);
  y += 22;

  // Target Role
  if (resumeData.targetRole) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.text(resumeData.targetRole.toUpperCase(), margin, y);
    y += 16;
  }

  // Contact Info Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  const contactParts = [
    resumeData.contactInfo?.email,
    resumeData.contactInfo?.phone,
    resumeData.contactInfo?.location,
    resumeData.contactInfo?.linkedin,
    resumeData.contactInfo?.portfolio
  ].filter(Boolean);

  const contactStr = contactParts.join('  |  ');
  if (contactStr) {
    doc.text(contactStr, margin, y);
    y += 16;
  }

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  const addSectionHeader = (title) => {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  };

  // Professional Summary
  if (resumeData.professionalSummary) {
    addSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    const summaryLines = doc.splitTextToSize(resumeData.professionalSummary, contentWidth);
    summaryLines.forEach(line => {
      checkPageBreak(14);
      doc.text(line, margin, y);
      y += 13;
    });
    y += 10;
  }

  // Core Competencies
  if (resumeData.coreCompetencies && resumeData.coreCompetencies.length > 0) {
    addSectionHeader('Core Competencies');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);

    const skillsStr = resumeData.coreCompetencies.join('  •  ');
    const skillLines = doc.splitTextToSize(skillsStr, contentWidth);
    skillLines.forEach(line => {
      checkPageBreak(14);
      doc.text(line, margin, y);
      y += 13;
    });
    y += 10;
  }

  // Work Experience
  if (resumeData.workExperience && resumeData.workExperience.length > 0) {
    addSectionHeader('Professional Experience');
    resumeData.workExperience.forEach((exp) => {
      checkPageBreak(30);

      // Title & Company
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      const titleCompany = `${exp.title || 'Software Engineer'} — ${exp.company || 'Company'}`;
      doc.text(titleCompany, margin, y);

      // Duration / Location on right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const dateLoc = [exp.duration, exp.location].filter(Boolean).join(' | ');
      if (dateLoc) {
        doc.text(dateLoc, pageWidth - margin, y, { align: 'right' });
      }
      y += 14;

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        exp.achievements.forEach((ach) => {
          const bulletLines = doc.splitTextToSize(ach, contentWidth - 15);
          checkPageBreak(bulletLines.length * 13 + 4);
          doc.text('•', margin + 4, y);
          bulletLines.forEach((line, idx) => {
            doc.text(line, margin + 16, y);
            y += 13;
          });
        });
      }
      y += 8;
    });
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    addSectionHeader('Key Projects');
    resumeData.projects.forEach((proj) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.name || 'Project Name', margin, y);

      if (proj.techStack) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`[${proj.techStack}]`, pageWidth - margin, y, { align: 'right' });
      }
      y += 14;

      if (proj.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        const descLines = doc.splitTextToSize(proj.description, contentWidth - 15);
        descLines.forEach((line) => {
          checkPageBreak(13);
          doc.text(`• ${line}`, margin + 4, y);
          y += 13;
        });
      }

      if (proj.keyMetric) {
        checkPageBreak(13);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 64, 175); // blue 800
        doc.text(`  Impact: ${proj.keyMetric}`, margin + 4, y);
        y += 13;
      }
      y += 6;
    });
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    addSectionHeader('Education');
    resumeData.education.forEach((edu) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const degreeStr = `${edu.degree || 'Degree'} ${edu.field ? `- ${edu.field}` : ''}`;
      doc.text(degreeStr, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const instYear = [edu.institution, edu.year].filter(Boolean).join(' | ');
      doc.text(instYear, pageWidth - margin, y, { align: 'right' });
      y += 15;
    });
    y += 6;
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    addSectionHeader('Certifications');
    resumeData.certifications.forEach((cert) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cert.title || 'Certification', margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const certInfo = [cert.issuer, cert.year].filter(Boolean).join(' | ');
      doc.text(certInfo, pageWidth - margin, y, { align: 'right' });
      y += 14;
    });
  }

  const filename = `${(resumeData.candidateName || 'ATS_Resume').replace(/\s+/g, '_')}_ATS_Optimized.pdf`;
  doc.save(filename);
};

export const exportAtsResumeDocx = async (resumeData) => {
  const children = [];

  // Name
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: resumeData.candidateName || 'Candidate Name',
          bold: true,
          size: 32, // 16pt
          color: '0F172A'
        })
      ]
    })
  );

  // Target Role
  if (resumeData.targetRole) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (resumeData.targetRole || '').toUpperCase(),
            bold: true,
            size: 22, // 11pt
            color: '475569'
          })
        ]
      })
    );
  }

  // Contact Info
  const contactParts = [
    resumeData.contactInfo?.email,
    resumeData.contactInfo?.phone,
    resumeData.contactInfo?.location,
    resumeData.contactInfo?.linkedin,
    resumeData.contactInfo?.portfolio
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 19, // 9.5pt
            color: '64748B'
          })
        ]
      })
    );
  }

  const addHeading = (title) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spaceBefore: 240,
        spaceAfter: 120,
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            color: '0F172A'
          })
        ]
      })
    );
  };

  // Professional Summary
  if (resumeData.professionalSummary) {
    addHeading('Professional Summary');
    children.push(
      new Paragraph({
        spaceAfter: 120,
        children: [
          new TextRun({
            text: resumeData.professionalSummary,
            size: 20, // 10pt
            color: '334155'
          })
        ]
      })
    );
  }

  // Core Competencies
  if (resumeData.coreCompetencies && resumeData.coreCompetencies.length > 0) {
    addHeading('Core Competencies');
    children.push(
      new Paragraph({
        spaceAfter: 120,
        children: [
          new TextRun({
            text: resumeData.coreCompetencies.join('  •  '),
            size: 20,
            color: '334155'
          })
        ]
      })
    );
  }

  // Work Experience
  if (resumeData.workExperience && resumeData.workExperience.length > 0) {
    addHeading('Professional Experience');
    resumeData.workExperience.forEach((exp) => {
      children.push(
        new Paragraph({
          spaceBefore: 120,
          children: [
            new TextRun({
              text: `${exp.title || 'Software Engineer'} — ${exp.company || 'Company'} `,
              bold: true,
              size: 21,
              color: '0F172A'
            }),
            new TextRun({
              text: ` (${[exp.duration, exp.location].filter(Boolean).join(' | ')})`,
              size: 19,
              color: '64748B'
            })
          ]
        })
      );

      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((ach) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spaceAfter: 40,
              children: [
                new TextRun({
                  text: ach,
                  size: 19,
                  color: '334155'
                })
              ]
            })
          );
        });
      }
    });
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    addHeading('Key Projects');
    resumeData.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          spaceBefore: 100,
          children: [
            new TextRun({
              text: `${proj.name || 'Project'} `,
              bold: true,
              size: 20,
              color: '0F172A'
            }),
            proj.techStack ? new TextRun({
              text: `[${proj.techStack}]`,
              size: 18,
              color: '64748B'
            }) : new TextRun({ text: '' })
          ]
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: proj.description,
                size: 19,
                color: '334155'
              })
            ]
          })
        );
      }

      if (proj.keyMetric) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `   Impact: ${proj.keyMetric}`,
                bold: true,
                size: 18,
                color: '1E40AF'
              })
            ]
          })
        );
      }
    });
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    addHeading('Education');
    resumeData.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spaceBefore: 80,
          children: [
            new TextRun({
              text: `${edu.degree || 'Degree'} ${edu.field ? `- ${edu.field}` : ''} `,
              bold: true,
              size: 20,
              color: '0F172A'
            }),
            new TextRun({
              text: `(${[edu.institution, edu.year].filter(Boolean).join(' | ')})`,
              size: 19,
              color: '64748B'
            })
          ]
        })
      );
    });
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    addHeading('Certifications');
    resumeData.certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          spaceBefore: 60,
          children: [
            new TextRun({
              text: `${cert.title || 'Certification'} `,
              bold: true,
              size: 19,
              color: '0F172A'
            }),
            new TextRun({
              text: `(${[cert.issuer, cert.year].filter(Boolean).join(' | ')})`,
              size: 18,
              color: '64748B'
            })
          ]
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ children }]
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(resumeData.candidateName || 'ATS_Resume').replace(/\s+/g, '_')}_ATS_Optimized.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

