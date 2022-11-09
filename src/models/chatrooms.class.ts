import { Message } from "./message.class";

export class Chatroom {

    users: Array<string>;
    messages: Array<Message>;
    


    constructor(obj?: any){
        this.users = obj ? obj.users : '';
        this.messages = obj ? obj.messages : '';

       
    }

    public toJSON(){
        return{
            users: this.users,
            messages: this.messages

        };
    }
}