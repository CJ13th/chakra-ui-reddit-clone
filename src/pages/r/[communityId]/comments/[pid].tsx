import { Post } from "@/atoms/postsAtom";
import About from "@/components/Community/About";
import PostItem from "@/components/Posts/PostItem";
import { auth, firestore } from "@/firebase/clientApp";
import usePosts from "@/hooks/usePosts";
import PageContent from "@/Layout/PageContent";
import { collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import useCommunityData from "@/hooks/useCommunityData";
import Comments from "@/components/Posts/Comments/Comments";
import { User } from "firebase/auth";

const PostPage: React.FC = () => {
  const { postStateValue, setPostStateValue, onDeletePost, onVote } =
    usePosts();
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { communityStateValue } = useCommunityData();

  const fetchPost = async (postId: string) => {
    try {
      const postRef = doc(firestore, "posts", postId);
      const retrievedPost = await getDoc(postRef);
      setPostStateValue((prev) => {
        return {
          ...prev,
          selectedPost: {
            id: retrievedPost.id,
            ...retrievedPost.data(),
          } as Post,
        };
      });
    } catch (error) {
      console.log("fetchPost error", error);
    }
  };

  useEffect(() => {
    const { pid } = router.query;
    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }
  }, [router.query, postStateValue.selectedPost]);
  return (
    <PageContent>
      {postStateValue.selectedPost && (
        <>
          <PostItem
            post={postStateValue.selectedPost}
            onDeletePost={onDeletePost}
            onVote={onVote}
            userVoteValue={
              postStateValue.postVotes.find((item) => {
                return item.postId === postStateValue.selectedPost?.id;
              })?.voteValue
            }
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />

          <Comments
            user={user as User}
            selectedPost={postStateValue.selectedPost}
            communityId={communityStateValue.currentCommunity?.id as string}
          />
        </>
      )}
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};
export default PostPage;
