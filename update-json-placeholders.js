const fs = require('fs');

const en = JSON.parse(fs.readFileSync('messages/en.json'));
const th = JSON.parse(fs.readFileSync('messages/th.json'));

en.abstractSubmission.step1.firstNamePlaceholder = 'e.g. John';
en.abstractSubmission.step1.lastNamePlaceholder = 'e.g. Doe';
en.abstractSubmission.step1.phonePlaceholder = 'e.g. 0812345678';
en.abstractSubmission.step2.firstNamePlaceholder = 'e.g. Jane';
en.abstractSubmission.step2.lastNamePlaceholder = 'e.g. Smith';

th.abstractSubmission.step1.firstNamePlaceholder = 'เช่น สมชาย';
th.abstractSubmission.step1.lastNamePlaceholder = 'เช่น ใจดี';
th.abstractSubmission.step1.phonePlaceholder = 'เช่น 0812345678';
th.abstractSubmission.step2.firstNamePlaceholder = 'เช่น สมหญิง';
th.abstractSubmission.step2.lastNamePlaceholder = 'เช่น รักเรียน';

fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('messages/th.json', JSON.stringify(th, null, 2));
console.log('done placeholders');

