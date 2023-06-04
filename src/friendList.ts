import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { Database, query, get, ref, orderByChild, equalTo, set, push, child } from "firebase/database";

export function friendReq(identifier: string, filter: string, db: Database, usr: User, list: HTMLUListElement, noteBox: HTMLDivElement){
    get(query(ref(db, '/users'), orderByChild( `/${filter}`), equalTo(identifier))).then((data) => {
        let reqTo;
        if(data.val() == null){
            noteBox.innerHTML = `No one by that ${filter} was found`;
            noteBox.setAttribute("style", "background-color: var(--bs-danger-bg-subtle)");
        } else {
            noteBox.innerHTML = `Friend request sent to ${identifier}`;
            noteBox.setAttribute("style", "background-color: var(--bs-success-bg-subtle)");
             data.forEach(e => {reqTo = e.key});
            push(ref(db, `requests/${reqTo}`), {type: "friendReq", by:`${usr.uid}`});
        }
    });
}
