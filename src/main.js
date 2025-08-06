import Vue from "vue";
import hello from "./hello.vue";
import "./styles/main.css";

const { entrypoints } = require("uxp");

entrypoints.setup({
  panels: {
    helloworld: {
      show(event) {
        var app4 = new Vue({
          el: "#container",
          components: { hello },
          render(h) {
            return h(hello);
          },
        });
      },
    },
  },
});
