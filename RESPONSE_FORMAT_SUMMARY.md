# Response Format Summary - Generate with AI

## 🔑 Key Return JSON Format (Matches Template Model!)

The backend endpoint `POST /api/templates/generate-ai` **MUST** return this structure:

```json
{
  "subject": "Email subject line",
  "body": "Email body with {{variables}}"
}
```

### Required Fields:
- **`subject`** (string): Email subject line
- **`body`** (string): Email body content that should contain variables like `{{firstName}}`, `{{lastName}}`, `{{companyName}}`, etc.

### Key Points:
- **NO `success` field** - Just return `{ subject, body }` directly
- **Matches template model structure** - Same as what gets saved: `{ subject, body }`
- **`body` contains variables** - Use `{{variableName}}` format (e.g., `Hi {{firstName}},...`)
- Don't hardcode the content - Let AI generate based on context

### Error Format:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## 📍 Where It's Displayed

### 1. Step 3 - Compose Step (Main Display)
**Location:** Lines 366-372 in `ComposeMessage.jsx`

```jsx
<textarea
  rows={12}
  value={composeData.body}  // ← The 'template' field from response populates this
  onChange={(e) => handleComposeChange("body", e.target.value)}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
  placeholder="Enter your message... Use {{firstName}} for personalization"
/>
```

**How it works:**
- User clicks "Generate with AI" button
- Response comes back with `response.data.template`
- `setComposeData` updates `composeData.body` with `response.data.template`
- The textarea displays `composeData.body` (which now contains the AI-generated template)

### 2. Step 4 - Preview Step
**Location:** Lines 411-414 in `ComposeMessage.jsx`

```jsx
<div 
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ __html: composeData.body }}  // ← Same data, displayed as preview
/>
```

**How it works:**
- When user clicks "Preview & Send", they see Step 4
- The preview displays `composeData.body` (which contains the generated template)
- Shows how the email will look to recipients

---

## 🔄 Data Flow

```
User clicks "Generate with AI"
    ↓
API call: POST /api/templates/generate-ai
    ↓
Backend returns: { success: true, template: "Hi {{firstName}},..." }
    ↓
Frontend receives: response.data.template
    ↓
setComposeData({ ...prev, body: response.data.template })
    ↓
composeData.body = "Hi {{firstName}},..."
    ↓
Displayed in textarea (Step 3) and preview (Step 4)
```

---

## ✅ Example Response

**Request:**
```json
POST /api/templates/generate-ai
{
  "subject": "Catching up",
  "body": "",
  "templateId": null
}
```

**Example Response:**
```json
{
  "subject": "Catching up",
  "body": "Hi {{firstName}},\n\nHope you're doing well! Been thinking about you and wanted to reach out.\n\nWould love to catch up if you're open to it — maybe grab coffee or lunch?\n\nNo pressure at all, just thought it'd be nice to reconnect.\n\nLet me know if you're interested!\n\nCheers,\nJoel"
}
```

**Result in UI:**
- `response.data.subject` → populates the subject input field
- `response.data.body` → populates the body textarea (Step 3)
- The body contains variables like `{{firstName}}` which will be replaced when sending
- User can edit both subject and body
- When they preview (Step 4), they see the subject and body
- When sending, the `{{firstName}}` variables get replaced with actual contact data

---

## ⚠️ Important Notes

1. **The `template` field MUST contain variables like `{{firstName}}`** - this is what makes it a template vs. static text
2. **Use `\n` for line breaks** - The frontend will display these as actual line breaks
3. **Don't return HTML** - The content should be plain text with `\n` for line breaks (the preview step will render it safely)
4. **The `template` field is what gets displayed** - Make sure it's well-formatted and readable

