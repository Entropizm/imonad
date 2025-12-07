"use client";

import { useState, useRef, useEffect } from "react";
import AppHeader from "./AppHeader";
import Editor from "@monaco-editor/react";
import { useAccount } from "wagmi";
import WalletConnectModal from "../WalletConnectModal";

interface SuperAppProps {
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: "dice",
    name: "Dice Game",
    icon: "🎲",
    description: "Create a Web3 dice rolling game",
    prompt: "Create a dice rolling game where users can bet MONAD tokens and win based on dice rolls. Include connect wallet, bet amount input, roll button, and display results.",
  },
  {
    id: "shitcoin",
    name: "Token ICO",
    icon: "💰",
    description: "Create your own token presale",
    prompt: "Create a token ICO/presale interface where users can buy tokens with MONAD. Show token price, amount input, buy button, and user's token balance. Make it look professional.",
  },
  {
    id: "simple",
    name: "Simple App",
    icon: "✨",
    description: "Create a utility or fun app",
    prompt: "Create a simple, useful, or fun app without blockchain features. Be creative!",
  },
];

const DEFAULT_CODE = `"use client";
import { useState } from "react";
import AppHeader from "@/components/apps/AppHeader";

export default function MyApp({ onClose }: { onClose: () => void }) {
  const [count, setCount] = useState(0);

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <AppHeader title="My App" onClose={onClose} />
      <div className="flex-1 p-4 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Counter: {count}</h2>
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Increment
        </button>
      </div>
    </div>
  );
}`;

export default function SuperApp({ onClose }: SuperAppProps) {
  const { isConnected, address } = useAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [view, setView] = useState<"templates" | "chat" | "editor">("templates");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appCategory, setAppCategory] = useState("games");
  const [appIcon, setAppIcon] = useState("📱");
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateSelect = async (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setMessages([]);  // Clear messages state (async)
    setView("chat");
    
    // Auto-generate from template - pass empty array explicitly since setState is async
    await generateCode(template.prompt, template.id, []);
  };

  const generateCode = async (prompt: string, template?: string, existingMessages: Array<{ role: string; content: string }> = messages) => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", content: prompt };
    const updatedMessages = [...existingMessages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          template: template || selectedTemplate,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate code');
      }

      const assistantMessage = data.code;
      console.log('Generated code length:', assistantMessage?.length);
      setMessages((prev) => [...prev, { role: "assistant", content: "✅ Code generated successfully! Switching to editor..." }]);

      // Extract code from response
      const codeMatch = assistantMessage.match(/```(?:typescript|tsx|jsx)?\n([\s\S]*?)```/);
      if (codeMatch) {
        console.log('Code block found, length:', codeMatch[1].length);
        setCode(codeMatch[1]);
      } else {
        // If no code block found, assume the whole response is code
        console.log('No code block, using raw response');
        setCode(assistantMessage);
      }
      
      // Always switch to editor view
      setTimeout(() => setView("editor"), 500);
    } catch (error: any) {
      console.error('Error generating code:', error);
      
      let errorMsg = 'Error generating code';
      if (error.message) {
        errorMsg += `: ${error.message}`;
      }
      
      // Show user-friendly error message
      if (error.message?.includes('ANTHROPIC_API_KEY')) {
        errorMsg = '⚠️ Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file and restart the server.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMsg = '⚠️ Could not connect to AI service. Check your internet connection and API key.';
      }
      
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: `Error: ${errorMsg}\n\nPlease check:\n1. ANTHROPIC_API_KEY is set in .env\n2. API key has credits\n3. Server was restarted after adding .env` 
      }]);
      
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      generateCode(input);
    }
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }

    if (!appName || !code) {
      alert("Please provide app name and code");
      return;
    }

    setIsDeploying(true);

    try {
      // 1. Save app to MongoDB
      const appRes = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: appName,
          description: appDescription || `A custom app created with SuperApp`,
          category: appCategory,
          icon: appIcon,
          code: code,
          creator: address,
        }),
      });

      const appData = await appRes.json();
      
      if (!appData.success) {
        throw new Error(appData.error || 'Failed to save app');
      }

      alert(`App "${appName}" deployed successfully! 🎉\n\nFind it in the Marketplace.`);
      
      // Reset form
      setAppName("");
      setAppDescription("");
      setCode(DEFAULT_CODE);
      setView("templates");
      
    } catch (error: any) {
      console.error('Deployment error:', error);
      alert('Error deploying app: ' + error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <div className="w-full h-full bg-gradient-to-b from-purple-50 to-blue-50 flex flex-col">
        <AppHeader title="App Studio" onClose={onClose} />

        {view === "templates" && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                🚀 Create Your App
              </h2>
              <p className="text-sm text-gray-600">
                Choose a template to get started with AI-powered code generation
              </p>
            </div>

            <div className="space-y-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setView("editor")}
              className="w-full mt-4 p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-medium text-gray-700 hover:shadow-md transition-all"
            >
              💻 Start from Scratch
            </button>
          </div>
        )}

        {view === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 p-3 bg-white border-b flex gap-2">
              <button
                onClick={() => setView("templates")}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium"
              >
                ← Back
              </button>
              <button
                onClick={() => setView("editor")}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
              >
                View Code
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">{msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content}</div>
                </div>
              ))}
              {isGenerating && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 text-gray-800 shadow-sm max-w-[85%] animate-pulse">
                  <div className="text-sm font-medium">🤖 Generating code...</div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-3 bg-white border-t sticky bottom-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Add more instructions..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !input.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {view === "editor" && (
          <div className="flex-1 flex flex-col">
            <div className="p-3 bg-white border-b flex gap-2 overflow-x-auto">
              <button
                onClick={() => setView(selectedTemplate ? "chat" : "templates")}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm whitespace-nowrap font-medium"
              >
                ← Back
              </button>
              {selectedTemplate && (
                <button
                  onClick={() => setView("chat")}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm whitespace-nowrap"
                >
                  💬 Chat
                </button>
              )}
              <button
                onClick={handleDeploy}
                disabled={isDeploying || !code}
                className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm whitespace-nowrap disabled:opacity-50"
              >
                {isDeploying ? "Deploying..." : "🚀 Deploy"}
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-b space-y-2">
              <input
                type="text"
                placeholder="App Name *"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={appIcon}
                  onChange={(e) => setAppIcon(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                />
                <select
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="games">Games</option>
                  <option value="defi">DeFi</option>
                  <option value="social">Social</option>
                  <option value="tools">Tools</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {showWalletModal && (
        <WalletConnectModal
          onClose={() => setShowWalletModal(false)}
          appName="App Studio"
        />
      )}
    </>
  );
}

