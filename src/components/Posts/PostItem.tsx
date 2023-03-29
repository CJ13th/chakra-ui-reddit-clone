import React, { useState } from "react";
import { Post } from "../../atoms/postsAtom";
import { AiOutlineDelete } from "react-icons/ai";
import { BsChat, BsDot } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowRedoOutline,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoBookmarkOutline,
} from "react-icons/io5";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Flex,
  Icon,
  Image,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import Link from "next/link";
import { eventNames } from "process";

type PostItemProps = {
  post: Post;
  userIsCreator: boolean;
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void; // needs a return type, the async function
  homePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  homePage,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const router = useRouter();
  const singlePostPage = !onSelectPost;

  const handleDelete = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setLoadingDelete(true);
    try {
      const success = await onDeletePost(post);

      if (!success) {
        throw new Error("Failed to delete post");
      }
      console.log("Post was successfully deleted");
      if (singlePostPage) {
        router.push(`/r/${post.communityId}`);
      }
    } catch (error: any) {
      setError(error.message);
    }
    setLoadingDelete(false);
  };
  return (
    <Flex
      bg="white"
      border="1px solid"
      borderColor={singlePostPage ? "white" : "gray.300"}
      borderRadius={singlePostPage ? "4px 4px 0px 0x" : "4px"}
      _hover={{ borderColor: singlePostPage ? "none" : "gray.500" }}
      cursor={singlePostPage ? "unset" : "pointer"}
      onClick={() => onSelectPost && onSelectPost(post)}
    >
      <Flex
        direction="column"
        align="center"
        bg={singlePostPage ? "none" : "gray.100"}
        p={2}
        width="40px"
        borderRadius={singlePostPage ? "0" : "3px 0px 0px 3px"}
      >
        <Icon
          as={
            userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
          }
          color={userVoteValue === 1 ? "brand.100" : "gray.400"}
          fontSize={22}
          onClick={(event) => onVote(event, post, 1, post.communityId)}
          cursor="pointer"
        ></Icon>
        <Text fontSize="9pt">{post.voteStatus}</Text>
        <Icon
          as={
            userVoteValue === -1
              ? IoArrowDownCircleSharp
              : IoArrowDownCircleOutline
          }
          color={userVoteValue === -1 ? "#4379ff" : "gray.400"}
          fontSize={22}
          onClick={(event) => onVote(event, post, -1, post.communityId)}
          cursor="pointer"
        ></Icon>
      </Flex>
      <Flex direction="column" width="100%">
        {error && (
          <Alert status="error" borderRadius={4}>
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {post.createdAt && (
          <Stack spacing={1} padding="10px">
            <Stack direction="row" spacing={0.6} align="center" fontSize="9pt">
              {homePage && (
                <>
                  {post.communityImageURL ? (
                    <Image
                      src={post.communityImageURL}
                      borderRadius="full"
                      boxSize="18px"
                      mr={2}
                    />
                  ) : (
                    <Icon
                      as={FaReddit}
                      fontSize="18pt"
                      mr={1}
                      color="blue.500"
                    />
                  )}
                  <Link href={`r/${post.communityId}`}>
                    <Text
                      fontWeight={700}
                      _hover={{
                        textDecoration: "underline",
                        // cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >{`r/${post.communityId}`}</Text>
                  </Link>
                  <Icon as={BsDot} color="gray.500" fontSize={8} />
                </>
              )}
              <Text>
                Posted by u/{post.creatorDisplayName}{" "}
                {moment(new Date(post.createdAt.seconds * 1000)).fromNow()}
              </Text>
            </Stack>
            <Text fontSize="12pt" fontWeight={600}>
              {post.title}
            </Text>
            <Text>{post.body}</Text>
            {post.imageURL && (
              <Flex justify="center" align="center" p={2}>
                {imageLoading && (
                  <Skeleton height="200px" width="100%" borderRadius={4} />
                )}
                <Image
                  src={post.imageURL}
                  maxHeight="460px"
                  alt="Post Image"
                  display={imageLoading ? "none" : "unset"}
                  onLoad={() => setImageLoading(false)}
                />
              </Flex>
            )}
          </Stack>
        )}
        <Flex ml={1} mb={0.5} color="gray.500">
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
          >
            <Icon as={BsChat} mr={2} />
            <Text fontSize="9pt">{post.numberOfComments}</Text>
          </Flex>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
          >
            <Icon as={IoArrowRedoOutline} mr={2} />
            <Text fontSize="9pt">Share</Text>
          </Flex>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
          >
            <Icon as={IoBookmarkOutline} mr={2} />
            <Text fontSize="9pt">Save</Text>
          </Flex>
          {userIsCreator && (
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={4}
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              onClick={handleDelete}
            >
              {loadingDelete ? (
                <>
                  <Spinner size="sm" />
                </>
              ) : (
                <>
                  <Icon as={AiOutlineDelete} mr={2} />
                  <Text fontSize="9pt">Delete</Text>
                </>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PostItem;