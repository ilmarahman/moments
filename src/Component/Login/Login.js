import React, { useContext, useState } from "react";
import "./Login.css";

import { useHistory, useLocation } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";

import { userContext } from "../../App";
import { firebaseConfig } from "./firebaseConfig";
import { useForm } from "react-hook-form";
import google from "../../photo/search.png";

const Login = () => {
  const [loggedInUser, setLoggedInUser] = useContext(userContext);

  const [user, setUser] = useState({
    isUser: false,
    name: "",
    email: "",
    password: "",
    reWritePassword: "",
    success: false,
    noMatch: "",
    error: "",
  });
  const [newUser, setNewUser] = useState(false);

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  const history = useHistory();
  const location = useLocation();
  const fromArray = [];

  let { from } = location.state || { from: { pathname: "/" } };
  fromArray.push(from);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (newUser && data.password !== data.reWritePassword) {
      const newUserInfo = { ...user };
      newUserInfo.noMatch = "password not matched";
      setUser(newUserInfo);
    }

    if (
      data.name &&
      data.email &&
      data.password &&
      data.password === data.reWritePassword
    ) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(data.email, data.password)
        .then((res) => {
          const { email } = res.user;

          const SignInUser = {
            name: user.name,
            email: email,
            isUser: true,
            success: true,
          };
          setLoggedInUser(SignInUser);
          sessionStorage.setItem("token", SignInUser.email);
          history.replace(from);
        })
        .catch((error) => {
          const errorMessage = error.message;
          const userInfo = { ...user, success: false };
          userInfo.error = errorMessage;
          setUser(userInfo);
        });
    }

    if (!newUser && data.email && data.password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(data.email, data.password)
        .then((res) => {
          console.log(res.user);
          const { email } = res.user;

          const SignInUser = {
            name: "user",
            email: email,
            isUser: true,
            success: true,
          };
          setLoggedInUser(SignInUser);
          sessionStorage.setItem("token", SignInUser.email);
          history.replace(from);
        })
        .catch((error) => {
          const errorMessage = error.message;
          const userInfo = { ...user, success: false };
          userInfo.error = errorMessage;
          setUser(userInfo);
        });
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((res) => {
        const { displayName, email } = res.user;

        const SignInUser = {
          name: displayName,
          email: email,
          isUser: true,
          success: true,
        };
        setUser(SignInUser);
        setLoggedInUser(SignInUser);
        sessionStorage.setItem("token", SignInUser.email);
        history.replace(from.pathname);
      })
      .catch((error) => {
        const newUserInfo = {
          isUser: false,
          name: "",
          email: "",
          success: false,
          error: error.message,
        };
        setUser(newUserInfo);
        setLoggedInUser(newUserInfo);
      });
  };

  const handleBlur = (event) => {
    let inputFieldValid = true;
    if (event.target.name === "email") {
      inputFieldValid =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          event.target.value
        );
    }

    if (event.target.name === "password") {
      inputFieldValid = /^.{8,}$/.test(event.target.value);
    }
    if (event.target.name === "reWritePassword") {
      inputFieldValid = /^.{8,}$/.test(event.target.value);
    }

    if (inputFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  };

  return (
    <div className="container login-container">
      <div style={{ justifyContent: "left" }} className="row">
        <div
          style={{ height: "550px", padding: "0px 50px" }}
          className=" loginForm offset-md-1 shadow rounded mb-5 col-xl-4 col-md-5 mt-5"
        >
          <h4 className="text-center text-secondary mt-3 mb-3">
            LOGIN / REGISTRATION FORM
          </h4>

          <button
            onClick={() => handleGoogleSignIn()}
            style={{
              width: "100%",
              padding: "10px",
              background: "transparent",
            }}
          >
            <img style={{ height: "20px" }} src={google} alt="" />
            Sign in with Google
          </button>

          <form
            style={{ padding: "0", marginTop: "10px" }}
            action=""
            onSubmit={handleSubmit(onSubmit)}
            className="text-center border-0 signIn-form"
          >
            {newUser && (
              <input
                className="form-group border-2 border-bottom pb-3 mb-3 form-control"
                type="text"
                name="name"
                placeholder="Your name"
                id="name"
                onBlur={handleBlur}
                required
                {...register("name", { required: true })}
              />
            )}
            <input
              type="email"
              className="form-group border-2 border-bottom pb-3 mb-3 form-control"
              name="email"
              placeholder="Your email"
              id="email"
              onBlur={handleBlur}
              required
              {...register("email", { required: true })}
            />
            <input
              type="password"
              className="form-group border-2 border-bottom pb-3 mb-3 form-control"
              placeholder="type your password"
              name="password"
              onBlur={handleBlur}
              id="password"
              required
              {...register("password", { required: true })}
            />
            {newUser && (
              <input
                type="password"
                className="form-group border-2  pb-3 mb-3 form-control"
                placeholder="re-write-password"
                name="reWritePassword"
                onBlur={handleBlur}
                id="reWritePassword"
                required
                {...register("reWritePassword", { required: true })}
              />
            )}

            <input
              className="btn mb-3  btn-color text-white text-bold text-bold button form-group form-control p-2"
              type="submit"
              value={newUser ? "Sign up" : "Sign in"}
            />

            {!newUser && (
              <p>
                <span className="h6 me-2"> Don't have Account ?</span>

                <span
                  style={{
                    color: "green",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => setNewUser(!newUser)}
                >
                  create account
                </span>
              </p>
            )}
            {newUser && (
              <p>
                <span className="h6 me-2"> Already have an account?</span>

                <span
                  style={{
                    color: "green",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => setNewUser(!newUser)}
                >
                  Log in
                </span>
              </p>
            )}
          </form>

          {user.success ? (
            <p className="text-success text-center">
              User created successfully
            </p>
          ) : (
            <p className="text-danger text-center h4">{user.error}</p>
          )}
          <p className="text-danger text-center h4">{user.noMatch} </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
