const eventBus = new Vue()

const socket = io();
let room = '';

Vue.component('join-form', {
  template: `
    <div class="col-sm-6 mx-auto">
      <h6 class="text-center">Choose a name and join a game.</h6>
      <form @submit.prevent="onSumbit">
        <div class="form-group">
          <label for="txtUsername" class="bmd-label-floating">Username</label>
          <input id="txtUsername" v-model="username" type="text" class="form-control"
            required>
        </div>
        <div class="text-center">
          <button type="submit" class="btn btn-raised btn-primary">Join Game</button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      username: ''
    }
  },
  methods: {
    onSumbit() {
      socket.emit('join-game', this.username);
      eventBus.$emit('change-state', 'queue');
    }
  }
});

Vue.component('queue', {
  template: `
    <div class="col-sm-12">
      <h6 class="text-center">Waiting for next player to join...</h6>
    </div>
  `
});

Vue.component('player', {
  props: {
    player: {
      type: Object,
      required: true
    }
  },
  template: `
    <div class="col-6 mx-auto">
      <div class="card">
        <div class="card-header">
          <span>{{ player.username }}</span>
        </div>
        <div class="card-body">
          <span>{{ player.choice }}</span>
        </div>
      </div>
    </div>
  `
});

Vue.component('choices', {
  template: `
    <div class="col-sm-12">
      <h6 class="text-center">Choose your weapon.</h6>
      <div class="col-12 text-center">
        <button type="button" class="btn btn-raised btn-primary" v-on:click="sendMessage('Rock')">Rock</button>
        <button type="button" class="btn btn-raised btn-primary" v-on:click="sendMessage('Paper')">Paper</button>
        <button type="button" class="btn btn-raised btn-primary" v-on:click="sendMessage('Scisors')">Scisors</button>
      </div>
    </div>
  `,
  methods: {
    sendMessage(choice) {
      eventBus.$emit('submit-choice', choice);
    }
  }
});

const app = new Vue({
  el: '#vue-app',
  data() {
    return {
      roomName: '',
      roomState: 'join',
      playerInfo: null,
      opponent: null
    }
  },
  methods: {
    changeState(state) {
      this.roomState = state;
    }
  },
  mounted() {
    eventBus.$on('change-state', state => {
      this.changeState(state);
    });
    eventBus.$on('join-room', (roomName, playerInfo) => {
      this.roomName = roomName;
      this.playerInfo = playerInfo;

      console.log('Waiting for next player to join on: ', roomName);
    });
    eventBus.$on('close-room', () => {
      socket.emit('send-opponent', this.roomName, this.playerInfo);
    });
    eventBus.$on('get-opponent', (opponentInfo) => {
      this.opponent = opponentInfo;

      this.changeState('game');
    });
    eventBus.$on('submit-choice', (choice) => {
      socket.emit('submit-choice', choice, this.roomName, this.playerInfo.username);
    });
  }
});

// Socket events
socket.on('join-room', (roomName, playerInfo) => {
  eventBus.$emit('join-room', roomName, playerInfo);
});

socket.on('close-room', (bool) => {
  eventBus.$emit('close-room', true);
});

socket.on('get-opponent', (opponentInfo) => {
  eventBus.$emit('get-opponent', opponentInfo);
});

socket.on('player-choice', (message) => {
  console.log(message);
});
