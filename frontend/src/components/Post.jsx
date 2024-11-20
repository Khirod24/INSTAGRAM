import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Button } from './ui/button'
import CommentDialog from './CommentDialog'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { useDispatch, useSelector } from 'react-redux';
import store from '@/redux/store';

const Post = ({post}) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false); //TO OPEN COMMENT ICON
    const {user} = useSelector(store=>store.auth)
    const {posts} = useSelector(store=>store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();


    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`https://instavibe-g534.onrender.com/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // update my post
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {
        try {
            const res = await axios.post(`https://instavibe-g534.onrender.com/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`https://instavibe-g534.onrender.com/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async()=>{
        try{
            const res = await axios.get(`https://instavibe-g534.onrender.com/api/v1/post/${post?._id}/bookmark`,{withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        }catch(e){
            console.log(e);
        }
    }

  return (
    <div className='my-3 w-full max-w-sm mx-auto'>
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
                
                <Avatar>
                    <AvatarImage src={post.author?.profilePicture} alt="post_image"/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className='flex items-center gap-3'>
                        <h1 className='font-bold'>{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary">Author</Badge>}
                </div>
            </div>
            
            <Dialog>
                <DialogTrigger asChild>
                    <MoreHorizontal className='cursor-pointer'/>
                </DialogTrigger>
                
                <DialogContent className="flex flex-col items-center text-sm text-center">    
                    {
                        post?.author?._id !== user?._id && 
                        <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                    }
                    <Button variant='ghost' className="cursor-pointer w-fit">Add to Favourites</Button>
                    {
                        user && user?._id === post?.author._id && 
                        <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                    }
                </DialogContent>
            </Dialog>
        </div>

        {/* POST IMG */}
        <img className='rounded-lg my-2 w-full aspect-square' src={post.image} alt="post_img"/>

        {/* POST LIKES AND COMMENTS */}
        <div className='flex items-center justify-between my-2'>
            <div className='flex items-center gap-3'>
                {    liked?
                    <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' />:
                    <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                }

                <MessageCircle onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }} className='cursor-pointer hover:text-gray-600' />
                
                <Send className='cursor-pointer hover:text-gray-600' />
            </div>
                <Bookmark  className='cursor-pointer hover:text-gray-600' onClick={bookmarkHandler} />
        </div>

        <span className='font-medium block mb-2'>{post.likes.length} Likes</span>
        <p>
            <span className='font-medium mr-2'>{post.author?.username}</span>
            {post.caption}
        </p>

        {comment.length>0 &&
            (
                <span onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }} className='cursor-pointer text-sm text-gray-400'>View all {comment.length} comments</span>
            )
        }

        <CommentDialog open={open} setOpen={setOpen}/>
        
        <div className='flex items-center justify-between'>
            <input type="text" placeholder='Add a comment...' value={text} onChange={changeEventHandler} className='outline-none text-sm w-full'/>
            {
                text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
            }
        </div>

    </div>
  )
}

export default Post