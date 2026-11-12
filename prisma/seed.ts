/**
 * Seeds the knowledge base with real UBT (University for Business and
 * Technology, Prishtina) student-services content, so the assistant has
 * something real to retrieve and answer from out of the box. This is an
 * unofficial thesis demo, not an official UBT data source - content below
 * is summarized from public UBT regulation titles and service descriptions
 * provided for this project; exact figures/deadlines should be confirmed
 * with the Students Office.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { ingestDocument } from "../src/lib/ingest";
import { getOrCreateDemoUser } from "../src/lib/demoUser";

const UBT_DOCUMENTS: { title: string; content: string }[] = [
  {
    title: "Student Regulations Overview",
    content: `UBT governs student academic life through a set of official regulations and policy documents. The main ones students ask about are:

- Regulation for Student Assessment - governs how students are evaluated and graded across their studies.
- Guideline for Student Assessment - the supporting framework for ensuring evaluation is applied fairly and consistently.
- Handbook for Students - covers student rights, responsibilities, and general academic procedures at UBT.
- Regulation of the First Phase of Studies - sets out the requirements and procedures for undergraduate (Bachelor) programs.
- Convention on Student Rights and Responsibilities - defines the mutual obligations between UBT and its students.
- Regulation for the Handling of Student Complaints - the grievance procedure students use to raise and resolve complaints.
- Regulation on Transfer of Studies - governs the process for transferring between study programs, or from another institution into UBT. A transfer request goes through the Students Office (see the Student Services document for how to submit requests and expected processing times); approval can depend on credit harmonization and grade conversion between the original and target program, which the Students Office also handles.
- Regulation on Anti-Plagiarism - sets UBT's academic honesty standards. It defines what counts as plagiarism and works together with the Disciplinary Procedure to determine consequences. Consequences depend on the severity of the case and are handled by the relevant academic bodies - they can range from a grade penalty on the affected assessment to more serious disciplinary action. A student involved in a suspected plagiarism case should consult the Students Office or the full regulation (available via the Knowledge Center) for the exact procedure that applies to their case.
- Student Support Services Regulation - describes the support systems available to students beyond academics.
- Regulation on Compulsory Practice - sets out internship/practical experience requirements that are part of certain study programs.
- Disciplinary Procedure - the formal process UBT follows when handling academic or conduct violations, including plagiarism cases.
- Regulations for Non-Discrimination - UBT's policy against discrimination within the university community.
- Decision on Promoting Gender Equality - UBT's policy commitments on gender equality.

For the exact text of any of these regulations, students should consult the official documents via UBT's Knowledge Center or ask the Students Office directly - this overview summarizes what each regulation covers, not its full legal text.`,
  },
  {
    title: "Student Services & Office Hours",
    content: `The Students Office is the main point of contact for administrative and academic-procedure questions at UBT. It handles:

- Enrollment request submissions
- Personal file documentation support
- Study contract signing
- Full-time student confirmation letters
- Study schedule information and updates
- Exam schedule details and notifications
- Exam submission and result inquiries
- Grade transcript requests and processing
- Credit harmonization and grade conversion (relevant for students transferring programs or institutions)
- Academic file access and review

Students can access these services in two ways: in person, using application forms available at the office, or online, through UBT's internet portal.

Office hours: 9:00-17:30.

Processing times: straightforward administrative requests (like confirmation letters or schedule information) typically take about 1 day. Requests that require a professional or committee decision - such as transfers, complaints, or transcript-related decisions - need at least 48 hours to process.

To request a transcript specifically: a student submits a transcript request either in person at the Students Office (using the relevant application form) or through the online portal, and it is processed as a standard administrative or decision-based request depending on the type of transcript needed - generally within 1 day for a standard request, or at least 48 hours if it requires additional review.

UBT students also use several online tools day to day:
- SMIS - the Student Information System, for core academic records.
- Moodle - the learning management platform for course materials and coursework.
- Student portal - used for checking groups, schedules, and related logistics.
- Knowledge Center - where official regulations and reference documents are published.`,
  },
  {
    title: "Registration & Fees",
    content: `Tuition fees at UBT vary by study program and by academic year, and exact amounts are announced during each admissions/student-competition cycle rather than being fixed year to year. This document is illustrative rather than a source of exact current pricing - students should confirm exact fees for their specific program with the Students Office or UBT's official channels.

UBT offers discounts on tuition in a couple of ways:
- Paying the full year's tuition in advance, rather than in installments.
- Merit-based discounts tied to strong high-school academic performance - students entering with a GPA of 9.0 or higher can receive a reduced fee that applies across all 3 years of study.

Online applications to UBT go through the university's dedicated application portal at apliko.ubt-uni.net. This is separate from SMIS (which is used by already-enrolled students for academic records) and is specifically the entry point for prospective students applying to a program.

For program-specific fee tables, discount eligibility details, or payment plan options, students should check the current admissions cycle information on UBT's official channels or ask the Students Office directly, since this document summarizes the general policy rather than a specific year's pricing.`,
  },
];

async function main() {
  console.log("Seeding demo user...");
  const user = await getOrCreateDemoUser();
  console.log(`  -> demo user: ${user.email} (${user.id})`);

  const existingCount = await prisma.knowledgeDocument.count();
  if (existingCount > 0) {
    console.log(
      `Knowledge base already has ${existingCount} document(s). Skipping seed (delete existing documents first if you want to reseed).`
    );
    return;
  }

  console.log(`Ingesting ${UBT_DOCUMENTS.length} UBT documents...`);
  for (const doc of UBT_DOCUMENTS) {
    const result = await ingestDocument(doc.title, doc.content);
    console.log(`  -> "${doc.title}": ${result.chunkCount} chunks embedded`);
  }
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
