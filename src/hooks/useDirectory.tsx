import { communityState } from "@/atoms/communitiesAtom";
import {
  DirectoryMenuItem,
  directoryMenuState,
} from "@/atoms/directoryMenuAtom";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { FaReddit } from "react-icons/fa";
import { useRecoilState, useRecoilValue } from "recoil";

const useDirectory = () => {
  const [directoryState, setDirectoryState] =
    useRecoilState(directoryMenuState);
  const communityStateValue = useRecoilValue(communityState);
  const router = useRouter();

  const toggleMenuOpen = () => {
    setDirectoryState((prev) => {
      return {
        ...prev,
        isOpen: !prev.isOpen,
      };
    });
  };

  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => {
      return {
        ...prev,
        selectedMenuItem: menuItem,
      };
    });
    router.push(menuItem.link);
    if (directoryState.isOpen) {
      toggleMenuOpen();
    }
  };

  useEffect(() => {
    const { currentCommunity } = communityStateValue;

    if (currentCommunity) {
      setDirectoryState((prev) => {
        return {
          ...prev,
          selectedMenuItem: {
            displayText: `r/${currentCommunity.id}`,
            link: `/r/${currentCommunity.id}`,
            imageURL: currentCommunity.imageURL,
            icon: FaReddit,
            iconColor: "blue.500",
          },
        };
      });
    }
  }, [communityStateValue.currentCommunity]);
  return { directoryState, toggleMenuOpen, onSelectMenuItem };
};
export default useDirectory;
