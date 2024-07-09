import React, { useEffect } from "react";
import { useFirebase } from "../context/Firebase";

const HomePage = () => {
  const firebase = useFirebase();
  useEffect(() => {
    firebase.listTodos().then((docs) => console.log(docs));
  }, []);
  return <div className="container">List todos here</div>;
};
export default HomePage;
