# Template Generate AI Endpoint

This document describes the backend endpoint that should be implemented to support the "Generate with AI" feature in ComposeMessage.

## Endpoint

`POST /api/templates/generate-ai`

## Request Body

```json
{
  "subject": "Optional subject line",
  "body": "Optional existing template body (will be used as context)",
  "templateId": "Optional template ID"
}
```

## Response Format (KEY - Matches Template Model!)

The response **MUST** match the template model structure:

```json
{
  "subject": "Email subject line",
  "body": "Email body content with {{variables}} like {{firstName}}, {{lastName}}, etc."
}
```

### Required Fields:
- **`subject`** (string): Email subject line
- **`body`** (string): Email body content that should contain variables like `{{firstName}}`, `{{lastName}}`, `{{companyName}}`, etc.

### Key Points:
- **NO `success` field** - Just return the template structure directly
- **Matches the template model** - Same structure as what gets saved to the database
- **`body` should contain variables** - Use `{{variableName}}` format for personalization (e.g., `{{firstName}}`, `{{lastName}}`, `{{companyName}}`)
- Don't hardcode the content - let the AI generate appropriate content based on the context

### Frontend Handling:
The frontend directly uses:
- `response.data.subject` → updates the subject field
- `response.data.body` → updates the body textarea

## Implementation Guide

The endpoint should:
1. Use OpenAI to generate template content
2. Ensure generated content uses variables like `{{firstName}}`, `{{lastName}}`, `{{companyName}}`, etc.
3. Use the existing template body as context if provided
4. Generate warm, human, low-pressure outreach content

## Example OpenAI Prompt

```
You are a Business Development Relationship Manager. Create a warm, human, low-pressure outreach EMAIL TEMPLATE with DYNAMIC VARIABLES.

=== EXISTING TEMPLATE (if provided) ===
{body}

=== YOUR TASK ===
Create or enhance an email template using VARIABLE TAGS for personalization.

Return ONLY valid JSON in this format:
{
  "content": "The email template with {{variableName}} tags",
  "suggestedVariables": ["firstName", "companyName", etc.]
}

=== VARIABLE TAG FORMAT ===
Use {{variableName}} ONLY for contact-specific data:
- {{firstName}} - Contact's first name
- {{lastName}} - Contact's last name  
- {{companyName}} - Their current company
- {{title}} - Their job title

=== REQUIREMENTS ===
1. **Contact Variables Only**: ONLY use {{variableName}} for firstName, lastName, companyName, title
2. **Human & Natural**: Write like a real person, not a sales bot
3. **Low Pressure**: Always include a release valve that removes pressure
4. **No Sales Language**: No CTAs, no calendar links, no "let's hop on a call"
5. **Greeting**: Always start with "Hi {{firstName}}," or similar
6. **Company Context**: Use {{companyName}} when relevant

=== EXAMPLE OUTPUT ===
{
  "content": "Hi {{firstName}},\\n\\nHope you're doing well! Been thinking about you and wanted to reach out.\\n\\nWould love to catch up if you're open to it — maybe grab coffee or lunch?\\n\\nNo pressure at all, just thought it'd be nice to reconnect.\\n\\nLet me know if you're interested!\\n\\nCheers,\\n[Your name]",
  "suggestedVariables": ["firstName"]
}

Return ONLY the JSON object, no markdown, no code blocks, no explanation.
```

