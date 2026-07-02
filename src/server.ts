import { FastMCP } from 'fastmcp';
import { z } from 'zod';

const API_URL = process.env.RELAY_API_URL || "http://localhost:3000/api/mcp";
const AUTH_TOKEN = process.env.RELAY_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error("RELAY_AUTH_TOKEN is missing in environment variables.");
  process.exit(1);
}

const server = new FastMCP({
  name: 'relay-mcp-server',
  version: '1.0.0',
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

server.addTool({
  name: "get_org_context",
  description: "Fetch the organizations the authenticated user belongs to, including their roles and permissions.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const data = await fetchFromRelay("/orgs");
      return JSON.stringify(data.data || data, null, 2);
    } catch (error: any) {
      return `Error fetching orgs: ${error.message}`;
    }
  }
});

server.addTool({
  name: "analyze_task_performance",
  description: "Fetch all tasks for a specific organization. Useful for identifying who is not completing tasks, who is falling behind, or generating performance summaries.",
  parameters: z.object({
    orgSlug: z.string().describe("The slug of the organization to fetch tasks for"),
  }),
  execute: async ({ orgSlug }) => {
    try {
      const data = await fetchFromRelay(`/orgs/${orgSlug}/tasks`);
      return `
      Here is the raw task data for the organization '${orgSlug}'. 
      Analyze this data to identify performance bottlenecks. 
      Specifically look for:
      1. Overdue tasks (due_date in the past and status is not 'completed').
      2. Individuals (assignees) who have a high number of pending or overdue tasks.
      3. A general summary of completion rates.
      
      Raw Data:
      ${JSON.stringify(data.data || data, null, 2)}
      `;
    } catch (error: any) {
      return `Error fetching tasks: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_members_and_tasks",
  description: "Fetch members (including their executive titles/roles) and their assigned tasks.",
  parameters: z.object({
    orgSlug: z.string().describe("The slug of the organization"),
  }),
  execute: async ({ orgSlug }) => {
    try {
      const data = await fetchFromRelay(`/orgs/${orgSlug}/members_tasks`);
      return JSON.stringify(data.data || data, null, 2);
    } catch (error: any) {
      return `Error fetching members and tasks: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_all_tasks",
  description: "Fetch all task information, showing the baton pass state across the organization.",
  parameters: z.object({
    orgSlug: z.string().describe("The slug of the organization"),
  }),
  execute: async ({ orgSlug }) => {
    try {
      const data = await fetchFromRelay(`/orgs/${orgSlug}/tasks`);
      return JSON.stringify(data.data || data, null, 2);
    } catch (error: any) {
      return `Error fetching tasks: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_all_duties",
  description: "Fetch all duties (The Command Chain) and their associated committees.",
  parameters: z.object({
    orgSlug: z.string().describe("The slug of the organization"),
  }),
  execute: async ({ orgSlug }) => {
    try {
      const data = await fetchFromRelay(`/orgs/${orgSlug}/duties`);
      return JSON.stringify(data.data || data, null, 2);
    } catch (error: any) {
      return `Error fetching duties: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_all_events",
  description: "Fetch all high-level events information (status, start/end dates).",
  parameters: z.object({
    orgSlug: z.string().describe("The slug of the organization"),
  }),
  execute: async ({ orgSlug }) => {
    try {
      const data = await fetchFromRelay(`/orgs/${orgSlug}/events`);
      return JSON.stringify(data.data || data, null, 2);
    } catch (error: any) {
      return `Error fetching events: ${error.message}`;
    }
  }
});

export { server };
