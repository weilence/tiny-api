import "./index.css";

const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

import { createApp } from "vue";
import naive from "naive-ui";

import App from "./App.vue";
createApp(App).use(naive).mount("#app");
