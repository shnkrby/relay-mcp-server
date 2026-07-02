# relay-mcp-server

A stateful streamable HTTP MCP server built with FastMCP.

## About

This project was created with [@agentailor/create-mcp-server](https://www.npmjs.com/package/@agentailor/create-mcp-server) using [FastMCP](https://github.com/punkpeye/fastmcp).

## Getting Started

```bash
# Install dependencies
npm install

# Build and run in development
npm run dev

# Or build and start separately
npm run build
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Testing with MCP Inspector

This project includes [MCP Inspector](https://github.com/modelcontextprotocol/inspector) as a dev dependency for testing and debugging.

First, start the server in one terminal:

```bash
npm run dev
```

Then, in another terminal, launch the inspector:

```bash
npm run inspect
```

## API Endpoints

- **POST /mcp** - Main MCP endpoint for JSON-RPC messages
- **GET /health** - Health check endpoint (returns 200 OK)

## Included Examples

This server comes with example implementations to help you get started:

### Prompts

- **greeting-template** - A simple greeting prompt that takes a name parameter

### Tools

- **start-notification-stream** - Sends periodic notifications for testing. Parameters:
  - `interval`: Milliseconds between notifications (default: 100)
  - `count`: Number of notifications to send (default: 10, use 0 for unlimited)

### Resources

- **greeting-resource** - A simple text resource at `https://example.com/greetings/default`

## Project Structure

```
relay-mcp-server/
├── src/
│   ├── server.ts     # FastMCP server definition (tools, prompts, resources)
│   └── index.ts      # Server startup configuration
├── Dockerfile        # Multi-stage Docker build
├── package.json
├── tsconfig.json
└── README.md
```

## Deployment

### Docker

Build and run the Docker container:

```bash
docker build -t relay-mcp-server .
docker run -p 3000:3000 relay-mcp-server
```
## Customization

- Add new tools, prompts, and resources in `src/server.ts`
- Modify transport configuration in `src/index.ts`

## Learn More

- [FastMCP](https://github.com/punkpeye/fastmcp) - The framework powering this server
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
