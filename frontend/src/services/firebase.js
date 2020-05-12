import { firebaseConfig } from "@/config.json";
import * as firebase from "firebase/app";
import "firebase/database";

export const databaseInstance = firebase
  .initializeApp(firebaseConfig)
  .database();

export const acceptedSubmissions = databaseInstance.ref("accepted-submissions");
