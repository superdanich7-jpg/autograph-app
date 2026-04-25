// context/PostsContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Comment = {
    id: string;
    user: string;
    text: string;
    timestamp: string;
};

export type Post = {
    id: string;
    uri: string;
    caption: string;
    timestamp: string;
    likes: number;
    liked: boolean;
    comments: Comment[];
};

type PostsContextType = {
    posts: Post[];
    addPost: (post: Omit<Post, 'id' | 'likes' | 'liked' | 'comments'>) => void;
    toggleLike: (postId: string) => void;
    addComment: (postId: string, text: string) => void;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);

    const addPost = (post: Omit<Post, 'id' | 'likes' | 'liked' | 'comments'>) => {
        const newPost: Post = {
            ...post,
            id: Date.now().toString(),
            likes: 0,
            liked: false,
            comments: [], // ✅ У новых постов массив пустой, но существует
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

    const addComment = (postId: string, text: string) => {
        if (!text.trim()) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            user: 'Guest',
            text: text,
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        };

        setPosts(prev =>
            prev.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        // ✅ ИСПРАВЛЕНИЕ: Если comments нет, берем пустой массив []
                        comments: [...(post.comments || []), newComment]
                    };
                }
                return post;
            })
        );
    };

    return (
        <PostsContext.Provider value={{ posts, addPost, toggleLike, addComment }}>
            {children}
        </PostsContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostsContext);
    if (!context) throw new Error('usePosts must be used within PostsProvider');
    return context;
};