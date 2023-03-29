import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import PageContent from "@/Layout/PageContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/clientApp";
import { useEffect, useState } from "react";
import {
  query,
  collection,
  where,
  limit,
  orderBy,
  getDocs,
} from "firebase/firestore";
import usePosts from "@/hooks/usePosts";
import { Post, PostVote } from "@/atoms/postsAtom";
import PostLoader from "@/components/Posts/PostLoader";
import { Stack } from "@chakra-ui/react";
import CreatePostLink from "@/components/Community/CreatePostLink";
import PostItem from "@/components/Posts/PostItem";
import { communityState } from "@/atoms/communitiesAtom";
import { useRecoilValue } from "recoil";
import useCommunityData from "@/hooks/useCommunityData";
import Recommendations from "@/components/Community/Recommendations";
import Premium from "@/components/Community/Premium";
import PersonalHome from "@/components/Community/PersonalHome";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const {
    setPostStateValue,
    postStateValue,
    onSelectPost,
    onDeletePost,
    onVote,
  } = usePosts();

  const { communityStateValue } = useCommunityData();

  const buildUserHomeFeed = async () => {
    setLoading(true);
    try {
      if (communityStateValue.mySnippets.length) {
        const myCommunityIds = communityStateValue.mySnippets.map((snippet) => {
          return snippet.communityId;
        });
        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "in", myCommunityIds),
          limit(10)
        );
        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        setPostStateValue((prev) => {
          return {
            ...prev,
            posts: posts as Post[],
          };
        });
      } else {
        buildNoUserFeed();
      }
    } catch (error) {
      console.log("buildUserHomeFeed", error);
    }
    setLoading(false);
  };

  const buildNoUserFeed = async () => {
    setLoading(true);
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      );

      const postDocs = await getDocs(postQuery);

      const posts = postDocs.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      setPostStateValue((prev) => {
        return {
          ...prev,
          posts: posts as Post[],
        };
      });
    } catch (error) {
      console.log("buildNoUserFeed", error);
    }
    setLoading(false);
  };

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => {
        return post.id;
      });
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("postId", "in", postIds)
      );
      const postVotesDocs = await getDocs(postVotesQuery);

      const postVotes = postVotesDocs.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setPostStateValue((prev) => {
        return {
          ...prev,
          postVotes: postVotes as PostVote[],
        };
      });
    } catch (error) {
      console.log("getUserPostVotes", error);
    }
  };

  // useEffects
  useEffect(() => {
    if (!loadingUser && !user) {
      // No user function
      buildNoUserFeed();
    }
  }, [user, loadingUser]);

  useEffect(() => {
    if (communityStateValue.snippetsFetched) {
      // We have a user function
      buildUserHomeFeed();
    }
  }, [communityStateValue.snippetsFetched]);

  useEffect(() => {
    if (user && postStateValue.posts.length) {
      getUserPostVotes();
    }

    //clean up function -> will run once this component dismounts i.e when they navigate away from homepage
    return () => {
      setPostStateValue((prev) => {
        return {
          ...prev,
          postVotes: [],
        };
      });
    };
  }, [user, postStateValue.posts]);

  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map((post) => {
              return (
                <PostItem
                  key={post.id}
                  post={post}
                  userIsCreator={user?.uid === post.creatorId}
                  userVoteValue={
                    postStateValue.postVotes.find(
                      (vote) => vote.postId === post.id
                    )?.voteValue
                  }
                  onVote={onVote}
                  onDeletePost={onDeletePost}
                  onSelectPost={onSelectPost}
                  homePage //just passing this in makes it true
                />
              );
            })}
          </Stack>
        )}
      </>
      <Stack spacing={5}>
        <Recommendations />
        <Premium />
        <PersonalHome />
      </Stack>
    </PageContent>
  );
};

export default Home;
