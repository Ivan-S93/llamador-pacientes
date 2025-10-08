import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import {open} from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());