import { authModalState } from "@/atoms/authModalAtoms";
import { communityState } from "@/atoms/communitiesAtom";
import { Post, postState, PostVote } from "@/atoms/postsAtom";
import PostItem from "@/components/Posts/PostItem";
import { auth, firestore, storage } from "@/firebase/clientApp";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const usePosts = () => {
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  const setModalState = useSetRecoilState(authModalState);

  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation();
    if (!user?.uid) {
      setModalState({
        open: true,
        view: "login",
      });
    }
    try {
      let voteChange = vote;
      const { voteStatus } = post; //VoteStatus is total votes

      const existingVote = postStateValue.postVotes.find(
        //They have already voted if we have an item in the postVotes array that matches
        (vote) => vote.postId === post.id
      );

      const batch = writeBatch(firestore);
      //create copies of state so we can mutate and use them to update the real state later
      const updatedPost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      let updatedPostVotes = [...postStateValue.postVotes];

      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`) //create a firestore document in the user's postVotes
        );
        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId: communityId,
          voteValue: vote, // 1 or -1
        };
        batch.set(postVoteRef, newVote);

        updatedPost.voteStatus = voteStatus + vote; // update the Front End state values
        updatedPostVotes = [...updatedPostVotes, newVote];
      } else {
        // have already voted and now are switching or removing their vote

        // get the reference to their previous vote on this post
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes/${existingVote.id}`
        );

        //Are they completely removing or switching their vote?
        if (existingVote.voteValue === vote) {
          //If the existing voteValue is the same as the new vote then they are removing completely

          voteChange = voteChange * -1;
          //i.e if they had previously voted +1 and they are removing then the total vote should go down by -1
          // if they had previousl voted -1 and are removing then the total vote should increase by +1

          // update the total votes on the post e.g they had prev voted +1 to make the total 100 so the new total should be 100 -1
          // or they had voted -1 to make the total 99 so the new total should be 99 - -1 = 100
          updatedPost.voteStatus = voteStatus - vote;
          //filter out that vote from the postVotes array since they are effectively deleting their vote
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          );
          // delete postVote doc in the db
          batch.delete(postVoteRef);
        } else {
          //if they have voted previously but the voteValue is different from vote e.g voteValue = -1 and new vote is +1

          // e.g they have voted +1 to make 100 and are now voting -1. so we need to do 100 - 1 to get back to the original then -1 again to get to the new vote count
          voteChange = 2 * vote;

          updatedPost.voteStatus = voteStatus + 2 * vote;
          //update existing postVote state
          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );
          updatedPostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote,
          };
          batch.update(postVoteRef, {
            voteValue: vote,
          });
        }
      }
      const postRef = doc(firestore, "posts", post.id!);
      batch.update(postRef, { voteStatus: voteStatus + voteChange });
      console.log("voteChange", voteChange);
      await batch.commit();

      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );
      updatedPosts[postIdx] = updatedPost;

      setPostStateValue((prev) => {
        return {
          ...prev,
          posts: updatedPosts,
          postVotes: updatedPostVotes,
        };
      });
      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => {
          return {
            ...prev,
            selectedPost: updatedPost,
          };
        });
      }
    } catch (error) {
      console.log("onVote error", error);
    }
  };
  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => {
      return {
        ...prev,
        selectedPost: post,
      };
    });
    router.push(`/r/${post.communityId}/comments/${post.id}`);
  };
  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      //check if there is an image in the firestore storage
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`);
        await deleteObject(imageRef);
      }

      //delete post documnent
      const postDocRef = doc(firestore, "posts", post.id!);
      await deleteDoc(postDocRef);
      //update recoil state so we don't show the post in the UI
      setPostStateValue((prev) => {
        const newPosts = prev.posts.filter((p) => p.id !== post.id);
        const selectedPost = null;
        const newPostVotes = prev.postVotes.filter(
          (prevPostVote) => prevPostVote.postId !== post.id
        );
        return { selectedPost, posts: newPosts, postVotes: newPostVotes };
      });
    } catch (error) {}
    return true;
  };

  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, "users", `${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    );

    const postVoteDocs = await getDocs(postVotesQuery);
    const postVotes = postVoteDocs.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    setPostStateValue((prev) => {
      return {
        ...prev,
        postVotes: postVotes as PostVote[],
      };
    });
  };

  useEffect(() => {
    if (!user || !currentCommunity?.id) return;
    getCommunityPostVotes(currentCommunity?.id);
  }, [user, currentCommunity]);

  useEffect(() => {
    if (!user) {
      // Clear user post votes
      setPostStateValue((prev) => {
        return {
          ...prev,
          postVotes: [],
        };
      });
    }
  }, [user, currentCommunity]);

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  };
};
export default usePosts;
