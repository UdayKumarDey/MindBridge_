# GPT-5 mini Connection Flow

MindBridge calls GPT-5 mini only from the server. The browser never receives the model credential or calls the model endpoint directly.

```text
Chat page
  → protected tRPC mutation: wellbeing.chat.send
  → createCompanionReply(user ID, message, risk flag)
  → retrieve recent conversations and check-ins
  → choose a response mode and build the message list
  → invokeLLM({ model: "gpt-5-mini", ... })
  → Forge Chat Completions API
  → validate response and save user + companion messages
  → return reply to the chat page
```

## Browser-to-server call

`client/src/pages/Chat.tsx` uses the typed mutation `trpc.wellbeing.chat.send.useMutation()`. When a signed-in user sends text, it submits `{ message }` to the protected `wellbeing.chat.send` procedure. On success, the page refreshes chat history and dashboard data.

## Companion request construction

In `server/routers.ts`, the protected mutation first checks whether the message needs immediate support. Non-crisis messages enter `createCompanionReply`, which loads the 16 most recent conversation messages and three most recent check-ins for the current user. It selects one of four response modes—reflection, grounding, planning, or exploration—and builds a message list containing the system guidance, current mode instruction, summarized check-ins, recent conversation history, and the new user message.

The request configuration is:

| Setting | Value |
|---|---|
| Model | `gpt-5-mini` |
| Output allowance | `maxCompletionTokens: 460` |
| Reasoning | `{ effort: "low" }` |
| History included | Up to 16 conversation messages |
| Check-ins included | Up to 3 recent entries |

## Secure model request

`server/_core/llm.ts` maps `maxCompletionTokens` to `max_completion_tokens` and sends a POST request to `${BUILT_IN_FORGE_API_URL}/v1/chat/completions`. The `Authorization` header is created from `BUILT_IN_FORGE_API_KEY`, both of which are read only from server environment variables via `server/_core/env.ts`. The browser bundle does not receive this key.

## Safety, validation, and storage

Messages that indicate immediate risk skip the model request and return India-specific emergency guidance. For standard responses, MindBridge extracts either string or text-array model content, rejects replies shorter than 24 characters, limits accepted output to 1,200 characters, and uses a contextual fallback if the model is unavailable. Finally, it saves both the user’s message and the companion response in the `conversations` table; the response is flagged when it is safety guidance.

## Relevant source files

| File | Responsibility |
|---|---|
| `client/src/pages/Chat.tsx` | Chat UI and tRPC mutation |
| `server/routers.ts` | Authenticated procedure, safety, context, model settings, persistence |
| `server/_core/llm.ts` | Authenticated request helper and response typing |
| `server/_core/env.ts` | Server-side environment-variable mapping |
| `server/db.ts` | Conversation and check-in retrieval plus message storage |
