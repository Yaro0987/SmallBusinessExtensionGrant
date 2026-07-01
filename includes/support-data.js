window.SUPPORT_DATA = {
  "botName": "Grant Assistant",
  "greeting": "Hi! I'm your Grant Assistant. I can help you with applications, answer questions about grants, or guide you through the site. How can I help?",
  "fallback": "I'm not sure I have the answer to that. Would you like to:\n- Speak with a human agent\n- Go back to the home page\n- Start a grant application",
  "liveAgent": "A human agent will be with you shortly. Meanwhile, you can continue browsing or start your application.",
  "items": [
    {
      "id": "greeting_hi",
      "keywords": ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy"],
      "a": "Hello! Welcome to the Small Business Expansion Grant. I'm your Grant Assistant. How can I help you today? You can ask me about:\n\n\u2022 Available grant programs\n\u2022 The application process\n\u2022 Eligibility requirements\n\u2022 How to navigate the site\n\u2022 Getting help with your application"
    },
    {
      "id": "what_grants",
      "keywords": ["what grants", "available grants", "grant programs", "types of grants", "grant categories", "what funding", "what programs"],
      "a": "We offer several grant programs:\n\n1. **Startup Grant** \u2014 For new businesses launching or in their first year\n2. **Small Business Grant** \u2014 For established businesses looking to expand\n3. **Innovation Grant** \u2014 For research, development, and innovative projects\n4. **Community Grant** \u2014 For community-focused initiatives and non-profits\n5. **Research Grant** \u2014 For academic and industry research projects\n\nYou can apply from our Apply page by clicking 'Apply Now'.",
      "followUps": ["How to apply?", "Who is eligible?", "How much can I get?"]
    },
    {
      "id": "how_apply",
      "keywords": ["how to apply", "how do i apply", "application process", "apply for grant", "submit application", "how apply"],
      "a": "Applying is easy! Here's how:\n\n1. Go to the **Apply** page\n2. Fill in your details: full name, business name, grant type, DOB, email, phone\n3. Select your desired grant amount\n4. Write your business plan/description\n5. Upload supporting documents (optional)\n6. Submit and we'll review within **24 hours**\n\nNeed help filling out the form? I can guide you through each step!",
      "followUps": ["Help me with my application", "What documents do I need?", "What happens after I submit?"]
    },
    {
      "id": "eligibility",
      "keywords": ["eligibility", "who can apply", "am i eligible", "qualify", "requirements", "who qualifies", "eligible"],
      "a": "Our grants are open to:\n\n\u2022 Small business owners (operating 6+ months)\n\u2022 Startup founders with a solid business plan\n\u2022 Freelancers and solopreneurs\n\u2022 Non-profit organizations\n\u2022 E-commerce businesses\n\u2022 Minority-owned, women-owned, and veteran-owned businesses\n\nYou must be at least 18 years old. Most industries and stages are welcome!",
      "followUps": ["How to apply?", "What grants are available?", "What documents do I need?"]
    },
    {
      "id": "repayment",
      "keywords": ["repay", "repayment", "pay back", "interest", "loan", "free money", "no repayment", "no pay back"],
      "a": "No! Our grants are **non-repayable**. This is free funding for your business. There is:\n\n\u2022 No interest\n\u2022 No repayment schedule\n\u2022 No hidden fees\n\u2022 No equity required\n\nOnce you're awarded a grant, the money is yours to use for your business.",
      "followUps": ["How much can I get?", "How to apply?", "What happens after I submit?"]
    },
    {
      "id": "review_time",
      "keywords": ["how long", "review time", "processing time", "how long does it take", "when will i know", "decision time", "24 hours", "24hr"],
      "a": "We review applications within **24 hours**. The process is:\n\n1. Submit your application (takes 5-10 minutes)\n2. Our team reviews it within 24 hours\n3. If approved, funds are disbursed shortly after"
    },
    {
      "id": "how_receive",
      "keywords": ["receive funds", "get money", "how paid", "disbursed", "bank account", "wire transfer", "direct deposit", "get funded"],
      "a": "Approved grant funds are disbursed directly to your bank account via **wire transfer** or **direct deposit**. Typically within 2-3 business days of approval."
    },
    {
      "id": "fees",
      "keywords": ["fee", "fees", "hidden fees", "application fee", "processing fee", "cost", "charges", "any fee"],
      "a": "No. Our grants are **completely free**. There are no application fees, processing fees, or hidden charges. You receive 100% of the grant amount."
    },
    {
      "id": "apply_page",
      "keywords": ["apply page", "application form", "apply form", "where do i apply", "fill application"],
      "a": "The **Apply** page is where you submit your grant application. You'll need:\n\n\u2022 Full name and business name\n\u2022 Grant type\n\u2022 Date of birth and contact info\n\u2022 Grant amount requested\n\u2022 Years of business experience\n\u2022 Your business plan or description\n\u2022 Supporting documents (optional)\n\nI can help you fill out the form step by step if you'd like assistance!"
    },
    {
      "id": "documents_needed",
      "keywords": ["documents", "documentation", "what documents", "required documents", "supporting documents", "paperwork", "need to apply"],
      "a": "For your application:\n\n**Required:**\n\u2022 Basic business information\n\u2022 Business plan or description\n\n**Optional but helpful:**\n\u2022 Business license or registration\n\u2022 Financial statements\n\u2022 Business photos or voice notes\n\u2022 Any other supporting documents\n\nYou can upload images, audio files, PDFs, and DOC files directly in the form."
    },
    {
      "id": "grant_amounts",
      "keywords": ["how much", "grant amount", "funding amount", "how much money", "maximum grant", "minimum grant", "amount"],
      "a": "Grant amounts vary by program:\n\n\u2022 **Startup Grants:** Up to $15,000\n\u2022 **Small Business Grants:** Up to $50,000\n\u2022 **Innovation Grants:** Up to $100,000\n\u2022 **Community Grants:** Up to $25,000\n\u2022 **Research Grants:** Up to $100,000\n\nThe average grant awarded is $15,000+."
    },
    {
      "id": "application_help",
      "keywords": ["help apply", "help with application", "guide me", "assist", "help me apply", "walk me through", "step by step"],
      "a": "I'd be happy to help you with your application! Let me ask you a few questions to get started:\n\n1. What is your **full name**?\n2. What is your **business name**?\n3. Which **grant type** are you interested in?\n4. What is your **email address**?\n\nJust answer each question and I'll help compile your information!"
    },
    {
      "id": "upload_help",
      "keywords": ["upload", "file", "document", "attach", "upload file", "how to upload", "image", "voice note", "audio"],
      "a": "You can upload files in two ways:\n\n**In the application form:**\n\u2022 Drag & drop files into the upload area\n\u2022 Supports: images, audio, PDF, DOC\n\u2022 Max 10MB per file\n\n**In this chat:**\n\u2022 Click the attachment button to upload images\n\u2022 Click the microphone for voice notes"
    },
    {
      "id": "after_submit",
      "keywords": ["after submit", "what happens next", "next steps", "after applying", "submitted", "what now"],
      "a": "After you submit:\n\n1. **Confirmation** \u2014 Email confirming receipt\n2. **Review** \u2014 Within 24 hours\n3. **Decision** \u2014 Notified via email\n4. **Funding** \u2014 Sent to your bank account if approved"
    },
    {
      "id": "application_tips",
      "keywords": ["tips", "advice", "suggestions", "recommendations", "best application", "strong application", "improve application"],
      "a": "Tips for a strong application:\n\n1. **Be specific** \u2014 Clearly describe your business and fund usage\n2. **Show impact** \u2014 Explain how the grant will help you grow\n3. **Provide details** \u2014 The more information, the better\n4. **Upload documents** \u2014 Supporting files strengthen your case\n5. **Be honest** \u2014 Accurate information builds trust"
    },
    {
      "id": "site_navigation",
      "keywords": ["navigate", "menu", "navigation", "how to use", "site map", "pages", "where to find"],
      "a": "This site has these pages:\n\n\u2022 **Home** \u2014 Overview of grant programs\n\u2022 **Apply** \u2014 Submit your application\n\nUse the top navigation bar or menu button to switch pages."
    },
    {
      "id": "approval_chances",
      "keywords": ["approval", "chances", "get approved", "likelihood", "approval rate", "success rate", "how likely"],
      "a": "We have a strong approval rate! Key factors:\n\n\u2022 Clear business plan and goals\n\u2022 Complete and accurate information\n\u2022 Relevant experience\n\u2022 Strong reasoning for fund usage\n\u2022 Supporting documents\n\nBe thorough and honest for the best chance."
    },
    {
      "id": "multiple_applications",
      "keywords": ["multiple applications", "apply more than once", "second application", "apply again", "multiple grants"],
      "a": "Yes! You can apply for different grant programs. Each application is reviewed independently."
    },
    {
      "id": "contact_support",
      "keywords": ["contact", "reach you", "call", "email", "phone", "customer support", "support"],
      "a": "You can reach us:\n\n\u2022 **Email:** info@sbgrant.com\n\u2022 **Phone:** 1-800-555-1234\n\nOr use this chat for instant help!"
    },
    {
      "id": "tech_support",
      "keywords": ["not working", "error", "bug", "issue", "problem", "technical", "broken", "website issue"],
      "a": "Having issues? Try:\n\n1. Refreshing the page\n2. Clearing your browser cache\n3. Using Chrome or Firefox\n\nIf it persists, email info@sbgrant.com"
    },
    {
      "id": "privacy",
      "keywords": ["privacy", "data", "secure", "safety", "information safe", "confidential", "protected"],
      "a": "Absolutely! All data is encrypted, never shared with third parties, and you can request deletion anytime."
    }
  ],
  "applicationFlow": [
    { "step": 1, "field": "fullname", "question": "What is your full name?" },
    { "step": 2, "field": "business_name", "question": "What is your business name?" },
    { "step": 3, "field": "grant_type", "question": "Which grant type? (Startup, Small Business, Innovation, Community, Research)" },
    { "step": 4, "field": "dob", "question": "What is your date of birth? (DD/MM/YYYY)" },
    { "step": 5, "field": "email", "question": "What is your email address?" },
    { "step": 6, "field": "cell", "question": "What is your cell phone number?" },
    { "step": 7, "field": "grant_amount", "question": "How much funding are you requesting?" },
    { "step": 8, "field": "experience", "question": "Years of business experience?" },
    { "step": 9, "field": "business_plan", "question": "Tell me about your business and fund usage." },
    { "step": 10, "field": "review", "question": "Would you like me to review your info before you submit?" }
  ]
};
