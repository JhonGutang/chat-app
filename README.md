# chat-app
a sample project to apply what i learned about websocket, this only contains client to server connection ( no database )

WebSockets provide persistent, bidirectional communication over a single TCP connection. Unlike HTTP, which is request-response and closes the connection after each response, WebSockets allow the client and server to continuously send messages in real time.

Process:
1. Handshake: Client sends an HTTP request with Upgrade: websocket. Server responds with 101 Switching Protocols, and both switch to the WebSocket protocol over the same TCP connection.
2. Protocol agreement: Client and server confirm subprotocols, headers, and message framing rules.
3. Persistent communication: Messages are sent in frames. Both client and server can send messages simultaneously. Ping/pong frames keep the connection alive.
4. Closing: Either side can initiate a Close frame to gracefully terminate the connection.

Example: In a chat app, User A sends a message to the server via WebSocket. The server validates the message, then sends a WebSocket message frame to User B instantly, enabling real-time conversation.
