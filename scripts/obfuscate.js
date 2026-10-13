const SALT = 'PLC_FISHBOWL_SALT_2026';

const apiKey = process.argv[2];

if (!apiKey) {
  console.log('\n[!] Please provide your API key:');
  console.log('    node scripts/obfuscate.js AIzaSyYourActualKeyHere\n');
  process.exit(1);
}

const salted = apiKey
  .split('')
  .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)))
  .join('');

const encoded = Buffer.from(salted).toString('base64');

console.log('\n======================================================');
console.log('SUCCESS! Copy the code below:');
console.log('======================================================\n');
console.log(encoded);
console.log('\n======================================================\n');
