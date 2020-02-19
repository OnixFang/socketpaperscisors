const eventBus = new Vue();

const socket = io();

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
    };
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
  props: {
    canChoose: {
      type: Boolean,
      required: true
    }
  },
  template: `
    <div class="col-12 text-center">
      <h6 class="text-center">Choose your weapon.</h6>
      <button type="button" class="btn btn-raised btn-primary" v-on:click="submitChoice('Rock')" :disabled="canChoose">Rock</button>
      <button type="button" class="btn btn-raised btn-primary" v-on:click="submitChoice('Paper')" :disabled="canChoose">Paper</button>
      <button type="button" class="btn btn-raised btn-primary" v-on:click="submitChoice('Scisors')" :disabled="canChoose">Scisors</button>
    </div>
  `,
  methods: {
    submitChoice(choice) {
      eventBus.$emit('submit-choice', choice);
    }
  }
});

new Vue({
  el: '#vue-app',
  data() {
    return {
      roomName: '',
      roomState: 'join',
      playerInfo: null,
      opponent: null
    };
  },
  computed: {
    buttonDisabled() {
      if (this.playerInfo !== null) {
        if (this.playerInfo.choice.length > 1) {
          console.log('Choice lenght is greater than 1.');
          return true;
        }
      }
      return false;
    }
  },
  methods: {
    changeState(state) {
      this.roomState = state;
    },
    leaveMatch() {
      this.opponent = null;
      socket.emit('leave-match', this.roomName);
      socket.emit('join-game', this.playerInfo.username, this.roomName);
      this.changeState('queue');
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
      this.playerInfo.choice = choice;
      socket.emit('submit-choice', choice, this.roomName, this.playerInfo.username);
    });
    eventBus.$on('left-room', () => {
      this.opponent = null;
      socket.emit('join-game', this.playerInfo.username);
      this.changeState('queue');
      console.log('A summoner has disconnected.');
    });
  }
});

// Socket events
socket.on('join-room', (roomName, playerInfo) => {
  eventBus.$emit('join-room', roomName, playerInfo);
});

socket.on('close-room', () => {
  eventBus.$emit('close-room', true);
});

socket.on('get-opponent', (opponentInfo) => {
  eventBus.$emit('get-opponent', opponentInfo);
});

socket.on('player-choice', (message) => {
  console.log(message);
});

socket.on('left-room', (bool) => {
  eventBus.$emit('left-room', bool);
});
