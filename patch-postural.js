const fs = require('fs');
let content = fs.readFileSync('components/AthleteHealthProfile.tsx', 'utf8');

if (!content.includes('PosturalAssessmentModal')) {
  content = content.replace(
    'import { ConfirmDialog } from "./ConfirmDialog";',
    'import { ConfirmDialog } from "./ConfirmDialog";\\nimport { PosturalAssessmentModal } from "./PosturalAssessmentModal";'
  );
}

const modalStart = '{/* Postural Comparison Modal */}';
const nextSection = '      {/* Fast Clinical Note Modal */}';

const startIndex = content.indexOf(modalStart);
const endIndex = content.indexOf(nextSection, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = 
      "{/* Postural Assessment Modal */}\\n" +
      "      <PosturalAssessmentModal\\n" +
      "        athleteId={athlete.id}\\n" +
      "        isOpen={showPosturalModal}\\n" +
      "        onClose={() => setShowPosturalModal(false)}\\n" +
      "        supabase={supabase}\\n" +
      "        onSaveSuccess={() => {\\n" +
      "          fetchAllAssessmentsData(athlete.id).then(refreshedData => {\\n" +
      "            setClinicalAssessments(refreshedData);\\n" +
      "          });\\n" +
      "        }}\\n" +
      "        language={language}\\n" +
      "      />\\n\\n";
      
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync('components/AthleteHealthProfile.tsx', content);
    console.log('Patch complete.');
} else {
    console.log('Could not find start or end index.', { startIndex, endIndex });
}
