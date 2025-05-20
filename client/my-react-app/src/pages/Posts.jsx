import React, { useState, useEffect } from 'react';

function Posts() {
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostBody, setNewPostBody] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const [editingPostId, setEditingPostId] = useState(null);
    const [editedPostTitle, setEditedPostTitle] = useState('');
    const [editedPostBody, setEditedPostBody] = useState('');
    const [newComment, setNewComment] = useState('');
    const [postComments, setPostComments] = useState({});
    // const [comments, setComments] = useState({}); // Object to store comments per post

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`http://localhost:3001/posts?userId=${currentUser?.id}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data.sort((a, b) => a.id - b.id));
            } else {
                console.error('Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleAddPost = async () => {
        if (!newPostTitle.trim() || !newPostBody.trim() || !currentUser?.id) return;
        try {
            const response = await fetch('http://localhost:3001/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, title: newPostTitle, body: newPostBody }),
            });
            if (response.ok) {
                setNewPostTitle('');
                setNewPostBody('');
                fetchPosts();
            } else {
                console.error('Failed to add post');
            }
        } catch (error) {
            console.error('Error adding post:', error);
        }
    };

    const handleEditPost = (post) => {
        setEditingPostId(post.id);
        setEditedPostTitle(post.title);
        setEditedPostBody(post.body);
    };

    const handleSaveEditPost = async (postId) => {
        if (!editedPostTitle.trim() || !editedPostBody.trim() || !currentUser?.id) return;
        try {
            const response = await fetch(`http://localhost:3001/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, title: editedPostTitle, body: editedPostBody }),
            });
            if (response.ok) {
                setEditingPostId(null);
                fetchPosts();
            } else {
                console.error('Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!currentUser?.id) return;
        try {
            const response = await fetch(`http://localhost:3001/posts/${postId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchPosts();
            } else {
                console.error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const fetchComments = async (postId) => {
        try {
            const response = await fetch(`http://localhost:3001/comments?post_id=${postId}`);
            if (response.ok) {
                const data = await response.json();
                // setComments(prevComments => ({ ...prevComments, [postId]: data })); // You might not be using this state
            } else {
                console.error('Failed to fetch comments for post:', postId);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (postId) => {
        if (!newComment.trim() || !currentUser?.id) return;
        try {
            const response = await fetch('http://localhost:3001/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postId, name: currentUser.username,email: currentUser.email, body: newComment }),
            });
            if (response.ok) {
                setNewComment('');
                fetchCommentsForPost(postId); // Re-fetch comments after adding
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const fetchCommentsForPost = async (postId) => {
        try {
            const response = await fetch(`http://localhost:3001/comments/post/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setPostComments(prevComments => ({
                    ...prevComments,
                    [postId]: data,
                }));
            } else {
                console.error('Failed to fetch comments for post:', postId);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Optimistically update the UI by removing the comment
                setPosts(prevPosts =>
                    prevPosts.map(post => ({
                        ...post,
                        comments: post.comments ? post.comments.filter(comment => comment.id !== commentId) : []
                    }))
                );
                // Optionally re-fetch comments for the post to ensure data consistency
                const postIdOfDeletedComment = posts.find(post => post.comments?.some(c => c.id === commentId))?.id;
                if (postIdOfDeletedComment) {
                    fetchCommentsForPost(postIdOfDeletedComment);
                }
            } else {
                console.error('Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div>
            <h2>All Posts</h2>
            {currentUser && (
                <div>
                    <h3>Add New Post</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Body"
                        value={newPostBody}
                        onChange={(e) => setNewPostBody(e.target.value)}
                    />
                    <button onClick={handleAddPost}>Add Post</button>
                </div>
            )}
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h3>
                            {editingPostId === post.id ? (
                                <input
                                    type="text"
                                    value={editedPostTitle}
                                    onChange={(e) => setEditedPostTitle(e.target.value)}
                                />
                            ) : (
                                post.title
                            )}
                        </h3>
                        <p>
                            {editingPostId === post.id ? (
                                <textarea
                                    value={editedPostBody}
                                    onChange={(e) => setEditedPostBody(e.target.value)}
                                />
                            ) : (
                                post.body
                            )}
                        </p>
                        {currentUser?.id === post.userId ? (
                            <div>
                                {editingPostId === post.id ? (
                                    <>
                                        <button onClick={() => handleSaveEditPost(post.id)}>Save</button>
                                        <button onClick={() => setEditingPostId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditPost(post)}>Edit</button>
                                        <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                                    </>
                                )}
                            </div>
                        ) : null}

                        <h4>Comments:</h4>
                        {post.comments && post.comments.map(comment => (
                            <div key={comment.id}>
                                <p><strong>{comment.name} ({comment.email}):</strong> {comment.body}</p>
                                {currentUser?.id === comment.user_id && (
                                    <button onClick={() => handleDeleteComment(comment.id)}>Delete Comment</button>
                                )}
                            </div>
                        ))}

                        {currentUser && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Add a comment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button onClick={() => handleAddComment(post.id)}>Add Comment</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Posts;