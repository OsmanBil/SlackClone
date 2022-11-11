export class Message {

    message: string;
    time: any;
    author: string;
    


    constructor(obj?: any){
        this.message = obj ? obj.message : '';
        this.time = obj ? obj.time : '';
        this.author = obj ? obj.author : '';

       
    }

    public toJSON(){
        return{
            message: this.message,
            time: this.time,
            author: this.author,
        };
    }
}