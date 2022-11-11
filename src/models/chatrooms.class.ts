import { Message } from "./message.class";
import { chatroomUser } from "./chatroomUser.class"; 

export class Chatroom {

    chatroomUsers: [chatroomUser];
    messages: [Message];
    


    constructor(obj?: any){
        this.chatroomUsers = obj ? obj.chatroomUsers : '';
        this.messages = obj ? obj.messages : '';

       
    }

    public toJSON(){
        return{
            chatroomUsers: this.chatroomUsers,
            messages: this.messages

        };
    }
}