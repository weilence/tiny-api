import "./index.css";

const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

import { createApp } from "vue";
import naive from "naive-ui";

import App from "./App.vue";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia).use(naive).mount("#app");
