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
    imageviewer: {
      show(event) {
        // 图片查看器面板直接加载imageviewer.html
        // 这个面板会通过URL参数或postMessage接收图片URL
        console.log('图片查看器面板已打开');
        
        // 设置面板内容为imageviewer.html
        const container = document.getElementById('container');
        if (container) {
          // 创建iframe来加载图片查看器
          const iframe = document.createElement('iframe');
          iframe.src = './imageviewer.html';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          container.innerHTML = '';
          container.appendChild(iframe);
        }
      },
    },
  },
});
