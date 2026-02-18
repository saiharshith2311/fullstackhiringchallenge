import React from 'react';
import PostList from '../Sidebar/PostList';
import { useEditorStore } from '../../store/useEditorStore';

const AppLayout = ({ children }) => {
  const { currentPostId } = useEditorStore();

  return (
    <div className="flex h-screen w-full bg-zinc-100 text-zinc-900 font-sans">
      <PostList />
      <main className="flex-1 h-screen overflow-hidden relative">
        {currentPostId ? (
            children
        ) : (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">✍️</div>
                <h1 className="text-2xl font-semibold mb-2 text-zinc-500">Select a post to edit</h1>
                <p className="text-zinc-400">Or create a new one from the sidebar</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
