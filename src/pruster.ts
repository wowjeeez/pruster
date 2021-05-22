import express from "express";
import http from "http";
import {Server} from "socket.io";
import {PrismaCtx, ChalkColors} from "./types/pruster";
import {EVENTS} from "./events";
import chalk from "chalk";
export default class Pruster {
    private readonly expressCtx: express.Express
    private readonly server: http.Server
    private debug = false
    private io: Server
    private log(msg: string, color: ChalkColors): void {
        if (this.debug) {
            console.log(chalk[color](msg))
        }
    }
    constructor(context: express.Express, dbConfig: Partial<PrismaCtx>, debug = false) {
        this.expressCtx = context;
        this.server = http.createServer(this.expressCtx);
        this.io = new Server(this.server);
        this.debug = debug
        if (!dbConfig.Write) {
            throw new Error("No Prisma context was specified!")
        } else if (!dbConfig.Read) {
            dbConfig.Read = dbConfig.Write
            this.log("Running database driver without read replicas", "yellow")
        }

    }
    public listen() {
        this.io.on('connection', (socket) => {
            this.io.emit(EVENTS.USER_CONNECTED, {name: socket.data.username || "Anonim user"})
            socket.on(EVENTS.CHAT_MESSAGE, (msg) => {
                this.io.emit(EVENTS.CHAT_MESSAGE, msg);
            });
            socket.on('disconnect', () => {
                this.io.emit(EVENTS.USER_LEFT, {name: socket.data.username || "Anonim user"})
            });
        });
    }
    public set debugMode(status: boolean) {
        this.debug = status
    }
}