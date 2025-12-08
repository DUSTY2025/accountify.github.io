// Import Firebase modules (app only—no Firestore needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBLiKwKj2eiAMfoWwwphrn7e9IAwDewUDE",
  authDomain: "accountify-3-a9f6b.firebaseapp.com",
  projectId: "accountify-3-a9f6b",
  storageBucket: "accountify-3-a9f6b.firebasestorage.app",
  messagingSenderId: "108549592928",
  appId: "1:108549592928:web:b373a492566f1077c13005",
  measurementId: "G-G2YEW8ZW4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Functions instance
const functions = getFunctions(app);
const claimCode = httpsCallable(functions, 'claimCode');

// Main async function
(async function() {
  const params = new URLSearchParams(window.location.search);
  const access = params.get('access');
  const message = document.getElementById('message');
  const codeContainer = document.getElementById('code-container');
  const codeElem = document.getElementById('code');
  const copyBtn = document.getElementById('copy-btn');

  // Optional: Check offline
  if (!navigator.onLine) {
    message.textContent = 'You appear to be offline. Please connect and try again.';
    message.classList.add('error');
    return;
  }

  try {
    if (!access) {
      message.textContent = 'Please access this page via the shortlink to claim your code.';
      return;
    }

    console.log('Access key provided:', access); // For debugging

    const result = await claimCode({ access: access });
    const data = result.data;

    if (data.success) {
      message.textContent = data.message;
      codeElem.textContent = 'Your code: ' + data.code;
      codeContainer.style.display = 'block';
      // Optional: If you want to store the code locally (tied to access key, not hash)
      // localStorage.setItem('claimedCode_' + access, data.code);
    } else {
      message.textContent = data.message;
      // If already claimed, optionally show a stored code if you add localStorage
    }
  } catch (error) {
    console.error('Claim error:', error);
    message.textContent = 'Error: ' + error.message;
    message.classList.add('error');
  }

  // Copy button event listener
  copyBtn.addEventListener('click', function() {
    const codeToCopy = codeElem.textContent.replace('Your code: ', '');
    if (codeToCopy && codeToCopy !== 'Your code: ') {
      navigator.clipboard.writeText(codeToCopy).then(function() {
        alert('Code copied to clipboard!');
      }).catch(function() {
        alert('Failed to copy. Please copy manually.');
      });
    } else {
      alert('No code to copy yet.');
    }
  });
})();
