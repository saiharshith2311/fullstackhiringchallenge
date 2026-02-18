import React, { useState } from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { Sparkles, Loader, Wand2 } from 'lucide-react';
import { generateAI } from '../../api/posts';

const AIPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const [isLoading, setIsLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleGenerate = async (action) => {
        setIsLoading(true);
        setShowMenu(false);
        
        let textContent = "";
        editor.update(() => {
            textContent = $getRoot().getTextContent();
        });

        if (!textContent.trim()) {
            alert("Please write something first!");
            setIsLoading(false);
            return;
        }

        try {
            const response = await generateAI(textContent, action);
            const aiText = response.result;
            
            // Append AI text to editor
            editor.update(() => {
                const root = $getRoot();
                const p = $createParagraphNode();
                p.append($createTextNode(`\n\n--- AI (${action}) ---\n${aiText}`));
                root.append(p);
            });
        } catch (error) {
            console.error("AI Error:", error);
            alert("Failed to generate AI response");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {showMenu && (
                <div className="bg-zinc-900 shadow-lg rounded-lg border border-zinc-800 mb-2 p-2 w-48">
                    <button 
                        onClick={() => handleGenerate('summarize')}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-sm rounded text-zinc-300 flex items-center gap-2"
                    >
                        📝 Summarize
                    </button>
                    <button 
                        onClick={() => handleGenerate('fix_grammar')}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-sm rounded text-zinc-300 flex items-center gap-2"
                    >
                        ✨ Fix Grammar
                    </button>
                    <button 
                        onClick={() => handleGenerate('expand')}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-sm rounded text-zinc-300 flex items-center gap-2"
                    >
                        🚀 Expand
                    </button>
                </div>
            )}

            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isLoading}
                className="bg-white hover:bg-zinc-200 text-black p-3 rounded-full shadow-lg transition-all flex items-center gap-2 font-medium"
            >
                {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : (
                    <Sparkles className="w-5 h-5" />
                )}
                {isLoading ? "Generating..." : "Ask AI"}
            </button>
        </div>
    );
};

export default AIPlugin;
