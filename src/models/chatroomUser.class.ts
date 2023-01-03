export class chatroomUser {

    name: string;
    lastLogin: any;
    


    constructor(obj?: any){
        this.name = obj ? obj.name : '';
        this.lastLogin = obj ? obj.lastLogin : '';

       
    }

    public toJSON(){
        return{
            name: this.name,
            lastLogin: this.lastLogin

        };
    }
}