import { authModalState } from "@/atoms/authModalAtoms";
import {
  Community,
  communityState,
  CommunitySnippet,
} from "@/atoms/communitiesAtom";
import { auth, firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { MdBatchPrediction } from "react-icons/md";
import { useRecoilState, useSetRecoilState } from "recoil";

const useCommunityData = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const router = useRouter();

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    if (!user) {
      setAuthModalState((prevState) => ({ open: true, view: "login" }));
      return;
    }
    setLoading(true);
    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };

  const getMySnippets = async () => {
    setLoading(true);
    try {
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );

      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        snippetsFetched: true,
      }));
    } catch (error) {
      console.log("getMySnippets", error);
    }

    setLoading(false);
  };

  const joinCommunity = async (communityData: Community) => {
    try {
      const batch = writeBatch(firestore);

      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || "",
        isModerator: user?.uid === communityData.creatorId,
      };

      //Batches are used for only writes --> similar to transactions, all must complete successful or the entire batch reverts
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      );
      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMembers: increment(1),
      });

      await batch.commit(); // actually run the batch

      setCommunityStateValue((prev) => {
        return {
          ...prev,
          mySnippets: [...prev.mySnippets, newSnippet],
        };
      });
    } catch (error: any) {
      console.log("joinCommunity", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const leaveCommunity = async (communityId: string) => {
    try {
      // take in the communityId
      // delete the document from the communitySnippets collection on the user where communityId equals doc
      // go to the communities collection and decrement the noOfUsers by 1
      const batch = writeBatch(firestore);
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      );
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });

      await batch.commit();

      setCommunityStateValue((prev) => {
        return {
          ...prev,
          mySnippets: prev.mySnippets.filter(
            (snippet) => snippet.communityId !== communityId
          ),
        };
      });

      setLoading(false);
    } catch (error: any) {
      console.log("leaveCommunity", error);
      setError(error.message);
    }
  };

  const getCommunityData = async (communityId: string) => {
    try {
      const communityRef = doc(firestore, "communities", communityId);
      const communityDoc = await getDoc(communityRef);
      setCommunityStateValue((prev) => {
        return {
          ...prev,
          currentCommunity: {
            id: communityDoc.id,
            ...communityDoc.data(),
          } as Community,
        };
      });
    } catch (error) {
      console.log("getCommunityData error", error);
    }
  };

  useEffect(() => {
    //Make sure we have a user before trying to get snippets
    if (!user) {
      setCommunityStateValue((prev) => {
        return {
          ...prev,
          mySnippets: [],
          snippetsFetched: false,
        };
      });
      return;
    }
    getMySnippets();
  }, [user]);

  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && !communityStateValue.currentCommunity) {
      getCommunityData(communityId as string);
    }
  }, [router.query, communityStateValue.currentCommunity]);

  return {
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  };
};
export default useCommunityData;
