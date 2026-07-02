import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DOTENV_QUIET = "true";
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.RELAY_API_URL || "http://localhost:3000/api/mcp";
const AUTH_TOKEN = process.env.RELAY_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error("RELAY_AUTH_TOKEN is missing in environment variables.");
  process.exit(1);
}

export const server = new FastMCP({
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
  description: "Fetch all tasks across all your organizations to identify who is not completing tasks, who is falling behind, or generate performance summaries.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const orgsResp = await fetchFromRelay("/orgs");
      const orgs = orgsResp.data || orgsResp;
      if (!orgs || orgs.length === 0) return "You are not a member of any organizations.";

      const allResults = [];
      for (const org of orgs) {
        const data = await fetchFromRelay(`/orgs/${org.slug}/tasks`);
        allResults.push({ organization: org.name, slug: org.slug, tasks: data.data || data });
      }

      return `
      Here is the raw task data across all your organizations:
      ${JSON.stringify(allResults, null, 2)}
      
      Analyze this data to identify performance bottlenecks. 
      List members with overdue tasks and highlight committees that are falling behind.
      `;
    } catch (error: any) {
      return `Error analyzing task performance: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_members_and_tasks",
  description: "Fetch members (including their executive titles/roles) and their assigned tasks across all organizations.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const orgsResp = await fetchFromRelay("/orgs");
      const orgs = orgsResp.data || orgsResp;
      if (!orgs || orgs.length === 0) return "You are not a member of any organizations.";

      const allResults = [];
      for (const org of orgs) {
        const data = await fetchFromRelay(`/orgs/${org.slug}/members_tasks`);
        allResults.push({ organization: org.name, slug: org.slug, members: data.data || data });
      }
      return JSON.stringify(allResults, null, 2);
    } catch (error: any) {
      return `Error fetching members and tasks: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_all_tasks",
  description: "Fetch all task information across all organizations.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const orgsResp = await fetchFromRelay("/orgs");
      const orgs = orgsResp.data || orgsResp;
      if (!orgs || orgs.length === 0) return "You are not a member of any organizations.";

      const allResults = [];
      for (const org of orgs) {
        const data = await fetchFromRelay(`/orgs/${org.slug}/tasks`);
        allResults.push({ organization: org.name, slug: org.slug, tasks: data.data || data });
      }
      return JSON.stringify(allResults, null, 2);
    } catch (error: any) {
      return `Error fetching tasks: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_all_duties",
  description: "Fetch all duties (The Command Chain) and their associated committees across all organizations.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const orgsResp = await fetchFromRelay("/orgs");
      const orgs = orgsResp.data || orgsResp;
      if (!orgs || orgs.length === 0) return "You are not a member of any organizations.";

      const allResults = [];
      for (const org of orgs) {
        const data = await fetchFromRelay(`/orgs/${org.slug}/duties`);
        allResults.push({ organization: org.name, slug: org.slug, duties: data.data || data });
      }
      return JSON.stringify(allResults, null, 2);
    } catch (error: any) {
      return `Error fetching duties: ${error.message}`;
    }
  }
});

server.addTool({
  name: "get_all_events",
  description: "Fetch all high-level events information (status, start/end dates) across all organizations.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const orgsResp = await fetchFromRelay("/orgs");
      const orgs = orgsResp.data || orgsResp;
      if (!orgs || orgs.length === 0) return "You are not a member of any organizations.";

      const allResults = [];
      for (const org of orgs) {
        const data = await fetchFromRelay(`/orgs/${org.slug}/events`);
        allResults.push({ organization: org.name, slug: org.slug, events: data.data || data });
      }
      return JSON.stringify(allResults, null, 2);
    } catch (error: any) {
      return `Error fetching events: ${error.message}`;
    }
  }
});

