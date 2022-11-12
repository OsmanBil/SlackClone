

export class Chatroom {

    chatroomUsers: [{
        name: string;
        lastLogin: any;
    }];
    messages2: [
        {message: string;
        time: any;
        author: string;}
        ];
    


    constructor(obj?: any){
        this.chatroomUsers = obj ? obj.chatroomUsers : '';
        this.messages2 = obj ? obj.messages : '';

       
    }

    public toJSON(){
        return{
            chatroomUsers: this.chatroomUsers,
            messages: this.messages2

        };
    }
}