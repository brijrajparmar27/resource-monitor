import ReactDOM from "react-dom/client";
import Demo from "./demo.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<Demo />);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
