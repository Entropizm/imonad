import { NextRequest, NextResponse } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in environment');
      return NextResponse.json(
        { success: false, error: 'ANTHROPIC_API_KEY not configured. Add it to your .env file.' },
        { status: 500 }
      );
    }
    
    console.log('API Key exists:', apiKey.substring(0, 10) + '...');

    // Create anthropic client with the API key
    const anthropic = createAnthropic({
      apiKey: apiKey,
    });

    const { messages, template } = await request.json();
    
    console.log('Received messages count:', messages?.length);
    
    // Validate messages
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Filter: only keep user messages with non-empty content (skip error messages from assistant)
    const validMessages = messages
      .filter((m: any) => {
        const hasContent = m.content && typeof m.content === 'string' && m.content.trim().length > 0;
        const isNotError = !m.content?.includes('Error:') && !m.content?.includes('Please check:');
        return hasContent && m.role === 'user' && isNotError;
      })
      .map((m: any) => ({
        role: 'user' as const,
        content: m.content.trim()
      }));
    
    console.log('Valid user messages:', validMessages.length);
    
    if (validMessages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid user messages found' },
        { status: 400 }
      );
    }
    
    let systemPrompt = `You are an expert React developer. Generate clean, working React components for an iOS-themed mobile interface.

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. DO NOT use any import statements - all dependencies are pre-loaded as globals
2. The component MUST be named "MyApp" and exported as default
3. Component must accept { onClose } as props (type: { onClose: () => void })
4. Use Tailwind CSS for styling
5. Make it look like iOS 4 apps (gradients, rounded corners, shadows)
6. Return ONLY the code wrapped in typescript code block, no explanations

AVAILABLE GLOBALS (use directly, NO imports):
- React (use React.useState, React.useEffect, etc.)
- useState, useEffect (from React)
- useAccount, useReadContract, useWriteContract (from wagmi)
- AppHeader component: <AppHeader title="App Name" onClose={onClose} />

CORRECT EXAMPLE (NO IMPORTS):
\`\`\`typescript
function MyApp({ onClose }) {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <AppHeader title="Counter" onClose={onClose} />
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-4">{count}</div>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg"
        >
          Add One
        </button>
      </div>
    </div>
  );
}

export default MyApp;
\`\`\`

WRONG (DO NOT DO THIS):
\`\`\`
import { useState } from "react";  // WRONG - NO IMPORTS!
import AppHeader from "...";       // WRONG - NO IMPORTS!
\`\`\``;

    if (template) {
      systemPrompt += `\n\nUSER SELECTED TEMPLATE: ${template}
      
Templates:
- "dice": Create a dice rolling game with web3 betting using MonadDice contract
- "shitcoin": Create a token ICO/presale interface with buy/sell functionality
- "simple": Create a simple utility or fun app without blockchain`;
    }
    
    console.log('Calling Anthropic API with model: claude-sonnet-4-20250514');
    
    // Use generateText instead of streamText for more reliable response
    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: validMessages,
      temperature: 0.7,
    });

    console.log('Anthropic API call successful, got response length:', result.text.length);
    
    return NextResponse.json({
      success: true,
      code: result.text,
    });
  } catch (error: any) {
    console.error('AI Generation Error:', error.message);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });
    
    let errorMessage = 'Failed to generate code';
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key. Check your ANTHROPIC_API_KEY.';
    } else if (error.message?.includes('not_found')) {
      errorMessage = 'Model not available. Try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
