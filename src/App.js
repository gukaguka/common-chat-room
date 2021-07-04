import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

if (!firebase.apps.length) {
firebase.initializeApp({
  apiKey: "AIzaSyBEE3kWbag1zeH7rLJIHz6HzgrhbsmKNU0",
  authDomain: "onair-superchat.firebaseapp.com",
  projectId: "onair-superchat",
  storageBucket: "onair-superchat.appspot.com",
  messagingSenderId: "383070465074",
  appId: "1:383070465074:web:439244ce1d5f93c1b8602b",
  measurementId: "G-FMGKZYG947"
});
}else {
   firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();



function App() {

  const [user] = useAuthState(auth);

  return (

    <div className='app'>
    <header>
        <SignOut />
      </header>

      <section>
         { user ? <ChatApp /> : <SignIn /> }
      </section>

    </div>    
    );
}



function SignIn() {

   const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
   }

   return (
    <button onClick={signInWithGoogle}> Sign in with Google account</button> 
    )
}

function SignOut() {

  return auth.currentUser && (
      <button className="sign-out" onClick = {() => auth.signOut()}> Sign Out </button>
    )
}


function ChatApp() {
  const dummy = useRef()
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFromValue] = useState('');

  const sendMessage = async(e) => {
       e.preventDefault();

       const { uid, photoURL } = auth.currentUser;
       await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
       })

       setFromValue('');

       dummy.current.scrollIntoView({ behavior: 'smooth' });
  } 

  return (
    <React.Fragment>
      <main className='messages-section'>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} /> )}
      <div ref={dummy}>
      </div>
      </main>
          <form onSubmit= {sendMessage}>
          <input value={formValue} onChange={e => setFromValue(e.target.value)} />
          <button type='submit'> Send </button>
          </form>
    </React.Fragment>
    )

}


const ChatMessage = (props) => {
const {text , uid , photoURL } = props.message;

const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

return (<React.Fragment>
  <div className={`message ${ messageClass }`}>
  <img src={photoURL} />
   <p>{ text }</p>
  </div>
  </React.Fragment>)

}




export default App;
