import React, { useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { getPosts, getPost, createPost, deletePost } from '../../api/posts';
import { FileText, Trash2, Plus, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const PostList = () => {
  const { posts, currentPostId, setPosts, setCurrentPost, addPost, deletePostFromList } = useEditorStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
        // If no post selected and posts exist, select the first one
        if (!currentPostId && data.length > 0) {
            // setCurrentPost(data[0]); // Optional: auto-select
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();
  }, [setPosts]);

  const handleSelectPost = async (postId) => {
    try {
      const freshPost = await getPost(postId);
      setCurrentPost(freshPost);
    } catch (error) {
      console.error("Failed to load post:", error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const newPost = await createPost();
      addPost(newPost);
      setCurrentPost(newPost);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };
  
  const handleDeletePost = async (e, id) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this post?")) {
        try {
            await deletePost(id);
            deletePostFromList(id);
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    }
  };

  return (
    <div className="w-64 bg-black border-r border-zinc-800 h-screen flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="font-semibold text-white flex items-center gap-2 tracking-wide">
            <GripVertical className="w-5 h-5 text-zinc-500" />
            My Posts
        </h2>
        <button 
            onClick={handleCreatePost}
            className="p-1 hover:bg-zinc-800 rounded-md transition-colors"
            title="New Post"
        >
            <Plus className="w-5 h-5 text-zinc-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {posts.map((post) => (
          <div 
            key={post.id}
            onClick={() => handleSelectPost(post.id)}
            className={twMerge(
                "group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all",
                currentPostId === post.id 
                    ? "bg-zinc-800 border border-zinc-700" 
                    : "hover:bg-zinc-900 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
                <FileText className={twMerge(
                    "w-4 h-4 flex-shrink-0",
                    post.status === 'published' ? "text-emerald-400" : "text-zinc-600"
                )} />
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-zinc-200 truncate">
                        {post.title || "Untitled"}
                    </span>
                    <span className="text-xs text-zinc-600">
                        {new Date(post.updated_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
            
            <button
                onClick={(e) => handleDeletePost(e, post.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-all text-zinc-600"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {posts.length === 0 && (
            <div className="text-center text-zinc-600 mt-10 text-sm">
                No posts yet. <br/> Click + to create one.
            </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
