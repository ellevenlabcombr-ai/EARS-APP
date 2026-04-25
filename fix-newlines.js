const fs = require('fs');
let content = fs.readFileSync('components/AthleteHealthProfile.tsx', 'utf8');

content = content.replace('import { ConfirmDialog } from "./ConfirmDialog";\\nimport { PosturalAssessmentModal } from "./PosturalAssessmentModal";', 'import { ConfirmDialog } from "./ConfirmDialog";\nimport { PosturalAssessmentModal } from "./PosturalAssessmentModal";');
// And also check if the modal import had \\n
content = content.replace(/\\n/g, '\n');

fs.writeFileSync('components/AthleteHealthProfile.tsx', content);
