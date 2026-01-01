<template>
  <div class="flex max-w-4xl mx-auto mt-5 border border-gray-300 rounded">
    <!-- Sidebar -->
    <div class="w-1/4 border-r border-gray-300 p-3">
      <h3 class="font-bold mb-2">Online Users</h3>
      <ul>
        <li
          v-for="user in onlineUsers"
          :key="user"
          :class="['p-2 rounded cursor-pointer', user === privateRecipient ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100']"
          @click="privateRecipient = user"
        >
          {{ user }}
        </li>
      </ul>
    </div>

    <!-- Chat Area -->
    <div class="flex-1 flex flex-col p-3 h-[520px]">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
              {{ privateRecipient ? privateRecipient.charAt(0).toUpperCase() : '?' }}
            </div>
            <div>
              <div class="text-lg font-semibold">{{ privateRecipient || 'Select a user' }}</div>
              <div class="text-xs text-gray-500">Private chat</div>
            </div>
          </div>
          <div class="text-sm text-gray-500">{{ privateRecipient ? 'Online' : '' }}</div>
        </div>

        <!-- Messages -->
        <ul class="flex-1 overflow-y-auto p-3 space-y-3" ref="messagesList">
          <li v-for="(msg, i) in filteredMessages" :key="i" :class="['flex', msg.from === username.value ? 'justify-end' : 'justify-start']">
            <!-- Received message (left) -->
            <div v-if="msg.from !== username.value" class="flex items-start gap-3">
              <div class="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">{{ getInitials(msg.from) }}</div>
              <div>
                <div class="bg-gray-100 text-gray-900 rounded-2xl px-4 py-2 max-w-[70vw] break-words">
                  <span class="font-semibold mr-2">{{ msg.from }}:</span>{{ msg.message }}
                </div>
              </div>
            </div>

            <!-- Sent message (right) -->
            <div v-else class="flex items-end gap-3">
              <div class="max-w-[70vw]">
                <div class="bg-blue-500 text-white rounded-2xl px-4 py-2 break-words">
                  <span class="font-semibold mr-2">You:</span>{{ msg.message }}
                </div>
                <div class="text-xs text-gray-300 mt-1 text-right">to {{ msg.to }}</div>
              </div>
              <div class="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">You</div>
            </div>
          </li>
        </ul>

        <!-- Input -->
        <div class="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
          <input
            v-model="privateMessage"
            @keyup.enter="sendPrivateMessage"
            placeholder="Type a message..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none"
            :disabled="!privateRecipient"
          />
          <button
            @click="sendPrivateMessage"
            class="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
            :disabled="!privateRecipient || !privateMessage.trim()"
          >
            Send
          </button>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useWebSocket } from '../composables/useWebSockets';

const { messages, onlineUsers, send, username } = useWebSocket('ws://localhost:8000');

const privateRecipient = ref('');
const privateMessage = ref('');
const messagesList = ref<HTMLElement | null>(null);

const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
};



// --- Filter messages only for current chat ---
const filteredMessages = computed(() =>
  messages.value.filter(msg => {
    if (msg.type !== 'private_message') return false;
    return (
      (msg.from === username.value && msg.to === privateRecipient.value) ||
      (msg.from === privateRecipient.value && msg.to === username.value)
    );
  })
);

// --- Send private message ---
const sendPrivateMessage = () => {
  if (!privateRecipient.value || !privateMessage.value.trim()) return;

  console.log(messages.value)

  send({
    type: 'private_message',
    to: privateRecipient.value,
    message: privateMessage.value.trim(),
  });

  privateMessage.value = '';
};

// --- Auto scroll to bottom ---
const scrollToBottom = () => {
  if (messagesList.value) {
    messagesList.value.scrollTop = messagesList.value.scrollHeight;
  }
};

// Scroll whenever filteredMessages changes
onMounted(() => {
  watch(filteredMessages, () => nextTick(scrollToBottom));
});
</script>

<style scoped>
ul {
  scrollbar-width: thin;
}
</style>
