import "./App.css";

import "firebase/firestore";
import "firebase/auth";

import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db } from "./firebase";
import { useEffect, useState, useRef } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>SUp@ Ch@tZ🫡</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState("");
  const [photoURL, setPhotoUrl] = useState(
    "https://api.adorable.io/avatars/23/abott@adorable.png"
  );

  const messagesRef = collection(db, "messages");
  const recentMessage = useRef();

  const queryAtts = query(messagesRef, orderBy("createdAt"), limit(25));

  //Send Messages
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    recentMessage.current.scrollIntoView({ behavior: "smooth" });
  };

  //Get Messages from Firestore
  useEffect(() => {
    //console.log(messagesRef);
    onSnapshot(queryAtts, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => {
          return { id: doc.id, viewing: false, ...doc.data() };
        })
      );
    });
  }, []);

  //Set photoURL
  useEffect(() => {
    if (auth.currentUser?.photoURL) {
      //console.log("Photo URL in UseEffect:", auth.currentUser.photoURL);
      setPhotoUrl(auth.currentUser.photoURL);
    }
  }, [auth]);

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, i) => (
            <>
              {console.log("Pre-Chat Msg uid: ", msg.uid)}
              <ChatMessage msg={msg.text} uid={msg.uid} photoURL={photoURL} />
            </>
          ))}
        <div ref={recentMessage}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={"Keep it Clean 👀"}
        />
        <button type="submit" disabled={!formValue}>
          😶‍🌫️
        </button>
      </form>
    </>
  );
};

const ChatMessage = (props) => {
  console.log("chat message photo: ", props.photoURL);

  const messageClass =
    props.uid === auth.currentUser?.uid ? "sent" : "recieved";
  console.log("useAuthStateHook uid: ", props.uid);
  return (
    <div className={`message ${messageClass}`}>
      <img src={props.photoURL} alt={"profile img broken lol"} />
      <p key={props.uid}>{props.msg}</p>
    </div>
  );
};

const SignIn = () => {
  const useSignInWithGoogle = () => {
    signInWithPopup(auth, provider);
  };

  return (
    <>
      <button onClick={useSignInWithGoogle}>SignIn W/ Google</button>
      <p
        style={{
          paddingLeft: "7.8rem",
        }}
      >
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
};

export default App;
