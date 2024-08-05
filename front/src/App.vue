<template>
  <div id="app">
    <div class="chat-container">
      <div class="sidebar" :class="{ 'sidebar-open': showUserList }">
        <div class="sidebar-header">
          <h2>在线用户</h2>
          <button @click="toggleUserList" class="close-btn" v-if="isMobile">
            &times;
          </button>
        </div>
        <ul class="user-list">
          <li v-for="user in onlineUsers" :key="user">{{ user }}</li>
        </ul>
      </div>
      <div class="main-chat">
        <div class="chat-header">
          <h1>Vue 3 聊天室</h1>
          <button @click="toggleUserList" class="menu-btn" v-if="isMobile">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div class="messages" ref="messagesContainer">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', { 'own-message': msg.username === username }]"
          >
            <div class="message-content">
              <span class="username">{{ msg.username }}</span>
              <p>{{ msg.text }}</p>
              <span class="time">{{ formatTime(msg.time) }}</span>
            </div>
          </div>
        </div>
        <div class="input-area">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="输入消息..."
          />
          <button @click="sendMessage" class="send-btn">发送</button>
          <button @click="openEmojiPicker" class="emoji-btn">😊</button>
        </div>
        <div v-if="showEmojiPicker" class="emoji-picker">
          <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">{{
            emoji
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, nextTick, computed } from 'vue'
import io from 'socket.io-client'

export default {
  name: 'App',
  setup() {
    const socket = io('http://154.64.255.87:3000')
    const messages = ref([])
    const newMessage = ref('')
    const username = ref('用户' + Math.floor(Math.random() * 1000))
    const messagesContainer = ref(null)
    const onlineUsers = ref([])
    const showEmojiPicker = ref(false)
    const emojis = ['😊', '😂', '🤔', '👍', '❤️', '🎉', '🌟', '🍕', '🐱', '🌈']

    const isMobile = computed(() => window.innerWidth <= 768)
    const showUserList = ref(false)

    onMounted(() => {
      socket.emit('join', username.value)

      socket.on('chat message', (msg) => {
        messages.value.push(msg)
        scrollToBottom()
      })

      socket.on('user joined', (users) => {
        onlineUsers.value = users
      })

      socket.on('user left', (users) => {
        onlineUsers.value = users
      })

      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth <= 768
      })
    })

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        const msg = {
          username: username.value,
          text: newMessage.value,
          time: new Date(),
        }
        socket.emit('chat message', msg)
        newMessage.value = ''
      }
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight
        }
      })
    }

    const formatTime = (time) => {
      return new Date(time).toLocaleTimeString()
    }

    const formatMessage = (text) => {
      return text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
      )
    }

    const openEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
    }

    const addEmoji = (emoji) => {
      newMessage.value += emoji
      showEmojiPicker.value = false
    }

    const toggleUserList = () => {
      showUserList.value = !showUserList.value
    }

    return {
      messages,
      newMessage,
      username,
      onlineUsers,
      messagesContainer,
      showEmojiPicker,
      emojis,
      isMobile,
      showUserList,
      sendMessage,
      formatTime,
      formatMessage,
      openEmojiPicker,
      addEmoji,
      toggleUserList,
    }
  },
}
</script>
<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.chat-container {
  display: flex;
  height: 100%;
  background-color: #f5f5f5;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.user-list {
  list-style-type: none;
  padding: 0 20px;
}

.user-list li {
  padding: 10px 0;
  border-bottom: 1px solid #34495e;
}

.main-chat {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h1 {
  margin: 0;
  font-size: 24px;
}

.menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-btn span {
  width: 30px;
  height: 3px;
  background: white;
}

.messages {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin-bottom: 20px;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 70%;
  background-color: #e0e0e0;
}

.own-message .message-content {
  background-color: #3498db;
  color: white;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.time {
  font-size: 0.8em;
  color: #7f8c8d;
}

.input-area {
  display: flex;
  padding: 20px;
  background-color: white;
}

input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px;
}

.send-btn,
.emoji-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.emoji-btn {
  background-color: #f1c40f;
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  background-color: white;
  border-top: 1px solid #ddd;
}

.emoji-picker span {
  font-size: 24px;
  margin: 5px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: -250px;
    height: 100%;
    transition: 0.3s;
    z-index: 1000;
  }

  .sidebar-open {
    left: 0;
  }

  .menu-btn {
    display: flex;
  }
}
</style>
