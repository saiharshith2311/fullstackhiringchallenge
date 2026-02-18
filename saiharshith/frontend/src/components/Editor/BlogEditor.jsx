import React, { useEffect, useRef } from 'react';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $getRoot, $createParagraphNode } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";

import Toolbar from './Toolbar';
import AIPlugin from './AIPlugin';
import { useEditorStore } from '../../store/useEditorStore';
import { useDebounce } from '../../hooks/useDebounce';
import { updatePost, publishPost } from '../../api/posts';
import { Send, FileEdit } from 'lucide-react';

// Component to handle external state updates (ONLY when switching posts)
const UpdateStatePlugin = () => {
    const [editor] = useLexicalComposerContext();
    const { currentPostId, serializedState } = useEditorStore();
    const prevPostIdRef = React.useRef(null);
    
    useEffect(() => {
        // Only set editor state when the POST changes, not on every keystroke
        if (currentPostId && currentPostId !== prevPostIdRef.current) {
            prevPostIdRef.current = currentPostId;
            if (serializedState) {
                try {
                    const newState = editor.parseEditorState(serializedState);
                    editor.setEditorState(newState);
                } catch (e) {
                    console.warn("Failed to parse editor state:", e);
                }
            } else {
                // New post with no content — clear editor
                editor.update(() => {
                    const root = $getRoot();
                    root.clear();
                    root.append($createParagraphNode());
                });
            }
        }
    }, [currentPostId, serializedState, editor]);
    
    return null;
};

// Component to handle Auto-Save
const AutoSavePlugin = () => {
    const { currentPostId, title, serializedState, setSaveStatus, updatePostInList } = useEditorStore();

    // Debounce the save function (2 seconds delay)
    const debouncedSave = useDebounce(async (id, data) => {
        if (!id) return;
        
        console.log("Auto-saving...");
        setSaveStatus('saving');
        
        try {
            await updatePost(id, data);
            setSaveStatus('saved');
            // Keep the sidebar's posts list in sync with latest content
            updatePostInList(id, data);
            console.log("Saved!");
        } catch (error) {
            console.error("Auto-save failed:", error);
            setSaveStatus('error');
        }
    }, 2000);

    // Trigger save when state changes (but debounced)
    // We watch serializedState which is updated by OnChangePlugin
    useEffect(() => {
        if (currentPostId && serializedState) {
            // Only trigger if we have unsaved changes (handled by store logic usually)
            // But here we rely on the bounce.
            setSaveStatus('unsaved'); // Visual feedback immediately
            
            debouncedSave(currentPostId, { 
                title, 
                content_json: serializedState 
            });
        }
    }, [serializedState, title, currentPostId, debouncedSave, setSaveStatus]);
    
    return null;
};


const BlogEditor = () => {
    const { serializedState, updateEditorState, title, updateTitle, saveStatus, currentPostId, postStatus, setPostStatus, updatePostInList } = useEditorStore();

    const handlePublishToggle = async () => {
        if (!currentPostId) return;
        try {
            const endpoint = postStatus === 'published' ? 'unpublish' : 'publish';
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${apiUrl}/posts/${currentPostId}/${endpoint}`, { method: 'POST' });
            const updated = await response.json();
            setPostStatus(updated.status);
            updatePostInList(currentPostId, { status: updated.status });
        } catch (error) {
            console.error('Publish failed:', error);
        }
    };

    const initialConfig = {
        namespace: "SmartBlogEditor",
        theme: {
            paragraph: "editor-paragraph",
            text: {
                bold: "editor-text-bold",
                italic: "editor-text-italic",
                underline: "editor-text-underline",
            },
            heading: {
                h1: "editor-heading-h1",
                h2: "editor-heading-h2",
            },
            list: {
                ul: "editor-list-ul",
                ol: "editor-list-ol",
            },
        },
        onError: (error) => console.error(error),
        nodes: [
            HeadingNode, 
            QuoteNode, 
            ListNode, 
            ListItemNode
        ]
    };

    const handleEditorChange = (editorState) => {
        // Serialized state to JSON string
        const jsonString = JSON.stringify(editorState.toJSON());
        updateEditorState(jsonString);
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 px-8 h-full flex flex-col">
            {/* Header: Title + Save Status */}
            <div className="mb-6 flex justify-between items-start">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => updateTitle(e.target.value)}
                    placeholder="Post Title"
                    className="text-4xl font-bold border-none outline-none w-full placeholder-zinc-300 bg-transparent text-zinc-800"
                />
                
                <div className="flex items-center gap-3 mt-2">
                    <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider whitespace-nowrap">
                        {saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                        {saveStatus === 'saved' && <span className="text-emerald-500">Saved ✓</span>}
                        {saveStatus === 'unsaved' && <span className="text-zinc-400">Unsaved</span>}
                        {saveStatus === 'error' && <span className="text-red-500">Error!</span>}
                    </div>
                    
                    <button
                        onClick={handlePublishToggle}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            postStatus === 'published'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                        }`}
                    >
                        {postStatus === 'published' ? (
                            <><FileEdit className="w-3.5 h-3.5" /> Unpublish</>
                        ) : (
                            <><Send className="w-3.5 h-3.5" /> Publish</>
                        )}
                    </button>
                </div>
            </div>

            {/* Lexical Editor */}
            <div className="flex-1 bg-white text-zinc-900 relative border border-zinc-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden">
                <LexicalComposer initialConfig={initialConfig}>
                    <Toolbar />
                    
                    <div className="relative flex-1 overflow-y-auto">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable className="ContentEditable__root min-h-full outline-none p-4 text-zinc-800" />
                            }
                            placeholder={
                                <div className="absolute top-16 left-4 text-zinc-400 pointer-events-none">
                                    Start writing...
                                </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <ListPlugin />
                        
                        {/* Custom Plugins */}
                        <OnChangePlugin onChange={handleEditorChange} />
                        <UpdateStatePlugin />
                        <AutoSavePlugin /> 
                        <AIPlugin />
                    </div>
                </LexicalComposer>
            </div>
        </div>
    );
};

export default BlogEditor;
