import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

(function(){
    var firebaseConfig = {
        apiKey: "AIzaSyCzhXsmwqnp3OPCxLfObDcaioXwKwCudk8",
        authDomain: "fireshipbas.firebaseapp.com",
        projectId: "fireshipbas",
        storageBucket: "fireshipbas.appspot.com",
        messagingSenderId: "447497954038",
        appId: "1:447497954038:web:9e08e348507e7a796dc2d7"
    };
    const firebase = initializeApp(firebaseConfig);
    console.log(firebase);
    const auth = getAuth(firebase);

    const whenSignedIn = document.getElementById("whenSignedIn") as HTMLDivElement;
    const whenSignedOut = document.getElementById("whenSignedOut") as HTMLDivElement;

    const signInBtn = document.getElementById("signInBtn") as HTMLButtonElement;
    const signOutBtn = document.getElementById("signOutBtn") as HTMLButtonElement;

    const userDetails = document.getElementById("userDetails") as HTMLDivElement;

    const provider = new GoogleAuthProvider();

    signInBtn.onclick = () => signInWithPopup(auth, provider);

    signOutBtn.onclick = () => signOut(auth);

    onAuthStateChanged(auth, user => {
        if(user){
            // signed in
            whenSignedIn.hidden = true;
            whenSignedOut.hidden = false;
            userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
        }
        else{
            // signed out
            whenSignedIn.hidden = false;
            whenSignedOut.hidden = true;
        }
    }
    );

})
