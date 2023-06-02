import { Task, loadTasks, addListItem, saveTasks, createTask } from "./todo";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { child, getDatabase, ref, set, get, push, onChildAdded } from "firebase/database";


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
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
  });;

/**  
This is a way of testing if data can be entered into the database or not, for debbugging purposes only

const dataBut = document.querySelector<HTMLButtonElement>("#addStuff");
var n = 0;
dataBut.onclick = function() {
    writeUserData(`${420 + n}`, "Potato", "Potato@proton.db", firebase);
    console.log("I am being clicked");
    n++;
}; 
**/

onAuthStateChanged(auth, user => {
    if(user){
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        const dbRef = ref(getDatabase(firebase));
        const taskRef = ref(database, 'users/' + user.uid + '/tasks');

        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
          if(snapshot.exists()){
            loadTasks(database, user.uid, tasks);
          }else{
            set(ref(database, 'users/' + user.uid), {
              username: user.displayName,
              email: user.email,
            });
          }
        }).catch((error) => {
          console.log(error);
        });

        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;

        onChildAdded(taskRef, (data) => {list.append(addListItem(data.val(), database, user.uid));});
      
        //if user wants to save more items
        form?.addEventListener("submit", e => {
            e.preventDefault();
            if(input != null && (input.value != "" && input.value != null)) {
              let newTask = createTask(input);
              push(taskRef, newTask);
            }
          });


        // For user to log out
        signOutBtn.onclick = () => {
          while(list.hasChildNodes()){list.firstChild?.remove()}
          tasks = [];
          signOut(auth);
        };
    }
    else{
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
    }
}
);