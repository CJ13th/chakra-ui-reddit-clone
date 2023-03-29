import { Button, Flex, Image, Stack } from "@chakra-ui/react";
import React, { useRef, useState } from "react";

type ImageUploadProps = {
  selectedFile?: string;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedFile: (value: string) => void;
  backToPostsTab: () => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedFile,
  onSelectImage,
  setSelectedFile,
  backToPostsTab,
}) => {
  const selectedFileRef = useRef<HTMLInputElement>(null);
  return (
    <Flex direction="column" justify="center" align="center" width="100%">
      {selectedFile ? (
        <>
          <Image src={selectedFile} maxWidth="400px" maxHeight="400px" />
          <Stack direction="row" mt={4}>
            <Button h="28px" onClick={backToPostsTab}>
              Back to post
            </Button>
            <Button
              h="28px"
              variant="outline"
              onClick={() => setSelectedFile("")}
            >
              Remove
            </Button>
          </Stack>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          p={20}
          border="1px dashed gray.200"
          width="100%"
          borderRadius={4}
        >
          <Button
            variant="outline"
            h="28px"
            onClick={() => {
              selectedFileRef.current?.click();
            }}
          >
            Upload
          </Button>
          <input
            ref={selectedFileRef}
            type="file"
            hidden
            onChange={onSelectImage}
          />
        </Flex>
      )}
    </Flex>
  );
};
export default ImageUpload;
