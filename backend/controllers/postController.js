import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { Comment } from "../models/comment.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

//ADD NEW POST
export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image){
            return res.status(400).json({ message: 'Image required' });
        } 

        // IMAGE UPLOAD 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // Buffer to dataUri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            success: true,
            message: 'New post added',
            post
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error in adding new post',
        })
    }
}

//GET ALL POSTS
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture'})
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            success: true,
            message:"All posts fetched successfully..",
            posts
            
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Error in getting all posts!"
        })
    }
};

//GET USER POST after auth
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            success: true,
            message:"User's all posts got successfully",
            posts
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in getting user's posts"
        })
    }
}

//POST LIKES
export const likePost = async (req, res) => {
    try {
        const postLikerId = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({success:false, message: 'Post not found!'});

        // Post Likes Logic
        await post.updateOne({ $addToSet: { likes: postLikerId } });
        await post.save();

        // SOCKET.IO FOR REAL TIME NOTIFICATION
        
        const user = await User.findById(postLikerId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== postLikerId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:postLikerId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Error in liking post!!"
        })
    }
}

//POST DISLIKE
export const dislikePost = async (req, res) => {
    try {
        const postLikerId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({success: false, message: 'Post not found'});

        // like logic started
        await post.updateOne({ $pull: { likes: postLikerId } });
        await post.save();

        // SOCKET.IO FOR REALTIME NOTIFICATION

        const user = await User.findById(postLikerId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== postLikerId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:postLikerId,
                userDetails:user,
                postId,
                message:'Your post was disliked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({success:true,message:'Post disliked'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message:'Post disliked'});
    }
}

//ADD COMMENTS ON POSTS
export const addComment = async (req,res) =>{
    try {
        const postId = req.params.id;
        const commenterId = req.id;
        const {text} = req.body;

        const post = await Post.findById(postId);

        if(!text) return res.status(400).json({
            success:false,
            message:'Comment not found, please write comment first'
        });

        const comment = await Comment.create({
            text,
            author:commenterId,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });
        
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'Comment Added!',
            comment,
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in adding comments in a post!"
        })
    }
};

//GET COMMENTS OF A POST
export const getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments) return res.status(404).json({message:'No comments found for this post', success:false});

        return res.status(200).json({success:true,comments});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in getting the comments of post!!"
        })
    }
}

//
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({success:false, message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post Deleted Successfully'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in deleting user's post"
        })
    }
}

//BOOKMARK POST
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});
        }else{
            // add to bookmark
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked..', success:true});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            messae:"Error in bookmarking the post"
        })
    }
}