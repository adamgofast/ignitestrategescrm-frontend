/**
 * Example Backend Endpoint: POST /api/templates/generate-ai
 * 
 * This is a reference implementation showing how to create the backend endpoint
 * for the "Generate with AI" feature in ComposeMessage.
 * 
 * Integrate this into your backend (Express, Next.js API route, etc.)
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

/**
 * POST /api/templates/generate-ai
 * 
 * Request body:
 * {
 *   subject: string (optional),
 *   body: string (optional - existing template content to use as context),
 *   templateId: string (optional)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   template: string (generated template with {{variables}}),
 *   subject: string (optional generated subject)
 * }
 */
async function generateTemplateWithAI(req, res) {
  try {
    const { subject, body, templateId } = req.body || {};
    
    // Build prompt - use existing body as context if provided
    const context = body || '';
    const prompt = `You are a Business Development Relationship Manager. Your task is to create a warm, human, low-pressure outreach EMAIL TEMPLATE with DYNAMIC VARIABLES.

${context ? `=== EXISTING TEMPLATE (enhance or use as context) ===\n${context}\n\n` : ''}=== YOUR TASK ===
Create ${context ? 'an enhanced version of the above template' : 'a new email template'} using VARIABLE TAGS for personalization.

Return ONLY valid JSON in this exact format:
{
  "content": "The email template with {{variableName}} tags",
  "suggestedVariables": ["firstName", "companyName", etc.]
}

=== VARIABLE TAG FORMAT ===
Use {{variableName}} ONLY for contact-specific data that will be filled in later from the database.

**CONTACT VARIABLES** (use {{tags}} - these will be filled later):
- {{firstName}} - Contact's first name
- {{lastName}} - Contact's last name  
- {{companyName}} - Their current company
- {{title}} - Their job title
- {{fullName}} - Full name (first + last)
- {{goesBy}} - Preferred name/nickname

=== REQUIREMENTS ===
1. **Contact Variables Only**: ONLY use {{variableName}} for firstName, lastName, companyName, title, fullName, goesBy
2. **Human & Natural**: Write like a real person, not a sales bot
3. **Low Pressure**: Always include a release valve that removes pressure
4. **No Sales Language**: No CTAs, no calendar links, no "let's hop on a call"
5. **Greeting**: Always start with "Hi {{firstName}}," or similar
6. **Company Context**: Use {{companyName}} when relevant
7. **Signature**: End with a plain name like "Joel" or "Cheers, Joel"

=== EXAMPLE OUTPUT ===
{
  "content": "Hi {{firstName}},\\n\\nHope you're doing well! Been thinking about you and wanted to reach out.\\n\\nWould love to catch up if you're open to it — maybe grab coffee or lunch?\\n\\nNo pressure at all, just thought it'd be nice to reconnect.\\n\\nLet me know if you're interested!\\n\\nCheers,\\nJoel",
  "suggestedVariables": ["firstName"]
}

IMPORTANT: Only use {{variables}} for contact-specific data. The template should be warm, personal, and low-pressure.

Return ONLY the JSON object, no markdown, no code blocks, no explanation.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates warm, human email templates with variable tags. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON from markdown if AI wrapped it
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate and ensure required fields
    if (!parsed.content || typeof parsed.content !== 'string') {
      throw new Error('AI response missing content field');
    }

    // Return format matches template model structure: { subject, body }
    // Body should contain variables like {{firstName}}, {{lastName}}, etc.
    // Don't hardcode the content - let AI generate it based on context
    return res.json({
      subject: parsed.subject || subject || "Reaching out", // Generate or use provided subject
      body: parsed.content || parsed.body, // AI-generated body with {{variables}}
    });
  } catch (error) {
    console.error('❌ Template generate AI error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate template with AI',
      details: error.message,
    });
  }
}

// Export for use in your backend framework
module.exports = { generateTemplateWithAI };

/**
 * Example Express.js route:
 * 
 * const express = require('express');
 * const router = express.Router();
 * const { generateTemplateWithAI } = require('./TEMPLATE_GENERATE_AI_ENDPOINT_EXAMPLE');
 * 
 * router.post('/templates/generate-ai', generateTemplateWithAI);
 * 
 * Example Next.js API route:
 * 
 * // app/api/templates/generate-ai/route.js
 * import { generateTemplateWithAI } from '@/lib/TEMPLATE_GENERATE_AI_ENDPOINT_EXAMPLE';
 * 
 * export async function POST(request) {
 *   const body = await request.json();
 *   // Adapt to Next.js Response format
 *   // ... implementation
 * }
 */

