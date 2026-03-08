# KB Bot

Slack Socket Mode bot for knowledge-base intake, rule drafting, and review workflow.

## Environment variables

- **Slack:** `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`
- **Channels:** `KB_ASK_CHANNEL_ID`, `KB_INTAKE_CHANNEL_ID`, `KB_REVIEW_CHANNEL_ID`, `KB_ALLOWED_CHANNEL_IDS`, `KB_STRUCTURED_INTAKE_CHANNEL_ID` (optional; JSON-only intake for ChatGPT-processed rule proposals)
- **LLM providers and budget:**
  - `DRAFTER_PROVIDER` — Provider for rule drafting from evidence (default: `none`)
  - `ASK_PROVIDER` — Provider for answering user questions (default: `none`)
  - `EXTRACTOR_PROVIDER` — Provider for vision/file extraction (default: `none`)
  - `MAX_DAILY_LLM_CALLS` — Daily cap for LLM calls (default: `20`)
  - `MAX_TOKENS_PER_CALL` — Hard ceiling for tokens per call; context is truncated above this (default: `800`)
  - `KILL_SWITCH` — Set to `true` to disable all LLM usage
- **Gemini (when DRAFTER_PROVIDER or ASK_PROVIDER is `gemini`):**
  - `GEMINI_API_KEY` — Required for Gemini API (or `GOOGLE_API_KEY`)
  - `GEMINI_MODEL` — Model name (default: `gemini-1.5-flash`). If omitted, the default is used and prefixed as `models/gemini-1.5-flash`. The default model works with the default v1beta endpoint.
  - `GEMINI_ENDPOINT` — Optional; default is `https://generativelanguage.googleapis.com/v1beta` so that the default model `gemini-1.5-flash` works. For a stable v1 endpoint, set `GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1` and use a model that supports v1 (e.g. see [API models list](https://ai.google.dev/api/models)); `gemini-1.5-flash` is not available on v1.
- **Azure OpenAI (optional; stub when disabled):**
  - `AZURE_OPENAI_ENDPOINT` — e.g. `https://<resource>.openai.azure.com`
  - `AZURE_OPENAI_API_KEY` — API key for the resource
  - `AZURE_OPENAI_DEPLOYMENT` — Deployment name (e.g. `gpt-4o`)
  - `AZURE_OPENAI_API_VERSION` — e.g. `2024-02-15-preview`
  - `AZURE_OPENAI_ENABLED` — Must be `true` to allow calls (default: `false`)
  - Recommended safe defaults when not using Azure: `ASK_PROVIDER=none`, `DRAFTER_PROVIDER=none`, `AZURE_OPENAI_ENABLED=false`, `MAX_DAILY_LLM_CALLS=5`
- **Other:** `DRY_RUN`, `LLM_PROVIDER`, `KB_DATA_DIR`, `DATA_DIR`, `REQUESTS_CA_BUNDLE`

Do not commit secrets; use `.env` and ensure `.env` and `/data` are gitignored.
# cash-mode
