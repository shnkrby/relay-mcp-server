# Relay MCP Server Guide

This guide explains how to create, test, and deploy a Model Context Protocol (MCP) server that connects your local or cloud-based AI agent (like `agy-cli`) directly to your Relay application.

## Prerequisites

1.  **Relay App Running:** Your Relay Next.js app should be running (e.g., `http://localhost:3000`) or deployed.
2.  **Supabase Access Token:** The MCP server authenticates as *you*. You need to get your Supabase Access Token (JWT).
    - Log into your Relay app in the browser.
    - Click on your Profile Avatar in the top right corner (or the Settings Cog icon).
    - Click **Developer Settings**.
    - Click the Copy button next to your Access Token.

## 1. Scaffold the MCP Server

We will use the `@agentailor/create-mcp-server` scaffolding tool to set up a TypeScript project quickly.

Run this in your terminal (outside the `relay-app` directory):
```bash
npx @agentailor/create-mcp-server@latest relay-mcp-server --typescript
cd relay-mcp-server
```

## 2. Configure Environment Variables

Create a `.env` file in the root of your new `relay-mcp-server` project:

```env
# The URL of your Relay API (local or production)
RELAY_API_URL=http://localhost:3000/api/mcp

# Your Supabase Access Token (JWT)
RELAY_AUTH_TOKEN=your_copied_access_token_here
```

## 3. Implement the Tools

Open `src/index.ts` in your new MCP server project and replace its contents with the following code. This code defines two tools: `get_org_context` and `analyze_task_performance`.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.RELAY_API_URL || "http://localhost:3000/api/mcp";
const AUTH_TOKEN = process.env.RELAY_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error("RELAY_AUTH_TOKEN is missing in environment variables.");
  process.exit(1);
}

const server = new McpServer({
  name: "Relay App MCP Server",
  version: "1.0.0",
});

// Helper function to fetch from Relay API
async function fetchFromRelay(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Relay API error (${response.status}): ${errorData?.error || response.statusText}`);
  }

  return response.json();
}

// Tool 1: Get Organization Context
server.tool(
  "get_org_context",
  "Fetch the organizations the authenticated user belongs to, including their roles and permissions.",
  {},
  async () => {
    try {
      const data = await fetchFromRelay("/orgs");
      return {
        content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error fetching orgs: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Tool 2: Analyze Task Performance
server.tool(
  "analyze_task_performance",
  "Fetch all tasks for a specific organization. Useful for identifying who is not completing tasks, who is falling behind, or generating performance summaries.",
  {
    orgSlug: z.string().describe("The slug of the organization to fetch tasks for"),
  },
  async ({ orgSlug }) => {
    try {
      const data = await fetchFromRelay(`/orgs/${orgSlug}/tasks`);
      
      const promptContext = `
      Here is the raw task data for the organization '${orgSlug}'. 
      Analyze this data to identify performance bottlenecks. 
      Specifically look for:
      1. Overdue tasks (due_date in the past and status is not 'completed').
      2. Individuals (assignees) who have a high number of pending or overdue tasks.
      3. A general summary of completion rates.
      
      Raw Data:
      ${JSON.stringify(data.data, null, 2)}
      `;

      return {
        content: [{ type: "text", text: promptContext }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error fetching tasks: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Relay MCP Server running on stdio");
}

run().catch(console.error);
```

## 4. Testing Locally with `agy-cli`

Build your MCP server:
```bash
npm run build
```

Configure `agy-cli` to use your local server. In your `agy-cli` configuration file (usually `~/.agy/config.json` or similar depending on the MCP client), add the server:

```json
{
  "mcpServers": {
    "relay": {
      "command": "node",
      "args": ["/absolute/path/to/relay-mcp-server/dist/index.js"],
      "env": {
        "RELAY_API_URL": "http://localhost:3000/api/mcp",
        "RELAY_AUTH_TOKEN": "your_copied_access_token_here"
      }
    }
  }
}
```

Now, when you talk to your AI assistant, you can ask: *"Can you summarize who is not doing their tasks well in the 'my-org' organization?"* and the assistant will use your Relay MCP server to fetch and analyze the data!

## 5. Deploying to Vercel

If you want your MCP Server to be available remotely (e.g., via SSE instead of local stdio), Vercel is a great option.

1.  **Update Transport:** Modify `src/index.ts` to use Vercel's Edge/Serverless functions and an SSE transport instead of `StdioServerTransport` (refer to the `@modelcontextprotocol/sdk` documentation for SSE setups).
2.  **vercel.json:** Create a `vercel.json` in your root:
    ```json
    {
      "version": 2,
      "builds": [
        { "src": "dist/index.js", "use": "@vercel/node" }
      ],
      "routes": [
        { "src": "/(.*)", "dest": "dist/index.js" }
      ]
    }
    ```
3.  **Environment Variables:** Add `RELAY_API_URL` (pointing to your production Relay Next.js app) and `RELAY_AUTH_TOKEN` in your Vercel project settings.
4.  **Deploy:** Run `vercel --prod` to deploy.
