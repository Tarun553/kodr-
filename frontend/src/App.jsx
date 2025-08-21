import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogImage,
} from "@/components/ui/morphing-dialog";
import { TextEffect } from "@/components/ui/text-effect";

import {
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Image as ImageIcon,
  User,
  Calendar,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
  Send,
  Delete,
} from "lucide-react";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: { opacity: 0, y: -20 },
};

const PostCard = ({ post, onLike, onComment, onDelete, isCommenting, commentText, onCommentChange, onSubmitComment, onCancelComment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        const updatedPost = await response.json();
        setIsLiked(true);
        setLikeCount(updatedPost.likes);
        toast.success("Post liked!");
      } else {
        const error = await response.json();
        if (error.error === "You already liked this user") {
          setIsLiked(true); // ensure UI shows liked state
          toast.error("You can only like once.");
        } else {
          toast.error(error.error || "Failed to like post. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("An error occurred while liking the post.");
    }
  };
  

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      variants={item}
      className="group relative"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 dark:border-gray-800 dark:hover:border-blue-900/50">
        <CardContent className="p-0">
          {/* Post Header */}
          <div className="p-6 pb-2">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-900 shadow-sm">
                <AvatarImage src={post.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(post.username || post.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {post.username || post.name || "Anonymous User"}
                  </h3>
                  <Badge variant="secondary" size="sm" className="shrink-0">
                    <User className="w-3 h-3 mr-1" />
                    User
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.createdAt || post.date)}</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mt-4 space-y-4">
              {post.postMessage && (
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {post.postMessage}
                </p>
              )}

              {post.image && (
                <MorphingDialog>
                  <MorphingDialogTrigger asChild>
                    <motion.div
                      className="rounded-lg overflow-hidden mt-3 relative cursor-zoom-in"
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-auto max-h-96 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </motion.div>
                  </MorphingDialogTrigger>

                  <MorphingDialogContainer>
                    <MorphingDialogContent className="bg-transparent border-none shadow-none max-w-6xl w-full p-0">
                      <div className="relative">
                        <MorphingDialogImage
                          src={post.image}
                          alt="Post content"
                          className="max-h-[90vh] w-auto mx-auto"
                        />
                        <MorphingDialogClose className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center">
                          <X className="h-5 w-5" />
                        </MorphingDialogClose>
                      </div>
                    </MorphingDialogContent>
                  </MorphingDialogContainer>
                </MorphingDialog>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Post Actions */}
          <div className="px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                disabled={isLiked}
                size="sm"
                className={`group/btn flex items-center gap-1.5 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors ${
                  isLiked ? "text-red-500 dark:text-red-400" : ""
                }`}
                onClick={() => handleLike(post._id)}
              >
                <motion.span
                  animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked ? "fill-current" : ""
                    }`}
                  />
                </motion.span>
                <span className="text-xs font-medium">
                  {likeCount > 0 ? likeCount : ""} Like
                  {likeCount !== 1 ? "s" : ""}
                </span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="group/btn flex items-center gap-1.5 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              onClick={() => onComment?.(post._id)}
            >
              <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-xs font-medium">Comment</span>
            </Button>
               </div>
                {/* Add the comment input section */}
    <div className="px-6 pb-4">
      {isCommenting && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            className="min-h-[80px] text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelComment}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSubmitComment}
              disabled={!commentText.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      )}

      {/* Display existing comments */}
      {post.comments?.length > 0 && (
        <div className="mt-3 space-y-3">
          {post.comments.map((comment, index) => (
            <div key={index} className="flex gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{comment.user?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-sm">
                <div className="font-medium text-sm">
                  {comment.user || 'Anonymous'}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {comment.text}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
            <Button
              variant="ghost"
              size="sm"
              className="group/btn flex items-center gap-1.5 text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
              onClick={() => onDelete?.(post._id)}
            >
              <Delete className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-xs font-medium">delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreatePost = ({
  onSubmit,
  isSubmitting,
  postMessage,
  setPostMessage,
  selectedImage,
  handleImageChange,
  removeImage,
}) => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreview("");
    }
  }, [selectedImage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Post
            </h2>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="What's on your mind?"
                value={postMessage}
                onChange={(e) => setPostMessage(e.target.value)}
                className="min-h-[100px] text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/50 dark:placeholder-gray-500"
                disabled={isSubmitting}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {postMessage.length}/500
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-3">
              {!imagePreview ? (
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-colors duration-200 group"
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="p-3 inline-flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Add photos or videos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    type="button"
                    onClick={removeImage}
                    size="icon"
                    variant="destructive"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-md hover:scale-110 transition-transform"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || !!imagePreview}
                >
                  <ImageIcon className="w-4 h-4 mr-1.5" />
                  <span className="text-xs">Photo/Video</span>
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !postMessage.trim()}
                className="px-6 font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const App = () => {
  const [posts, setPosts] = useState([]);
  const [postMessage, setPostMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Fetch all posts
  const fetchPosts = async () => {
    const loading = posts.length === 0 ? setIsLoading : setIsRefreshing;
    loading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response = await fetch("http://localhost:3000/api/users");
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setPosts(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch posts");
      }
    } catch (error) {
      toast.error("Failed to load posts. Please try again.");
      setPosts([]);
    } finally {
      loading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          "Image too large. Please select an image smaller than 5MB."
        );
        return;
      }
      setSelectedImage(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Submit new post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postMessage.trim()) {
      toast.error("Please enter a message for your post.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("postMessage", postMessage);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Your post has been shared!");
        setPostMessage("");
        setSelectedImage(null);
        fetchPosts();
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (postId) => {
    console.log("Like post:", postId);
    // Implement like functionality
    const response = fetch(`http://localhost:3000/api/users/${postId}/like`, {
      method: "POST",
    });
    if (response.ok) {
      toast.success("Post liked!");
      setIsLiked(true);
    } else {
      toast.error("Failed to like post. Please try again.");
    }
    console.log("Liked post:", postId);
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/api/users/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: commentText,
          user: "Anonymous" // You can replace this with the actual username if you have user auth
        }),
      });
  
      if (response.ok) {
        const updatedPost = await response.json();
        // Update the posts with the new comment
        setPosts(posts.map(post => 
          post._id === postId ? updatedPost : post
        ));
        setCommentText("");
        setActiveCommentPostId(null);
        toast.success("Comment added!");
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const toggleCommentInput = (postId) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    setCommentText("");
  };
  

  const handleDelete = (postId) => {
    console.log("Delete post:", postId);
    // Implement share functionality
    const response = fetch(`http://localhost:3000/api/users/${postId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Post deleted!");
    } else {
      toast.error("Failed to delete post. Please try again.");
    }
    console.log("Delete post:", postId);
    toast.success("Post deleted!");
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <ImageIcon className="w-5 h-5 text-white" />
              </motion.div>
            <h1 className="text-2xl font-semibold bg-transparent bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">postShare</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPosts}
                disabled={isLoading || isRefreshing}
                className="group"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isRefreshing
                        ? "animate-spin"
                        : "group-hover:rotate-180 transition-transform"
                    }`}
                  />
                )}
                Refresh
              </Button>
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-sm font-medium"
              >
                {posts.length} {posts.length === 1 ? "Post" : "Posts"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Create Post */}
        <CreatePost
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          postMessage={postMessage}
          setPostMessage={setPostMessage}
          selectedImage={selectedImage}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
        />

        {/* Posts Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Latest Posts
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <div className="flex gap-4 pt-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-900/50 overflow-hidden">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 mb-6">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                    Be the first to share something amazing with the community!
                  </p>
                  <Button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                  >
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <AnimatePresence>
                {posts.map((post) => (
                <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={toggleCommentInput}
                onDelete={handleDelete}
                isCommenting={activeCommentPostId === post._id}
                commentText={commentText}
                onCommentChange={setCommentText}
                onSubmitComment={() => handleComment(post._id)}
                onCancelComment={() => setActiveCommentPostId(null)}
              />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                PostShare
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} PostShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
