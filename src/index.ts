import { Task, loadTasks, addListItem, saveTasks, createTask } from "./to-do";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { child, getDatabase, ref, set, get, push, onChildAdded } from "firebase/database";
import corsModule from "cors";
import { friendReq } from "./friendList";

const cors = corsModule({origin:true});


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

const taskForm = document.querySelector("#new-task-form") as HTMLFormElement | null;
const taskInput = document.querySelector<HTMLInputElement>("#new-task-title");

const friendForm = document.querySelector("#add-friend-form") as HTMLFormElement
const queryFilter = document.querySelector("#search-filter") as HTMLSelectElement
const userIdent = document.querySelector("#identifier") as HTMLInputElement
const friendList = document.querySelector("#friendsList") as HTMLUListElement
const notif = document.querySelector("#notif") as HTMLDivElement

var tasks : Task[] = [];

signInBtn.onclick = () => signInWithPopup(auth, provider);

  signOutBtn.onclick = () => {
    while(list.hasChildNodes()){list.firstChild?.remove()}
    tasks = [];
    auth.signOut().then(() => {
      document.location.reload();
    }).catch((error)=>{
      console.log(error);
    });
  };

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
        taskForm?.addEventListener("submit", e => {
            e.preventDefault();
            if(taskInput != null && (taskInput.value != "" && taskInput.value != null)) {
              let newTask = createTask(taskInput);
              push(taskRef, newTask);
              taskInput.value = "";
            }
        });

        friendForm?.addEventListener("submit", e => {
          e.preventDefault();
          if(userIdent != null && (userIdent.value != "" && userIdent.value != null)){
            friendReq(userIdent.value, queryFilter.value, database, user, friendList, notif);
          }
        });
        
    }
    else{
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
    }
}
);