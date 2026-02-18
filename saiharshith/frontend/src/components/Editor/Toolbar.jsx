import React from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection"; 
import { $getSelection, $isRangeSelection } from "lexical";

import { 
    Bold, Italic, Underline, 
    Heading1, Heading2, 
    List, ListOrdered, 
    Undo, Redo 
} from "lucide-react";

const ToolbarButton = ({ onClick, icon: Icon, title }) => (
    <button 
        onClick={onClick}
        className="p-2 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-900 transition-colors"
        title={title}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const Toolbar = () => {
    const [editor] = useLexicalComposerContext();

    const formatText = (format) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const formatHeading = (tag) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(tag));
            }
        });
    };

    const formatList = (type) => {
        if (type === 'ul') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
    };

    return (
        <div className="flex items-center gap-1 border-b border-zinc-200 p-2 bg-zinc-50 sticky top-0 z-10">
            <ToolbarButton 
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} 
                icon={Undo} title="Undo" 
            />
            <ToolbarButton 
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} 
                icon={Redo} title="Redo" 
            />
            
            <div className="w-px h-6 bg-gray-200 mx-2" />
            
            <ToolbarButton 
                onClick={() => formatText("bold")} 
                icon={Bold} title="Bold" 
            />
            <ToolbarButton 
                onClick={() => formatText("italic")} 
                icon={Italic} title="Italic" 
            />
            <ToolbarButton 
                onClick={() => formatText("underline")} 
                icon={Underline} title="Underline" 
            />

            <div className="w-px h-6 bg-zinc-200 mx-2" />

            <ToolbarButton 
                onClick={() => formatHeading("h1")} 
                icon={Heading1} title="Heading 1" 
            />
            <ToolbarButton 
                onClick={() => formatHeading("h2")} 
                icon={Heading2} title="Heading 2" 
            />

            <div className="w-px h-6 bg-zinc-200 mx-2" />

            <ToolbarButton 
                onClick={() => formatList("ul")} 
                icon={List} title="Bullet List" 
            />
            <ToolbarButton 
                onClick={() => formatList("ol")} 
                icon={ListOrdered} title="Numbered List" 
            />
        </div>
    );
};

export default Toolbar;
