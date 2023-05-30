import { Task, loadTasks, addListItem, createTL, saveTasks } from "./todo";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { Database, child, getDatabase, ref, set, get } from "firebase/database";
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

const whenSignedIn = document.getElementById("whenSignedIn") as HTMLDivElement;
const whenSignedOut = document.getElementById("whenSignedOut") as HTMLDivElement;

const signInBtn = document.getElementById("signInBtn") as HTMLButtonElement;
const signOutBtn = document.getElementById("signOutBtn") as HTMLButtonElement;

const userDetails = document.getElementById("userDetails") as HTMLDivElement;

const list = document.querySelector("#list") as HTMLUListElement;
const form = document.querySelector("#new-task-form") as HTMLFormElement | null;
const input = document.querySelector<HTMLInputElement>("#new-task-title");

var tasks : Task[] = [];


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

/* 
This is a way of testing if data can be entered into the database or not, for debbugging purposes only

const dataBut = document.querySelector<HTMLButtonElement>("#addStuff");
var n = 0;
dataBut.onclick = function() {
    writeUserData(`${420 + n}`, "Potato", "Potato@proton.db", firebase);
    console.log("I am being clicked");
    n++;
}; 
*/

onAuthStateChanged(auth, user => {
    if(user){
        // signed in
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
          if(snapshot.exists()){
            //load list items from server
            loadTasks(database, user.uid, tasks);
          }else{
            writeUserData(user.uid, user.displayName, user.email, firebase);
          }
        }).catch((error) => {
          console.log(error);
        });

        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
      
        //add initial List Items
        setTimeout(function(){
          tasks.forEach((item) => {addListItem(item, database, user.uid, tasks, list)})
        }, 1000);

        //if user wants to save more items
        form?.addEventListener("submit", e => {
            e.preventDefault();
            if(input != null) {
                const taskToAdd = createTL(input, tasks)
                if(taskToAdd != null) addListItem(taskToAdd, database, user.uid, tasks, list);
                saveTasks(database, user.uid, tasks);
            }
          });

        // For user to log out
        signOutBtn.onclick = () => {
          saveTasks(database, user.uid, tasks)
          signOut(auth);
          list?.childNodes.forEach(e => e.remove());
          tasks = [];
        };
    }
    else{
        // signed out
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
    }
}
);