import React, { useState } from "react";
import { VStack, Circle, Text, Button, Flex, Box } from "@chakra-ui/react";
import CreateCommunityModal from "../Modal/CreateCommunity/CreateCommunityModal";
import Link from "next/link";

const NotFound: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <Circle size="100px" bg="gray.500" mb={6}></Circle>
      <Text fontWeight={600} mb={4}>
        Sorry, there aren’t any communities on Reddit with that name.
      </Text>
      <Text fontSize="10pt" mb={6}>
        This community may have been banned or the community name is incorrect.
      </Text>
      <Flex width="100%" justifyContent="center">
        <Button variant="outline" ml={2} mr={2} onClick={() => setOpen(true)}>
          Create Community
        </Button>
        <Link href="/">
          <Button ml={2} mr={2}>
            Go Home
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
};
export default NotFound;
