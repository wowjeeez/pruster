import express from "express";
import http from "http";
import {Server} from "socket.io";
import {EVENTS} from "./events";
export default class Pruster {
    private readonly expressCtx: express.Express
    private readonly server: http.Server
    private io: Server
    constructor(context: express.Express) {
        this.expressCtx = context;
        this.server = http.createServer(this.expressCtx);
        this.io = new Server(this.server);


    }
    public listen() {
        this.io.on('connection', (socket) => {
            this.io.emit(EVENTS.USER_CONNECTED, {name: socket.data.usernamename || "Anonim user"})
            socket.on(EVENTS.CHAT_MESSAGE, (msg) => {
                this.io.emit(EVENTS.CHAT_MESSAGE, msg);
            });
            socket.on('disconnect', () => {
                this.io.emit(EVENTS.USER_LEFT, {name: socket.data.usernamename || "Anonim user"})
            });
        });
    }
}