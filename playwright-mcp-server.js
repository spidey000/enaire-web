#!/usr/bin/env node

/**
 * Playwright MCP Server
 * Exposes Playwright capabilities via the Model Context Protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Global state
let browser;
let context;
let page;

const server = new Server(
  {
    name: "playwright-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function ensurePage() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
       viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
  }
  return page;
}

// Helper to ensure directory exists
const ensureDir = (filePath) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "navigate",
        description: "Navigates to a specified URL.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The URL to navigate to" }
          },
          required: ["url"]
        },
      },
      {
        name: "screenshot",
        description: "Takes a screenshot of the current page.",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to save the screenshot" },
            fullPage: { type: "boolean", description: "Whether to take a full page screenshot (default: true)" }
          },
          required: ["path"]
        },
      },
      {
        name: "click",
        description: "Clicks on an element matching the selector.",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS or XPath selector" }
          },
          required: ["selector"]
        },
      },
      {
        name: "fill",
        description: "Fills an input field matching the selector.",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS or XPath selector" },
            value: { type: "string", description: "Value to fill" }
          },
          required: ["selector", "value"]
        },
      },
      {
        name: "wait",
        description: "Waits for a specified amount of time.",
        inputSchema: {
          type: "object",
          properties: {
            ms: { type: "number", description: "Time to wait in milliseconds" }
          },
          required: ["ms"]
        },
      },
       {
        name: "get_content",
        description: "Gets the text content of the page.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const page = await ensurePage();
  
  try {
    switch (request.params.name) {
      case "navigate": {
        const { url } = request.params.arguments;
        await page.goto(url, { waitUntil: 'networkidle' });
        return {
          content: [{ type: "text", text: `Navigated to ${url}` }],
        };
      }

      case "screenshot": {
        const { path: screenshotPath, fullPage = true } = request.params.arguments;
        ensureDir(screenshotPath);
        await page.screenshot({ path: screenshotPath, fullPage });
        return {
          content: [{ type: "text", text: `Screenshot saved to ${screenshotPath}` }],
        };
      }

      case "click": {
        const { selector } = request.params.arguments;
        await page.click(selector);
        return {
          content: [{ type: "text", text: `Clicked ${selector}` }],
        };
      }

      case "fill": {
        const { selector, value } = request.params.arguments;
        await page.fill(selector, value);
        return {
          content: [{ type: "text", text: `Filled ${selector} with "${value}"` }],
        };
      }
      
      case "wait": {
        const { ms } = request.params.arguments;
        await page.waitForTimeout(ms);
        return {
          content: [{ type: "text", text: `Waited ${ms}ms` }],
        };
      }

      case "get_content": {
        // Return a simplified version of content or just body text to avoid huge payloads
        const content = await page.evaluate(() => document.body.innerText);
        return {
            content: [{ type: "text", text: content }]
        }
      }

      default:
        throw new Error("Unknown tool");
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Playwright MCP Server running on stdio");