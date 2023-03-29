import { Community } from "@/atoms/communitiesAtom";
import { Post } from "@/atoms/postsAtom";
import { firestore } from "@/firebase/clientApp";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import PostLoader from "./PostLoader";

type PostsProps = {
  communityData: Community;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  } = usePosts();

  const getPosts = async () => {
    //Anytime we make a request use try/catch and loading state
    setLoading(true);
    try {
      const postsQuery = query(
        collection(firestore, "posts"),
        where("communityId", "==", communityData.id),
        orderBy("createdAt", "desc")
      );
      const postDocs = await getDocs(postsQuery);

      // store retrieved posts in postState
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostStateValue((prev) => {
        return {
          ...prev,
          posts: posts as Post[],
        };
      });
    } catch (error: any) {
      console.log("getPosts", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPosts();
  }, [communityData]);
  return (
    <>
      {loading ? (
        <PostLoader />
      ) : (
        <Stack>
          {postStateValue.posts.map((post) => {
            return (
              <PostItem
                key={post.id}
                post={post}
                userIsCreator={true}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (vote) => vote.postId === post.id
                  )?.voteValue
                }
                onVote={onVote}
                onDeletePost={onDeletePost}
                onSelectPost={onSelectPost}
              />
            );
          })}
        </Stack>
      )}
    </>
  );
};
export default Posts;
