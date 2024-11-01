import {User} from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {Post} from "../models/post.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js"


//USER REGISTER / SIGNUP
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Data missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "User already exists!, Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcryptjs.hash(password, 10);
        user = await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in resgistering user!"
        })
    }
}

//USER LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Data missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid Credentials",
                success: false,
            });
        }
        const isPasswordMatch = await bcryptjs.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false,
            });
        };

        const token = await jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

        // Populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome Back ${user.username}`,
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in user login!"
        })
    }
};

//USER LOG OUT
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully!',
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in user logout!"
        })
    }
};

//GET USER PROFILE
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            success: true,
            message:"User Profile get successfully",
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            success:false,
            message:"User profile not found!"
        })
    }
};

//EDIT USER PROFILE after auth
export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found!!',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: `${user.username}'s profile updated`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error in editing user's profile",
            success: false
        });
    }
};

//GET SUGGESTED USERS after auth
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users suggestions',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in getting users suggestions"
        })
    }
};

//FOLLOW / UNFOLLOW OTHERS
export const followOrUnfollow = async (req, res) => {
    try {
        const whoFollow = req.id; //khirod
        const whomFollow = req.params.id; //divya
        if (whoFollow === whomFollow) {
            return res.status(400).json({
                message: 'You cannot Follow/Unfollow yourself!',
                success: false
            });
        }

        const user = await User.findById(whoFollow);
        const targetUser = await User.findById(whomFollow);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // TO CHECK WHETHER DO FOLLOW OR UNFOLLOW TARGET USER
        const isFollowing = user.following.includes(whomFollow);
        if (isFollowing) {
            // Unfollow Logic
            await Promise.all([
                User.updateOne({ _id: whoFollow }, { $pull: { following: whomFollow } }),
                User.updateOne({ _id: whomFollow }, { $pull: { followers: whoFollow } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            // Follow Lofic
            await Promise.all([
                User.updateOne({ _id: whoFollow }, { $push: { following: whomFollow } }),
                User.updateOne({ _id: whomFollow }, { $push: { followers: whoFollow } }),
            ])
            return res.status(200).json({ message: 'Followed successfully', success: true });
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success:false,
            message:"Error in following/unfollowing logic"
        })
    }
}


