import { authModalState } from "@/atoms/authModalAtoms";
import { auth } from "@/firebase/clientApp";
import { FIREBASE_ERRORS } from "@/firebase/errors";
import { Input, Button, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";

const SignUp: React.FC = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [createUserWithEmailAndPassword, user, loading, userError] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) {
      setError("");
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
  };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpForm((prevState) => {
      return {
        ...prevState,
        [event.target.name]: event.target.value,
      };
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        required
        name="email"
        type="email"
        placeholder="Email"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        bg="gray.50"
      />
      <Input
        required
        name="password"
        type="password"
        placeholder="Password"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        bg="gray.50"
      />
      <Input
        required
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        bg="gray.50"
      />
      {(error || userError) && (
        <Text textAlign="center" color="red" fontSize="10pt">
          {error ||
            FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS]}
        </Text>
      )}
      <Button w="100%" h="36px" mt={2} mb={2} type="submit" isLoading={loading}>
        Sign Up
      </Button>
      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>Already a redditor?</Text>
        <Text
          color="blue.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() =>
            setAuthModalState((prevState) => ({ ...prevState, view: "login" }))
          }
        >
          LOG IN
        </Text>
      </Flex>
    </form>
  );
};
export default SignUp;
