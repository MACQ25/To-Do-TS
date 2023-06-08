import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { Database, query, get, ref, orderByChild, equalTo, set, push, child, onChildAdded, remove, DataSnapshot, update, onChildChanged, orderByKey } from "firebase/database";


/**
 * Check if user is not self : Y
 * Check if user is not friend already : Y
 * Check if user exists : Y
 * Check if request has not been done already : Y
 * Sends request to user : Y
 */

export function friendReq(identifier: string, filter: string, db: Database, user: User, list: HTMLUListElement, noteBox: HTMLDivElement){
    if(identifier == user.displayName || identifier == user.email){
        noteBox.innerHTML = `You cannot send a request to yourself`;
        noteBox.setAttribute("style", "background-color: var(--bs-danger-bg-subtle)");
    } else {
        get(query(ref(db, `/users/${user.uid}/friends/`), orderByChild('/friendName'), equalTo(identifier))).then((data) => {
            if(data.exists()){
                noteBox.innerHTML = `User is already added as a friend`;
                noteBox.setAttribute("style", "background-color: var(--bs-warning-bg-subtle)");
            } else {
                get(query(ref(db, '/users'), orderByChild( `/${filter}`), equalTo(identifier))).then((data) => {
                    if(data.val() == null){
                        noteBox.innerHTML = `No one by that ${filter} was found`;
                        noteBox.setAttribute("style", "background-color: var(--bs-danger-bg-subtle)");
                    } else {
                        let reqToID : string = Object.keys(data.val())[0];
                        let reqToEm : string = data.child(`${reqToID}/email`).val();
                        let reqToNa : string = data.child(`${reqToID}/username`).val();

                        get(query(ref(db, `/users/${user.uid}/reqSent`), orderByChild(`/toId`), equalTo(`${reqToID}`))).then((data) => {
                            if(data.val() != null){
                                noteBox.innerHTML = `You have already sent a request to ${filter}`;
                                noteBox.setAttribute("style", "background-color: var(--bs-warning-bg-subtle)");
                            } else {
                                noteBox.innerHTML = `Friend request sent to ${identifier}`;
                                noteBox.setAttribute("style", "background-color: var(--bs-success-bg-subtle)");
                                push(ref(db, `users/${user.uid}/reqSent`), {to: identifier, toId: reqToID});
                                push(ref(db, `requests/`), {to: reqToNa, toID: reqToID, toEm: reqToEm, type:"friendReq", by:`${user.displayName}`, byID: `${user.uid}`, byEmail: `${user.email}`, state: "unknown"});
                            }
                        });
                    }
                });
            }
        })
    }
}

export function requestReceiver(db: Database, user: User, requestList: HTMLUListElement){
    let reqsRec = query(ref(db, `requests/`), orderByChild("toID"), equalTo(`${user.uid}`));
    onChildAdded(reqsRec, (data) => {
        if(data.exists()){
            const nuReq = document.createElement("li");
            nuReq.className = "container-sm"

            const name = document.createElement("p");
            name.innerHTML = data.val().by;
            nuReq.appendChild(name);
    
            const accept = document.createElement("button");
            accept.innerHTML = "Accept";
            accept.addEventListener("click", function(){
                this.parentElement?.remove();
                incomingRequestInteraction(true, data, db, user);
            });
            accept.className = "rounded-2 bg-success";
            nuReq.appendChild(accept);
    
            const decline = document.createElement("button");
            decline.innerHTML = "Decline";
            decline.addEventListener("click", function(){
                this.parentElement?.remove();
                incomingRequestInteraction(false, data, db, user);
            });
            decline.click = () => { nuReq.remove();}
            decline.className = "rounded-2 bg-danger";
            nuReq.appendChild(decline);

            requestList.append(nuReq);
        }
    });
}

// this works however only one way

function incomingRequestInteraction(action: boolean, req: DataSnapshot, db: Database, user: User){
    if(action){
        push(ref(db, `users/${user.uid}/friends`), {friendName: req.val().by, friendId: req.val().byID, friendEmail: req.val().byEmail});
        update(ref(db, `requests/${req.key}`), {state:"accepted"});
    } else{
        update(ref(db, `requests/${req.key}`), {state:"declined"});
    }
}

export function checkMyRequests(db: Database, user: User){
    onChildChanged(query(ref(db, `requests/`), orderByChild(`/byID`), equalTo(`${user.uid}`)), (data) => {
        push(ref(db, `users/${user.uid}/friends`), {friendName: data.val().to, friendId: data.val().toID, friendEmail: data.val().toEm});
        get(query(ref(db, `users/${user.uid}/reqSent`), orderByChild("toId"), equalTo(`${data.val().toID}`))).then((data) => {remove(data.ref)})
        remove(data.ref);
    });
}