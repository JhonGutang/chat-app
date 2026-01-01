<script setup lang="ts">
import { ref } from 'vue';
import { useWebSocket, ServerMessage } from '../composables/useWebSockets';

const { messages, send, username } = useWebSocket('ws://localhost:8000');

const messageInput = ref('');

const sendMessage = () => {
        if (!messageInput.value.trim()) return;

        send({
                type: 'public_message',
                message: messageInput.value.trim(),
        });

        messageInput.value = '';
};
</script>

<template>
        <div class="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold mb-4">Public Chat</h2>

                <div class="h-64 overflow-y-auto mb-4 bg-gray-50 p-3 rounded">
                        <ul class="space-y-3">
                                <li v-for="(msg, i) in messages" :key="i" class="flex flex-col">
                                        <div v-if="msg.type === 'public_message'" class="flex items-baseline space-x-2">
                                                <span class="text-xs font-semibold text-indigo-600">[Public]</span>
                                                <span class="text-sm font-medium text-gray-800">{{ msg.from }}:</span>
                                                <span class="text-sm text-gray-700">{{ msg.message }}</span>
                                        </div>
                                        <div v-else-if="msg.type === 'error'" class="text-sm text-red-600">
                                                [Error] {{ msg.message }}
                                        </div>
                                </li>
                        </ul>
                </div>

                <div class="flex gap-2">
                        <input
                                v-model="messageInput"
                                @keyup.enter="sendMessage"
                                placeholder="Type a message"
                                class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                                @click="sendMessage"
                                class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                                Send
                        </button>
                </div>
        </div>
</template>
