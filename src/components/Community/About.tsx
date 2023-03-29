import { Community } from "@/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaReddit } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { communityState } from "@/atoms/communitiesAtom";

type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
  const [uploadingImage, setUploadingImage] = useState(false);
  const setCommunitiesStateValue = useSetRecoilState(communityState);
  const userSnippets = useRecoilValue(communityState).mySnippets;
  const isModerator = !!userSnippets.filter((snippet) => {
    return snippet.isModerator && snippet.communityId === communityData.id;
  }).length;
  // const isMember = !!userSnippets.filter(
  //   (snippet) => snippet.communityId === communityData.id
  // ).length; Default behaviour on Reddit is that you can post in communities even if not joined

  const [showSaveButton, setShowSaveButton] = useState(!!selectedFile);
  const onUpdateImage = async () => {
    setUploadingImage(true);
    try {
      const communityImageRef = ref(
        storage,
        `communities/${communityData.id}/communityImage`
      );
      await uploadString(communityImageRef, selectedFile!, "data_url");
      const downloadURL = await getDownloadURL(communityImageRef);
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      });
      setCommunitiesStateValue((prev) => {
        return {
          ...prev,
          currentCommunity: {
            ...prev.currentCommunity,
            imageURL: downloadURL,
          } as Community,
        };
      });
      setShowSaveButton(false);
    } catch (error) {}
    setUploadingImage(false);
  };
  return (
    <Box position="sticky" top="14px">
      <Flex
        justify="space-between"
        align="center"
        bg="blue.400"
        color="white"
        p={3}
        borderRadius="4px 4px 0px 0px"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About community
        </Text>
        <Icon as={HiOutlineDotsHorizontal} />
      </Flex>
      <Flex direction="column" p={3} bg="white" borderRadius="0px 0px 4px 4px">
        <Stack>
          <Flex width="100%" p={2} fontSize="10pt" fontWeight={700}>
            <Flex direction="column" flexGrow={1}>
              <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
              <Text>Members</Text>
            </Flex>
            <Flex direction="column" flexGrow={1}>
              <Text>1</Text>
              <Text>Online</Text>
            </Flex>
          </Flex>
          <Divider />
          <Flex
            align="center"
            width="100%"
            p={1}
            fontWeight={500}
            fontSize="10pt"
          >
            <Icon as={RiCakeLine} fontSize={18} mr={2} />
            {communityData.createdAt && (
              <Text>
                {`Created ${moment(
                  new Date(communityData.createdAt.seconds * 1000)
                ).format("MMM DD YYYY")}`}
              </Text>
            )}
          </Flex>

          <Link href={`/r/${communityData.id}/submit`}>
            <Button width="100%" mt={3} h="30px">
              Create Post
            </Button>
          </Link>
          {isModerator && (
            <>
              <Divider />
              <Stack spacing={1} fontSize="10pt">
                <Text fontWeight={600}>Admin</Text>
                <Flex align="center" justify="space-between">
                  <Text
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => selectedFileRef.current?.click()}
                  >
                    Change Image
                  </Text>
                  {communityData.imageURL || selectedFile ? (
                    <Image
                      src={selectedFile || communityData.imageURL}
                      borderRadius="full"
                      boxSize="40px"
                      alt="community image"
                    />
                  ) : (
                    <Icon
                      as={FaReddit}
                      fontSize={40}
                      color="brand.100"
                      mr={2}
                    />
                  )}
                </Flex>
                {selectedFile &&
                  showSaveButton &&
                  (uploadingImage ? (
                    <Spinner />
                  ) : (
                    <Text cursor="pointer" onClick={onUpdateImage}>
                      Save Changes
                    </Text>
                  ))}
                <input
                  ref={selectedFileRef}
                  type="file"
                  hidden
                  onChange={(event) => onSelectFile(event, setShowSaveButton)}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;
