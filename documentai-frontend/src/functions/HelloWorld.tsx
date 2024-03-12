import { useState } from "react";
import axios from "axios";

function HelloWorld() {
  const [message, setMessage] = useState("");

  const fetchMessage = () => {
    axios
      .get("http://localhost:8000/hello-world/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <button onClick={fetchMessage}>Fetch Message</button>
      <p>{message}</p>
    </div>
  );
}

export default HelloWorld;
