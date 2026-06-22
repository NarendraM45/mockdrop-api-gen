import type { Endpoint } from "./store";
import { endpointUrl } from "./store";

export type OS = "windows" | "macos" | "linux";

export type SnippetLang =
  | "curl"
  | "powershell"
  | "wget"
  | "fetch"
  | "axios"
  | "node";

export type Snippet = { display: string; copy: string };

export const ALL_LANGS: { id: SnippetLang; name: string; os: OS[] | "all" }[] = [
  { id: "curl", name: "cURL", os: "all" },
  { id: "powershell", name: "PowerShell", os: ["windows"] },
  { id: "wget", name: "wget", os: ["macos", "linux"] },
  { id: "fetch", name: "fetch", os: "all" },
  { id: "axios", name: "axios", os: "all" },
  { id: "node", name: "Node.js", os: "all" },
];

export function langsForOs(os: OS) {
  return ALL_LANGS.filter((l) => l.os === "all" || (l.os as OS[]).includes(os));
}

export function detectOs(): OS {
  if (typeof navigator === "undefined") return "linux";
  const ua = navigator.userAgent || navigator.platform || "";
  if (/Win/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  return "linux";
}

function safeParseBody(payload: string, method: string): string | null {
  if (method === "GET" || method === "DELETE") return null;
  try {
    return JSON.stringify(JSON.parse(payload));
  } catch {
    return null;
  }
}

/**
 * Returns { display, copy }.
 *  - display: pretty multi-line, for the code block
 *  - copy:    single-line, safe to paste directly into a terminal (no \n, no \ continuations)
 */
export function buildSnippet(e: Endpoint, lang: SnippetLang, os: OS): Snippet {
  const url = endpointUrl(e.id);
  const method = e.method;
  const body = safeParseBody(e.payload, method);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";

  switch (lang) {
    case "curl": {
      if (os === "windows") {
        const headersInline = Object.entries(headers)
          .map(([k, v]) => `-H "${k}: ${v}"`)
          .join(" ");
        const headersBlock = Object.entries(headers)
          .map(([k, v]) => `-H "${k}: ${v}"`)
          .join(" \\\n  ");
        const bodyInline = body ? ` -d "${body.replace(/"/g, '\\"')}"` : "";
        const bodyBlock = body ? ` \\\n  -d "${body.replace(/"/g, '\\"')}"` : "";
        return {
          copy: `curl -X ${method} "${url}" ${headersInline}${bodyInline}`,
          display: `curl -X ${method} "${url}" \\\n  ${headersBlock}${bodyBlock}`,
        };
      }
      const headersInline = Object.entries(headers)
        .map(([k, v]) => `-H '${k}: ${v}'`)
        .join(" ");
      const headersBlock = Object.entries(headers)
        .map(([k, v]) => `-H '${k}: ${v}'`)
        .join(" \\\n  ");
      const bodyInline = body ? ` -d '${body}'` : "";
      const bodyBlock = body ? ` \\\n  -d '${body}'` : "";
      return {
        copy: `curl -X ${method} '${url}' ${headersInline}${bodyInline}`,
        display: `curl -X ${method} '${url}' \\\n  ${headersBlock}${bodyBlock}`,
      };
    }

    case "powershell": {
      const hdr = Object.entries(headers)
        .map(([k, v]) => `"${k}"="${v}"`)
        .join(";");
      const hdrBlock = Object.entries(headers)
        .map(([k, v]) => `    "${k}" = "${v}"`)
        .join("\n");
      const bodyInline = body
        ? ` -Body '${body}' -ContentType 'application/json'`
        : "";
      const bodyBlock = body
        ? ` \`\n  -Body '${body}' \`\n  -ContentType 'application/json'`
        : "";
      return {
        copy: `Invoke-RestMethod -Uri "${url}" -Method ${method} -Headers @{${hdr}}${bodyInline}`,
        display: `$response = Invoke-RestMethod \`\n  -Uri "${url}" \`\n  -Method ${method} \`\n  -Headers @{\n${hdrBlock}\n  }${bodyBlock}\n$response | ConvertTo-Json`,
      };
    }

    case "wget": {
      const hdrInline = Object.entries(headers)
        .map(([k, v]) => `--header="${k}: ${v}"`)
        .join(" ");
      const hdrBlock = Object.entries(headers)
        .map(([k, v]) => `--header="${k}: ${v}"`)
        .join(" \\\n  ");
      const bodyInline = body ? ` --body-data='${body}'` : "";
      const bodyBlock = body ? ` \\\n  --body-data='${body}'` : "";
      return {
        copy: `wget -qO- --method=${method} "${url}" ${hdrInline}${bodyInline}`,
        display: `wget -qO- \\\n  --method=${method} \\\n  "${url}" \\\n  ${hdrBlock}${bodyBlock}`,
      };
    }

    case "fetch": {
      const opts = `{ method: '${method}', headers: ${JSON.stringify(headers)}${body ? `, body: JSON.stringify(${body})` : ""} }`;
      const optsPretty = `{\n  method: '${method}',\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}${body ? `,\n  body: JSON.stringify(${body})` : ""}\n}`;
      return {
        copy: `fetch('${url}', ${opts}).then(r => r.json()).then(console.log).catch(console.error)`,
        display: `fetch('${url}', ${optsPretty})\n  .then(r => r.json())\n  .then(console.log)\n  .catch(console.error)`,
      };
    }

    case "axios": {
      const cfg = `{ method: '${method.toLowerCase()}', url: '${url}', headers: ${JSON.stringify(headers)}${body ? `, data: ${body}` : ""} }`;
      const cfgPretty = `{\n  method: '${method.toLowerCase()}',\n  url: '${url}',\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}${body ? `,\n  data: ${body}` : ""}\n}`;
      return {
        copy: `axios(${cfg}).then(r => console.log(r.data)).catch(console.error)`,
        display: `import axios from 'axios';\n\naxios(${cfgPretty})\n  .then(r => console.log(r.data))\n  .catch(console.error)`,
      };
    }

    case "node": {
      const hdr = JSON.stringify(headers);
      const hdrPretty = JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ");
      return {
        copy: `const https=require('https');const req=https.request('${url}',{method:'${method}',headers:${hdr}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>console.log(JSON.parse(d)));});req.on('error',console.error);${body ? `req.write('${body}');` : ""}req.end();`,
        display: `const https = require('https');\n\nconst req = https.request(\n  '${url}',\n  { method: '${method}', headers: ${hdrPretty} },\n  res => {\n    let data = '';\n    res.on('data', c => data += c);\n    res.on('end', () => console.log(JSON.parse(data)));\n  }\n);\nreq.on('error', console.error);\n${body ? `req.write('${body}');\n` : ""}req.end();`,
      };
    }
  }
}

// Back-compat for any callers expecting the old signature
export const SNIPPET_LANGS = ALL_LANGS;
