/**
 * Test des fonctions email utils
 */

import { extractCleanEmail, extractAuthorEmail, compareEmails } from '../utils/emailUtils';

// Test 1: Format SharePoint
console.log('=== TEST 1: Format SharePoint ===');
const sharePointEmail = 'i:0#.f|membership|cyrille_nana@afrilandfirstbank.com';
const cleaned = extractCleanEmail(sharePointEmail);
console.log('Input:', sharePointEmail);
console.log('Output:', cleaned);
console.log('Expected: cyrille_nana@afrilandfirstbank.com');
console.log('Match:', cleaned === 'cyrille_nana@afrilandfirstbank.com');

// Test 2: Email normal
console.log('\n=== TEST 2: Email normal ===');
const normalEmail = 'user@domain.com';
const cleaned2 = extractCleanEmail(normalEmail);
console.log('Input:', normalEmail);
console.log('Output:', cleaned2);
console.log('Expected: user@domain.com');
console.log('Match:', cleaned2 === 'user@domain.com');

// Test 3: Comparaison
console.log('\n=== TEST 3: Comparaison ===');
const email1 = 'i:0#.f|membership|test@domain.com';
const email2 = 'test@domain.com';
const areEqual = compareEmails(email1, email2);
console.log('Email 1:', email1);
console.log('Email 2:', email2);
console.log('Are equal:', areEqual);
console.log('Expected: true');

// Test 4: Extract Author Email
console.log('\n=== TEST 4: Extract Author Email ===');
const mockObjectif = {
  'Author#Claims': 'i:0#.f|membership|author@company.com',
  Author: { EMail: 'author@company.com' }
};
const authorEmail = extractAuthorEmail(mockObjectif);
console.log('Mock data:', JSON.stringify(mockObjectif, null, 2));
console.log('Extracted email:', authorEmail);
console.log('Expected: author@company.com');
console.log('Match:', authorEmail === 'author@company.com');
