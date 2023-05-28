import { mainTodo } from "./todo";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { Database, getDatabase, ref, set } from "firebase/database";
import { getFirestore } from "firebase/firestore";

function writeUserData(userId: string, name: string | null, email: string | null, fireRef: FirebaseApp) {
    const db = getDatabase();
    set(ref(db, 'users/' + userId), {
      username: name,
      email: email,
    });
  }

var firebaseConfig = {
    apiKey: "AIzaSyDU2JcTurCRB9v1_y-O2-Sb2wRDnYcb154",
    authDomain: "fir-start-cad93.firebaseapp.com",
    projectId: "fir-start-cad93",
    storageBucket: "fir-start-cad93.appspot.com",
    messagingSenderId: "529847938389",
    appId: "1:529847938389:web:c17a7dad25e33b21c1d3dc",
    databaseURL: "https://fir-start-cad93-default-rtdb.firebaseio.com/",
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const provider = new GoogleAuthProvider();
const database = getDatabase(firebase);
console.log(database);

const whenSignedIn = document.getElementById("whenSignedIn") as HTMLDivElement;
const whenSignedOut = document.getElementById("whenSignedOut") as HTMLDivElement;

const signInBtn = document.getElementById("signInBtn") as HTMLButtonElement;
const signOutBtn = document.getElementById("signOutBtn") as HTMLButtonElement;

const userDetails = document.getElementById("userDetails") as HTMLDivElement;

const dataBut = document.querySelector<HTMLButtonElement>("#addStuff");

signInBtn.onclick = () => signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });;

signOutBtn.onclick = () => signOut(auth);

if (dataBut != null) dataBut.onclick = function() {
    writeUserData("420", "Potato", "Potato@proton.db", firebase);
    console.log("I am being clicked");
};

onAuthStateChanged(auth, user => {
    if(user){
        // signed in
        console.log(user);
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        writeUserData(user.uid, user.displayName, user.email, firebase);
        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
    }
    else{
        // signed out
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
    }
}
);


mainTodo();