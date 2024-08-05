<template>
  <div id="app">
    <h1>Vue 3 高级聊天室</h1>
    <div class="chat-container">
      <div class="user-list">
        <h3>在线用户</h3>
        <ul>
          <li v-for="user in onlineUsers" :key="user">{{ user }}</li>
        </ul>
      </div>
      <div class="chat-room">
        <div class="messages" ref="messagesContainer">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', {'own-message': msg.username === username}]">
            <div class="message-info">
              <span class="username">{{ msg.username }}</span>
              <span class="time">{{ formatTime(msg.time) }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(msg.text)"></div>
          </div>
        </div>
        <div class="input-area">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="输入消息..." />
          <button @click="sendMessage">发送</button>
          <button @click="openEmojiPicker">😊</button>
        </div>
        <div v-if="showEmojiPicker" class="emoji-picker">
          <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">{{ emoji }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import io from 'socket.io-client';

export default {
  name: 'App',
  setup() {
    const socket = io('http://154.64.255.87:3000');
    const messages = ref([]);
    const newMessage = ref('');
    const username = ref('用户' + Math.floor(Math.random() * 1000));
    const messagesContainer = ref(null);
    const onlineUsers = ref([]);
    const showEmojiPicker = ref(false);
    const emojis = ['😊', '😂', '🤔', '👍', '❤️', '🎉', '🌟', '🍕', '🐱', '🌈'];

    onMounted(() => {
      socket.emit('join', username.value);

      socket.on('chat message', (msg) => {
        messages.value.push(msg);
        scrollToBottom();
      });

      socket.on('user joined', (users) => {
        onlineUsers.value = users;
      });

      socket.on('user left', (users) => {
        onlineUsers.value = users;
      });
    });

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        const msg = {
          username: username.value,
          text: newMessage.value,
          time: new Date()
        };
        socket.emit('chat message', msg);
        newMessage.value = '';
      }
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    const formatTime = (time) => {
      return new Date(time).toLocaleTimeString();
    };

    const formatMessage = (text) => {
      // 简单的URL检测和转换
      return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    };

    const openEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value;
    };

    const addEmoji = (emoji) => {
      newMessage.value += emoji;
      showEmojiPicker.value = false;
    };

    return {
      messages,
      newMessage,
      username,
      onlineUsers,
      messagesContainer,
      showEmojiPicker,
      emojis,
      sendMessage,
      formatTime,
      formatMessage,
      openEmojiPicker,
      addEmoji
    };
  }
}
</script>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.chat-container {
  display: flex;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.user-list {
  width: 200px;
  background-color: #f1f1f1;
  padding: 20px;
  border-right: 1px solid #ddd;
}

.user-list ul {
  list-style-type: none;
  padding: 0;
}

.user-list li {
  margin-bottom: 10px;
}

.chat-room {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 500px;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
}

.message {
  margin-bottom: 15px;
  text-align: left;
}

.message-info {
  margin-bottom: 5px;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.time {
  font-size: 0.8em;
  color: #888;
}

.message-text {
  background-color: #e6e6e6;
  padding: 10px;
  border-radius: 10px;
  display: inline-block;
}

.own-message {
  text-align: right;
}

.own-message .message-text {
  background-color: #dcf8c6;
}

.input-area {
  display: flex;
  padding: 20px;
  background-color: #f1f1f1;
}

input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.emoji-picker span {
  font-size: 24px;
  margin: 5px;
  cursor: pointer;
}
</style>
