import { create } from 'zustand';

export const useEditorStore = create((set) => ({
  posts: [],
  currentPostId: null,
  // Using a ref-like object or string for JSON to avoid deep re-renders if not needed
  // But Lexical handles its own state mostly. We store the serialized state here.
  serializedState: null, 
  title: "Untitled",
  postStatus: "draft",  // 'draft' | 'published'
  
  // 'saved' | 'saving' | 'unsaved' | 'error'
  saveStatus: 'saved',

  setPosts: (posts) => set({ posts }),
  
  setCurrentPost: (post) => set({ 
    currentPostId: post.id, 
    title: post.title, 
    serializedState: post.content_json,
    postStatus: post.status || 'draft',
    saveStatus: 'saved'
  }),
  
  setPostStatus: (status) => set({ postStatus: status }),
  
  updateTitle: (title) => set({ title, saveStatus: 'unsaved' }),
  
  updateEditorState: (json) => set({ serializedState: json, saveStatus: 'unsaved' }),
  
  setSaveStatus: (status) => set({ saveStatus: status }),
  
  // Helper to update a post in the list without refetching
  updatePostInList: (id, updates) => set((state) => ({
    posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p))
  })),
  
  addPost: (post) => set((state) => ({ 
    posts: [post, ...state.posts],
    currentPostId: post.id,
    title: post.title,
    serializedState: post.content_json,
    saveStatus: 'saved'
  })),
  
  deletePostFromList: (id) => set((state) => ({
    posts: state.posts.filter((p) => p.id !== id),
    currentPostId: state.currentPostId === id ? null : state.currentPostId
  })),
}));
