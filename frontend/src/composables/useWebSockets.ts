// composables/useWebSocket.ts
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { Ref } from 'vue';

export type ServerMessage =
  | { type: 'public_message'; from: string; message: string }
  | { type: 'private_message'; from: string; to: string; message: string }
  | { type: 'users'; users: string[] }
  | { type: 'error'; message: string };

export type ClientMessage =
  | { type: 'register'; username: string }
  | { type: 'public_message'; message: string }
  | { type: 'private_message'; to: string; message: string };

export function useWebSocket(url: string, usernamePrompt = true) {
  const ws = ref<WebSocket | null>(null);

  // All messages received (public + private)
  const messages: Ref<ServerMessage[]> = ref([]);

  // Online users (reactive)
  const onlineUsers = ref<string[]>([]);

  // Connection status
  const connected = ref(false);

  // Current user's username
  const username = ref('');

  // --- Auto-scroll helper (optional, can be used in component) ---
  const scrollToBottom = (el: HTMLElement | null) => {
    if (el) el.scrollTop = el.scrollHeight;
  };

  const connect = () => {
    ws.value = new WebSocket(url);

    ws.value.onopen = () => {
      console.log('WebSocket connected');
      connected.value = true;

      // Prompt username
      if (usernamePrompt) {
        username.value = prompt('Enter your username') || `Guest${Date.now()}`;
        send({ type: 'register', username: username.value });
      }
    };

    ws.value.onmessage = async (event) => {
      let dataStr: string;

      if (event.data instanceof Blob) {
        dataStr = await event.data.text();
      } else {
        dataStr = event.data;
      }

      try {
        const data: ServerMessage = JSON.parse(dataStr);

        // Handle online users separately
        if (data.type === 'users') {
          // Exclude self from list
          onlineUsers.value = data.users.filter(u => u !== username.value);
        } else {
          // Push other messages into messages array
          messages.value.push(data);
        }

        nextTick(() => scrollToBottom(null)); // Optional: pass a ref if needed
      } catch (err) {
        console.error('Invalid message from server:', dataStr);
      }
    };

    ws.value.onclose = () => {
      console.log('WebSocket disconnected');
      connected.value = false;
    };
  };

  // --- Send a message (public or private) ---
  const send = (msg: ClientMessage) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
    ws.value.send(JSON.stringify(msg));
  };

  // --- Close connection ---
  const disconnect = () => {
    ws.value?.close();
  };

  onMounted(connect);
  onBeforeUnmount(disconnect);

  return {
    ws,
    messages,
    onlineUsers,
    connected,
    username,
    send,
    disconnect,
  };
}
