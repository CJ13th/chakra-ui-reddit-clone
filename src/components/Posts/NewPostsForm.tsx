import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Icon,
} from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import TextInputs from "./PostForm/TextInputs";
import ImageUpload from "./PostForm/ImageUpload";
import { TiBackspace } from "react-icons/ti";
import { read } from "fs";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { Post } from "@/atoms/postsAtom";
import { serialize } from "v8";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "@/firebase/clientApp";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useSelectFile from "@/hooks/useSelectFile";

type NewPostsFormProps = {
  user: User;
  communityImageURL?: string;
};

const formTabs = [
  { title: "Posts", icon: IoDocumentText, isDisabled: false },
  { title: "Images & Video", icon: IoImageOutline, isDisabled: false },
  { title: "Link", icon: BsLink45Deg, isDisabled: true },
  { title: "Poll", icon: BiPoll, isDisabled: true },
  { title: "Talk", icon: BsMic, isDisabled: true },
];

const NewPostsForm: React.FC<NewPostsFormProps> = ({
  user,
  communityImageURL,
}) => {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);
  const [textInputs, setTextInputs] = useState({ title: "", body: "" });
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState(false);

  const handeCreatePost = async () => {
    const { communityId } = router.query; //communityId comes from our dynamic route that we defined in pages
    const newPost: Post = {
      communityId: communityId as string,
      communityImageURL: communityImageURL || "",
      creatorId: user.uid,
      creatorDisplayName: user.displayName || user.email!.split("@")[0],
      title: textInputs.title,
      body: textInputs.body,
      numberOfComments: 0,
      voteStatus: 0,
      createdAt: serverTimestamp() as Timestamp,
    };

    setLoading(true);
    try {
      //store post in database
      const postDoc = await addDoc(collection(firestore, "posts"), newPost);
      // if we have an image
      if (selectedFile) {
        // create a storage reference for the image
        const imageRef = ref(storage, `posts/${postDoc.id}/image`);
        //upload the image to the location in storage
        await uploadString(imageRef, selectedFile, "data_url");
        // get the image url
        const downloadURL = await getDownloadURL(imageRef);
        // update the post document to have the image url that we can use in the frontend
        await updateDoc(postDoc, {
          imageURL: downloadURL,
        });
      }
      router.push(`/r/${communityId}`);
    } catch (error: any) {
      console.log("handeCreatePost", error.message);
      setPostError(true);
    }
    setLoading(false);
  };
  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTextInputs((prev) => {
      return {
        ...prev,
        [event.target.name]: event.target.value,
      };
    });
  };

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <>
      <Tabs
        bg="white"
        borderRadius={4}
        mt={2}
        index={tabIndex}
        onChange={handleTabsChange}
      >
        <TabList display="flex">
          {formTabs.map((tab) => {
            return (
              <Tab
                key={tab.title}
                _hover={{ bg: "gray.50" }}
                isDisabled={tab.isDisabled}
                display={{
                  base: tab.isDisabled ? "none" : "inherit",
                  sm: "inherit",
                }}
                flexGrow={1}
                fontWeight={700}
                p="14px 0px"
              >
                <Flex align="center" height="20px" mr={2}>
                  <Icon as={tab.icon} height="100%" fontSize={18} />
                </Flex>
                <Text fontSize="10pt">{tab.title}</Text>
              </Tab>
            );
          })}
        </TabList>

        <TabPanels>
          <TabPanel>
            <TextInputs
              textInputs={textInputs}
              onChange={onTextChange}
              handleCreatePost={handeCreatePost}
              loading={loading}
            />
          </TabPanel>
          <TabPanel>
            <ImageUpload
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              onSelectImage={onSelectFile}
              backToPostsTab={() => setTabIndex(0)}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {postError && (
        <Alert status="error" borderRadius={4}>
          <AlertIcon />
          <AlertDescription>Error creating post</AlertDescription>
        </Alert>
      )}
    </>
  );
};
export default NewPostsForm;
