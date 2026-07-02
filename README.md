# 🛰️ Relay MCP Server

This is the official Model Context Protocol (MCP) Server for the **Relay** organization task management system.

It allows AI Assistants (like Claude Desktop, Cursor, and Windsurf) to securely access live context from your Relay organizations. It fetches data directly from your deployed Relay Next.js backend, meaning your AI always has real-time awareness of your team's tasks, duties, events, and members.

## 🛠️ Setup Instructions

To use this MCP server, it must run locally on your machine alongside your AI assistant using `stdio` transport. *(Note: Even though your main Relay App is hosted on Vercel, MCP Servers that use standard Input/Output for communication must be run on the same computer as your AI).*

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root of this project and add your credentials:
   ```env
   # The URL of your live Relay Next.js App
   RELAY_API_URL=https://relay-seven-lime.vercel.app/api/mcp
   
   # Your Supabase Access Token (obtainable from Developer Settings in the Relay Web App)
   RELAY_AUTH_TOKEN=your_token_here
   ```

3. **Build the Server:**
   ```bash
   npm run build
   ```

4. **Test the Tools:**
   You can easily test if the MCP server is working by using the official MCP Inspector:
   ```bash
   npm run inspect
   ```

---

## 🔌 Integration Guide

Because this server communicates over `stdio`, you integrate it by telling your AI Assistant to run the local `node` process.

### For Claude Desktop

1. Open your Claude Desktop configuration file:
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the `relay-mcp-server` to the `mcpServers` object, pointing to the absolute path of this repository on your computer:

```json
{
  "mcpServers": {
    "relay": {
      "command": "node",
      "args": [
        "C:/Absolute/Path/To/Your/relay-mcp-server/dist/index.js"
      ]
    }
  }
}
```

3. Restart Claude Desktop. You will now see the Relay tools available (indicated by a small hammer/wrench icon) when chatting with Claude!

### For Cursor

1. Open Cursor Settings and go to **Features > MCP Servers**.
2. Click **+ Add new MCP server**.
3. Name it `Relay`.
4. Set the Type to `command`.
5. Set the Command to: `node C:/Absolute/Path/To/Your/relay-mcp-server/dist/index.js` (update with your actual path).
6. Click Save. Cursor will now automatically use the Relay tools to help you write code or analyze your organization!

## 🧰 Available Tools

The AI assistant will have access to the following tools automatically across all organizations you have joined:
- `get_org_context`: Fetches the basic info and your roles for all orgs.
- `get_all_tasks`: Fetches all tasks.
- `get_all_events`: Fetches timelines and event statuses.
- `get_all_duties`: Fetches the command chain and committees.
- `get_members_and_tasks`: Fetches the members and dynamically maps assigned tasks to each specific member.
- `analyze_task_performance`: Automatically analyzes the raw task data and returns insights into bottlenecks and overdue tasks.
