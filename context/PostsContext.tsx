// context/PostsContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Post = {
    id: string;
    uri: string;
    caption: string;
    timestamp: string;
    likes: number;
    liked: boolean;
};

type PostsContextType = {
    posts: Post[];
    addPost: (post: Omit<Post, 'id' | 'likes' | 'liked'>) => void;
    toggleLike: (postId: string) => void;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);

    const addPost = (post: Omit<Post, 'id' | 'likes' | 'liked'>) => {
        const newPost: Post = {
            ...post,
            id: Date.now().toString(),
            likes: 0,
            liked: false,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const toggleLike = (postId: string) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === postId
                    ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );
    };

    return (
        <PostsContext.Provider value={{ posts, addPost, toggleLike }}>
            {children}
        </PostsContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostsContext);
    if (!context) throw new Error('usePosts must be used within PostsProvider');
    return context;
};