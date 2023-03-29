import { Button, Flex, Input, Stack, Textarea } from "@chakra-ui/react";
import React from "react";

type TextInputsProps = {
  textInputs: {
    title: string;
    body: string;
  };
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCreatePost: () => void;
  loading: boolean;
};

const TextInputs: React.FC<TextInputsProps> = ({
  textInputs,
  onChange,
  handleCreatePost,
  loading,
}) => {
  return (
    <Stack width="100%" spacing={3}>
      <Input
        name="title"
        value={textInputs.title}
        onChange={onChange}
        fontSize="10pt"
        borderRadius={4}
        placeholder="Title"
        _placeholder={{ color: "gray.500" }}
      />
      <Textarea
        h="100px"
        name="body"
        value={textInputs.body}
        onChange={onChange}
        fontSize="10pt"
        borderRadius={4}
        placeholder="Text (optional)"
        _placeholder={{ color: "gray.500" }}
      />
      <Flex justify="flex-end">
        <Button
          isLoading={loading}
          h="34px"
          p="0px 30px"
          isDisabled={!textInputs.title}
          onClick={handleCreatePost}
        >
          Post
        </Button>
      </Flex>
    </Stack>
  );
};
export default TextInputs;
