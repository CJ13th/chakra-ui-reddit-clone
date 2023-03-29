import { communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
import NewPostsForm from "@/components/Posts/NewPostsForm";
import { auth } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import PageContent from "@/Layout/PageContent";
import { Box, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";

const Submit: React.FC = () => {
  const [user] = useAuthState(auth);
  //const communityStateValue = useRecoilValue(communityState);
  const { communityStateValue } = useCommunityData();

  // useEffect(() => {
  //   if (!communityStateValue) {

  //   }
  // })
  return (
    <PageContent>
      <>
        <Box padding="14px 0px" borderBottom="1px solid" borderColor="white">
          <Text>Create a post</Text>
        </Box>
        {user && (
          <NewPostsForm
            user={user}
            communityImageURL={communityStateValue.currentCommunity?.imageURL}
          />
        )}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};

export default Submit;
