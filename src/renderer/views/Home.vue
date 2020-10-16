<template>
  <div id="wrapper">
    <img id="logo" src="../assets/meteorman_logo.png" alt="electron-vue">
    <main>
      <div class="left-side">
        <span class="title">
          Methods
        </span>
        <v-text-field>
          <v-btn
              slot="prepend"
              depressed
              outlined
          >
            DDP
          </v-btn>
          <v-btn
              slot="append"
              depressed
              outlined
              v-on:click="ddp()"
          >
            SEND
          </v-btn>
        </v-text-field>
      </div>
    </main>
  </div>
</template>

<script>
  import simpleDDP from 'simpleddp'; // ES6
  import ws from 'isomorphic-ws';
  export default {
    name: 'home',
    methods: {
      async ddp(){
        console.log("Click");

        let opts = {
          endpoint: "ws://admin.movin.mx/websocket",
          SocketConstructor: ws,
          reconnectInterval: 5000
        };
        const server = new simpleDDP(opts);

        const res = await server.call('binnacle.makeBackup');

        console.log(res);
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>