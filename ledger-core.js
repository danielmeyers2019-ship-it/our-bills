// Shared Firebase connection + data helpers used by every page (index.html, history.html, future pages).
// Keeping this in one file means you only ever paste your Firebase keys once.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCAxCmis-RNhwDYeOazhQhCGV9xXMkr2I",
  authDomain: "household-ledger-b976e.firebaseapp.com",
  projectId: "household-ledger-b976e",
  storageBucket: "household-ledger-b976e.firebasestorage.app",
  messagingSenderId: "818913730005",
  appId: "1:818913730005:web:3b122dc79109e32591b15c"
};

export const firebaseReady = firebaseConfig.apiKey !== "YOUR_API_KEY";
let db, docRef;
if (firebaseReady) {
  const fbApp = initializeApp(firebaseConfig);
  db = getFirestore(fbApp);
  docRef = doc(db, "ledger", "household");
}

export const ME_KEY = 'ledger-my-person-id';

export function defaultData(){
  return {
    people: [
      { id: 'p-daniel', name: 'Daniel', color: 'A' },
      { id: 'p-maddy', name: 'Maddy', color: 'B' }
    ],
    bills: [
      { id: 'b-aaa', name: 'AAA', amount: 339.23, dueDay: 4, payerId: 'p-daniel' },
      { id: 'b-utilities', name: 'Utilities', amount: 142.79, dueDay: 18, payerId: 'p-daniel' },
      { id: 'b-creditcard', name: 'Credit card', amount: 60, dueDay: 13, payerId: 'p-daniel' },
      { id: 'b-car-d', name: 'Car', amount: 412.02, dueDay: 26, payerId: 'p-daniel' },
      { id: 'b-frontier', name: 'Frontier', amount: 62, dueDay: 26, payerId: 'p-daniel' },
      { id: 'b-rent', name: 'Rent', amount: 2598, dueDay: 30, payerId: 'p-daniel' },
      { id: 'b-saliemae', name: 'Salie Mae', amount: 370, dueDay: 30, payerId: 'p-daniel' },
      { id: 'b-nelnet', name: 'nelnet', amount: 320, dueDay: 30, payerId: 'p-daniel' },
      { id: 'b-school', name: 'school', amount: 365, dueDay: 15, payerId: 'p-maddy' },
      { id: 'b-carpayment', name: 'car payment', amount: 445, dueDay: 15, payerId: 'p-maddy' },
      { id: 'b-carinsurance', name: 'Car insurance', amount: 215, dueDay: 15, payerId: 'p-maddy' },
      { id: 'b-medicine', name: 'Medicine', amount: 275, dueDay: 10, payerId: 'p-maddy' },
      { id: 'b-vet', name: 'Vet', amount: 175, dueDay: 10, payerId: 'p-maddy' }
    ],
    payments: {}
  };
}

export function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
export function fmtMoney(n){ return '$' + Number(n).toFixed(2).replace(/\.00$/, ''); }

export function colorFor(person){
  if(!person) return {main:'var(--neutral)', soft:'var(--neutral-soft)'};
  if(person.color==='A') return {main:'var(--personA)', soft:'var(--personA-soft)'};
  if(person.color==='B') return {main:'var(--personB)', soft:'var(--personB-soft)'};
  return {main:'var(--neutral)', soft:'var(--neutral-soft)'};
}

export function findPerson(data, id){ return data.people.find(function(p){ return p.id===id; }); }

export function monthKeyOf(date){
  return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0');
}

export function dueDateInMonth(dueDay, year, month){
  var lastDay = new Date(year, month+1, 0).getDate();
  var day = Math.min(dueDay, lastDay);
  return new Date(year, month, day);
}

export function paymentKey(billId, monthKey){ return billId + '|' + monthKey; }

export function loadMe(){ return localStorage.getItem(ME_KEY); }
export function saveMe(id){ localStorage.setItem(ME_KEY, id); }

export function nextColorSlot(data){
  var used = data.people.map(function(p){ return p.color; });
  if(used.indexOf('A')===-1) return 'A';
  if(used.indexOf('B')===-1) return 'B';
  return null;
}

export async function loadInitial(){
  try{
    var snap = await getDoc(docRef);
    if(snap.exists()){
      var d = snap.data();
      if(!d.payments) d.payments = {};
      if(!d.people) d.people = [];
      if(!d.bills) d.bills = [];
      return d;
    } else {
      var fresh = defaultData();
      await setDoc(docRef, fresh);
      return fresh;
    }
  }catch(e){
    return defaultData();
  }
}

export async function saveData(data){
  try{
    await setDoc(docRef, data);
    return true;
  }catch(e){
    return false;
  }
}

export function subscribeLive(callback){
  if(!firebaseReady) return;
  onSnapshot(docRef, function(snap){
    if(snap.exists()){
      var d = snap.data();
      if(!d.payments) d.payments = {};
      if(!d.people) d.people = [];
      if(!d.bills) d.bills = [];
      callback(d);
    }
  }, function(){ callback(null); });
}
