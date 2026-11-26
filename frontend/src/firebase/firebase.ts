import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDo4w6oDOHMuZP3NLqWvDxhirjJ2d4CdUU',
  authDomain: 'olist-dashboard-c7bcb.firebaseapp.com',
  databaseURL: 'https://olist-dashboard-c7bcb-default-rtdb.firebaseio.com',
  projectId: 'olist-dashboard-c7bcb',
  storageBucket: 'olist-dashboard-c7bcb.firebasestorage.app',
  messagingSenderId: '418648289459',
  appId: '1:418648289459:web:78c8b88bc7f641195080c6',
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);